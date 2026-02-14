import { NextResponse } from 'next/server';

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
        "src": `${basePath}/logo.png`,
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": `${basePath}/logo.png`,
        "sizes": "256x256",
        "type": "image/png"
      },
      {
        "src": `${basePath}/logo.png`,
        "sizes": "384x384",
        "type": "image/png"
      },
      {
        "src": `${basePath}/logo.png`,
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
}
