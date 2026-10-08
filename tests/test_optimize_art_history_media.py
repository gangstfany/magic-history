"""Offline optimizer contract, using only generated fixtures."""
from dataclasses import FrozenInstanceError
from pathlib import Path
import random
import os
import tempfile
import unittest
from unittest.mock import patch

from PIL import Image
from scripts.optimize_art_history_media import optimize_image
from scripts import optimize_art_history_media as optimizer


class OptimizeImageTests(unittest.TestCase):
    def setUp(self):
        self.sources = tempfile.TemporaryDirectory()
        self.repository = tempfile.TemporaryDirectory()
        self.root = Path(self.repository.name).resolve()
        (self.root / 'assets/art-history/u5').mkdir(parents=True)
        self.outputs = tempfile.TemporaryDirectory(dir=self.root / 'assets/art-history/u5')
        root_patch = patch('scripts.optimize_art_history_media.REPOSITORY_ROOT', self.root)
        root_patch.start()
        self.addCleanup(root_patch.stop)
        self.addCleanup(self.repository.cleanup)
        self.addCleanup(self.sources.cleanup)
        self.addCleanup(self.outputs.cleanup)
        self.destination = Path(self.outputs.name) / 'image.webp'

    def source(self, mode='RGB', size=(400, 200), color='red', exif=None):
        path = Path(self.sources.name) / 'source.png'
        image = Image.new(mode, size, color)
        image.save(path, **({'exif': exif} if exif else {}))
        return path

    def test_portrait_and_landscape_are_bounded_and_result_is_immutable(self):
        for size in [(600, 300), (300, 600)]:
            result = optimize_image(self.source(size=size), self.destination,
                                    max_edge=100, replace=True)
            self.assertEqual((result.width, result.height),
                             (100, 50) if size[0] > size[1] else (50, 100))
            self.assertLessEqual(result.byte_count, 1_572_864)
            self.assertEqual(result.relative_path,
                             self.destination.relative_to(self.root).as_posix())
            with self.assertRaises((FrozenInstanceError, AttributeError)):
                result.width = 10

    def test_exif_orientation_is_applied_before_resizing(self):
        exif = Image.Exif()
        exif[274] = 6
        result = optimize_image(self.source(size=(400, 200), exif=exif),
                                self.destination, max_edge=100)
        self.assertEqual((result.width, result.height), (50, 100))

    def test_meaningful_alpha_is_lossless(self):
        source = self.source('RGBA', color=(123, 77, 42, 128))
        optimize_image(source, self.destination)
        data = self.destination.read_bytes()
        self.assertIn(b'VP8L', data)
        with Image.open(self.destination) as output:
            self.assertEqual(output.getpixel((0, 0)), (123, 77, 42, 128))

    def test_transparency_disappearing_on_resize_accepts_opaque_decoded_mode(self):
        source = Path(self.sources.name) / 'sparse-alpha.png'
        image = Image.new('RGBA', (100, 100), (123, 77, 42, 255))
        image.putpixel((0, 0), (123, 77, 42, 0))
        image.save(source)
        expected = image.copy()
        expected.thumbnail((1, 1), Image.Resampling.LANCZOS)
        self.assertEqual(expected.getchannel('A').getextrema(), (255, 255))
        result = optimize_image(source, self.destination, max_edge=1)
        self.assertEqual((result.width, result.height), (1, 1))
        self.assertIn(b'VP8L', self.destination.read_bytes())
        with Image.open(self.destination) as output:
            self.assertEqual(output.mode, 'RGB')
            self.assertEqual(output.getpixel((0, 0)), expected.convert('RGB').getpixel((0, 0)))

    def test_noisy_photo_uses_lossy_webp_with_bounded_quality_and_bytes(self):
        source = Path(self.sources.name) / 'noise.png'
        image = Image.frombytes('RGB', (256, 256), random.Random(7).randbytes(256*256*3))
        image.save(source)
        result = optimize_image(source, self.destination, max_bytes=50_000)
        self.assertLessEqual(result.byte_count, 50_000)
        self.assertIn(b'VP8 ', self.destination.read_bytes())
        expected = Path(self.sources.name) / 'expected.webp'
        candidates = []
        for quality in range(88, 59, -2):
            image.save(expected, format='WEBP', quality=quality)
            candidates.append(expected.read_bytes())
        first_fit = next(data for data in candidates if len(data) <= 50_000)
        self.assertEqual(self.destination.read_bytes(), first_fit)

    def test_palette_transparency_resamples_with_lanczos(self):
        source = Path(self.sources.name) / 'indexed.png'
        image = Image.new('P', (17, 11))
        image.putpalette([255, 0, 0, 0, 0, 255] + [0] * 762)
        image.putdata([(x + y) % 2 for y in range(11) for x in range(17)])
        image.info['transparency'] = 0
        image.save(source)
        expected = image.convert('RGBA')
        expected.thumbnail((7, 7), Image.Resampling.LANCZOS)
        optimize_image(source, self.destination, max_edge=7)
        with Image.open(self.destination) as output:
            self.assertEqual(output.convert('RGBA').tobytes(), expected.tobytes())

    def test_rejects_source_destination_identity_and_hardlinks(self):
        source = self.source()
        for alias in [False, True]:
            with self.subTest(hardlink=alias):
                self.destination.unlink(missing_ok=True)
                os.link(source, self.destination)
                chosen_source = source if alias else self.destination
                original = source.read_bytes()
                with self.assertRaisesRegex(ValueError, 'same|source'):
                    optimize_image(chosen_source, self.destination, replace=True)
                self.assertEqual(source.read_bytes(), original)
                self.assertEqual(self.destination.read_bytes(), original)

    def test_ancestor_swap_after_validation_cannot_write_outside(self):
        source = self.source()
        outside = Path(self.sources.name) / 'outside'
        outside.mkdir()
        unit = self.root / 'assets/art-history/u5'
        moved = unit.with_name('saved-u5')
        destination = unit / 'escaped.webp'
        validate = optimizer._destination
        def swap(path):
            result = validate(path)
            unit.rename(moved)
            unit.symlink_to(outside, target_is_directory=True)
            return result
        with patch.object(optimizer, '_destination', side_effect=swap):
            try:
                optimize_image(source, destination)
            except (ValueError, OSError):
                pass
        self.assertFalse((outside / 'escaped.webp').exists())
        self.assertEqual(list(outside.iterdir()), [])
        unit.unlink()
        moved.rename(unit)

    def test_rejects_symlink_parent_and_destination(self):
        source = self.source()
        alias = self.destination.parent / 'alias'
        alias.symlink_to(self.sources.name, target_is_directory=True)
        with self.assertRaises((ValueError, OSError)):
            optimize_image(source, alias / 'escaped.webp')
        self.destination.symlink_to(source)
        with self.assertRaises((ValueError, OSError)):
            optimize_image(source, self.destination, replace=True)

    def test_swap_during_encoding_keeps_publication_and_cleanup_anchored(self):
        source = self.source()
        outside = Path(self.sources.name) / 'outside'
        outside.mkdir()
        unit = self.root / 'assets/art-history/u5'
        moved = unit.with_name('saved-u5')
        destination = unit / 'escaped.webp'
        save = Image.Image.save
        def swap_and_save(image, handle, *args, **kwargs):
            unit.rename(moved)
            unit.symlink_to(outside, target_is_directory=True)
            return save(image, handle, *args, **kwargs)
        try:
            with patch.object(Image.Image, 'save', new=swap_and_save):
                optimize_image(source, destination)
            self.assertEqual(list(outside.iterdir()), [])
            with Image.open(moved / 'escaped.webp') as output:
                self.assertEqual(output.format, 'WEBP')
            self.assertFalse(any(moved.glob('.*.tmp')))
        finally:
            unit.unlink()
            moved.rename(unit)

    def test_noisy_photo_exhaustion_preserves_destination(self):
        source = Path(self.sources.name) / 'noise.png'
        image = Image.frombytes('RGB', (64, 64), random.Random(3).randbytes(64*64*3))
        image.save(source)
        floor = Path(self.sources.name) / 'floor.webp'
        image.save(floor, format='WEBP', quality=60)
        self.destination.write_bytes(b'original')
        with self.assertRaisesRegex(ValueError, 'floor 60'):
            optimize_image(source, self.destination, max_bytes=floor.stat().st_size-1,
                           replace=True)
        self.assertEqual(self.destination.read_bytes(), b'original')

    def test_refuses_unsafe_destinations(self):
        source = self.source()
        targets = ['assets/art-history/u4/no.webp', '.private-media/no.webp',
                   'assets/art-history/u5/../u6/no.webp',
                   Path(self.sources.name) / 'outside.webp']
        for target in targets:
            with self.subTest(target=target), self.assertRaises(ValueError):
                optimize_image(source, target)

    def test_existing_destination_requires_replace(self):
        self.destination.write_bytes(b'original')
        with self.assertRaises(FileExistsError):
            optimize_image(self.source(), self.destination)
        self.assertEqual(self.destination.read_bytes(), b'original')
        optimize_image(self.source(), self.destination, replace=True)
        with Image.open(self.destination) as output:
            self.assertEqual(output.format, 'WEBP')

    def test_failure_leaves_no_partial_output_or_temporary_file(self):
        with self.assertRaisesRegex(ValueError, 'byte|size|budget'):
            optimize_image(self.source(), self.destination, max_bytes=1)
        self.assertEqual(list(self.destination.parent.iterdir()), [])

    def test_failed_replacement_preserves_original(self):
        self.destination.write_bytes(b'original')
        with self.assertRaises(ValueError):
            optimize_image(self.source('RGBA', color=(1, 2, 3, 128)),
                           self.destination, max_bytes=1, replace=True)
        self.assertEqual(self.destination.read_bytes(), b'original')
        self.assertEqual(list(self.destination.parent.iterdir()), [self.destination])


if __name__ == '__main__':
    unittest.main()
