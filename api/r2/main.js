const express = require("express");
const router = express.Router();
const { getR2ObjectByKey } = require("../../service/r2Service");

// POST /r2 -> Menerima JSON body { "key": "smpm/1788223757868_..." } dan memproses/mengembalikan biner gambar langsung dari backend
router.post("/", async (req, res) => {
  try {
    let inputKey = req.body.key || req.body.url;
    if (!inputKey) {
      return res.status(400).json({
        success: false,
        message: "Field 'key' wajib diisi dalam body JSON. Contoh: { \"key\": \"smpm/1788223757868_foto.png\" }",
      });
    }

    // Jika inputKey berupa URL lengkap Cloudflare R2 (https://pub-....r2.dev/smpm/file.png), ambil path key-nya saja
    let r2Key = inputKey;
    if (r2Key.startsWith("http://") || r2Key.startsWith("https://")) {
      const parsedUrl = new URL(r2Key);
      r2Key = parsedUrl.pathname.replace(/^\/+/, "");
    }

    const objectData = await getR2ObjectByKey(r2Key);

    if (objectData.contentType) {
      res.setHeader("Content-Type", objectData.contentType);
    }
    if (objectData.contentLength) {
      res.setHeader("Content-Length", objectData.contentLength);
    }

    // Pipe stream gambar biner langsung ke penonton/client
    objectData.body.pipe(res);
  } catch (error) {
    console.error("R2 POST Stream Error:", error);
    res.status(404).json({
      success: false,
      message: "Gambar tidak ditemukan atau gagal diproses dari Cloudflare R2",
      error: error.message,
    });
  }
});

module.exports = router;
