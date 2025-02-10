// Import required modules
var express = require( 'express' );
var http = require( 'http' );
var WebSocket = require( 'ws' );
var cors = require( 'cors' );

// Create an instance of an Express application
var app = express();
// Define the port number for the server, using environment variable or defaulting to 3000
var PORT = process.env.PORT || 3000;
// Enable CORS to allow connections from any origin
app.use( cors( { origin: '*' } ) );
// Serve static files from the current directory
app.use( express.static( __dirname ) );
// Create an HTTP server using Express
var server = http.createServer( app );
// Create a WebSocket server and attach it to the HTTP server
var wss = new WebSocket.Server( { server } );
// Store clients based on room ID
var rooms = {};
// Handle new WebSocket connections
wss.on( 'connection', function connection( ws ) {
  // Variables to store user's room and username
  var user_room = null;
  var user_name = null;
  // Listen for incoming messages from the client
  ws.on( 'message', function incoming( message ) {
    try {
      // Parse the received JSON message
      var data = JSON.parse( message );
      // Handle user joining a room
      if ( data.type === 'join' ) {
        // Assign the received room ID and username
        user_room = data.room_id;
        user_name = data.username;
        // If the room does not exist, create an empty array for it
        if ( !rooms[ user_room ] ) {
          rooms[ user_room ] = [];
        }
        // Add the new WebSocket connection to the room
        rooms[ user_room ].push( ws );
        // Log the user's entry to the room
        console.log( user_name + ' joined room: ' + user_room );
        return;
      }
      // Handle chat messages
      if ( data.type === 'message' && user_room ) {
        // Broadcast the message to all clients in the same room, except the sender
        rooms[ user_room ].forEach( function( client ) {
          if ( client !== ws && client.readyState === WebSocket.OPEN ) {
            client.send( JSON.stringify( {
              type: 'message',
              text: data.text,
              data: data.data,
              sender: user_name
            } ) );
          }
        } );
      }
    } catch ( error ) {
      // Handle any errors in message processing
      console.error( 'Error processing message:', error );
    }
  } );
  // Handle WebSocket disconnection
  ws.on( 'close', function() {
    // If the user was in a room, remove their WebSocket from the room's client list
    if ( user_room && rooms[ user_room ] ) {
      rooms[ user_room ] = rooms[ user_room ].filter( function( client ) {
        return client !== ws;
      } );
      // Log the user's exit from the room
      console.log( user_name + ' left room: ' + user_room );
    }
  } );
} );
// Start the server and listen on the specified port
server.listen( PORT, function() {
  console.log( 'Server running on port ' + PORT );
} );
