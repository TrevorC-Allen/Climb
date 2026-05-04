# Privacy

StillClimb is local-first.

## What Stays Local

- Local account profiles
- Training entries
- Motion analysis snapshots
- Saved guidebook areas
- Imported/exported JSON backups

This data is stored in the browser on the device using `localStorage`.

## Network Requests

StillClimb makes these external requests:

- OpenBeta API for outdoor guidebook search.
- OpenBeta/theCrag links when the user opens an external guidebook page.
- MediaPipe runtime and pose model files for camera/video motion analysis.
- GitHub Pages for hosting the app shell.

Camera frames are processed in the browser. The current app does not upload camera video to a StillClimb server.

## No Cloud Account Yet

The current account system is local-only. It does not include passwords, cloud login, or multi-device sync.

## Backups

Users can export their current account data as JSON from the History view. Anyone with that JSON file can read the exported training data, so treat backups as personal files.
