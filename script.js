const $ = (id) => document.getElementById(id);
const socket = io();
let currentRoom = '';
let applyingRemote = false;
let syncTimer;

const fields = ['htmlCode', 'cssCode', 'jsCode'];
const readCode = () => ({ html: $('htmlCode').value, css: $('cssCode').value, js: $('jsCode').value });
function runCode() {
  const { html, css, js } = readCode();
  const safeScript = js.replace(/<\/script/gi, '<\\/script');
  const documentText = `<!doctype html><html><head><meta charset="utf-8"><style>${css.replace(/<\/style/gi, '<\\/style')}</style></head><body>${html}<script>
  const sendLog=(type,args)=>parent.postMessage({type:'code-console',level:type,args:args.map(v=>{try{return typeof v==='string'?v:JSON.stringify(v)}catch(e){return String(v)}})},'*');
  ['log','info','warn','error'].forEach(type=>{const old=console[type];console[type]=(...args)=>{sendLog(type,args);old.apply(console,args)}});
  window.onerror=(msg,src,line,col)=>sendLog('error',[msg+' (line '+line+')']);
  try { ${safeScript}\n } catch(e) { sendLog('error',[e.message]); }
  <\/script></body></html>`;
  $('consoleOutput').textContent = 'Code ran. Console messages will appear here.';
  $('preview').srcdoc = documentText;
}
function scheduleSync() {
  if (!currentRoom || applyingRemote) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => socket.emit('code-change', readCode()), 180);
}
fields.forEach(id => $(id).addEventListener('input', scheduleSync));
$('runBtn').addEventListener('click', runCode);
$('clearBtn').addEventListener('click', () => { fields.forEach(id => $(id).value = ''); scheduleSync(); runCode(); });
$('clearConsole').addEventListener('click', () => $('consoleOutput').textContent = 'Console cleared.');
window.addEventListener('message', event => {
  if (event.source !== $('preview').contentWindow || !event.data || event.data.type !== 'code-console') return;
  const line = `[${event.data.level}] ${event.data.args.join(' ')}`;
  if ($('consoleOutput').textContent === 'Code ran. Console messages will appear here.') $('consoleOutput').textContent = '';
  $('consoleOutput').textContent += ($('consoleOutput').textContent ? '\n' : '') + line;
});

$('joinBtn').addEventListener('click', () => {
  const userName = $('userName').value.trim() || 'Guest';
  const roomId = $('roomId').value.trim() || 'ROOM-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  $('roomId').value = roomId;
  socket.emit('join-room', { userName, roomId });
});
$('chatForm').addEventListener('submit', event => {
  event.preventDefault();
  const message = $('chatInput').value.trim();
  if (message && currentRoom) socket.emit('chat-message', { message });
  $('chatInput').value = '';
});
socket.on('connect', () => { $('connectionText').textContent = 'Connected'; });
socket.on('disconnect', () => { $('connectionText').textContent = 'Disconnected'; });
socket.on('app-error', message => alert(message));
socket.on('room-state', state => {
  currentRoom = state.roomId;
  $('roomInfo').textContent = 'Room: ' + currentRoom;
  $('chatInput').disabled = false; $('sendBtn').disabled = false;
  applyingRemote = true;
  $('htmlCode').value = state.html; $('cssCode').value = state.css; $('jsCode').value = state.js;
  applyingRemote = false;
  $('chatMessages').innerHTML = '';
  addMessage({ userName: 'System', message: 'You joined room ' + currentRoom, system: true });
  runCode();
});
socket.on('code-change', state => {
  applyingRemote = true;
  $('htmlCode').value = state.html; $('cssCode').value = state.css; $('jsCode').value = state.js;
  applyingRemote = false;
});
socket.on('room-count', count => $('roomCount').textContent = count);
socket.on('chat-message', addMessage);
function addMessage(item) {
  const container = $('chatMessages');
  const empty = container.querySelector('.empty'); if (empty) empty.remove();
  const div = document.createElement('div');
  div.className = item.system ? 'message system' : 'message';
  if (!item.system) {
    const name = document.createElement('strong'); name.textContent = item.userName || 'Guest';
    const body = document.createElement('span'); body.textContent = item.message;
    div.append(name, body);
  } else div.textContent = item.message;
  container.appendChild(div); container.scrollTop = container.scrollHeight;
}
runCode();
