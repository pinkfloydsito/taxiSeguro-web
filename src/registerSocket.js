import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:9000');

function subscribeMonitor() {
  socket.on('position', (position) => {
    console.info(position);
  });
}

export { subscribeMonitor, socket };
