const express = require( 'express' ); // Import Express module
const http = require( 'http' ); // Import HTTP module
const WebSocket = require( 'ws' ); // Import WebSocket module
const path = require( 'path' ); // Import Path module

const app = express(); // Create an Express application
const PORT = process.env.PORT || 3000; // Define the server port

// Serve static files from the root directory
app.use( express.static( __dirname ) );

// Create HTTP server by passing the Express app
const server = http.createServer( app );

// Integrate WebSocket with the HTTP server
const wss = new WebSocket.Server({ server });

// Array to keep track of all connected clients
const clients = [];

wss.on( 'connection', function connection( ws ) {
    console.log( "WS connection arrived" );

    // Add the new connection to our list of clients
    clients.push( ws );

    ws.on( 'message', function incoming( message ) {
        console.log( 'received: %s', message );

        // Broadcast the message to all clients
        clients.forEach( client => {
            if ( client.readyState === WebSocket.OPEN ) {
                console.log( "message", message.toString() );
                client.send( message.toString() );
            }
        });
    });

    ws.on( 'close', () => {
        // Remove the client from the array when it disconnects
        const index = clients.indexOf( ws );
        if ( index > -1 ) {
            clients.splice( index, 1 );
        }
    });

    // Send a welcome message on new connection
    ws.send( 'Welcome to the chat!' );
});

// Send index.html file from the root directory
app.get( '/' , function( req, res ) {
    res.sendFile( path.join( __dirname, 'index.html' ) );
});

// Start the server
server.listen( PORT, () => {
    console.log( `Server running on port ${PORT}` );
});
