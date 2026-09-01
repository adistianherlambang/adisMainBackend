const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  uploadImageToR2,
  listR2Images,
  deleteR2Image,
  getR2ImageStream,
} = require("../../service/r2Service");
const { publicDevUrl } = require("../../service/r2Config");

// Configuration for Multer (Memory Storage) - Mengizinkan semua tipe file (gambar, PDF, dokumen, dll.)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // Max 50MB
  },
});


const DEFAULT_FOLDER = "smpm";

// GET /smpm -> Info status API SMPM R2
router.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "SMPM Cloudflare R2 Image Service",
    defaultFolder: DEFAULT_FOLDER,
    endpoints: {
      upload: "POST /smpm/upload (multipart/form-data with field 'image' or 'file')",
      listFiles: "GET /smpm/files",
      getFile: "GET /smpm/file/:filename",
      deleteFile: "DELETE /smpm/file/:filename",
    },
  });
});

// POST /smpm/upload -> Upload single file gambar ke R2 (folder smpm/)
router.post("/upload", (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const file = req.file || (req.files && req.files[0]);
      if (!file) {
        return res.status(400).json({
          success: false,
          message: "File tidak ditemukan. Kirim file dengan field name 'file' atau 'image'.",
        });
      }

      const folderName = req.body.folderName || DEFAULT_FOLDER;

      const result = await uploadImageToR2({
        fileBuffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        folderName,
        customName: req.body.customName,
      });

      res.status(201).json({
        success: true,
        message: `File berhasil di-upload ke Cloudflare R2 (folder '${folderName}')`,
        data: result,
      });
    } catch (error) {
      console.error("R2 Upload Error:", error);
      res.status(500).json({
        success: false,
        message: "Gagal meng-upload file ke R2",
        error: error.message,
      });
    }

  });
});

// GET /smpm/files -> Ambil daftar gambar di folder smpm/
router.get("/files", async (req, res) => {
  try {
    const folderName = req.query.folderName || DEFAULT_FOLDER;
    const files = await listR2Images(folderName);
    res.json({
      success: true,
      folder: folderName,
      total: files.length,
      data: files,
    });
  } catch (error) {
    console.error("R2 List Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar gambar dari R2",
      error: error.message,
    });
  }
});

// GET /smpm/file/:filename -> Redirect ke public R2 dev URL atau stream
router.get("/file/:filename", async (req, res) => {
  const { filename } = req.params;
  const folderName = req.query.folderName || DEFAULT_FOLDER;
  const redirectMode = req.query.stream !== "true";

  if (redirectMode) {
    return res.redirect(`${publicDevUrl}/${folderName}/${filename}`);
  }

  try {
    const imageStream = await getR2ImageStream(folderName, filename);
    if (imageStream.contentType) {
      res.setHeader("Content-Type", imageStream.contentType);
    }
    if (imageStream.contentLength) {
      res.setHeader("Content-Length", imageStream.contentLength);
    }
    imageStream.body.pipe(res);
  } catch (error) {
    console.error("R2 Get File Error:", error);
    res.status(404).json({
      success: false,
      message: "Gambar tidak ditemukan di R2",
      error: error.message,
    });
  }
});

// DELETE /smpm/file/:filename -> Hapus gambar dari R2
router.delete("/file/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const folderName = req.query.folderName || DEFAULT_FOLDER;
    const result = await deleteR2Image(folderName, filename);
    res.json({
      success: true,
      message: `File ${filename} berhasil dihapus dari R2 folder ${folderName}`,
      data: result,
    });
  } catch (error) {
    console.error("R2 Delete Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus gambar dari R2",
      error: error.message,
    });
  }
});

module.exports = router;
