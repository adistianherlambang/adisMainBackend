const express = require("express");
const router = express.Router();
const cloudinary = require("./config");

// GET: read list file dari cloudinary (misalnya folder "my_folder")
// router.get("/cloudinary", async (req, res) => {
//   try {
//     const { resources } = await cloudinary.search
//       .expression('folder:my_folder') // ganti dengan folder kamu
//       .sort_by('public_id', 'desc')
//       .max_results(50)
//       .execute();

//     res.json({
//       message: "Success read from Cloudinary",
//       data: resources,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       error: "Failed read Cloudinary",
//     });
//   }
// });

router.get("/cloudinary", async (req, res) => {
  const url = cloudinary.url('main-sample')
  console.log(url)
})

module.exports = router;