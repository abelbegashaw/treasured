"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type ContentFile = {
  link?: string
  [key: string]: unknown
}

type JourneyImage = {
  id: string
  name: string
  url: string
}

const slideVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 120 : -120,
    scale: 0.98,
    filter: "blur(10px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -120 : 120,
    scale: 0.985,
    filter: "blur(8px)",
  }),
}

const sortByChronology = (a: string, b: string) => {
  const timeA = extractChronologyValue(a)
  const timeB = extractChronologyValue(b)

  if (timeA !== timeB) return timeA - timeB
  return a.localeCompare(b)
}

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
  if (numeric?.length) {
    return Number(numeric.join(""))
  }

  return Number.MAX_SAFE_INTEGER
}

const prefetchImage = (url: string) => {
  const image = new Image()
  image.src = url
}

const Icon = ({ path }: { path: string }) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" focusable="false">
    <path d={path} fill="currentColor" />
  </svg>
)

const iconPaths = {
  previous: "M15.5 5.5 9 12l6.5 6.5-1.4 1.4L6.2 12l7.9-7.9 1.4 1.4Z",
  next: "m8.5 18.5 6.5-6.5-6.5-6.5 1.4-1.4 7.9 7.9-7.9 7.9-1.4-1.4Z",
  play: "M8 5v14l11-7L8 5Z",
  pause: "M7 5h4v14H7V5Zm6 0h4v14h-4V5Z",
  zoomIn: "M11 5v6H5v2h6v6h2v-6h6v-2h-6V5h-2Zm1 14v-2h6v6h-2v-4h-4Zm-8 0v4H2v-6h6v2H4Z",
  zoomOut: "M5 11h14v2H5v-2Zm12 8v-4h4v-2h-6v6h2Zm-14 0v-6h6v2H5v4H3Zm2-14v4H3V5h4v2Z",
  reset: "M12 5a7 7 0 1 1-6.2 4H3l3.5-3.5L10 9H7.8A5 5 0 1 0 12 7V5Z",
  fit: "M4 6h16v12H4V6Zm2 2v8h12V8H6Zm2 2h8v4H8v-4Z",
  expand: "M5 5h6v2H8.4l3.1 3.1-1.4 1.4L7 8.4V11H5V5Zm8 0h6v6h-2V8.4l-3.1 3.1-1.4-1.4L15.6 7H13V5ZM5 13h2v2.6l3.1-3.1 1.4 1.4L8.4 17H11v2H5v-6Zm12 0h2v6h-6v-2h2.6l-3.1-3.1 1.4-1.4 3.1 3.1V13Z",
}

export default function JourneyPage() {
  const [images, setImages] = useState<JourneyImage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isPlaying, setIsPlaying] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [fitMode, setFitMode] = useState<"cover" | "contain">("contain")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const touchStartX = useRef<number | null>(null)

  const currentImage = images[currentIndex]
  const progressPercent = images.length ? ((currentIndex + 1) / images.length) * 100 : 0

  const goToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= images.length || index === currentIndex) return
      setDirection(index > currentIndex ? 1 : -1)
      setCurrentIndex(index)
    },
    [currentIndex, images.length]
  )

  const goNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => {
      if (images.length === 0) return 0
      return prev === images.length - 1 ? 0 : prev + 1
    })
  }, [images.length])

  const goPrevious = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => {
      if (images.length === 0) return 0
      return prev === 0 ? images.length - 1 : prev - 1
    })
  }, [images.length])

  useEffect(() => {
    const loadImages = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/content.json", { cache: "no-store" })
        if (!response.ok) throw new Error("Could not load the journey link.")

        const content = (await response.json()) as ContentFile
        const folderLink =
          typeof content.link === "string"
            ? content.link
            : Object.values(content).find((value): value is string => typeof value === "string")

        if (!folderLink) {
          throw new Error("content.json must contain a folder link.")
        }

        const slidesResponse = await fetch(`/api/journey-slides?link=${encodeURIComponent(folderLink)}`, {
          cache: "no-store",
        })

        if (!slidesResponse.ok) {
          const payload = (await slidesResponse.json().catch(() => null)) as { error?: string } | null
          throw new Error(payload?.error || "Could not load journey images.")
        }

        const payload = (await slidesResponse.json()) as { images?: JourneyImage[] }
        const nextImages = Array.isArray(payload.images) ? payload.images : []

        setImages(nextImages)
        setCurrentIndex(0)
        setZoom(1)
        setFitMode("contain")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load journey images.")
      } finally {
        setIsLoading(false)
      }
    }

    void loadImages()
  }, [])

  useEffect(() => {
    if (!isPlaying || images.length < 2) return
    const timer = window.setInterval(goNext, 4800)
    return () => window.clearInterval(timer)
  }, [goNext, images.length, isPlaying])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault()
        goNext()
        return
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault()
        goPrevious()
        return
      }
      if (event.key === " ") {
        event.preventDefault()
        setIsPlaying((prev) => !prev)
        return
      }
      if (event.key === "+" || event.key === "=") {
        event.preventDefault()
        setZoom((prev) => Math.min(2.8, Number((prev + 0.1).toFixed(2))))
        return
      }
      if (event.key === "-") {
        event.preventDefault()
        setZoom((prev) => Math.max(1, Number((prev - 0.1).toFixed(2))))
        return
      }
      if (event.key === "0") {
        event.preventDefault()
        setZoom(1)
        return
      }
      if (event.key === "Home") {
        event.preventDefault()
        goToIndex(0)
        return
      }
      if (event.key === "End") {
        event.preventDefault()
        goToIndex(images.length - 1)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goNext, goPrevious, goToIndex, images.length])

  useEffect(() => {
    if (!currentImage) return
    const next = images[(currentIndex + 1) % images.length]
    const previous = images[(currentIndex - 1 + images.length) % images.length]
    if (next) prefetchImage(next.url)
    if (previous) prefetchImage(previous.url)
  }, [currentImage, currentIndex, images])

  const zoomIn = () => setZoom((prev) => Math.min(2.8, Number((prev + 0.1).toFixed(2))))
  const zoomOut = () => setZoom((prev) => Math.max(1, Number((prev - 0.1).toFixed(2))))
  const resetZoom = () => setZoom(1)

  const thumbnailIndices = useMemo(() => {
    if (images.length <= 7) return images.map((_, index) => index)
    const start = Math.max(0, currentIndex - 3)
    const end = Math.min(images.length, start + 7)
    return Array.from({ length: end - start }, (_, offset) => start + offset)
  }, [currentIndex, images])

  return (
    <div
      className="relative h-dvh overflow-hidden bg-[color:var(--deep)] text-white"
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current
        const endX = event.changedTouches[0]?.clientX
        touchStartX.current = null

        if (startX === null || endX === undefined) return
        const delta = endX - startX
        if (Math.abs(delta) < 40) return
        if (delta < 0) goNext()
        else goPrevious()
      }}
    >
      <style jsx global>{`
        .journey-stage-glow {
          animation: journeyPulse 7.5s ease-in-out infinite;
        }
        @keyframes journeyPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.45;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.68;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(233,180,76,0.26),transparent_28%),radial-gradient(circle_at_82%_14%,rgba(194,75,90,0.26),transparent_32%),linear-gradient(135deg,rgba(37,30,26,0.96),rgba(20,17,15,1))]" />
      <div className="pointer-events-none absolute inset-0 grain-overlay opacity-30" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-24 left-[-8%] h-72 w-72 rounded-full bg-[color:var(--sun)]/25 blur-3xl journey-stage-glow" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-6%] h-80 w-80 rounded-full bg-[color:var(--rose)]/20 blur-3xl journey-stage-glow" aria-hidden="true" />

      <header className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="rounded-full border border-white/18 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-white/80 backdrop-blur-md transition hover:border-white/40 hover:text-white"
        >
          Back
        </Link>

        <div className="min-w-0 text-center">
          <p className="truncate text-xs uppercase tracking-[0.24em] text-white/55">Journey so far</p>
          <p className="mt-1 text-sm text-white/80">{images.length ? `${currentIndex + 1} / ${images.length}` : "Loading"}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFitMode((prev) => (prev === "cover" ? "contain" : "cover"))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white/80 backdrop-blur-md transition hover:border-white/40 hover:text-white"
            aria-label={fitMode === "cover" ? "Show full image" : "Fill the frame"}
            title={fitMode === "cover" ? "Show full image" : "Fill the frame"}
          >
            <Icon path={fitMode === "cover" ? iconPaths.fit : iconPaths.expand} />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white/80 backdrop-blur-md transition hover:border-white/40 hover:text-white"
            aria-label={isPlaying ? "Pause slideshow" : "Resume slideshow"}
            title={isPlaying ? "Pause slideshow" : "Resume slideshow"}
            disabled={images.length < 2}
          >
            <Icon path={isPlaying ? iconPaths.pause : iconPaths.play} />
          </button>
        </div>
      </header>

      <main className="relative z-10 flex h-full items-center justify-center px-3 pb-24 pt-20 sm:px-6 sm:pb-28 sm:pt-24">
        {isLoading ? (
          <div className="rounded-3xl border border-white/15 bg-white/10 px-6 py-5 text-center text-sm text-white/75 backdrop-blur-md">
            Loading the journey...
          </div>
        ) : error ? (
          <div className="max-w-md rounded-3xl border border-white/15 bg-white/10 px-6 py-5 text-center backdrop-blur-md">
            <p className="text-lg font-semibold">Unable to load slideshow</p>
            <p className="mt-2 text-sm text-white/70">{error}</p>
          </div>
        ) : currentImage ? (
          <div className="relative h-full w-full max-w-7xl overflow-hidden rounded-[32px] border border-white/12 bg-white/[0.05] shadow-2xl shadow-black/30 backdrop-blur-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_65%)]" />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentImage.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <div
                    className="absolute inset-0 flex items-center justify-center p-4 transition-transform duration-300 ease-out sm:p-6"
                    style={{ transform: `scale(${zoom})` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentImage.url}
                      alt={currentImage.name}
                      className={`max-h-full max-w-full select-none object-contain ${fitMode === "cover" ? "h-full w-full" : "h-auto w-auto"}`}
                      draggable={false}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/55 via-black/18 to-transparent" />
          </div>
        ) : (
          <div className="rounded-3xl border border-white/15 bg-white/10 px-6 py-5 text-center text-sm text-white/75 backdrop-blur-md">
            No images were found in that folder.
          </div>
        )}

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrevious}
              className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/18 bg-white/10 p-3 text-white/80 backdrop-blur-md transition hover:border-white/40 hover:bg-white/15 hover:text-white sm:inline-flex"
              aria-label="Previous slide"
            >
              <Icon path={iconPaths.previous} />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/18 bg-white/10 p-3 text-white/80 backdrop-blur-md transition hover:border-white/40 hover:bg-white/15 hover:text-white sm:inline-flex"
              aria-label="Next slide"
            >
              <Icon path={iconPaths.next} />
            </button>
          </>
        ) : null}
      </main>

      <footer className="absolute inset-x-0 bottom-0 z-30 flex flex-col gap-3 px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="h-1 overflow-hidden rounded-full bg-white/14">
          <div className="h-full rounded-full bg-[color:var(--sun)] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrevious}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white/80 backdrop-blur-md transition hover:border-white/40 hover:text-white sm:hidden"
              aria-label="Previous slide"
            >
              <Icon path={iconPaths.previous} />
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-lg shadow-black/20 transition hover:bg-[color:var(--rose)]"
              aria-label={isPlaying ? "Pause slideshow" : "Resume slideshow"}
              disabled={images.length < 2}
            >
              <Icon path={isPlaying ? iconPaths.pause : iconPaths.play} />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-white/10 text-white/80 backdrop-blur-md transition hover:border-white/40 hover:text-white sm:hidden"
              aria-label="Next slide"
            >
              <Icon path={iconPaths.next} />
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-2 py-2 backdrop-blur-md">
            <button
              type="button"
              onClick={zoomOut}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Zoom out"
            >
              <Icon path={iconPaths.zoomOut} />
            </button>
            <button
              type="button"
              onClick={resetZoom}
              className="inline-flex h-9 min-w-14 items-center justify-center rounded-full px-3 text-xs uppercase tracking-[0.18em] text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={zoomIn}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Zoom in"
            >
              <Icon path={iconPaths.zoomIn} />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="hidden h-9 items-center justify-center rounded-full px-3 text-xs uppercase tracking-[0.18em] text-white/80 transition hover:bg-white/10 hover:text-white sm:inline-flex"
              aria-label="Reset zoom"
              title="Reset zoom"
            >
              <Icon path={iconPaths.reset} />
            </button>
            <button
              type="button"
              onClick={() => setFitMode((prev) => (prev === "cover" ? "contain" : "cover"))}
              className="hidden h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white sm:inline-flex"
              aria-label={fitMode === "cover" ? "Show full image" : "Fill the frame"}
              title={fitMode === "cover" ? "Show full image" : "Fill the frame"}
            >
              <Icon path={fitMode === "cover" ? iconPaths.fit : iconPaths.expand} />
            </button>
          </div>
        </div>

        {thumbnailIndices.length > 1 ? (
          <div className="flex items-center justify-center gap-2">
            {thumbnailIndices.map((index) => {
              const image = images[index]
              const active = index === currentIndex

              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => goToIndex(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${active ? "w-7 bg-[color:var(--sun)]" : "w-2.5 bg-white/35 hover:bg-white/60"}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              )
            })}
          </div>
        ) : null}
      </footer>
    </div>
  )
}