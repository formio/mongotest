
console.log('Starting Mongo Test');
const mongo = require('./mongodb');
mongo((err) => {
  if (err) {
    console.log('Error: ', err);
  }
  else {
    console.log('Mongo Test Complete');
  }
  process.exit()
});

