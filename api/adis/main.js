const express = require("express");
const router = express.Router();

const cloudinaryServices = require("./service/cloudinary/cloudinary")

router.use("/cloud", cloudinaryServices)

router.get("/", (req,res) => {
  res.json("adis")
})

module.exports = router;