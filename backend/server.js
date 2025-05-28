const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.post("/api/qa-activity", async (req, res) => {
  try {
    const data = req.body;
    const saved = await prisma.qAActivity.create({ data });
    res.json(saved);
  } catch (err) {
    console.error("Error saving activity", err);
    res.status(500).json({ error: "Failed to save activity" });
  }
});

app.get("/api/qa-activity", async (req, res) => {
  try {
    const activities = await prisma.qAActivity.findMany();
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

app.listen(5050, () => {
  console.log("Server running on http://localhost:5050");
});
