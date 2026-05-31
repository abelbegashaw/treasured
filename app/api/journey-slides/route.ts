import { NextResponse } from "next/server"

type JourneyImage = {
  id: string
  name: string
  url: string
}

const imageExtensions = /\.(jpe?g|png|gif|webp|avif)$/i

const extractFolderId = (input: string): string | null => {
  const trimmed = input.trim()

  const folderMatch = trimmed.match(/\/folders\/([A-Za-z0-9_-]+)/)
  if (folderMatch?.[1]) return folderMatch[1]

  if (/^[A-Za-z0-9_-]{10,}$/.test(trimmed)) return trimmed

  return null
}

const decodeHtml = (value: string) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")

const extractChronologyValue = (name: string) => {
  const timestamp = name.match(/(\d{4})-(\d{2})-(\d{2})[_-](\d{2})-(\d{2})-(\d{2})/)
  if (timestamp?.length === 7) {
    const [, year, month, day, hour, minute, second] = timestamp
    return Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    )
  }

  const numeric = name.match(/\d+/g)
  if (numeric?.length) return Number(numeric.join(""))

  return Number.MAX_SAFE_INTEGER
}

const buildImageUrl = (fileId: string) => `/api/journey-image?id=${encodeURIComponent(fileId)}`

const parseFolderPage = (html: string): JourneyImage[] => {
  const entryRegex = /aria-label="([^"]+?)\s+Image\s+Shared"[\s\S]*?data-id="([A-Za-z0-9_-]{10,})"/gi
  const entries = new Map<string, JourneyImage>()

  for (const match of html.matchAll(entryRegex)) {
    const name = decodeHtml((match[1] || "").trim())
    const fileId = match[2]

    if (!name || !fileId || !imageExtensions.test(name)) continue
    if (entries.has(fileId)) continue

    entries.set(fileId, {
      id: fileId,
      name,
      url: buildImageUrl(fileId),
    })
  }

  return Array.from(entries.values()).sort((a, b) => {
    const timeA = extractChronologyValue(a.name)
    const timeB = extractChronologyValue(b.name)

    if (timeA !== timeB) return timeA - timeB
    return a.name.localeCompare(b.name)
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const link = searchParams.get("link")

  if (!link) {
    return NextResponse.json({ error: "Missing 'link' query parameter." }, { status: 400 })
  }

  const folderId = extractFolderId(decodeURIComponent(link))
  if (!folderId) {
    return NextResponse.json({ error: "Invalid Google Drive folder link." }, { status: 400 })
  }

  const folderUrl = `https://drive.google.com/drive/folders/${encodeURIComponent(folderId)}?hl=en&usp=sharing`

  try {
    const upstream = await fetch(folderUrl, {
      cache: "no-store",
      headers: {
        Accept: "text/html,application/xhtml+xml",
      },
    })

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Could not fetch folder page (${upstream.status}).` },
        { status: 502 }
      )
    }

    const html = await upstream.text()
    const images = parseFolderPage(html)

    if (!images.length) {
      return NextResponse.json({ error: "No images were found in that folder." }, { status: 404 })
    }

    return NextResponse.json({ images })
  } catch (error) {
    return NextResponse.json(
      {
        error: `Could not load journey folder: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 502 }
    )
  }
}