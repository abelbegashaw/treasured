import admin from "firebase-admin"

type FirebaseAdminConfig = {
  projectId: string
  clientEmail: string
  privateKey: string
  databaseURL: string
}

const getFirebaseConfig = (): FirebaseAdminConfig => {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  const databaseURL = process.env.FIREBASE_DATABASE_URL

  if (!projectId || !clientEmail || !privateKey || !databaseURL) {
    throw new Error(
      "Missing Firebase admin environment variables. Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_DATABASE_URL"
    )
  }

  if (
    clientEmail.includes("YOUR_SERVICE_ACCOUNT_CLIENT_EMAIL") ||
    privateKey.includes("YOUR_SERVICE_ACCOUNT_PRIVATE_KEY")
  ) {
    throw new Error(
      "Firebase Admin credentials are still placeholders. Replace FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local with values from your Firebase service account JSON."
    )
  }

  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
    databaseURL,
  }
}

const ensureFirebaseApp = () => {
  if (admin.apps.length) return
  const config = getFirebaseConfig()
  admin.initializeApp({
    credential: admin.credential.cert(config),
    databaseURL: config.databaseURL,
  })
}

export const getDatabase = () => {
  ensureFirebaseApp()
  return admin.database()
}
