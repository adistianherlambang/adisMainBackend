const express = require("express");
const serverless = require("serverless-http");

require("dotenv").config();

//endpoint
const adis = require("./adis/main")

const app = express();
app.use(express.json());

// ROUTES
app.get("/", (req, res) => {
  res.json({ message: "Main OK" });
});

app.get("ya", (req, res) => {
  res.json({message: "yayaya"})
})

app.use("/api/adis", adis); 

// LOCAL DEVELOPMENT
const isDev = process.env.NODE_ENV !== "production";

if (isDev) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running locally on http://localhost:${port}`);
  });
}

// EXPORT FOR VERCEL
module.exports = app;
module.exports.handler = serverless(app);