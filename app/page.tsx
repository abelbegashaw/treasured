"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type ListItem = {
  id: string
  label: string
  done: boolean
}

const accessSessionKey = "list-for-two:access"

export default function Home() {
  const [items, setItems] = useState<ListItem[]>([])
  const [draft, setDraft] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [accessInput, setAccessInput] = useState("")
  const [showAccess, setShowAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const progress = useMemo(() => {
    const doneCount = items.filter((item) => item.done).length
    const total = items.length
    const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100)
    return { done: doneCount, total, percent }
  }, [items])

  const loadList = async (code: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/list", {
        headers: {
          "x-access-code": code,
        },
      })
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setAccessCode("")
          throw new Error("Access denied. Check your code.")
        }
        throw new Error("Could not load the list.")
      }
      const data = (await response.json()) as { items: ListItem[] }
      setItems(Array.isArray(data.items) ? data.items : [])
      setHasLoaded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the list.")
      setItems([])
      setHasLoaded(false)
    } finally {
      setIsLoading(false)
    }
  }

  const saveList = async (_code: string, nextItems: ListItem[]) => {
    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch("/api/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-code": _code,
        },
        body: JSON.stringify({ items: nextItems }),
      })
      if (!response.ok) {
        throw new Error("Could not save changes.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.")
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.sessionStorage.getItem(accessSessionKey)
    if (stored) {
      setAccessCode(stored)
      setAccessInput(stored)
      void loadList(stored)
    } else {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!hasLoaded || !accessCode) return
    const timeout = window.setTimeout(() => {
      void saveList(accessCode, items)
    }, 600)
    return () => window.clearTimeout(timeout)
  }, [items, accessCode, hasLoaded])

  const handleAccessSubmit = async () => {
    const trimmed = accessInput.trim()
    if (!trimmed) return
    setAccessCode(trimmed)
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(accessSessionKey, trimmed)
    }
    await loadList(trimmed)
  }

  const toggleItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item))
    )
  }

  const updateItem = (itemId: string, label: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, label } : item))
    )
  }

  const addItem = () => {
    const value = draft.trim()
    if (!value) return
    const newItem: ListItem = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      label: value,
      done: false,
    }
    setItems((prev) => [newItem, ...prev])
    setDraft("")
  }

  const requestRemoveItem = (itemId: string) => {
    setPendingDeleteId(itemId)
  }

  const cancelRemoveItem = () => {
    setPendingDeleteId(null)
  }

  const confirmRemoveItem = () => {
    if (!pendingDeleteId) return
    setItems((prev) => prev.filter((item) => item.id !== pendingDeleteId))
    setPendingDeleteId(null)
  }


  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 paper-texture" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-32 left-[-10%] h-72 w-72 rounded-full bg-[color:var(--sun)]/40 blur-3xl float-slow"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-10 right-[-12%] h-80 w-80 rounded-full bg-[color:var(--rose)]/30 blur-3xl float-slower"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 grain-overlay" aria-hidden="true" />

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 pb-16 pt-12 sm:gap-10 sm:px-6 sm:pb-20 sm:pt-16">
        <header className="reveal-up">
          <div className="flex items-center gap-3 flex-nowrap">
            <p className="min-w-0 flex-1 truncate text-xs uppercase tracking-[0.25em] text-muted sm:text-sm sm:tracking-[0.3em]">List for Two</p>
            <Link
              href="/journey"
              className="rounded-full bg-[color:var(--accent)] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white shadow-sm transition hover:bg-[color:var(--rose)] whitespace-nowrap sm:px-4 sm:text-xs sm:tracking-[0.2em]"
            >
              Journey so far ...
            </Link>
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-deep sm:text-5xl">
            Our shared bucket list.
          </h1>
          <p className="mt-4 text-lg text-muted">
            Dream it together, do it together, remember it forever.
          </p>
        </header>

        <section
          className="card-shadow rounded-3xl border border-[color:var(--line)] bg-[color:var(--card)] p-5 reveal-up sm:p-6"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-muted">Completion</p>
              <p className="mt-2 text-2xl text-deep">
                {progress.done} / {progress.total} completed
              </p>
            </div>
            <div className="min-w-[150px] rounded-full border border-[color:var(--line)] bg-white/70 px-4 py-2 text-sm text-muted sm:min-w-[180px]">
              {progress.percent}% done
            </div>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-white/70">
            <div
              className="h-2 rounded-full bg-[color:var(--accent)] transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          {isSaving ? (
            <p className="mt-3 text-sm text-muted">Saving...</p>
          ) : (
            <p className="mt-3 text-sm text-muted">Synced to the server</p>
          )}
          {error ? <p className="mt-2 text-sm text-[color:var(--rose)]">{error}</p> : null}
        </section>

        <section
          className="card-shadow rounded-3xl border border-[color:var(--line)] bg-[color:var(--card)] p-5 reveal-up sm:p-6"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addItem()
              }}
              placeholder="Add a new idea"
              className="w-full rounded-full border border-[color:var(--line)] bg-white/80 px-4 py-3 text-sm text-deep outline-none transition focus:border-[color:var(--accent)]"
            />
            <button
              type="button"
              onClick={addItem}
              className="rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm text-white transition hover:bg-[color:var(--rose)]"
            >
              Add
            </button>
          </div>

          {isLoading ? (
            <p className="mt-6 text-sm text-muted">Loading list...</p>
          ) : (
            <div className="mt-6 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    aria-pressed={item.done}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
                      item.done
                        ? "border-[color:var(--accent-2)] bg-[color:var(--accent-2)] text-white"
                        : "border-[color:var(--line)] bg-white/70 text-muted"
                    }`}
                  >
                    {item.done ? "X" : ""}
                  </button>
                  <input
                    value={item.label}
                    onChange={(event) => updateItem(item.id, event.target.value)}
                    className={`w-full border-b border-transparent bg-transparent text-base outline-none transition focus:border-[color:var(--accent)] ${
                      item.done ? "line-through text-muted/70" : "text-muted"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => requestRemoveItem(item.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--line)] text-xs text-muted transition hover:border-[color:var(--rose)] hover:text-rose"
                    aria-label="Delete"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        fill="currentColor"
                        d="M9 3h6l1 2h4v2H4V5h4l1-2zm2 6h2v8h-2V9zm-4 0h2v8H7V9zm8 0h2v8h-2V9z"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {!accessCode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--deep)]/80 px-6">
          <div className="card-shadow w-full max-w-md rounded-3xl border border-[color:var(--line)] bg-[color:var(--card)] p-8 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-muted">Private list</p>
            <h2 className="mt-3 text-2xl text-deep">Enter access code</h2>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={accessInput}
                onChange={(event) => setAccessInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void handleAccessSubmit()
                }}
                className="w-full rounded-full border border-[color:var(--line)] bg-white/80 px-4 py-3 text-sm text-deep outline-none transition focus:border-[color:var(--accent)]"
                placeholder="Access code"
                type={showAccess ? "text" : "password"}
              />
              <button
                type="button"
                onClick={() => setShowAccess((prev) => !prev)}
                className="rounded-full border border-[color:var(--line)] px-4 py-3 text-sm text-muted transition hover:border-[color:var(--accent)]"
                aria-pressed={showAccess}
              >
                {showAccess ? "Hide" : "View"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => void handleAccessSubmit()}
              className="mt-4 w-full rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm text-white transition hover:bg-[color:var(--rose)]"
            >
              Unlock list
            </button>
            {error ? <p className="mt-3 text-sm text-[color:var(--rose)]">{error}</p> : null}
          </div>
        </div>
      ) : null}

      {pendingDeleteId ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[color:var(--deep)]/70 px-6">
          <div className="card-shadow w-full max-w-md rounded-3xl border border-[color:var(--line)] bg-[color:var(--card)] p-8 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-muted">Remove item</p>
            <h2 className="mt-3 text-2xl text-deep">Delete this idea?</h2>
            <p className="mt-2 text-sm text-muted">This can’t be undone.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={cancelRemoveItem}
                className="w-full rounded-full border border-[color:var(--line)] px-5 py-3 text-sm text-muted transition hover:border-[color:var(--accent)]"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={confirmRemoveItem}
                className="w-full rounded-full bg-[color:var(--rose)] px-5 py-3 text-sm text-white transition hover:bg-[color:var(--accent)]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
