
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from a 'public' directory
// app.use(express.static(path.join(__dirname, 'public')));
app.use( express.static( path.join( __dirname, 'public' ) ) );


// Create HTTP server by passing the Express app
const server = http.createServer(app);

// Integrate WebSocket with the HTTP server
const wss = new WebSocket.Server({ server });

// Array to keep track of all connected clients
const clients = [];

wss.on('connection', function connection(ws) {
    console.log("WS connection arrived");

    // Add the new connection to our list of clients
    clients.push(ws);

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);

        // Broadcast the message to all clients
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                console.log("message",message.toString())
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => {
        // Remove the client from the array when it disconnects
        const index = clients.indexOf(ws);
        if (index > -1) {
            clients.splice(index, 1);
        }
    });

    // Send a welcome message on new connection
    ws.send('Welcome to the chat!');
});

// Send index html file
app.get( '/' , function( req, res) {
    // Send the index.html file from the 'public' directory
    res.sendFile( path.join( __dirname, 'public', 'index.html' ) );
})

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
