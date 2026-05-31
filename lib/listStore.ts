import { getDatabase } from "@/lib/firebaseAdmin"

export type ListItem = {
  id: string
  label: string
  done: boolean
}

type ListDocument = {
  _id: string
  items: ListItem[]
  updatedAt: string
}

const hasValidAdminCredentials = (): boolean => {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  const databaseURL = process.env.FIREBASE_DATABASE_URL

  return Boolean(
    projectId &&
      databaseURL &&
      clientEmail &&
      privateKey &&
      clientEmail.includes("gserviceaccount.com") &&
      privateKey.includes("BEGIN PRIVATE KEY")
  )
}

const getDatabaseUrl = (): string => {
  const databaseURL =
    process.env.FIREBASE_DATABASE_URL ?? process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL

  if (!databaseURL) {
    throw new Error(
      "Missing Firebase database URL. Set FIREBASE_DATABASE_URL (or NEXT_PUBLIC_FIREBASE_DATABASE_URL)."
    )
  }

  return databaseURL.replace(/\/$/, "")
}

const getListEndpoint = (listId: string): string => {
  return `${getDatabaseUrl()}/lists/${encodeURIComponent(listId)}.json`
}

export const loadList = async (listId: string): Promise<ListItem[]> => {
  if (hasValidAdminCredentials()) {
    const snapshot = await getDatabase().ref(`lists/${listId}`).get()
    if (!snapshot.exists()) return []
    const doc = snapshot.val() as ListDocument
    return Array.isArray(doc?.items) ? doc.items : []
  }

  const response = await fetch(getListEndpoint(listId), {
    method: "GET",
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `Realtime DB GET failed (${response.status} ${response.statusText}). ${body || "Check Firebase Realtime Database rules."}`
    )
  }

  const doc = (await response.json()) as ListDocument | null
  return Array.isArray(doc?.items) ? doc.items : []
}

export const saveList = async (listId: string, items: ListItem[]): Promise<void> => {
  const payload: ListDocument = {
    _id: listId,
    items,
    updatedAt: new Date().toISOString(),
  }

  if (hasValidAdminCredentials()) {
    await getDatabase().ref(`lists/${listId}`).set(payload)
    return
  }

  const response = await fetch(getListEndpoint(listId), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `Realtime DB PUT failed (${response.status} ${response.statusText}). ${body || "Check Firebase Realtime Database rules."}`
    )
  }
}
