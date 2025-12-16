const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors")

require("dotenv").config();

//endpoint
const adis = require("./adis/main")

const app = express();
app.use(express.json());

app.use(cors({
  origin: "*", // sementara (dev)
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ROUTES
app.get("/", (req, res) => {
  res.json({ message: "Main OK" });
});

app.get("/ya", (req, res) => {
  res.json({message: "yayaya"})
})

app.use("/adis", adis); 

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