import express from "express";
import "dotenv/config";
import { connectDB } from "./db/index.js";
const app = express();

const port = process.env.PORT || 8000;

app.get("/hello", (req, res) => {
  res.send("<h1>Hello world</h1>");
});
app.listen(port, () => {
  connectDB();
  console.log(`Server started on PORT ${port}`);
});
