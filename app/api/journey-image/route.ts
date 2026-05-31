import { NextResponse } from "next/server"

const extractFileId = (url: string): string | null => {
  const match = url.match(/\/file\/d\/([^/]+)/)
  if (match?.[1]) return match[1]
  // also support direct id input
  if (/^[A-Za-z0-9_-]{10,}$/.test(url)) return url
  return null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const urlParam = searchParams.get("url")

  const driveUrl = urlParam ?? searchParams.get("id") ?? null

  if (!driveUrl) {
    return NextResponse.json({ error: "Missing 'url' query parameter." }, { status: 400 })
  }

  const fileId = extractFileId(decodeURIComponent(driveUrl))
  if (!fileId) {
    return NextResponse.json({ error: "Invalid Google Drive URL or file id." }, { status: 400 })
  }

  const sourceUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`

  try {
    console.log(`[journey-image] proxying fileId=${fileId} source=${sourceUrl}`)
    const upstream = await fetch(sourceUrl, { cache: "no-store" })
    if (!upstream.ok) {
      console.warn(`[journey-image] upstream returned ${upstream.status} for fileId=${fileId}`)
      return NextResponse.json({ error: `Could not fetch journey image (${upstream.status}).` }, { status: 502 })
    }

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream"
    console.log(`[journey-image] fetched fileId=${fileId} content-type=${contentType}`)
    const arrayBuffer = await upstream.arrayBuffer()

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Could not fetch journey image: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 502 }
    )
  }
}
