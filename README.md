# ShipSharp.net

Static **Blazor WebAssembly** portfolio for ShipSharp.net / Kelenna Kennedy Okere.

The deployable output is `output/wwwroot`, which contains only static files. This makes it suitable for Cloudflare Pages, GitHub Pages, Netlify, nginx, or any static file host.

## Local development

```bash
dotnet run
```

Open the URL printed by the Blazor dev server.

## Rebuilding CSS

Tailwind is compiled locally (no CDN at runtime). The generated `wwwroot/tailwind.css` is committed, so normal builds need no Node/npm.

Download the standalone CLI once (Linux x64):

```bash
mkdir -p tools
curl -L --fail -o tools/tailwindcss \
  https://github.com/tailwindlabs/tailwindcss/releases/download/v3.4.17/tailwindcss-linux-x64
chmod +x tools/tailwindcss
```

After changing any Razor markup or classes:

```bash
./tools/tailwindcss -c tailwind.config.js \
  -i wwwroot/styles/tailwind.input.css \
  -o wwwroot/tailwind.css --minify
```

## Static publish

```bash
dotnet publish -c Release -o output
```

Deploy the contents of:

```text
output/wwwroot
```

`wwwroot/_headers` is copied into that folder automatically. SPA fallback is configured in `wrangler.jsonc` for Workers, and `build.sh` generates `_redirects` only for Cloudflare Pages builds.

## Deploy to Cloudflare

### Current setup: Workers Builds + static assets

The existing Cloudflare project is a **Worker** (`shipsharpwebsite`), not a Pages project. That is why the deploy log shows `npx wrangler deploy` and a `.workers.dev` URL. It still serves the same static Blazor output; the important part is that Wrangler uploads `output/wwwroot`.

1. Push this folder to GitHub.
2. Keep these files committed:
   - `build.sh` (executable)
   - `wrangler.jsonc`
3. In Cloudflare, open the `shipsharpwebsite` Worker.
4. Go to **Settings → Build**.
5. Set:

   | Setting | Value |
   | --- | --- |
   | Root directory | `/` |
   | Build command | `./build.sh` |
   | Deploy command | Leave default (`npx wrangler deploy`) |
   | Build directory / output directory | `output/wwwroot` if the field is shown |

6. Remove any custom deploy command that mentions `--assets wwwroot` or otherwise bypasses `./build.sh`.
7. Deploy again.

`wrangler.jsonc` contains:

```jsonc
{
  "name": "shipsharpwebsite",
  "compatibility_date": "2026-11-21",
  "assets": {
    "directory": "./output/wwwroot",
    "not_found_handling": "single-page-application"
  }
}
```

`not_found_handling` serves `index.html` for unknown routes, so `/services`, `/projects`, `/stack`, and `/contact` work on direct load. A `_redirects` file is intentionally not used in this mode.

A correct deploy log should show `./build.sh` running, the .NET publish output, and roughly 160 files / 16–19 MB being uploaded — not 16 files / 0.33 KiB from `wwwroot`.

`build.sh` already sets:

```text
DOTNET_CLI_TELEMETRY_OPTOUT=1
DOTNET_NOLOGO=1
```

It also deletes the old `output/` directory before publishing, so stale files cannot be deployed.

### Cloudflare files

- `wrangler.jsonc` — points Wrangler at `output/wwwroot` and enables SPA fallback.
- `wwwroot/_headers` — emits security headers and marks the `workers.dev` URL `noindex`. HTTPS/HSTS are handled by Cloudflare’s dashboard, not ASP.NET Core middleware.

### Custom domain

For the current Worker:

1. Open the Worker → **Settings → Domains & Routes → Add Custom Domain**.
2. Add `shipsharp.net` and, optionally, `www.shipsharp.net`.
3. In your Cloudflare zone, go to **SSL/TLS → Overview → Full (strict)** once DNS is proxied and the certificate is active.

### If you want a true Pages project instead

Create a new **Pages → Connect to Git** project with:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `./build.sh` |
| Build output directory | `output/wwwroot` |
| Root directory | `/` |

Pages ignores `wrangler.jsonc`, so `build.sh` detects Cloudflare Pages via `CF_PAGES=1` and generates `output/wwwroot/_redirects` containing:

```text
/* /index.html 200
```

Workers Builds sets `WORKERS_CI=1`, so the file is not generated there and the two SPA fallback mechanisms do not conflict.

### Important: SEO

This is a pure client-side Blazor WebAssembly app. Search engines that do not execute JavaScript will only see the `index.html` shell, not the fully rendered page content.

Google can usually render JavaScript, but indexing may be slower. `wwwroot/index.html` includes a static title, description, canonical URL, Open Graph/Twitter tags, and Person JSON-LD with the real email and social profiles so crawlers still get useful baseline metadata.

If strong SEO matters, the next upgrade is build-time prerendering for the six routes, or hosting the original Interactive Server app on a .NET host with Cloudflare in front.

### File size note

Cloudflare Pages has a 25 MiB per-file limit. AOT is explicitly disabled in `ShipSharp.csproj`, so the published runtime should stay below that limit. If you later enable AOT and hit the limit, disable it again or load the Brotli-compressed runtime.

## Docker (optional)

```bash
docker build -t shipsharp .
docker run -p 8080:80 shipsharp
```

The image serves the static output with nginx and includes the same SPA fallback and security headers.

## Contact information

- Email: `shipsharp.net@gmail.com`
- GitHub: https://github.com/ShipSharpDotnet
- LinkedIn: https://www.linkedin.com/in/shipsharp-dotnet/
- Fiverr: https://www.fiverr.com/shipsharp

## Other notes

- Canonical URLs and Open Graph tags assume `https://shipsharp.net`. Change `BaseUrl` in `Components/Seo.razor`, plus the URLs in `wwwroot/sitemap.xml` and `wwwroot/robots.txt`, if the domain changes.
- Fonts are self-hosted Latin-subset WOFF2 files (see `FONT-LICENSES.md`).
- The logo is an optimized WebP with a PNG favicon.
- The original Interactive Server version was backed up outside the project during migration.
