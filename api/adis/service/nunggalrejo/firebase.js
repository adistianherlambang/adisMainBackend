const admin = require("firebase-admin")
const dotenv = require("dotenv")

dotenv.config();

// Validate required env vars for the Firebase service account
const requiredEnv = [
  "NUNGGALREJO_FB_TYPE",
  "NUNGGALREJO_FB_PROJECT_ID",
  "NUNGGALREJO_FB_PRIVATE_KEY_ID",
  "NUNGGALREJO_FB_PRIVATE_KEY",
  "NUNGGALREJO_FB_EMAIL"
];

const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  throw new Error(
    `Missing required environment variables for Nunggalrejo Firebase: ${missing.join(", ")}`
  );
}

const privateKey = process.env.NUNGGALREJO_FB_PRIVATE_KEY.replace(/\\n/g, "\n");

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.NUNGGALREJO_FB_TYPE,
    project_id: process.env.NUNGGALREJO_FB_PROJECT_ID,
    private_key_id: process.env.NUNGGALREJO_FB_PRIVATE_KEY_ID,
    private_key: privateKey,
    client_email: process.env.NUNGGALREJO_FB_EMAIL,
    client_id: process.env.NUNGGALREJO_FB_CLIENT_ID,
    auth_uri: process.env.NUNGGALREJO_FB_AUTH_URI,
    token_uri: process.env.NUNGGALREJO_FB_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.NUNGGALREJO_FB_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.NUNGGALREJO_FB_CLIENT_CERT_URL,
    universe_domain: process.env.NUNGGALREJO_FB_UNIVERSE_DOMAIN
  })
});

const db = admin.firestore();
module.exports = db