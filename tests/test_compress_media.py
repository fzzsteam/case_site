import tempfile
import unittest
import subprocess
from pathlib import Path

from tools.compress_media import (
    compress_one,
    directory_size,
    discover_media,
    probe_media,
    replace_if_smaller,
    run,
)


class CoreMediaTests(unittest.TestCase):
    def test_discovers_supported_media_recursively_case_insensitively(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "nested").mkdir()
            for name in ("a.jpg", "b.JPEG", "c.png", "nested/d.MP4"):
                (root / name).write_bytes(b"media")
            (root / "ignore.bin").write_bytes(b"unknown")

            found = [path.relative_to(root).as_posix() for path in discover_media(root)]

            self.assertEqual(found, ["a.jpg", "b.JPEG", "c.png", "nested/d.MP4"])

    def test_directory_size_sums_all_regular_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "nested").mkdir()
            (root / "one").write_bytes(b"123")
            (root / "nested/two").write_bytes(b"4567")
            self.assertEqual(directory_size(root), 7)

    def test_replace_if_smaller_replaces_source(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source, candidate = root / "source.mp4", root / "candidate.mp4"
            source.write_bytes(b"original")
            candidate.write_bytes(b"new")
            self.assertTrue(replace_if_smaller(source, candidate))
            self.assertEqual(source.read_bytes(), b"new")
            self.assertFalse(candidate.exists())

    def test_compress_one_produces_valid_smaller_png(self):
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / "image.png"
            subprocess.run(
                [
                    "ffmpeg", "-v", "error", "-f", "lavfi", "-i",
                    "color=c=red@0.5:s=640x480", "-frames:v", "1", str(source),
                ],
                check=True,
            )
            with source.open("ab") as stream:
                stream.write(b"padding" * 10000)
            original_size = source.stat().st_size

            result = compress_one(source)

            self.assertEqual(result.status, "replaced")
            self.assertLess(source.stat().st_size, original_size)
            self.assertTrue(probe_media(source))

    def test_dry_run_reports_exact_counts_without_changes(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "a.jpg").write_bytes(b"abc")
            (root / "b.mp4").write_bytes(b"12345")
            (root / "ignore.bin").write_bytes(b"1234567")
            before = directory_size(root)

            summary = run(root, dry_run=True)

            self.assertEqual(summary.scanned, 2)
            self.assertEqual(summary.replaced, 0)
            self.assertEqual(summary.skipped, 2)
            self.assertEqual(summary.failed, 0)
            self.assertEqual(summary.before_bytes, before)
            self.assertEqual(summary.after_bytes, before)

    def test_replace_if_smaller_keeps_source_and_removes_candidate(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source, candidate = root / "source.png", root / "candidate.png"
            source.write_bytes(b"small")
            candidate.write_bytes(b"much larger")
            self.assertFalse(replace_if_smaller(source, candidate))
            self.assertEqual(source.read_bytes(), b"small")
            self.assertFalse(candidate.exists())


if __name__ == "__main__":
    unittest.main()
