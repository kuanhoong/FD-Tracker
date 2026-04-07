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
