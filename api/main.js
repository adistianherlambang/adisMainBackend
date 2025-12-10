const express = require("express");
const app = express();
const serverless = require("serverless-http");

app.use(express.json());

// contoh endpoint
app.get("/", (req, res) => {
  res.send("Express on Vercel berhasil!");
});

app.get("/hello", (req, res) => {
  res.json({ message: "Hello dari Vercel Serverless" });
});

// export for Vercel
module.exports = app;
module.exports.handler = serverless(app);