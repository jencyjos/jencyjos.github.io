require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000; 

const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
const dbName = 'StockSearchDB'; 
const client = new MongoClient(uri);

let db;
client.connect().then((client) => {
  db = client.db(dbName);
});
const { buyStock, sellStock } = require('./controllers/stock-controller');

app.use('/',express.static('browser'))

// app.use(cors(
//   {
//     origin:'https://assignment-3-419020.wl.r.appspot.com'
//   }
// ));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('backend is running!');
});



// Endpoint for fetching stock details
app.get('/api/stock/details/:ticker', async (req, res) => {
  const ticker = req.params.ticker;
  const finnhubApi =`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`;

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
    const filteredData = data.result.filter(item =>
      item.type === 'Common Stock' && !item.symbol.includes('.')
    );
    const filteredResponse = filteredData.map(item => ({
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
  const currentDate = new Date();
  const sevenDaysBefore = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));

  const toDate = currentDate.toISOString().split('T')[0];
  const fromDate = sevenDaysBefore.toISOString().split('T')[0];
  const finnhubApi = `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${fromDate}&to=${toDate}&token=${process.env.FINNHUB_API_KEY}`;

  try {
      const response = await fetch(finnhubApi);
      if (!response.ok) {
        throw new Error(`Error from Finnhub API: ${response.statusText}`);
      }
      let data = await response.json();
      data = data.filter(article => article.image && article.image.trim() !== '');
      data = data.slice(0, 20);

      res.json(data);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
  }
});



// HOURLY charts API call
app.get('/api/stock/historical/:ticker', async (req, res) => {
  const ticker = req.params.ticker;
  const multiplier = 1;
  const timespan = 'hour';
  const currentDate = req.query.to;
  const fromDate = req.query.from;
  const finnhubApi = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${fromDate}/${currentDate}?adjusted=true&sort=asc&apiKey=${process.env.POLYGON_API_KEY}`;
  try {
    const response = await fetch(finnhubApi);
    if (!response.ok) {
      throw new Error(`Error from Polygon API: ${response.statusText}`);
    }
    const data = await response.json();
    let formattedData = {
    }
    if(data.results){
    formattedData = {
      stockPriceData: data.results.map(point => [point.t, point.c]),
      volumeData: data.results.map(point => [point.t, point.v])
    }
  }
  console.log(formattedData)
res.json(formattedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// SMA data API call --charts
app.get('/api/stock/sma/:ticker', async (req, res) => {
  const ticker = req.params.ticker;
  const multiplier = 1;
  const timespan = 'day';
  const currentDate = new Date();
  const fromDate = new Date();
  fromDate.setFullYear(currentDate.getFullYear() - 2);
  // console.log(fromDate)
  

  const toDateString = currentDate.toISOString().split('T')[0];
  const fromDateString = fromDate.toISOString().split('T')[0];

  const finnhubApi = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${fromDateString}/${toDateString}?adjusted=true&sort=asc&apiKey=${process.env.POLYGON_API_KEY}`;

  try {
    const response = await fetch(finnhubApi);
    if (!response.ok) {
      throw new Error(`Error from Polygon API: ${response.statusText}`);
    }
    const data = await response.json();

    const formattedData = {
      stockPriceData: data.results.map(point => [point.t, point.o, point.h, point.l, point.c]),
      volumeData: data.results.map(point => [point.t, point.v])
    };

    res.json(formattedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// earnings charts API call
app.get('/api/stock/earnings/:ticker', async (req, res) => {
  const ticker = req.params.ticker;
  const finnhubApi = `https://finnhub.io/api/v1/stock/earnings?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`;

  try {
    const response = await fetch(finnhubApi);
    if (!response.ok) {
      throw new Error(`Error from Finnhub API: ${response.statusText}`);
    }
    let earningsData = await response.json();
    
    earningsData = earningsData.map((item) => ({
      actual: item.actual !== null ? item.actual : 0,
      estimate: item.estimate !== null ? item.estimate : 0,
      period: item.period,
      symbol: item.symbol,
      surprise: ((item.actual !== null && item.estimate !== null) ? item.actual - item.estimate : 0).toFixed(4)
    }));
    console.log(earningsData);
    res.json(earningsData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching earnings data' });
  }
});


//recommendation trends
app.get('/api/stock/recommendation/:ticker', async (req, res) => {
  const ticker = req.params.ticker;
  const finnhubApi = `https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`;

  try {
    const response = await fetch(finnhubApi);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching recommendation trends data:', error);
    res.status(500).json({ message: 'Error fetching recommendation trends data' });
  }
});


//current
// Company Insider Sentiment API call
app.get('/api/stock/insider-sentiment/:ticker', async (req, res) => {
  const ticker = req.params.ticker;
 
  const fromDate = '2022-01-01';
  const finnhubApi = `https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${ticker}&from=${fromDate}&token=${process.env.FINNHUB_API_KEY}`;

  try {
    const response = await fetch(finnhubApi);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const sentimentData = await response.json();

    const msprData = sentimentData.data.reduce(
      (acc, cur) => {
        acc.totalMspr += cur.mspr;
        if (cur.mspr > 0) acc.positiveMspr += cur.mspr;
        if (cur.mspr < 0) acc.negativeMspr += cur.mspr;
        return acc;
      },
      { totalMspr: 0, positiveMspr: 0, negativeMspr: 0 }
    );
    const changeData = sentimentData.data.reduce(
      (acc, cur) => {
        acc.totalChange += cur.change;
        if (cur.change > 0) acc.positiveChange += cur.change;
        if (cur.change < 0) acc.negativeChange += cur.change;
        return acc;
      },
      { totalChange: 0, positiveChange: 0, negativeChange: 0 }
    );

    res.json({ 
      changeAggregates: changeData, 
      msprAggregates: msprData 
    });
  } catch (error) {
    console.error('Error fetching insider sentiment data:', error);
    res.status(500).json({ message: 'Error fetching insider sentiment data' });
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
    const filteredData = data.filter(symbol => !symbol.includes('.'));

    res.json(filteredData);
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


app.get('/api/wallet', async (req, res) => {
  try {
    const wallet = await db.collection('userWallet').findOne({});
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wallet balance', error });
  }
});


app.post('/api/buy', async (req, res) => {
  const { ticker, name, quantity, price } = req.body; 
  const totalCost = price * quantity;

  try {
    const wallet = await db.collection('userWallet').findOne({});
    if (wallet.balance < totalCost) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Update wallet
    await db.collection('userWallet').updateOne({}, { $inc: { balance: -totalCost } });

    const result = await buyStock(ticker, name, quantity, price)
    if (result.success ==  true)
      res.json({ message: 'Transaction successful' });
  } catch (error) {
    // console.log(error)
    res.status(500).json({ message: 'Transaction failed', error });
  }
});

app.get('/api/portfolio', async (req, res) => {
  try {
    const portfolio = await db.collection('portfolio').findOne({});
    if (portfolio && portfolio.stocks && portfolio.stocks.length > 0) {
      res.json({stocks:portfolio.stocks}); 
    } else {
      res.json({stocks:[]});
    }
  } catch (error) {
    // console.log(error)
    res.status(500).json({ message: 'Failed to fetch portfolio', error });
  }
});


// Endpoint for selling stocks
app.post('/api/sell', async (req, res) => {
  try {
    const { ticker, quantity, price } = req.body;
    const wallet = await db.collection('userWallet').findOne({});
    revenue = quantity*price
    await db.collection('userWallet').updateOne({}, { $inc: { balance: +revenue } });
    // console.log("updated the wallet")
    const result = await sellStock(ticker, quantity, price);
    res.status(200).json(result);
  } catch (error) {
    console.log("error ocured in sell", error)
    res.status(500).json({ message: error.message });
  }
});

// Toggle watchlist item
app.post('/api/watchlist/toggle', async (req, res) => {
  const ticker = req.body.ticker;
  if (!ticker) {
    return res.status(400).json({ message: 'Ticker is required' });
  }

  try {
    const watchlistCollection = db.collection('watchlist');
    const stockExists = await watchlistCollection.findOne({ ticker });

    if (stockExists) {
      await watchlistCollection.deleteOne({ ticker });
      res.status(200).json({ message: `Ticker ${ticker} removed from watchlist.` });
    } else {
      await watchlistCollection.insertOne({ ticker });
      res.status(200).json({ message: `Ticker ${ticker} added to watchlist.` });
    }
  } catch (error) {
    console.error('Error toggling watchlist item:', error);
    res.status(500).json({ message: 'Error toggling watchlist item' });
  }
});

// Get the watchlist
app.get('/api/watchlist', async (req, res) => {
  try {
    const watchlistCollection = db.collection('watchlist');
    const watchlist = await watchlistCollection.find({}).toArray();
    res.status(200).json(watchlist);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ message: 'Error fetching watchlist' });
  }
});



app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app; 