const pg = require('pg');

function pgTryConnect(dbConfig) {
  return new Promise((resolve, reject) => {
    const client = new pg.Client(dbConfig);
    client.connect(function(err) {
      const isConnected = !err;
      if (isConnected) {
        console.log('Connected to PG');
      }
      resolve(isConnected);
    });
  });
}

module.exports = pgTryConnect;
