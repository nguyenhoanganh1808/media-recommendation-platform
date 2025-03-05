import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Media Recommendation Backend");
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
