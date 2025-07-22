// Simple test script to verify socket.io stability
const io = require('socket.io-client');
const readline = require('readline');

console.log('Socket.IO Stability Test');
console.log('------------------------');
console.log('This script will test the stability of the socket.io connection');
console.log('Press Ctrl+C to exit');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connection counter
let connectionCount = 0;
let disconnectionCount = 0;
let reconnectionCount = 0;
let errorCount = 0;

// Create socket with reconnection settings
const socket = io('http://localhost:5000', {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  transports: ['websocket', 'polling']
});

// Connection events
socket.on('connect', () => {
  connectionCount++;
  console.log(`[${new Date().toISOString()}] Connected to server (${connectionCount} times)`);
});

socket.on('disconnect', (reason) => {
  disconnectionCount++;
  console.log(`[${new Date().toISOString()}] Disconnected: ${reason} (${disconnectionCount} times)`);
});

socket.on('reconnect', (attemptNumber) => {
  reconnectionCount++;
  console.log(`[${new Date().toISOString()}] Reconnected after ${attemptNumber} attempts (${reconnectionCount} times)`);
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`[${new Date().toISOString()}] Reconnection attempt #${attemptNumber}`);
});

socket.on('reconnect_error', (error) => {
  errorCount++;
  console.log(`[${new Date().toISOString()}] Reconnection error: ${error} (${errorCount} errors)`);
});

socket.on('connect_error', (error) => {
  errorCount++;
  console.log(`[${new Date().toISOString()}] Connection error: ${error} (${errorCount} errors)`);
});

// Command menu
function showMenu() {
  console.log('\nTest Commands:');
  console.log('1. Force disconnect (simulates network issue)');
  console.log('2. Reconnect manually');
  console.log('3. Send test message');
  console.log('4. Show connection statistics');
  console.log('5. Exit test');
  
  rl.question('Enter command number: ', (answer) => {
    switch(answer) {
      case '1':
        console.log('Forcing disconnect...');
        socket.disconnect();
        break;
      case '2':
        console.log('Attempting manual reconnection...');
        socket.connect();
        break;
      case '3':
        console.log('Sending test message...');
        socket.emit('test message', { text: 'Test message', timestamp: new Date().toISOString() });
        break;
      case '4':
        console.log('\nConnection Statistics:');
        console.log(`Connections: ${connectionCount}`);
        console.log(`Disconnections: ${disconnectionCount}`);
        console.log(`Reconnections: ${reconnectionCount}`);
        console.log(`Errors: ${errorCount}`);
        console.log(`Current state: ${socket.connected ? 'Connected' : 'Disconnected'}`);
        break;
      case '5':
        console.log('Exiting test...');
        socket.disconnect();
        rl.close();
        process.exit(0);
        return;
      default:
        console.log('Invalid command');
    }
    showMenu();
  });
}

// Start the test
showMenu();

// Handle process exit
process.on('SIGINT', () => {
  console.log('\nDisconnecting and exiting...');
  socket.disconnect();
  rl.close();
  process.exit(0);
});