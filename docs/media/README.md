# PathProof media package

All files were recaptured from the redesigned local application on September 26, 2026. No product interface state was composited or fabricated. The recording is silent by design and includes burned English captions; matching `.srt`, `.ass`, and transcript files are included.

## Deliverables

- `01-start.png`: seeded 6-of-8 audit and visible findings.
- `02-findings.png`: missing-route finding selected.
- `03-counterexample.png`: exact fixed inputs and failing path.
- `04-corrected.png`: repaired model with 8 of 8 scenarios terminating.
- `05-mobile.png`: full mobile layout capture.
- `pathproof-walkthrough.mp4`: 2:16 real-browser walkthrough, 1440 × 1080, H.264, no audio, burned captions.
- `walkthrough.srt`, `walkthrough.ass`, `transcript.md`: English accessibility and editing sources.
- `recording.json`, `media-probe.txt`, `render.log`: capture timing and technical evidence.
- `example-model.json`, `example-audit.md`: files downloaded during the recorded flow.

The MP4 is suitable for review but still needs upload to YouTube, Vimeo, or Youku as public or unlisted before GIBC submission. A private or local-only file does not meet that event requirement.

Capture tooling used Playwright and FFmpeg locally. Raw browser video is retained under `raw/`; FFmpeg itself is not redistributed in this project.
