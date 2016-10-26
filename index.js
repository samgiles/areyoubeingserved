function createRetry(timeoutSeconds, testFn) {

  let timedOut = false;
  let retryCount = 0;
  let startTime = 0;

  function timeout() {
    startTime = Date.now();
    setTimeout(function() {
      timedOut = true;
    }, timeoutSeconds * 1000);
  }

  function outputInfo() {
    const timeElapsed = new Date(Date.now() - startTime).getSeconds();
    process.stdout.write(
      `Retrying (${retryCount}) time elapsed: ${timeElapsed}s/${timeoutSeconds}s\r`);
  }

  timeout();
  return function _retry() {
    return new Promise((resolve, reject) => {
      Promise.resolve(testFn())
        .then((result) => {
          if (result) {
            resolve();
          } else {
            if (timedOut) {
              reject('timed out');
            } else {
              setTimeout(() => {
                retryCount++;
                outputInfo();
                resolve(_retry());
              }, 500);
            }
          }
        });
    });
  }
}

module.exports = {
  createRetry,
  waitForTcp: function(timeoutSeconds, host, port) {
    const tcpTryConnect = require('./lib/tcp');
    return createRetry(timeoutSeconds, tcpTryConnect.bind(null, { host, port, }));
  },
  waitForPg: function(timeoutSeconds, dbConfig) {
    let pgTryConnect;
    try {
      pgTryConnect = require('./lib/postgres');
    } catch(e) {
      throw new Error(
        'You must install the \'pg\' package to use \'waitForPg\': `npm install pg`');
    }

    return createRetry(timeoutSeconds, pgTryConnect.bind(null, dbConfig));
  },
};
