# CodeTogether — Collaborative Coding Platform

A beginner-friendly B.Tech mini-project with HTML/CSS/JavaScript editors, live preview, shared rooms, real-time code updates and room chat.

## Requirements
- Node.js (LTS recommended)
- Internet connection for the first `npm install`

## Run on Windows
1. Extract this ZIP into a normal folder.
2. Open Command Prompt (CMD) in the extracted folder. (File Explorer address bar: type `cmd` and press Enter.)
3. Run:
   ```cmd
   npm install
   npm start
   ```
4. Open `http://localhost:3000` in your browser.
5. Keep the CMD window open while using the website.

If PowerShell blocks `npm`, use CMD or run `npm.cmd install` and `npm.cmd start`.

If port 3000 is already in use, an earlier server may already be running. Open `http://localhost:3000` first. To stop the old server, focus its terminal and press Ctrl+C. Avoid `taskkill /F /IM node.exe` if you have other Node projects running because it stops all Node processes.

## Try collaboration
- Open the site in two browser tabs.
- In tab 1, enter a name and room ID (e.g. `CSE2026`) and click Create / Join Room.
- In tab 2, enter another name and the exact same room ID and click Create / Join Room.
- Code edits and chat messages are broadcast to other users in that room.

## Files
- `server.js`: Express + Socket.IO server
- `public/index.html`: page structure
- `public/style.css`: styling
- `public/script.js`: editor, preview, chat and room client logic
- `package.json`: project dependencies and start command

## Notes
This is an educational demo. Room data is stored in server memory and resets when the server restarts. Use only trusted code in the JavaScript editor; the preview uses a sandboxed iframe but this is not a production-grade secure code execution service. The app currently runs browser-side HTML/CSS/JavaScript, not Python/C/C++.
