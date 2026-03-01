# Blomdaele Static on GitHub Pages (free)

## What works on GitHub Pages
- All files in `Blomdaele-Static` (HTML/CSS/JS/images) can be hosted for free.
- The contact form is now GitHub Pages-compatible and uses a free FormSubmit AJAX endpoint by default.

## What does NOT run on GitHub Pages
- `Blomdaele-Contact-Api` (Node.js server) cannot run on GitHub Pages.
- GitHub Pages is static hosting only (no Node, no server-side SMTP).

## Contact form setup
Current default endpoint in `js/site.js`:
- `https://formsubmit.co/ajax/info@blomdaele.be`

To use another endpoint without changing JS logic:
- Per form: add `data-endpoint="https://your-endpoint"` on the `<form>`
- Global: set `window.BLOMDAELE_CONTACT_ENDPOINT = 'https://your-endpoint'` before loading `js/site.js`

### FormSubmit first-time activation
FormSubmit sends an activation email the first time. Approve it once for `info@blomdaele.be`.

## GitHub workflow added
Workflow file:
- `.github/workflows/Blomdaele_pages_deploy.yml`

It deploys:
- `Vipersoft.Web/Vipersoft.Blomdaele/Blomdaele-Static/**`

to GitHub Pages on pushes to `main`.

## Repository settings required (one-time)
1. Go to **Settings → Pages**
2. Under **Build and deployment**, select **Source: GitHub Actions**
3. Re-run or trigger the workflow **Blomdaele Pages Deploy**

## Optional custom domain
If you want `blomdaele.be` directly on Pages, add a `CNAME` file inside `Blomdaele-Static` with your domain and configure DNS at your registrar.
