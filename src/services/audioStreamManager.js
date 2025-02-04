import fs from 'fs';
import path from 'path';
import { config } from '../config/config.js';
import { StreamError } from '../utils/errors.js';

class AudioStreamManager {
    constructor() {
        // Map to store active recording streams
        // It was either map or object, but map is more efficient :P
        this.streams = new Map();
        // Ideally in prod, we should use a database to store this information
        
        // Ensure recording directory exists
        this._checkRecordingDirectory();
        
        // Start cleanup interval
        this._startCleanupInterval();
    }

    /**
     * Checks if the recording directory exists and creates it if it doesn't
     * @private
     * @returns {void}
     * */
    _checkRecordingDirectory() {
        if (!fs.existsSync(config.RECORDING_PATH)) {
            fs.mkdirSync(config.RECORDING_PATH, { recursive: true });
        }
    }
    /**
     * Creates a new recording stream for a socket
     * @param {string} socketId
     * @returns {Promise<void>}
     */
    async createStream(socketId) {
        // Generate unique filename using timestamp and socket ID
        // This is enough for now
        const filename = `recording-${Date.now()}-${socketId}.webm`;
        const filepath = path.join(config.RECORDING_PATH, filename);

        const writeStream = fs.createWriteStream(filepath);

        this.streams.set(socketId, {
            stream: writeStream,
            filepath: filepath,
            filename: filename,
            size: 0,
            chunks: 0,
            startTime: Date.now(),
            isPaused: false,
            totalPausedDuration: 0,
            lastPauseTime: null
        });

        writeStream.on('error', (error) => {
            console.error(`Stream error for socket ${socketId}:`, error);
            this.cleanup(socketId);
        });
    }

    /**
     * Writes an audio chunk to the stream
     * @param {string} socketId
     * @param {Buffer} chunk
     * @returns {Promise<boolean>} - Returns true if write was successful
     */
    async writeChunk(socketId, chunk) {
        const streamData = this.streams.get(socketId);
        if (!streamData || streamData.isPaused) return false;

        // Validate chunk size
        if (chunk.length > config.MAX_CHUNK_SIZE) {
            throw new StreamError('Chunk size exceeds maximum allowed');
        }

        // Check total recording size
        streamData.size += chunk.length;
        if (streamData.size > config.MAX_RECORDING_SIZE) {
            throw new StreamError('Recording size exceeds maximum allowed');
        }

        // Write chunk with back-pressure handling
        return new Promise((resolve, reject) => {
            if (!streamData.stream.write(chunk)) {
                streamData.stream.once('drain', () => resolve(true));
            } else {
                resolve(true);
            }
        });
    }

    /**
     * Pauses the recording stream
     * @param {string} socketId
     */
    pauseRecording(socketId) {
        const streamData = this.streams.get(socketId);
        if (streamData && !streamData.isPaused) {
            streamData.isPaused = true;
            streamData.lastPauseTime = Date.now();
        }
    }

    /**
     * Resumes the recording stream
     * @param {string} socketId
     */
    resumeRecording(socketId) {
        const streamData = this.streams.get(socketId);
        if (streamData && streamData.isPaused) {
            streamData.isPaused = false;
            if (streamData.lastPauseTime) {
                streamData.totalPausedDuration += Date.now() - streamData.lastPauseTime;
                streamData.lastPauseTime = null;
            }
        }
    }

    /**
     * Finalizes and closes the recording stream
     * @param {string} socketId
     * @returns {Promise<Object>} Recording metadata
     */
    async finalizeRecording(socketId) {
        const streamData = this.streams.get(socketId);
        if (!streamData) return null;

        return new Promise((resolve, reject) => {
            streamData.stream.end(async () => {
                try {
                    const duration = Date.now() - streamData.startTime - streamData.totalPausedDuration;
                    const metadata = {
                        filename: streamData.filename,
                        filepath: streamData.filepath,
                        duration: duration,
                        size: streamData.size,
                        chunks: streamData.chunks
                    };
                    
                    this.cleanup(socketId);
                    resolve(metadata);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    /**
     * Cleans up resources for a socket
     * @param {string} socketId
     */
    cleanup(socketId) {
        const streamData = this.streams.get(socketId);
        if (streamData) {
            streamData.stream.destroy();
            this.streams.delete(socketId);
        }
    }

    /**
     * Starts the cleanup interval for old recordings
     * This can be later modified to move old recordings to cold storage / archive
     * @private
     */
    _startCleanupInterval() {
        setInterval(() => {
            try {
                const files = fs.readdirSync(config.RECORDING_PATH);
                const now = Date.now();
                
                files.forEach(file => {
                    const filepath = path.join(config.RECORDING_PATH, file);
                    const stats = fs.statSync(filepath);
                    
                    if (now - stats.mtime.getTime() > config.MAX_FILE_AGE) {
                        fs.unlinkSync(filepath);
                        console.log(`Cleaned up old recording: ${file}`);
                    }
                });
            } catch (error) {
                console.error('Error during cleanup:', error);
            }
        }, config.CLEANUP_INTERVAL);
    }

}

// Make sure to export singleton instance
export const audioManager = new AudioStreamManager();