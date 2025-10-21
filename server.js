const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const API_BASE = 'https://api.openweathermap.org/data/2.5';
const API_KEY = process.env.OPENWEATHER_API_KEY;
if (!API_KEY) {
  console.error('Missing OPENWEATHER_API_KEY in .env');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname)));

app.get('/api/weather', async (req, res) => {
  try {
    const { q, lat, lon } = req.query;
    if (!q && !(lat && lon)) {
      return res.status(400).json({ error: 'q or lat+lon required' });
    }

    const params = q
      ? `q=${encodeURIComponent(q)}`
      : `lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;

    const url = `${API_BASE}/weather?${params}&appid=${API_KEY}&units=metric`;
    const r = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));