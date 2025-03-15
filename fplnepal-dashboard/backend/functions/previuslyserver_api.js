const express = require("express");
const serverless = require("serverless-http");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const router = express.Router();
const FPL_BASE_URL = "https://fantasy.premierleague.com/api";

// ✅ Fetch General FPL Data (Bootstrap)
router.get("/fpl-data", async (req, res) => {
  try {
    const response = await axios.get(`${FPL_BASE_URL}/bootstrap-static/`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// ✅ Fetch Fixtures for a Specific Gameweek
router.get("/fixtures", async (req, res) => {
  const { event } = req.query;
  if (!event) return res.status(400).json({ error: "Gameweek is required" });

  try {
    const response = await axios.get(`${FPL_BASE_URL}/fixtures/?event=${event}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch fixtures" });
  }
});

// ✅ Fetch Teams Data
router.get("/teams", async (req, res) => {
  try {
    const response = await axios.get(`${FPL_BASE_URL}/bootstrap-static/`);
    res.json(response.data.teams);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

// ✅ Make sure all routes are inside `/.netlify/functions/api`
app.use("/.netlify/functions/api", router);

// ✅ Export function for Netlify
module.exports.handler = serverless(app);
