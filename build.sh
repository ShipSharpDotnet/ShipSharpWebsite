#!/bin/sh
set -eu

export DOTNET_CLI_TELEMETRY_OPTOUT=1
export DOTNET_NOLOGO=1

curl -sSL https://dot.net/v1/dotnet-install.sh > dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh -c 10.0 -InstallDir ./dotnet

./dotnet/dotnet --version

rm -rf output
./dotnet/dotnet publish -c Release -o output

# Cloudflare Pages uses _redirects for SPA fallback. Workers static assets use
# not_found_handling in wrangler.jsonc instead, so do not emit this file there.
if [ "${CF_PAGES:-}" = "1" ] && [ "${WORKERS_CI:-}" != "1" ]; then
  printf '/* /index.html 200\n' > output/wwwroot/_redirects
fi
