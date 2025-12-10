const express = require("express");
const serverless = require("serverless-http");

const app = express();
app.use(express.json());

// endpoint
app.get("/", (req, res) => {
  res.json({ message: "Express di Vercel jalan!" });
});

// export ke vercel
module.exports = app;
module.exports.handler = serverless(app);