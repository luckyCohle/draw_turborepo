# Excalidraw Clone

A real-time collaborative drawing application built with raw HTML5 Canvas. Draw shapes on your screen and see them appear instantly on your friends' screens!

## Features
- **Live Collaboration**: Draw on your canvas, and your friends will see it in real-time.
- **Raw HTML5 Canvas**: No external libraries for rendering—everything is built from scratch.
- **Turbo Repo Monorepo Setup**: Efficiently organized with separate workspaces for frontend, backend, and WebSocket server.
- **Next.js Frontend**: A modern React-based frontend powered by Next.js.
- **Express HTTP Backend**: Handles API requests and authentication.
- **WebSocket Server**: Enables real-time drawing synchronization using `ws`.

## Tech Stack
- **Frontend**: Next.js (React framework)
- **Backend**: Express.js (HTTP server)
- **WebSockets**: `ws` (WebSocket server for real-time communication)
- **Monorepo**: Turbo Repo for efficient project structuring

## Getting Started

### Prerequisites
Ensure you have the following installed:
- Node.js (>= 18.x)
- npm or yarn

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/luckyCohle/draw_turborepo.git
   cd draw_turborepo
   ```
2. Install dependencies:
   ```sh
   npm install  # or yarn install
   ```
3. Start the development servers:
   ```sh
   npm run dev  # Starts frontend, backend, and WebSocket server
   ```

### Project Structure
```
/draw_turborepo
├── apps
│   ├── frontend (Next.js app)
│   ├── backend (Express HTTP server)
│   ├── websocket (WebSocket server)
├── packages
│   ├── shared (Reusable utilities)
│   ├── config (Project-wide configurations)
```

## Usage
1. Open the frontend in your browser (`http://localhost:3000`).
2. Start drawing using your mouse.
3. Share the session link with your friends to collaborate in real time!

## Contributing
Contributions are welcome! Feel free to submit issues or pull requests.

## License
MIT License

## Repository
[GitHub Repository](https://github.com/luckyCohle/draw_turborepo)

