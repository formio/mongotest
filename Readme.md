# Mongo Connection Testing

## About
This repository is designed to test out the connection to the mongodb database in a way similar to how the form.io 
enterprise server connects. The full source code is available so that the connection can be tested and tweaked until
the connection is successful.

## Usage
First, run ```npm install``` to install all dependencies. Then, Set some environment variables the same as you would
with the form.io server. You can set these by preceding the node command like this:

```bash
MONGO=mongodb://localhost:27017 node index
```

Then run the ```node index``` command to run the index.js file. You should see some logs about the progress of
connecting to the database.

## Variables
|  Variable               | Default                   | Description                             |
|-------------------------|---------------------------|-----------------------------------------|
| `MONGO`                 |                           | The connection string to mongodb.
| `MONGO_CONFIG`          |                           | JSON string of mongo config.
| `MONGO_SA`              |                           | A remote security certificate that can be loaded via fetch.
| `MONGO_SSL`             |                           | The file directory where SSL certs can be found.
| `MONGO_SSL_VALIDATE`    |                           | Whether to set sslValidate in mongo config.
| `MONGO_SSL_PASSWORD`    |                           | The password to the SSL cert used to encrypt it.

## Troubleshooting
When attempting to run this program, if you do not see ```Connection successful```, you can debug what is going wrong
and make modifications to test out alternative configurations.

First, you can modify the MONGO_CONFIG variable to change almost any setting being sent to the mongodb drivers. The
final output is logged in the output logs so you can check exactly what is being sent to mongodb. If this doesn't work, 
you can manually change the config in the mongodb.js file and make any modifications you want until it can connect.

Second, if you are using self signed certs, each cert loaded will list itself as being loaded after you set the 
MONGO_SSL variable. Make sure all of your expected certs are being loaded.

Third, if you are still unable to connect, make any tweaks to the mongodb.js file to get it to connect.

Let us know what changes were required to connect successfully. 

## Docker
This can also be test in docker by doing a docker build of the files. To do this, run ```docker build .``` and wait for
the build to complete. Then you can run ```docker run -e "MONGO=mongodb://localhost:27017" {sha_from_build}``` to test
out the docker image. 
