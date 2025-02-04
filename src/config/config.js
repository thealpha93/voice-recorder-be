import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
    // Server configuration
    PORT: process.env.PORT || 3000,
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5174",
    
    // Recording settings
    MAX_RECORDING_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_CHUNK_SIZE: 1024 * 1024, // 1MB
    RECORDING_PATH: path.join(__dirname, '../../storage/recordings'),
    
    // Cleanup settings
    CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
    MAX_FILE_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
    
    // Audio settings
    SUPPORTED_MIME_TYPES: ['audio/webm', 'audio/ogg', 'audio/wav'],
    
    // WebSocket events
    EVENTS: {
        CONNECT: 'connection',
        DISCONNECT: 'disconnect',
        AUDIO_DATA: 'audio-data',
        START_RECORDING: 'start-recording',
        STOP_RECORDING: 'stop-recording',
        PAUSE_RECORDING: 'pause-recording',
        RESUME_RECORDING: 'resume-recording',
        RECORDING_ERROR: 'recording-error',
        RECORDING_SAVED: 'recording-saved'
    }
};