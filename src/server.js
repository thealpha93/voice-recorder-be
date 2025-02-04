import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config/config.js';
import { audioManager } from './services/audioStreamManager.js';
import WebSocketHandler from './websocket/handler.js';

const app = express();
const httpServer = createServer(app);

app.use(cors({
    origin: config.CORS_ORIGIN,
    methods: ['GET', 'POST']
}));


const io = new Server(httpServer, {
    cors: {
        origin: config.CORS_ORIGIN,
        methods: ['GET', 'POST']
    },
    maxHttpBufferSize: config.MAX_CHUNK_SIZE
});

// Set up WebSocket handlers
new WebSocketHandler(io, audioManager);

app.get('/test', (req, res) => {
    res.json({ status: 'ok' });
});

httpServer.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
    console.log(`WebSocket server is ready for connections`);
    console.log(`Recording directory: ${config.RECORDING_PATH}`);
});