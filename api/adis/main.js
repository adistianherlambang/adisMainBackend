const express = require("express");
const router = express.Router();

const cloudinaryServices = require("./service/cloudinary/cloudinary")

router.use("/cloud", cloudinaryServices)

module.exports = router;