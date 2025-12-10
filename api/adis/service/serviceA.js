const express = require("express");
const router = express.Router();

router.get("/A", (req, res) => {
  res.json({ message: "Service A OK" });
});

module.exports = router;