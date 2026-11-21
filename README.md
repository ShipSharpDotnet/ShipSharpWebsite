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

`wwwroot/_redirects` and `wwwroot/_headers` are copied into that folder automatically.

## Deploy to Cloudflare Pages

1. Push this folder to GitHub (or GitLab).
2. In Cloudflare, go to **Workers & Pages → Create application → Pages → Connect to Git**.
3. Select the repository.
4. Use these build settings:

   | Setting | Value |
   | --- | --- |
   | Production branch | `main` |
   | Build command | `./build.sh` |
   | Build directory | `output/wwwroot` |
   | Root directory | `/` (or the folder containing `ShipSharp.csproj`) |

5. Make sure `build.sh` is committed with executable permission:

   ```bash
   chmod +x build.sh
   git update-index --chmod=+x build.sh
   ```

6. Deploy. Cloudflare will install .NET 10, publish the app, and upload `output/wwwroot`.

7. Add your custom domain:

   - In the Pages project, go to **Custom domains → Set up a custom domain**.
   - Add `shipsharp.net` and, optionally, `www.shipsharp.net`.
   - Cloudflare provisions certificates automatically.

8. In **SSL/TLS → Overview**, use **Full (strict)** once your origin/domain is configured.

`build.sh` already sets:

```text
DOTNET_CLI_TELEMETRY_OPTOUT=1
DOTNET_NOLOGO=1
```

### Cloudflare files

- `wwwroot/_redirects` — sends unknown routes to `index.html` so `/services`, `/projects`, `/stack`, and `/contact` work on direct load.
- `wwwroot/_headers` — emits security headers. HTTPS/HSTS are handled by Cloudflare’s dashboard, not ASP.NET Core middleware.

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
