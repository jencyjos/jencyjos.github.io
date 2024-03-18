require('dotenv').config(); //load env variables from .env file

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
// import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 3000; 

// middleware to enable cors and json body parsing
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('backend is running!');
});


//API Call for company details upon search above tabs
app.get('/api/stock/profile/:ticker', async(req,res) => {
  const ticker = req.params.ticker;
  const finnhubApi = `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`;
  try {
    const response = await fetch(finnhubApi);
    if (!response.ok) {
      throw new Error(`Error from Finnhub API: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});


//API call for summary tab
app.get('/api/stock/quote/:ticker', async(req,res) => {
  const ticker = req.params.ticker;
  const finnhubApi = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`;
  try {
    const response = await fetch(finnhubApi);
    if (!response.ok) {
      throw new Error(`Error from Finnhub API: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});