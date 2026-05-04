# Release Checklist

## Basic App

- Open `https://trevorc-allen.github.io/StillClimb/`.
- Confirm the title and installed app name are `StillClimb`.
- Confirm first-time data is empty except for the default local account.
- Add the app to the phone home screen and reopen it.

## Local Accounts

- Create a second local account.
- Add one training entry in each account.
- Switch accounts and confirm records are isolated.
- Export JSON from one account.
- Import JSON into another account and confirm data appears there.
- Delete a non-active account after confirmation.

## Training Log

- Create boulder and route entries.
- Confirm V Scale and YDS grade formatting.
- Confirm dashboard metrics and grade pyramid update.
- Delete a history row and confirm it disappears only from the active account.

## Guidebook

- Search `Smith Rock`.
- Preview an area.
- Save an area.
- Open an OpenBeta external link.
- Disconnect network and confirm the app shell still opens.

## Motion Analysis

- Open the Motion view.
- Grant camera permission.
- Confirm fallback rule sliders still work if the pose model cannot load.
- Toggle center-of-mass trail on and off.

## PWA Update

- Confirm `sw.js` cache name changes for each release.
- On an existing install, reopen the app twice and confirm the new version appears.

## Known Limits

- Local accounts are not cloud accounts.
- Data does not sync across devices without JSON export/import.
- Motion analysis is a training aid, not a safety system.
- Outdoor guidebook data depends on OpenBeta availability.
