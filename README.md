# FD Tracker

Fixed Deposit tracker for browser and mobile, built as a static web app.

## Cloudflare Pages Deployment

This project can be deployed directly to Cloudflare Pages as a static site.

### Option 1: GitHub + Cloudflare Pages

Recommended if you want automatic redeploys whenever you push changes.

1. Push this folder to a GitHub repository.
2. Log in to Cloudflare and go to `Workers & Pages`.
3. Select `Create application`.
4. Choose `Pages` and connect your GitHub repository.
5. Use these settings:

   - Production branch: `main`
   - Framework preset: `None`
   - Build command: leave blank, or use `exit 0`
   - Build output directory: `.`

6. Deploy the project.
7. Cloudflare will give you a `*.pages.dev` URL.

### Option 2: Direct Upload

Useful if you want to upload the project without GitHub.

1. Log in to Cloudflare and go to `Workers & Pages`.
2. Select `Create application`.
3. Choose `Pages`.
4. Choose `Direct Upload` or `Drag and drop your files`.
5. Upload this project folder as the site contents.
6. Set the project name and deploy.

Important: Direct Upload projects cannot later be switched to Git integration. If you want automatic deployments later, create a new Pages project connected to Git.

## Cloud Persistence With Cloudflare D1

This repo now includes:

- Pages Functions API routes under `functions/api/deposits/`
- D1 schema in `db/schema.sql`
- frontend API-first loading with browser fallback

To enable permanent cloud storage, connect the Pages project to Git and bind a D1 database.

### 1. Use a Git-connected Pages project

Cloudflare Pages Functions require Git integration or Wrangler-based deployment.

If your current site was created with Direct Upload, create a new Pages project from this GitHub repo instead of extending the Direct Upload project.

### 2. Create a D1 database

In Cloudflare dashboard:

1. Go to `Workers & Pages` -> `D1 SQL Database`
2. Create a database, for example: `fd-tracker-db`
3. Copy the database ID

### 3. Add the D1 binding to Pages

In your Pages project:

1. Open `Settings`
2. Open `Bindings`
3. Add a `D1 database` binding
4. Use binding name: `DB`
5. Select your `fd-tracker-db` database

The API routes in this repo expect the binding name to be exactly `DB`.

### 4. Apply the schema

Run this with Wrangler after logging in:

```powershell
npx wrangler d1 execute fd-tracker-db --file=./db/schema.sql
```

If Wrangler asks for authentication, complete the Cloudflare login flow first:

```powershell
npx wrangler login
```

### 5. Redeploy the Pages project

After the binding and schema are ready, redeploy the Pages project from Git.

Once deployed:

- `GET /api/deposits` will load saved deposits from D1
- `POST /api/deposits` will save deposits to D1
- `DELETE /api/deposits/:id` will remove deposits from D1

### 6. Local data migration behavior

If the app finds local browser deposits and the remote D1 database is empty, it will automatically try to copy the browser data into D1 on first successful API load.

### 7. Privacy warning

This implementation does not yet include authentication.

Before storing real FD data in D1, you should protect the site with:

- Cloudflare Access, or
- another authentication layer

Without protection, anyone who can reach the site URL could potentially access the shared backend data.

## Custom Domain

After deployment:

1. Open your Pages project.
2. Go to `Custom domains`.
3. Select `Set up a domain`.
4. Add your domain or subdomain.

Notes:

- If you want to use an apex domain like `example.com`, the domain should be on Cloudflare nameservers.
- If you want to use a subdomain like `fd.example.com`, you can point a CNAME to your `*.pages.dev` domain.

## Recommended Settings For This Project

- Build output directory: `.`
- No Node build step required
- HTTPS is handled by Cloudflare
- Works on desktop and mobile browsers
- D1 binding name: `DB`

## Notification Reminder Limitation

This app uses browser notification permission. That means:

- In-app reminders always appear in the dashboard
- Popup reminders only work if the user enables notifications
- Notifications are best when the app is open or installed as a home screen app
- This is not yet a full backend push-notification system

## Local Preview

You can preview locally with:

```powershell
python -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

## Cloudflare References

- Cloudflare Pages Static HTML: https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- Cloudflare Build Configuration: https://developers.cloudflare.com/pages/configuration/build-configuration/
- Cloudflare Direct Upload: https://developers.cloudflare.com/pages/get-started/direct-upload/
- Cloudflare Custom Domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
- Cloudflare Pages Functions: https://developers.cloudflare.com/pages/functions/
- Cloudflare Pages Bindings: https://developers.cloudflare.com/pages/functions/bindings/
- Cloudflare D1 Get Started: https://developers.cloudflare.com/d1/get-started/
