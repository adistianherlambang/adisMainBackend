const express = require("express");
const serverless = require("serverless-http");

const app = express();
app.use(express.json());

// ROUTES
app.get("/", (req, res) => {
  res.json({ message: "Main API OK" });
});

app.get("/test", (req, res) => {
  res.json({ message: "Main API Test OK" });
});

// LOCAL DEVELOPMENT
if (process.env.NODE_ENV === "development") {
  const port = 5000;
  app.listen(port, () => {
    console.log(`Server running locally on http://localhost:${port}`);
  });
}

// EXPORT FOR VERCEL
module.exports = app;
module.exports.handler = serverless(app);