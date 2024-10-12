require('dotenv').config(); 

const uri = process.env.MONGODB_URI;
const dbName = 'StockSearchDB';
const collectionName = 'portfolio';
const { MongoClient } = require('mongodb');
const client = new MongoClient(uri);

let db;

async function connectDb() {
    try {
        await client.connect();
        db = client.db(dbName);
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}

async function getPortfolio() {
    if (!db) {
        await connectDb();
    }
    return db.collection(collectionName).findOne();
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

async function buyStock(ticker, name, quantity, price) {
    try {
        let portfolio = await getPortfolio();
        const cost = price * quantity;

        if (!portfolio) {
            portfolio = { stocks: [{ ticker, name, shares: quantity, averageCost: price }] };
        } else {
            const existingStockIndex = portfolio.stocks.findIndex(stock => stock.ticker === ticker);

            if (existingStockIndex !== -1) {
                console.log("Updating stock")
                console.log(ticker, name, quantity, price)
                // If the stock exists, update its shares and averageCost
                const existingStock = portfolio.stocks[existingStockIndex];
                const updatedShares = existingStock.shares + quantity;
                const updatedAverageCost = ((existingStock.averageCost * (existingStock.shares - quantity)) + cost) / existingStock.shares;
                portfolio.stocks[existingStockIndex] = { ...existingStock, shares: updatedShares, averageCost: updatedAverageCost };
            }
            else {
                portfolio.stocks.push({ ticker, name, shares: quantity, averageCost: price });
            }
        }
        await db.collection(collectionName).updateOne({}, { $set: { stocks: portfolio.stocks} },  { upsert: true });
        return { success: true};
    } catch(error) {
        console.log(error)
        return { success: false};
    }
}

async function sellStock(ticker, quantity, price) {
    console.log("entered fun");
    console.log(ticker, quantity, price)
    try {
        let portfolio = await getPortfolio();
        const stock = portfolio.stocks.find(s => s.ticker === ticker);
        if (!stock || stock.shares < quantity) {
            return { success: false, stocks: portfolio.stocks, balance: portfolio.balance };
        }
        const revenue = price * quantity;
        stock.shares -= quantity;
        if (stock.shares === 0) {
            console.log("fully sold")
            portfolio.stocks = portfolio.stocks.filter(s => s.ticker !== ticker);
        } else {
            console.log("sold some")
            stock.averageCost = ((stock.averageCost * (stock.shares + quantity)) - revenue) / stock.shares;
        }
        await db.collection(collectionName).updateOne({}, { $set: { stocks: portfolio.stocks} });
        return { success: true, stocks: portfolio.stocks};
    } catch (error) {
        console.log(error)
        return { success: false};
    }
    
}

module.exports = {
    buyStock,
    sellStock
};
