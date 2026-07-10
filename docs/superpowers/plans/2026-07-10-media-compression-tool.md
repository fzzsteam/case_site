# Media Compression Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, test, and run a safe recursive CLI that replaces JPEG, PNG, and MP4 files only when validated compressed output is smaller.

**Architecture:** A Python standard-library CLI discovers media, invokes ffmpeg into same-directory temporary files, validates outputs with ffprobe, atomically replaces only smaller outputs, and accumulates byte-accurate statistics. Unit tests exercise discovery and replacement decisions with real temporary files; an integration test uses generated media with the installed ffmpeg tools.

**Tech Stack:** Python 3, unittest, ffmpeg 8, ffprobe 8.

## Global Constraints

- Preserve paths, filenames, extensions, dimensions, and PNG transparency.
- Use H.264 CRF 24, AAC, and faststart for MP4.
- Never replace before successful encoding and validation; never replace with a larger file.
- Continue after per-file failure and report exact counts and bytes.

---

### Task 1: Core discovery and safe replacement

**Files:**
- Create: `tools/compress_media.py`
- Create: `tests/test_compress_media.py`

**Interfaces:**
- Produces: `discover_media(root: Path) -> list[Path]`, `replace_if_smaller(source: Path, candidate: Path) -> bool`, and `directory_size(root: Path) -> int`.

- [ ] Write unittest cases proving case-insensitive supported-file discovery, unknown-file exclusion, recursive directory byte totals, and smaller-only replacement.
- [ ] Run `python3 -m unittest tests/test_compress_media.py -v` and verify failure because the module is absent.
- [ ] Implement the minimal functions and rerun the test until it passes.

### Task 2: ffmpeg compression, validation, and reporting CLI

**Files:**
- Modify: `tools/compress_media.py`
- Modify: `tests/test_compress_media.py`

**Interfaces:**
- Produces: `compress_one(source: Path) -> Result`, `run(root: Path, dry_run: bool) -> Summary`, and CLI output with scan/replaced/skipped/failed and byte totals.

- [ ] Add tests using generated JPEG, transparent PNG, MP4, and unknown data to prove supported outputs validate, unknown files remain unchanged, and summary arithmetic is exact.
- [ ] Run the focused test and verify it fails for missing compression behavior.
- [ ] Implement format-specific ffmpeg arguments, ffprobe validation, same-directory temporary output, cleanup, continuation, dry-run, and human-readable reporting.
- [ ] Run the complete unittest suite and verify all tests pass.

### Task 3: Production execution and independent verification

**Files:**
- Modify in place: `方直智胜-往期项目/**/*.{jpg,jpeg,png,mp4}`

**Interfaces:**
- Consumes: `python3 tools/compress_media.py [--dry-run] PATH`.

- [ ] Record exact directory bytes and dry-run candidate counts.
- [ ] Run the compressor against `方直智胜-往期项目` and retain its final summary.
- [ ] Independently run ffprobe across every supported media file, count failures, and compute exact final directory bytes.
- [ ] Run the unittest suite again and report replaced count, final space, and savings.
