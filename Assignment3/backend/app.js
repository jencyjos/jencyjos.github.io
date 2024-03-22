require('dotenv').config(); //load env variables from .env file

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { connect } = require('./mongo');

const app = express();
const port = process.env.PORT || 3000; 

connect(); //mongodb

// middleware to enable cors and json body parsing
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('backend is running!');
});

// Autocomplete API for symbol search
app.get('/api/autocomplete/:query', async (req, res) => {
  const query = req.params.query;
  const finnhubApi = `https://finnhub.io/api/v1/search?q=${query}&token=${process.env.FINNHUB_API_KEY}`;

  try {
    const response = await fetch(finnhubApi);
    if (!response.ok) {
      throw new Error(`Error from Finnhub API: ${response.statusText}`);
    }
    const data = await response.json();
    // Optional: Filter the response to only include the needed keys if necessary
    const filteredResponse = data.result.map(item => ({
      description: item.description,
      displaySymbol: item.displaySymbol,
      symbol: item.symbol,
      type: item.type
    }));
    res.json(filteredResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});


//Company profile
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


//stock quotes
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


//company news
app.get('/api/stock/news/:ticker', async (req, res) => {
  const ticker = req.params.ticker;
  // const fromDate = "2022-01-01"; 
  // const toDate = "2022-12-31"; 
  const currentDate = new Date();
  const sevenDaysBefore = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));

  const toDate = currentDate.toISOString().split('T')[0];
  const fromDate = sevenDaysBefore.toISOString().split('T')[0];
  const finnhubApi = `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${fromDate}&to=${toDate}&token=${process.env.FINNHUB_API_KEY}`;

  try {
      const response = await fetch(finnhubApi);
      const data = await response.json();
      res.json(data);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
  }
});


// Historical data API call
app.get('/api/stock/historical/:ticker', async (req, res) => {
  const ticker = req.params.ticker;
  const multiplier = 1;
  const timespan = 'day';

  // Calculate 6 months and 1 day ago date
  const currentDate = new Date();
  const fromDate = new Date();
  fromDate.setMonth(currentDate.getMonth() - 6);
  fromDate.setDate(fromDate.getDate() - 1);

  const toDateString = currentDate.toISOString().split('T')[0];
  const fromDateString = fromDate.toISOString().split('T')[0];

  const finnhubApi = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${fromDateString}/${toDateString}?adjusted=true&sort=asc&apiKey=${process.env.POLYGON_API_KEY}`;

  try {
    const response = await fetch(finnhubApi);
    if (!response.ok) {
      throw new Error(`Error from Polygon API: ${response.statusText}`);
    }
    const data = await response.json();

    // Format data for HighCharts if necessary
    const formattedData = {
      stockPriceData: data.results.map(point => [point.t, point.c]),
      volumeData: data.results.map(point => [point.t, point.v])
    };

    res.json(formattedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Company recommendation trends API call
app.get('/api/stock/recommendation/:ticker', async (req, res) => {
  const ticker = req.params.ticker;
  const finnhubApi = `https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`;

  try {
    const response = await fetch(finnhubApi);
    if (!response.ok) {
      throw new Error(`Error from Finnhub API: ${response.statusText}`);
    }
    const recommendations = await response.json();
    res.json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Company Insider Sentiment API call
app.get('/api/stock/insider-sentiment/:ticker', async (req, res) => {
  const ticker = req.params.ticker;
  // Using the default 'from' date as mentioned in the assignment description
  const fromDate = '2022-01-01';
  const finnhubApi = `https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${ticker}&from=${fromDate}&token=${process.env.FINNHUB_API_KEY}`;

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


//company peers
app.get('/api/peers/:ticker', async (req, res) => {
  const ticker = req.params.ticker;
  const finnhubApi = `https://finnhub.io/api/v1/stock/peers?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`;

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


app.get('/api/earnings/:ticker', async (req, res) => {
  const ticker = req.params.ticker;
  const finnhubApi = `https://finnhub.io/api/v1/stock/earnings?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`;

  try {
    const response = await fetch(finnhubApi);
    if (!response.ok) {
      throw new Error(`Error from Finnhub API: ${response.statusText}`);
    }
    let data = await response.json();
    
    // Replace any null values with 0 as per requirement
    data = data.map(item => ({
      actual: item.actual !== null ? item.actual : 0,
      estimate: item.estimate !== null ? item.estimate : 0,
      period: item.period,
      symbol: item.symbol
    }));

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});