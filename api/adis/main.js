const express = require("express");
const router = express.Router();

const cloudinaryServices = require("./service/cloudinary/cloudinary")

router.use(cloudinaryServices)

module.exports = router;