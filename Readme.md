# Voice Recorder Backend

This is a Node.js WebSocket server that handles real-time audio streaming and recording. This server allows clients to stream audio data (pause, resume and stop). This uses nodejs streams to ensure low memory usage and to make sure that the whole recording is not lost if the server crashes or some error happens.

## System Architecture

The voice recording system uses a straightforward but effective architecture centered around WebSocket connections and streaming data processing.

The architecture is fairly simple and consists of webhooks and streaming data processing.

The system consists of four main components:

1. WebSocket Server: Handles real-time connections with the client using Socket.IO.

2. Audio Stream Manager: Processes incoming audio chunks streams. When scaling up, we'll probably need a queue. THis is export as a singleton instance to simplify DI and to implement shared state.

3. Storage Layer: Saves recordings to the file system in an organized structure. Right now files are stored in the same server (bad idea). When scaling up, we'll need to use storage services like s3 and move older recordings to archive.

## Getting Started

### Prerequisites

Before running the server, make sure you have:
- Node.js (version 18 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone 
cd voice-recorder-be
```

2. Install dependencies:
```bash
npm install
```

3. Create a storage directory:
```bash
mkdir -p storage/recordings
```

4. Start the server:
```bash
npm run dev
```

The server will start on http://localhost:3000.

## Key Components

### Audio Manager

The AudioManager class handles the core functionality of processing and saving audio streams. It uses Node.js streams to efficiently handle long audio recordings. It also is more fault tolerant than the normal array based aproach:


## Configuration

The server can be configured through environment variables:

```env
# Server Configuration
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Recording Configuration
MAX_RECORDING_SIZE=104857600  # 100MB in bytes
MAX_CHUNK_SIZE=1048576        # 1MB in bytes
```

## Limitations and Considerations

1. Single Server: This implementation runs on a single server and isn't designed for scaling. We'll need to implement a queue based streaming system for scalability.

2. Local Storage: Recordings are saved to the local file system, which may not be suitable for production use with multiple servers. For production it would be better to go with s3 standard and maybe s3 glacier for archiving.