const express = require("express");
const router = express.Router();
const cloudinary = require("./config");

router.get("/", async (req, res) => {
  const url = cloudinary.url('main-sample')
  res.send(url)
})

module.exports = router;