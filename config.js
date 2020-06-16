var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var config = {};
var secrets = {};
console.log('Starting Config');

if (process.env.DOCKER_SECRETS || process.env.DOCKER_SECRET) {
  try {
    console.log('Loading Docker Secrets');
    const secretDir = process.env.DOCKER_SECRETS_PATH || '/run/secrets';
    if (fs.existsSync(secretDir)) {
      const files = fs.readdirSync(secretDir);
      if (files && files.length) {
        files.forEach(file => {
          const fullPath = path.join(secretDir, file);
          const key = file;
          const data = fs
            .readFileSync(fullPath, "utf8")
            .toString()
            .trim();

          secrets[key] = data;
        });
        console.log('Docker Secrets Loaded');
      }
    }
  }
  catch (err) {
    console.log('Cannot load Docker Secrets', err);
  }
}

// Find the config in either an environment variable or docker secret.
const getConfig = (key, defaultValue) => {
  // If there is a secret configuration for this key, return its value here.
  if (secrets.hasOwnProperty(key)) {
    return secrets[key];
  }
  // If an environment variable is set.
  if (process.env.hasOwnProperty(key)) {
    return process.env[key];
  }
  return defaultValue;
};

if (getConfig('MONGO')) {
  config.mongo = getConfig('MONGO');
}

if (getConfig('MONGO_SA')) {
  config.mongoSA = getConfig('MONGO_SA');
}

if (getConfig('MONGO_SSL')) {
  config.mongoSSL = getConfig('MONGO_SSL');
}

if (getConfig('MONGO_SSL_VALIDATE')) {
  config.mongoSSLValidate = getConfig('MONGO_SSL_VALIDATE');
}

if (getConfig('MONGO_SSL_PASSWORD')) {
  config.mongoSSLPassword = getConfig('MONGO_SSL_PASSWORD');
}

if (getConfig('MONGO_CONFIG')) {
  config.mongoConfig = getConfig('MONGO_CONFIG');
}

console.log('Finished Config', config);

module.exports = config;
