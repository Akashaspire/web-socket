const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();

// Serve static files (if needed)
app.use(express.static('public'));

// Initialize WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// WebSocket event handling
wss.on('connection', (ws) => {
  console.log('A new client connected.');

  // Event listener for incoming messages
  ws.on('message', (message) => {
    console.log('Received message:', message.toString());

    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  // Event listener for client disconnection
  ws.on('close', () => {
    console.log('A client disconnected.');
  });
});

// API to send HTML content via WebSocket
app.get('/send-html', (req, res) => {
  var html_message = '<h1>Hello WebSocket Clients!</h1><p>This is a message from the server.</p>';

  // Broadcast the HTML message to all WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(html_message);
    }
  });

  res.json({ success: true, message: 'HTML message sent to WebSocket clients.' });
});

// Route to serve an HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
