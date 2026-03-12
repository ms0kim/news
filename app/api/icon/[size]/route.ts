import { NextRequest, NextResponse } from "next/server";

const EMOJIS = ["🐰", "🍧", "🩰", "🍦", "🍨", "🐶", "🐹", "🩰", "🧴"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size } = await params;
  const emoji = request.nextUrl.searchParams.get("e") || EMOJIS[0];
  const sizeNum = parseInt(size, 10) || 192;
  const noBg = request.nextUrl.searchParams.get("bg") === "0";

  const svg = noBg
    ? `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sizeNum} ${sizeNum}" width="${sizeNum}" height="${sizeNum}">
  <text x="50%" y="50%" text-anchor="middle" dy=".35em" font-size="${sizeNum * 0.95}" font-family="system-ui, sans-serif">${emoji}</text>
</svg>`
    : `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sizeNum} ${sizeNum}" width="${sizeNum}" height="${sizeNum}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B7FD8"/>
      <stop offset="100%" style="stop-color:#C4B5FD"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".35em" font-size="${sizeNum * 0.5}" font-family="system-ui, sans-serif">${emoji}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
