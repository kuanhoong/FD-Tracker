# FD Tracker

Fixed Deposit tracker for browser and mobile, built as a static web app.

## Current Storage Model

The app now reads its shared deposit data from [data/deposits.json](c:/Users/kuanh/Downloads/FD-Tracker/data/deposits.json).

- The deployed site is read-only for deposit entries.
- To change tracked deposits, edit `data/deposits.json`, commit, and redeploy.
- Browser-only preferences still use local storage for theme choice and notification reminder deduping.

## Data File Format

`data/deposits.json` must contain an array of objects using this shape:

```json
[
  {
    "id": "uuid",
    "bankName": "UOB Bank",
    "depositName": "UOB FD",
    "principal": 300000,
    "rate": 3.7,
    "startDate": "2025-12-15",
    "tenureMonths": 6,
    "maturityDate": "2026-06-15",
    "notes": ""
  }
]
```

## Updating Deposits

1. Edit [data/deposits.json](c:/Users/kuanh/Downloads/FD-Tracker/data/deposits.json).
2. Keep each object aligned with the schema above.
3. Commit and push the change.
4. Redeploy on Netlify.

The service worker treats `data/deposits.json` as network-first so fresh deploy data is picked up without staying stuck on an older cached copy.

## Netlify Deployment

This project can be deployed to Netlify as a static site.

### Recommended Netlify Settings

- Build command: `echo 'Static site - no build step required'`
- Publish directory: `.`

These settings are already defined in [netlify.toml](c:/Users/kuanh/Downloads/FD-Tracker/netlify.toml).

### Deploy From GitHub

1. Log in to Netlify.
2. Select `Add new site`.
3. Choose `Import an existing project`.
4. Connect your GitHub repository.
5. Select this repo.
6. Confirm the build settings from `netlify.toml`.
7. Deploy.

## Local Preview

You can preview locally with:

```powershell
python -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

## Notes

- Supabase runtime integration has been removed from the frontend.
- Existing seed data in `data/deposits.json` was exported from the previous Supabase `deposits` table.
