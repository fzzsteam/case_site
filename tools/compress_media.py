#!/usr/bin/env python3
"""Safely compress JPEG, PNG, and MP4 files in place."""

import argparse
import os
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path


SUPPORTED_SUFFIXES = {".jpg", ".jpeg", ".png", ".mp4"}


@dataclass(frozen=True)
class Result:
    path: Path
    status: str
    before_bytes: int
    after_bytes: int
    error: str = ""


@dataclass(frozen=True)
class Summary:
    scanned: int
    replaced: int
    skipped: int
    failed: int
    before_bytes: int
    after_bytes: int


def discover_media(root: Path) -> list[Path]:
    """Return supported regular files below root in stable path order."""
    return sorted(
        path
        for path in root.rglob("*")
        if path.is_file() and path.suffix.lower() in SUPPORTED_SUFFIXES
    )


def directory_size(root: Path) -> int:
    """Return the total bytes occupied by regular files below root."""
    return sum(path.stat().st_size for path in root.rglob("*") if path.is_file())


def replace_if_smaller(source: Path, candidate: Path) -> bool:
    """Atomically replace source if candidate is smaller, then remove candidate."""
    if candidate.stat().st_size < source.stat().st_size:
        os.chmod(candidate, source.stat().st_mode)
        os.replace(candidate, source)
        return True
    candidate.unlink(missing_ok=True)
    return False


def probe_media(path: Path) -> bool:
    """Return true when ffprobe can read the expected primary stream."""
    process = subprocess.run(
        [
            "ffprobe", "-v", "error", "-select_streams", "v:0",
            "-show_entries", "stream=codec_type,width,height", "-of", "csv=p=0",
            str(path),
        ],
        capture_output=True,
        text=True,
    )
    return process.returncode == 0 and bool(process.stdout.strip())


def _ffmpeg_command(source: Path, candidate: Path) -> list[str]:
    common = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(source)]
    suffix = source.suffix.lower()
    if suffix in {".jpg", ".jpeg"}:
        return common + [
            "-map_metadata", "0", "-frames:v", "1", "-q:v", "3", str(candidate)
        ]
    if suffix == ".png":
        return common + [
            "-map_metadata", "0", "-frames:v", "1", "-compression_level", "9",
            "-pred", "mixed", str(candidate),
        ]
    return common + [
        "-map", "0:v:0", "-map", "0:a?", "-map_metadata", "0",
        "-c:v", "libx264", "-preset", "fast", "-crf", "24",
        "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(candidate),
    ]


def compress_one(source: Path) -> Result:
    """Compress one source safely and replace it only when output is smaller."""
    before = source.stat().st_size
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{source.stem}.compress-", suffix=source.suffix, dir=source.parent
    )
    os.close(descriptor)
    candidate = Path(temporary_name)
    try:
        candidate.unlink()
        process = subprocess.run(
            _ffmpeg_command(source, candidate), capture_output=True, text=True
        )
        if process.returncode != 0 or not candidate.exists():
            error = process.stderr.strip().splitlines()[-1] if process.stderr.strip() else "ffmpeg failed"
            return Result(source, "failed", before, before, error)
        if not probe_media(candidate):
            return Result(source, "failed", before, before, "ffprobe validation failed")
        candidate_size = candidate.stat().st_size
        if replace_if_smaller(source, candidate):
            return Result(source, "replaced", before, candidate_size)
        return Result(source, "skipped", before, before)
    except (OSError, subprocess.SubprocessError) as exc:
        return Result(source, "failed", before, before, str(exc))
    finally:
        candidate.unlink(missing_ok=True)


def run(root: Path, dry_run: bool = False) -> Summary:
    """Compress supported files below root and return exact aggregate statistics."""
    root = root.resolve()
    if not root.is_dir():
        raise ValueError(f"not a directory: {root}")
    before = directory_size(root)
    media = discover_media(root)
    results: list[Result] = []
    for index, path in enumerate(media, 1):
        if dry_run:
            result = Result(path, "skipped", path.stat().st_size, path.stat().st_size)
        else:
            print(f"[{index}/{len(media)}] {path.relative_to(root)}", flush=True)
            result = compress_one(path)
            saved = result.before_bytes - result.after_bytes
            detail = f"saved {format_bytes(saved)}" if result.status == "replaced" else result.error
            print(f"  {result.status}: {detail}".rstrip(), flush=True)
        results.append(result)
    after = directory_size(root)
    return Summary(
        scanned=len(media),
        replaced=sum(result.status == "replaced" for result in results),
        skipped=sum(result.status == "skipped" for result in results),
        failed=sum(result.status == "failed" for result in results),
        before_bytes=before,
        after_bytes=after,
    )


def format_bytes(size: int) -> str:
    value = float(size)
    for unit in ("B", "KiB", "MiB", "GiB", "TiB"):
        if abs(value) < 1024 or unit == "TiB":
            return f"{value:.2f} {unit}"
        value /= 1024
    raise AssertionError("unreachable")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", type=Path)
    parser.add_argument("--dry-run", action="store_true", help="scan without changing files")
    args = parser.parse_args()
    try:
        summary = run(args.directory, args.dry_run)
    except ValueError as exc:
        parser.error(str(exc))
    saved = summary.before_bytes - summary.after_bytes
    ratio = (saved / summary.before_bytes * 100) if summary.before_bytes else 0.0
    print("\nSummary")
    print(f"  scanned:  {summary.scanned}")
    print(f"  replaced: {summary.replaced}")
    print(f"  skipped:  {summary.skipped}")
    print(f"  failed:   {summary.failed}")
    print(f"  before:   {format_bytes(summary.before_bytes)} ({summary.before_bytes} bytes)")
    print(f"  after:    {format_bytes(summary.after_bytes)} ({summary.after_bytes} bytes)")
    print(f"  saved:    {format_bytes(saved)} ({saved} bytes, {ratio:.2f}%)")
    return 1 if summary.failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
