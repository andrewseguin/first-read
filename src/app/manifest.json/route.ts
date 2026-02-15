import { NextResponse } from 'next/server';

export const dynamic = "force-static";

export function GET() {
  const isProd = process.env.NODE_ENV === 'production';
  const basePath = isProd ? '/first-read' : '';

  const manifest = {
    "theme_color": "#09090b",
    "background_color": "#09090b",
    "display": "standalone",
    "scope": isProd ? "/first-read/" : "/",
    "start_url": isProd ? "/first-read/" : "/",
    "name": "First Read",
    "short_name": "First Read",
    "description": "First Read App",
    "icons": [
      {
        "src": `${basePath}/icon-192.png`,
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": `${basePath}/icon-512.png`,
        "sizes": "512x512",
        "type": "image/png"
      },
      {
        "src": `${basePath}/icon-maskable-512.png`,
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "maskable"
      }
    ]
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
}
