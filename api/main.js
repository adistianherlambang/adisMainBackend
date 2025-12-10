const express = require("express");
const serverless = require("serverless-http");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Main API OK" });
});

app.get("/test", (req, res) => {
  res.json({ message: "Main API Test OK" });
});

module.exports = serverless(app);