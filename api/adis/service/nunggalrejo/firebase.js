const admin = require("firebase-admin");

let initialized = false;
let initError = null;

function checkEnvVars() {
  const requiredEnv = [
    "NUNGGALREJO_FB_TYPE",
    "NUNGGALREJO_FB_PROJECT_ID",
    "NUNGGALREJO_FB_PRIVATE_KEY_ID",
    "NUNGGALREJO_FB_KEY_ID",
    "NUNGGALREJO_FB_EMAIL"
  ];

  const missing = requiredEnv.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables for Nunggalrejo Firebase: ${missing.join(", ")}`
    );
  }
}

function init() {
  if (initialized) return;
  try {
    checkEnvVars();

    const privateKey = process.env.NUNGGALREJO_FB_KEY_ID.replace(/\\n/g, "\n");

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

    initialized = true;
  } catch (err) {
    initError = err;
    // Don't throw here: allow module to be required without crashing the whole function.
    console.error("Firebase initialization failed:", err.message);
  }
}

/**
 * Returns the Firestore instance. Will attempt to initialize on first call.
 * Throws a descriptive error if initialization failed or required env vars are missing.
 */
function getDb() {
  if (!initialized && !initError) init();
  if (initError) {
    throw initError;
  }
  return admin.firestore();
}

module.exports = { getDb };