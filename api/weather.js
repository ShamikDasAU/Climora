const fetch = require('node-fetch');

const API_BASE = 'http://api.weatherstack.com';
const API_KEY = process.env.WEATHERSTACK_API_KEY;

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { q, lat, lon } = req.query;
    if (!q && !(lat && lon)) {
      return res.status(400).json({ error: 'q or lat+lon required' });
    }

    // WeatherStack uses 'query' parameter for both city names and coordinates
    const query = q || `${lat},${lon}`;
    const url = `${API_BASE}/current?access_key=${API_KEY}&query=${encodeURIComponent(query)}`;
    
    const r = await fetch(url);
    const data = await r.json();
    
    if (data.error) {
      return res.status(404).json({ error: data.error.info || 'Location not found' });
    }
    
    // Transform WeatherStack response to match our frontend format
    const transformedData = {
      name: data.location.name,
      sys: { country: data.location.country },
      main: {
        temp: data.current.temperature,
        feels_like: data.current.feelslike,
        humidity: data.current.humidity,
        pressure: data.current.pressure
      },
      weather: [{
        main: data.current.weather_descriptions[0],
        description: data.current.weather_descriptions[0]
      }],
      wind: {
        speed: data.current.wind_speed / 3.6 // Convert km/h to m/s
      },
      dt: data.location.localtime_epoch,
      timezone: data.location.utc_offset ? parseInt(data.location.utc_offset.split(':')[0]) * 3600 : 0
    };
    
    res.status(200).json(transformedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};