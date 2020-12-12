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
    return MongoClient.connect(uri, { useUnifiedTopology: true })
        .then(db => {
            cachedDb = db;
			cachedDb = db.db('db-nw');
            return cachedDb;
        })
        .catch(err => {
            console.log(JSON.stringify(err))
        });
}

function insertRecord (db, values) {
    console.log('=> insert record');
    const query = { id: values.id };
    const options = { upsert: true };
    return db.collection('coll-ipad').updateMany(query, {$set: values}, options)
        .then(result => {
            const { matchedCount, modifiedCount } = result;
            console.log(`Successfully matched ${matchedCount} and modified ${modifiedCount} items.`);
            return result
        })
        .catch(err => {
            console.error(`Failed to update items: ${err}`);
            return 'error';
        });
}

exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    console.log('event: ', event);
    connectToDatabase(MONGODB_URI)
            .then(db => insertRecord(db, event))
            .then(result => {
              console.log('=> returning results: ', result);
              return callback(null, {statusCode: 200, body: result});
            })
        .catch(err => {
            console.log(err);
            return callback({statusCode: 400, body: err});
        });
};
