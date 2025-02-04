
export class RecordingError extends Error {
    constructor(message, code = 'RECORDING_ERROR') {
        super(message);
        this.name = 'RecordingError';
        this.code = code;
    }
}

export class StreamError extends Error {
    constructor(message, code = 'STREAM_ERROR') {
        super(message);
        this.name = 'StreamError';
        this.code = code;
    }
}