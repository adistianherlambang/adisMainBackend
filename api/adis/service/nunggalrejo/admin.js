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
      const doc = await db.collection("products").add({
        name,
        price: Number(price),
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        createdAt: new Date()
      });

      res.json({
        id: doc.id,
        imageUrl: uploadResult.secure_url
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * GET /products
 */
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

router.get("/", (req,res) => {
  res.json("ya")
})

module.exports = router;