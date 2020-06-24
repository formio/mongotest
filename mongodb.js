'use strict';

const async = require('async');
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const path = require('path');
const config = require('./config');
const fetch = require('node-fetch');

/**
 * Fetch the SA certificate.
 *
 * @param next
 * @return {*}
 */
const getSA = function(next) {
  if (!config.mongoSA) {
    return next();
  }

  // If they provide the SA url, then fetch it from there.
  if (config.mongoSA.indexOf('http') === 0) {
    debug.db(`Fetching SA Certificate ${config.mongoSA}`);
    fetch(config.mongoSA)
      .then((response) => {
        if (response.ok) {
          return response.text();
        }
        throw new Error(response.statusText);
      })
      .then((body) => {
        if (body) {
          debug.db('Fetched SA Certificate');
          config.mongoSA = body;
          return next();
        }
        throw new Error('Empty Body');
      })
      .catch((error) => {
        debug.db(`Unable to fetch SA Certificate: ${error}`);
        unlock(() => {
          throw new Error(`Unable to fetch the SA Certificate: ${config.mongoSA}.`);
        });
        config.mongoSA = '';
        return next();
      });
  }
  else {
    return next();
  }
};

/**
 * Fetch the SSL certificates from local dir.
 *
 * @param next
 * @return {*}
 */
const getSSL = function(next) {
  if (!config.mongoSSL) {
    return next();
  }

  console.log('Loading Mongo SSL Certificates');

  const certs = {
    sslValidate: !!config.mongoSSLValidate,
    ssl: true,
  };

  if (config.mongoSSLPassword) {
    certs.sslPass = config.mongoSSLPassword;
  }

  const files = {
    sslCA: 'ca.pem',
    sslCert: 'cert.pem',
    sslCRL: 'crl.pem',
    sslKey: 'key.pem',
  };

  // Load each file into its setting.
  Object.keys(files).forEach((key) => {
    const file = files[key];
    if (fs.existsSync(path.join(config.mongoSSL, file))) {
      console.log(' > Reading', path.join(config.mongoSSL, file));
      if (key === 'sslCA') {
        certs[key] = [fs.readFileSync(path.join(config.mongoSSL, file))];
      }
      else {
        certs[key] = fs.readFileSync(path.join(config.mongoSSL, file));
      }
    }
    else {
      console.log(' > Could not find', path.join(config.mongoSSL, file), 'skipping');
    }
  });
  console.log('');

  config.mongoSSL = certs;
  return next();
};

/**
 * Initialize the Mongo Connections for queries.
 *
 * @param next
 *  The next function to execute after establishing connections.
 *
 * @returns {*}
 */
const connection = function(next) {
  if (!config.mongo) {
    return next('MONGO connection string not defined.');
  }

  // Get a connection to mongo, using the config settings.
  const dbUrl = config.mongo;

  console.log(`Opening new connection to ${dbUrl}`);
  let mongoConfig = config.mongoConfig ? JSON.parse(config.mongoConfig) : {};
  // if (!mongoConfig.hasOwnProperty('connectTimeoutMS')) {
  //   mongoConfig.connectTimeoutMS = 300000;
  // }
  // if (!mongoConfig.hasOwnProperty('socketTimeoutMS')) {
  //   mongoConfig.socketTimeoutMS = 300000;
  // }
  if (!mongoConfig.hasOwnProperty('useNewUrlParser')) {
    mongoConfig.useNewUrlParser = true;
  }
  if (config.mongoSA) {
    mongoConfig.sslValidate = true;
    mongoConfig.sslCA = config.mongoSA;
  }
  if (config.mongoSSL) {
    mongoConfig = {
      ...mongoConfig,
      ...config.mongoSSL,
    };
  }

  mongoConfig.useUnifiedTopology = true;
  console.log('MongoConfig', mongoConfig);

  // Establish a connection and continue with execution.
  MongoClient.connect(dbUrl, mongoConfig, function(err, client) {
    if (err) {
      return next(`Connection Error: ${err}`);
    }
    console.log('Connection successful');

    client.db('formio');

    console.log('Found formio database');

    return next();
  });
};

/**
 * Initialized the update script.
 */
module.exports = function(next) {
  async.series([
    getSA,
    getSSL,
    connection,
  ], next);
};
