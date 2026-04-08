# FD Tracker

Fixed Deposit tracker for browser and mobile, built as a static web app.

## Current State

The app currently stores data in browser local storage.

This repo is now prepared for:

- Netlify hosting
- future Supabase integration

It no longer depends on the Cloudflare D1 deployment path.

## Netlify Deployment

This project can be deployed to Netlify as a static site.

### Recommended Netlify Settings

- Build command: `echo 'Static site - no build step required'`
- Publish directory: `.`

These settings are already defined in [netlify.toml](c:/Users/kuanh/Downloads/FD-Tracker/netlify.toml).

### Deploy From GitHub

1. Log in to Netlify
2. Select `Add new site`
3. Choose `Import an existing project`
4. Connect your GitHub repository
5. Select this repo
6. Confirm the build settings from `netlify.toml`
7. Deploy

## Supabase Preparation

This repo includes a lightweight frontend config scaffold for Supabase:

- [supabase-config.js](c:/Users/kuanh/Downloads/FD-Tracker/supabase-config.js)
- [supabase-config.example.js](c:/Users/kuanh/Downloads/FD-Tracker/supabase-config.example.js)

Right now the app does not yet save to Supabase. It is only prepared for that next step.

### What is already prepared

- a dedicated Supabase config file loaded before the app
- app storage status messaging that can detect whether Supabase config values are present
- removal of Cloudflare-specific runtime assumptions

### Next implementation step

The next phase is to:

1. create a Supabase project
2. create a `deposits` table
3. add authentication
4. replace browser-only storage with Supabase reads and writes

## Privacy Note

Until Supabase auth is added, the app should still be treated as a local-only tracker.

If you deploy it publicly on Netlify today:

- the site is public
- your FD entries are still only stored in your browser local storage
- other devices will not automatically share that data yet

## Local Preview

You can preview locally with:

```powershell
python -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

## Files Added For Netlify / Supabase Direction

- [netlify.toml](c:/Users/kuanh/Downloads/FD-Tracker/netlify.toml)
- [supabase-config.js](c:/Users/kuanh/Downloads/FD-Tracker/supabase-config.js)
- [supabase-config.example.js](c:/Users/kuanh/Downloads/FD-Tracker/supabase-config.example.js)

## Next Recommended Step

If you want permanent private storage, the next best step is:

- Netlify for hosting
- Supabase for database + auth

Then we can make the app available on both desktop and mobile with the same signed-in data.
