const express = require('express');
const path = require('path');
require('dotenv').config();

const weatherHandler = require('./api/weather');

const app = express();
app.use(express.static(path.join(__dirname)));

// Use the same handler locally
app.get('/api/weather', weatherHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));