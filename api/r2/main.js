const express = require("express");
const router = express.Router();
const { getR2ObjectByKey } = require("../../service/r2Service");

/**
 * Helper untuk mengkonversi req.params.key (yang dapat berupa array/string dengan koma di Express 5) menjadi path key R2 dengan slash '/'
 */
function extractR2KeyFromParams(keyParam) {
  if (!keyParam) return "";
  if (Array.isArray(keyParam)) {
    return keyParam.join("/");
  }
  return String(keyParam).replace(/,/g, "/");
}

/**
 * Handler umum untuk mengambil dan mengalirkan (stream) gambar dari R2
 */
async function handleStreamR2Object(r2KeyInput, res) {
  try {
    if (!r2KeyInput) {
      return res.status(400).json({
        success: false,
        message: "Key gambar tidak boleh kosong.",
      });
    }

    let cleanKey = decodeURIComponent(r2KeyInput).replace(/^\/+/, "");

    // Bersihkan koma jika Express 5 mengonversi wildcard path
    cleanKey = cleanKey.replace(/,/g, "/");

    // Jika key berawalan "key/", bersihkan prefix tersebut
    if (cleanKey.startsWith("key/")) {
      cleanKey = cleanKey.substring(4);
    }

    // Jika key tidak mengandung nama folder (misal: "1788223757868_foto.png"), tambahkan folder default "smpm/"
    if (!cleanKey.includes("/")) {
      cleanKey = `smpm/${cleanKey}`;
    }

    const objectData = await getR2ObjectByKey(cleanKey);

    if (objectData.contentType) {
      res.setHeader("Content-Type", objectData.contentType);
    }
    if (objectData.contentLength) {
      res.setHeader("Content-Length", objectData.contentLength);
    }

    // Cache-Control header agar penutupan/reload gambar lebih cepat
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    // Pipe stream data biner gambar langsung ke response
    objectData.body.pipe(res);
  } catch (error) {
    console.error("R2 Stream Error:", error);
    res.status(404).json({
      success: false,
      message: "Gambar tidak ditemukan atau gagal diproses dari Cloudflare R2",
      error: error.message,
    });
  }
}

// POST /r2 -> Body JSON { "key": "smpm/1788223757868_..." }
router.post("/", (req, res) => {
  let inputKey = req.body.key || req.body.url;
  if (!inputKey) {
    return res.status(400).json({
      success: false,
      message: "Field 'key' wajib diisi dalam body JSON. Contoh: { \"key\": \"smpm/1788223757868_foto.png\" }",
    });
  }

  let r2Key = inputKey;
  if (r2Key.startsWith("http://") || r2Key.startsWith("https://")) {
    const parsedUrl = new URL(r2Key);
    r2Key = parsedUrl.pathname.replace(/^\/+/, "");
  }

  handleStreamR2Object(r2Key, res);
});

// GET /r2/key/* -> GET http://localhost:5000/r2/key/smpm/1788223757868_foto.png
router.get("/key/*key", (req, res) => {
  const r2Key = extractR2KeyFromParams(req.params.key);
  handleStreamR2Object(r2Key, res);
});

// GET /r2/* -> GET http://localhost:5000/r2/smpm/1788223757868_foto.png
router.get("/*key", (req, res) => {
  const r2Key = extractR2KeyFromParams(req.params.key);
  handleStreamR2Object(r2Key, res);
});

module.exports = router;
