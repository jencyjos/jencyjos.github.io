require('dotenv').config(); 
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = 'StockSearchDB';
const collectionName = 'portfolio';

async function connectDb() {
    if (!client.isConnected()) await client.connect();
    return client.db(dbName).collection(collectionName);
}

async function getPortfolio() {
    const collection = await connectDb();
    return collection.findOne(); 
}

async function addToPortfolio(ticker, shares, averageCost) {
    const portfolio = await getPortfolio();
    const stock = portfolio.stocks.find(s => s.ticker === ticker);
    if (stock) {
        stock.shares += shares;
        stock.averageCost = ((stock.averageCost * (stock.shares - shares)) + (averageCost * shares)) / stock.shares;
    } else {
        portfolio.stocks.push({ ticker, shares, averageCost });
    }
    const collection = await connectDb();
    await collection.updateOne({}, { $set: { stocks: portfolio.stocks } });
}

async function buyStock(ticker, quantity, price) {
    const portfolio = await getPortfolio();
    const cost = price * quantity;
    if (cost > portfolio.balance) {
        throw new Error('Insufficient balance');
    }
    const stock = portfolio.stocks.find(s => s.ticker === ticker);
    if (stock) {
        stock.shares += quantity;
        stock.averageCost = ((stock.averageCost * (stock.shares - quantity)) + cost) / stock.shares;
    } else {
        portfolio.stocks.push({ ticker, shares: quantity, averageCost: price });
    }
    portfolio.balance -= cost;
    const collection = await connectDb();
    await collection.updateOne({}, { $set: { stocks: portfolio.stocks, balance: portfolio.balance } });
    return { success: true, stocks: portfolio.stocks, balance: portfolio.balance };
}

async function sellStock(ticker, quantity, price) {
    const portfolio = await getPortfolio();
    const stock = portfolio.stocks.find(s => s.ticker === ticker);
    if (!stock || stock.shares < quantity) {
        throw new Error('Not enough shares to sell');
    }
    const revenue = price * quantity;
    stock.shares -= quantity;
    if (stock.shares === 0) {
        portfolio.stocks = portfolio.stocks.filter(s => s.ticker !== ticker);
    } else {
        stock.averageCost = ((stock.averageCost * (stock.shares + quantity)) - revenue) / stock.shares;
    }
    portfolio.balance += revenue;
    const collection = await connectDb();
    await collection.updateOne({}, { $set: { stocks: portfolio.stocks, balance: portfolio.balance } });
    return { success: true, stocks: portfolio.stocks, balance: portfolio.balance };
}

module.exports = {
    buyStock,
    sellStock
};
