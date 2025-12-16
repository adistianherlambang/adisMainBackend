const express = require("express")
const { getDb } = require("./firebase")
const upload = require("../cloudinary/multer")
const cloudinary = require("../cloudinary/config")

const router = express.Router();

router.post(
  "/product",
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, price } = req.body;
      const file = req.file;

      if (!name || !price || !file) {
        return res.status(400).json({ error: "data tidak lengkap" });
      }

      // upload ke cloudinary
      const uploadResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        { folder: "products" }
      );

      // simpan ke firestore
      const doc = await getDb().collection("product").add({
        name,
        price: Number(price),
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        createdAt: new Date()
      });

      // fetch the created document to verify it was written
      const createdSnap = await getDb().collection("product").doc(doc.id).get();
      const createdData = createdSnap.exists ? createdSnap.data() : null;

      // Log useful debug info (project id, doc id, cloudinary public id)
      console.log("Product created", {
        firebaseProject: process.env.NUNGGALREJO_FB_PROJECT_ID,
        id: doc.id,
        cloudinaryId: uploadResult.public_id,
      });

      res.json({
        id: doc.id,
        imageUrl: uploadResult.secure_url,
        product: createdData,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// get product by id (debug helper)
router.get("/product/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const docRef = getDb().collection("products").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//buat get product
router.get("/product", async (req, res) => {
  try {
    const snap = await getDb()
      .collection("products")
      .orderBy("createdAt", "desc")
      .get();

    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/product/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "ID dokumen wajib diisi" });

  try {
    const docRef = getDb().collection("products").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Dokumen tidak ditemukan" });
    }

    await docRef.delete();
    res.json({ message: "Dokumen berhasil dihapus", id });
  } catch (err) {
    console.error("Gagal menghapus dokumen:", err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

router.get("/", (req,res) => {
  res.json("ya")
})

// end of routes

module.exports = router;