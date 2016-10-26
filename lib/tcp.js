const net = require('net');

function tcpTryConnect(config) {
  return new Promise((resolve, reject) => {
    setTimeout(function() { resolve(false); }, 1000);

    const socket = net.createConnection(config, () => {
      resolve(true);
    });

    socket.on('error', () => {
      resolve(false);
    });

    socket.on('close', (hadError) => {
      resolve(!hadError);
    });
  })
}

module.exports = tcpTryConnect;
