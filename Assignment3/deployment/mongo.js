// mongo.js
const { MongoClient } = require('mongodb');

// Replace the uri string with your MongoDB deployment's connection string.
const uri = "mongodb+srv://jencyjos:Alright24!@cluster0.x8d2lnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connect() {
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB');
    } catch (e) {
        console.error('Connection to MongoDB failed', e);
    }
}

module.exports = { client, connect };
