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
      const { name, price, toko, nomor, description, kategori, minBuy, userId} = req.body;
      const file = req.file;

      if (!name || !price || !file) {
        return res.status(400).json({ error: "data tidak lengkap" });
      }

      // upload ke cloudinary
      const uploadResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        { folder: "products" }
      );

      const slugify = (text) => text?.toLowerCase().replace(/\s+/g, "-") || "";

      // simpan ke firestore
      const doc = await getDb().collection("product").add({
        name,
        toko,
        userId,
        description,
        nomor,
        kategori,
        minBuy,
        price: Number(price),
        imgUrl: uploadResult.secure_url,
        cloudinaryId: uploadResult.public_id,
        slug: slugify(`/${kategori}/${toko}/${name}`, { lower: true, strict: true })
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
    const docRef = getDb().collection("product").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Dokumen tidak ditemukan" });
    }

    const docData = docSnap.data();

    // Hapus image di Cloudinary jika ada public_id
    if (docData.cloudinaryId) {
      await cloudinary.uploader.destroy(docData.cloudinaryId);
      console.log(`Image Cloudinary ${docData.cloudinaryId} berhasil dihapus`);
    }

    // Hapus dokumen Firestore
    await docRef.delete();

    res.json({
      message: "Dokumen dan image berhasil dihapus",
      id,
    });
  } catch (err) {
    console.error("Gagal menghapus dokumen atau image:", err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

router.post("/update", upload.single("image"), async (req, res) => {
  try {
    const { no, nama, alamat, toko, userId } = req.body;
    const file = req.file;

    if (!toko) {
      return res.status(400).json({ message: "Toko wajib diisi" });
    }

    // Upload image baru jika ada
    let uploadResult = null;
    if (file) {
      uploadResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        { folder: "products" }
      );
      console.log("Image baru diupload:", uploadResult.secure_url);
    }

    // Cari dokumen user berdasarkan "toko"
    const querySnap = await getDb()
      .collection("users")
      .where("userId", "==", userId)
      .get();

    if (querySnap.empty) {
      return res.status(404).json({ message: "User dengan toko ini tidak ditemukan" });
    }

    const updatedUsers = [];

    for (const doc of querySnap.docs) {
      const existingData = doc.data();

      // Hapus image lama jika ada dan ada image baru
      if (uploadResult && existingData.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(existingData.cloudinaryId, { invalidate: true });
          console.log("Image lama berhasil dihapus:", existingData.cloudinaryId);
        } catch (err) {
          console.warn("Gagal hapus image lama:", err.message);
        }
      }

      // Update field opsional
      const updateData = {};
      if (no) updateData.no = no;
      if (toko) updateData.toko = toko;
      if (alamat) updateData.alamat = alamat;
      if (userId) updateData.userId = userId
      if (uploadResult) {
        updateData.imgUrl = uploadResult.secure_url;
        updateData.cloudinaryId = uploadResult.public_id; // harus sama persis dengan public_id di Cloudinary
      }

      await doc.ref.set(updateData, { merge: true });

      updatedUsers.push({ id: doc.id, ...existingData, ...updateData });
    }

    res.json({
      message: "User berhasil diperbarui",
      users: updatedUsers,
    });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/", (req,res) => {
  res.json("ya")
})

// end of routes

module.exports = router;