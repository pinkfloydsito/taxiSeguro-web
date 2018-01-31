const io = require('socket.io-client');
const socket = io('http://localhost:9000');

export { socket };
