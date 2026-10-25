const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const rooms = new Map();

app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req, res) => res.json({ ok: true, app: 'Collaborative Coding Platform' }));

io.on('connection', (socket) => {
  socket.on('join-room', ({ roomId, userName } = {}) => {
    roomId = String(roomId || '').trim().toUpperCase().slice(0, 20);
    userName = String(userName || 'Guest').trim().slice(0, 24) || 'Guest';
    if (!roomId) return socket.emit('app-error', 'Please enter a room ID.');
    for (const oldRoom of socket.rooms) if (oldRoom !== socket.id) socket.leave(oldRoom);
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.userName = userName;
    if (!rooms.has(roomId)) rooms.set(roomId, { html: '<h1>Hello, world!</h1>\n<p>Edit the code and click Run.</p>', css: 'body { font-family: Arial; padding: 20px; } h1 { color: #2563eb; }', js: "console.log('Hello from JavaScript!');" });
    socket.emit('room-state', { roomId, ...rooms.get(roomId) });
    socket.to(roomId).emit('chat-message', { userName: 'System', message: `${userName} joined the room.`, system: true });
    io.to(roomId).emit('room-count', io.sockets.adapter.rooms.get(roomId)?.size || 1);
  });

  socket.on('code-change', ({ html, css, js } = {}) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    const state = { html: String(html || '').slice(0, 100000), css: String(css || '').slice(0, 100000), js: String(js || '').slice(0, 100000) };
    rooms.set(roomId, state);
    socket.to(roomId).emit('code-change', state);
  });

  socket.on('chat-message', ({ message } = {}) => {
    const roomId = socket.data.roomId;
    if (!roomId) return;
    message = String(message || '').trim().slice(0, 500);
    if (!message) return;
    io.to(roomId).emit('chat-message', { userName: socket.data.userName || 'Guest', message, system: false });
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    if (roomId) io.to(roomId).emit('room-count', io.sockets.adapter.rooms.get(roomId)?.size || 0);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Collaborative Coding Platform running at http://localhost:${PORT}`);
});
