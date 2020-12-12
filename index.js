'use strict';

const MongoClient = require('mongodb').MongoClient;
const MONGODB_URI = process.env.MONGODB_URI; // or Atlas connection string

let cachedDb = null;

function connectToDatabase (uri) {
    console.log('=> connect to database');
    if (cachedDb) {
        console.log('=> using cached database instance');
        return Promise.resolve(cachedDb);
    }
    return MongoClient.connect(uri)
        .then(db => {
            cachedDb = db;
            return cachedDb;
        });
}

function queryDatabase (db) {
    console.log('=> query database');
    return db.collection('items').find({}).toArray()
        .then(() => { return { statusCode: 200, body: 'success' }; })
        .catch(err => {
            console.log('=> an error occurred: ', err);
            return { statusCode: 500, body: 'error' };
        });
}

exports.handler = (event, context, callback) => {
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda and GitHub!'),
        event: event
    };
    context.callbackWaitsForEmptyEventLoop = false;
    console.log('event: ', event);
    connectToDatabase(MONGODB_URI)
            //.then(db => queryDatabase(db))
            //.then(result => {
            //  console.log('=> returning result: ', result);
            //  callback(null, result);
            //})
        .then(() => {
            return callback(response);
        })
        .catch(err => {
            response.statusCode = 400;
            response.body = err;
            console.log('=> an error occurred: ', err);
            callback(response);
        });
};
