import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid'; // To generate unique IDs

// Create an Express application
const app = express();
const port = 8000;

// Create an HTTP server and pass it to WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Map to store clients with unique IDs
const clients: Map<string, WebSocket> = new Map();

// WebSocket connection
wss.on('connection', (ws: WebSocket) => {
    // Generate a unique ID for the client
    const clientId = uuidv4();
    console.log('New client connected');

    // Store the client in the map
    clients.set(clientId, ws);

    // Send the client ID back to the client
    ws.send(JSON.stringify({ action: "connect" ,type: 'id', id: clientId }));

    console.log(`Client connected with ID: ${clientId}`);

    ws.on('message', (message: string) => {
        console.log(`Received message from ${clientId}: ${message}`);

        // Example: Broadcast the message to all clients except the sender
        clients.forEach((client, id) => {
            if (id !== clientId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ action: "new_message", type: "message", message: message.toString(), timeStamp: new Date().getTime() }));
            }
        });
    });

    ws.on('close', () => {
        // Remove the client from the map when they disconnect
        clients.delete(clientId);
        console.log(`Client with ID: ${clientId} disconnected`);
    });
});


// REST API endpoint
app.get('/api/data', (req, res) => {
    res.json({ message: 'Hello from REST API' });
})

// Start the server
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});