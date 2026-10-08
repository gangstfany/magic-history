"""Deterministic, offline WebP preparation for public U5/U6 media.

Opaque images use quality 88 down to a floor of 60, in two-point steps.
If that floor (or lossless alpha) cannot meet the byte budget, fail rather
than silently degrading further. Sources are never modified.
"""
import argparse
from contextlib import contextmanager
from dataclasses import dataclass
import os
from pathlib import Path
import secrets
import stat

from PIL import Image, ImageOps


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
QUALITY_FLOOR = 60


@dataclass(frozen=True)
class OptimizationResult:
    width: int
    height: int
    byte_count: int
    relative_path: str


def _destination(path):
    path = Path(path)
    if '..' in path.parts or '.private-media' in path.parts:
        raise ValueError('Destination cannot contain traversal or .private-media')
    absolute = path if path.is_absolute() else REPOSITORY_ROOT / path
    try:
        relative = absolute.relative_to(REPOSITORY_ROOT)
    except ValueError:
        raise ValueError('Destination must be inside repository U5/U6 assets') from None
    if (relative.parts[:3] not in [('assets', 'art-history', 'u5'),
                                  ('assets', 'art-history', 'u6')]
            or len(relative.parts) < 4 or absolute.suffix.lower() != '.webp'):
        raise ValueError('Destination must be a .webp inside assets/art-history/u5 or u6')
    # Reject symlink escape as well as lexical escape, including unit-root links.
    if absolute.resolve() != absolute:
        raise ValueError('Destination must not follow symlinks')
    return absolute, relative.as_posix()


@contextmanager
def _parent_directory(destination):
    """Walk from filesystem root without following any directory symlinks."""
    if not hasattr(os, 'O_NOFOLLOW') or not hasattr(os, 'O_DIRECTORY'):
        raise OSError('Secure directory-descriptor operations are unavailable')
    flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW
    descriptor = os.open(destination.anchor, flags)
    try:
        for part in destination.parent.parts[1:]:
            try:
                child = os.open(part, flags, dir_fd=descriptor)
            except FileNotFoundError:
                try:
                    os.mkdir(part, dir_fd=descriptor)
                except FileExistsError:
                    pass
                child = os.open(part, flags, dir_fd=descriptor)
            os.close(descriptor)
            descriptor = child
        yield descriptor
    finally:
        os.close(descriptor)


def _existing_destination(parent_fd, name, source_stat, replace):
    try:
        existing = os.stat(name, dir_fd=parent_fd, follow_symlinks=False)
    except FileNotFoundError:
        return
    if stat.S_ISLNK(existing.st_mode):
        raise ValueError('Destination must not be a symlink')
    if os.path.samestat(existing, source_stat):
        raise ValueError('Source and destination identify the same file')
    if not replace:
        raise FileExistsError(f'Destination already exists: {name}')


def optimize_image(source, destination, *, max_edge=2000,
                   max_bytes=1_572_864, replace=False):
    """Optimize into an allowed repository destination; publish atomically."""
    if (not isinstance(max_edge, int) or isinstance(max_edge, bool) or max_edge <= 0
            or not isinstance(max_bytes, int) or isinstance(max_bytes, bool)
            or max_bytes <= 0):
        raise ValueError('max_edge and max_bytes must be positive integers')
    destination, relative_path = _destination(destination)
    with _parent_directory(destination) as parent_fd, open(source, 'rb') as source_file:
        source_stat = os.fstat(source_file.fileno())
        _existing_destination(parent_fd, destination.name, source_stat, replace)
        opened = Image.open(source_file)
        image = ImageOps.exif_transpose(opened)
        opened.close()
        if 'A' in image.getbands() or 'transparency' in image.info:
            rgba = image.convert('RGBA')
            has_alpha = rgba.getchannel('A').getextrema()[0] < 255
            image = rgba if has_alpha else rgba.convert('RGB')
        else:
            has_alpha = False
            image = image.convert('RGB')
        image.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
        # Downsampling can erase sparse transparency. WebP then decodes as RGB,
        # while the source-based lossless encoding policy remains unchanged.
        expected_mode = ('RGBA' if has_alpha and
                         image.getchannel('A').getextrema()[0] < 255 else 'RGB')
        temporary_name = f'.{destination.name}.{secrets.token_hex(16)}.tmp'
        descriptor = os.open(temporary_name,
                             os.O_RDWR | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                             0o600, dir_fd=parent_fd)
        try:
            with os.fdopen(descriptor, 'w+b') as output:
                qualities = [None] if has_alpha else range(88, QUALITY_FLOOR - 1, -2)
                for quality in qualities:
                    output.seek(0)
                    output.truncate()
                    options = {'lossless': True} if has_alpha else {'quality': quality}
                    image.save(output, format='WEBP', **options)
                    output.flush()
                    byte_count = os.fstat(output.fileno()).st_size
                    if byte_count <= max_bytes:
                        break
                else:
                    raise ValueError(f'Cannot meet byte budget {max_bytes}; '
                                     f'lossless alpha or quality floor {QUALITY_FLOOR} required')
                output.seek(0)
                with Image.open(output) as verified:
                    verified.load()
                    if (verified.format != 'WEBP' or verified.size != image.size
                            or verified.mode != expected_mode):
                        raise ValueError('Saved WebP failed integrity/dimension/mode verification')
            _existing_destination(parent_fd, destination.name, source_stat, replace)
            if replace:
                os.replace(temporary_name, destination.name,
                           src_dir_fd=parent_fd, dst_dir_fd=parent_fd)
            else:
                # Atomic no-clobber publication: even a concurrent writer is safe.
                os.link(temporary_name, destination.name,
                        src_dir_fd=parent_fd, dst_dir_fd=parent_fd,
                        follow_symlinks=False)
            return OptimizationResult(image.width, image.height, byte_count, relative_path)
        finally:
            try:
                os.unlink(temporary_name, dir_fd=parent_fd)
            except FileNotFoundError:
                pass


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, help='Source image path (may be outside repository)')
    parser.add_argument('--destination', required=True, help='Output .webp in assets/art-history/u5 or u6')
    parser.add_argument('--max-edge', type=int, default=2000, help='Maximum width/height in pixels (default: 2000)')
    parser.add_argument('--max-bytes', type=int, default=1_572_864, help='Maximum output bytes (default: 1572864)')
    parser.add_argument('--replace', action='store_true', help='Allow replacement of an existing destination')
    args = parser.parse_args()
    try:
        result = optimize_image(args.source, args.destination, max_edge=args.max_edge,
                                max_bytes=args.max_bytes, replace=args.replace)
    except (OSError, ValueError) as error:
        parser.exit(1, f'Optimization failed: {error}\n')
    print(f'{result.relative_path}: {result.width}x{result.height}, {result.byte_count} bytes')


if __name__ == '__main__':
    main()
