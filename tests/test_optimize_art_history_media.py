"""Offline optimizer contract, using only generated fixtures."""
from dataclasses import FrozenInstanceError
from pathlib import Path
import random
import tempfile
import unittest
from unittest.mock import patch

from PIL import Image
from scripts.optimize_art_history_media import optimize_image


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
        self.assertIn(self.destination.read_bytes(), candidates)

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
