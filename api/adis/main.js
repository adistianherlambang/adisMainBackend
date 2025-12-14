const express = require("express");
const router = express.Router();

const cloudinaryServices = require("./service/cloudinary/cloudinary")
const waclient = require("./service/whatsapp-client/main.js")

router.use("/cloud", cloudinaryServices)
router.use("/wa", waclient)

router.get("/", (req,res) => {
  res.json("adis")
})

router.get("/a", (req, res) => {
  const yes = new Date()
  res.json(yes)
})

module.exports = router;