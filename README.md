# Resume Tracker

A clean, minimal Windows desktop app for tracking job applications, resumes, and cover letters.

## Features

- Dashboard metrics for applied, rejected, interviewed, and offered applications.
- Job application records with company, title, location, job type, email, job link, description, notes, status, and submitted date.
- Separate add/edit application window.
- Resume and cover letter libraries with local uploads.
- Application form document pickers that can choose existing files or upload new files.
- Local SQLite storage under the Electron user data folder.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run dist
```

`npm run build` checks TypeScript and builds the Electron main, preload, and renderer bundles. `npm run dist` creates a portable Windows executable with Electron Builder, such as `release/Resume Tracker Portable 1.0.0.exe`.

## Local Data

Application data is stored locally in Electron's `userData` folder:

- `resume-tracker.db` for SQLite data.
- `files/resumes/` for uploaded resumes.
- `files/cover-letters/` for uploaded cover letters.

The Settings dialog shows the exact folder and can open it in Explorer.
