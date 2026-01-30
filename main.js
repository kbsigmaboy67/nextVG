
document.addEventListener("contextmenu", e => e.preventDefault());

const desktop = document.getElementById("desktop");
const appsBar = document.getElementById("apps");
const clock = document.getElementById("clock");

let topZ = 100;
const windows = {};

const defaultTheme = {
  ui: "#0b0f1a",
  accent: "#00f0ff",
  font: "Orbitron",
  bg: ""
};

const state = JSON.parse(localStorage.getItem("nextvg-theme") || "null") || defaultTheme;

function applyTheme() {
  document.documentElement.style.setProperty("--ui", state.ui);
  document.documentElement.style.setProperty("--accent", state.accent);
  document.body.style.fontFamily = `'${state.font}', sans-serif`;
  if (state.bg) desktop.style.backgroundImage = `url(${state.bg})`;
}
applyTheme();

function saveTheme() {
  localStorage.setItem("nextvg-theme", JSON.stringify(state));
}

/* -------- CSS injected -------- */
const style = document.createElement("style");
style.innerHTML = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron&family=Roboto&family=Poppins&family=Ubuntu&family=JetBrains+Mono&family=Fira+Code&family=Share+Tech+Mono&family=Audiowide&family=Permanent+Marker&family=Pacifico&display=swap');

.window {
  position:absolute;
  background:var(--ui);
  border:2px solid #111;
  resize:both;
  overflow:hidden;
  border-radius:10px;
}

.window.focused {
  border:2px solid var(--accent);
  box-shadow:
    0 0 8px var(--accent),
    0 0 16px var(--accent),
    inset 0 0 6px var(--accent);
  animation:pulse 2s infinite alternate;
}

@keyframes pulse {
  from { box-shadow:0 0 6px var(--accent); }
  to   { box-shadow:0 0 18px var(--accent); }
}

.titlebar {
  background:#00000088;
  padding:6px 10px;
  cursor:move;
  display:flex;
  justify-content:space-between;
  color:white;
  user-select:none;
}

.controls button {
  background:#000;
  color:white;
  border:none;
  margin-left:6px;
  border-radius:6px;
  cursor:pointer;
}

iframe, textarea {
  width:100%;
  height:100%;
  border:none;
  background:black;
  color:white;
}

.appicon {
  display:flex;
  align-items:center;
  justify-content:center;
}

.appicon svg {
  width:28px;
  height:28px;
}
`;
document.head.appendChild(style);

/* -------- Window system -------- */

function focusWindow(win){
  win.style.zIndex = ++topZ;
  document.querySelectorAll(".window").forEach(w=>w.classList.remove("focused"));
  win.classList.add("focused");
}

function createWindow(id,title,content){
  if(windows[id]) return toggle(id);

  const win = document.createElement("div");
  win.className = "window";
  win.style.left = "120px";
  win.style.top = "80px";
  win.style.width = "600px";
  win.style.height = "400px";
  win.style.zIndex = ++topZ;
  win.onmousedown = ()=>focusWindow(win);

  const bar = document.createElement("div");
  bar.className = "titlebar";
  bar.innerHTML = `<span>${title}</span>`;

  const ctr = document.createElement("div");
  ctr.className = "controls";
  ctr.innerHTML = `<button>–</button><button>▢</button><button>✕</button>`;
  bar.appendChild(ctr);

  const body = document.createElement("div");
  body.style.height = "calc(100% - 32px)";

  if(content === "settings"){
    body.innerHTML = `
    <div style="padding:12px;color:white">
      <h2>NextVG OS Settings</h2>
      UI Color <input type=color value="${state.ui}" onchange="state.ui=this.value;applyTheme();saveTheme()"><br><br>
      Accent <input type=color value="${state.accent}" onchange="state.accent=this.value;applyTheme();saveTheme()"><br><br>
      Font:
      <select onchange="state.font=this.value;applyTheme();saveTheme()">
        <option>Orbitron</option><option>Roboto</option><option>Poppins</option>
        <option>Ubuntu</option><option>JetBrains Mono</option><option>Fira Code</option>
        <option>Share Tech Mono</option><option>Audiowide</option><option>Permanent Marker</option><option>Pacifico</option>
      </select><br><br>
      Background <input type=file onchange="setBg(this.files[0])">
    </div>`;
  }
  else if(content === "minecraft"){
    body.innerHTML = `
      <div style="padding:10px;color:white">
        <button onclick="launchMC('1.12')">Build 1.12 Blob</button>
        <div id="mc12"></div><br>
        <button onclick="launchMC('1.8')">Build 1.8 Blob</button>
        <div id="mc18"></div>
      </div>`;
  }
  else if(content === "editor"){
    body.innerHTML = `
      <textarea id="editor"></textarea>
      <button style="position:absolute;bottom:10px;right:10px"
        onclick="openEditorBlob()">Run as Blob</button>`;
  }
  else if(content === "readme"){
    body.innerHTML = `
      <div style="padding:14px;color:#cbd5e1;font-size:14px">
        <b>README</b><br><br>
        go to "https://cloudmoonapp.com" or "https://now.gg" on NextBrowser<br>
        check out my YouTube! @kbsigmaboy67<br>
        email: kbsigmaboy67@gmail.com<br>
        GitHub: https://github.com/kbsigmaboy67<br><br>
        credits: Keagan, J.T., Ryder, Joe/Baca, KB's school gang, and everyone who helped make the proxies here.<br><br>
        nobody involved in this project is responsible for the use of any proxies here.
      </div>`;
  }
  else {
    const iframe = document.createElement("iframe");
    iframe.src = atob(content);
    body.appendChild(iframe);
  }

  win.append(bar, body);
  desktop.appendChild(win);
  windows[id] = win;
  focusWindow(win);

  let ox,oy,drag=false;
  bar.onmousedown = e=>{drag=true;ox=e.clientX-win.offsetLeft;oy=e.clientY-win.offsetTop;}
  window.onmouseup=()=>drag=false;
  window.onmousemove=e=>{
    if(drag){
      win.style.left=e.clientX-ox+"px";
      win.style.top=e.clientY-oy+"px";
    }
  };

 // Minimize
ctr.children[0].onclick = () => {
  win.style.display = "none";
};

// Fullscreen toggle
ctr.children[1].onclick = () => {
  if (!win.dataset.maximized) {
    // Save old size/position
    win.dataset.prev = JSON.stringify({
      left: win.style.left,
      top: win.style.top,
      width: win.style.width,
      height: win.style.height
    });

    // Maximize
    win.style.left = "0";
    win.style.top = "0";
    win.style.width = "100%";
    win.style.height = "100%";
    win.dataset.maximized = "1";
  } else {
    // Restore
    const prev = JSON.parse(win.dataset.prev);
    win.style.left = prev.left;
    win.style.top = prev.top;
    win.style.width = prev.width;
    win.style.height = prev.height;
    win.dataset.maximized = "";
  }
};

// Close
ctr.children[2].onclick = () => {
  win.remove();
  delete windows[id];
};

}

function toggle(id){
  const w = windows[id];
  w.style.display = w.style.display==="none"?"block":"none";
  focusWindow(w);
}

function setBg(file){
  const r=new FileReader();
  r.onload=e=>{
    state.bg=e.target.result;
    applyTheme(); saveTheme();
  };
  r.readAsDataURL(file);
}

async function launchMC(ver){
  const res = await fetch(ver+".html");
  const html = await res.text();
  const blob = new Blob([html],{type:"text/html"});
  const url = URL.createObjectURL(blob);
  document.getElementById(ver==="1.12"?"mc12":"mc18").innerHTML =
    `<button onclick="window.open('${url}','_blank','k:pop')">Open Again</button>`;
  window.open(url,'_blank','k:pop');
}

function openEditorBlob(){
  const text = document.getElementById("editor").value;
  const blob = new Blob([text],{type:"text/html"});
  open(URL.createObjectURL(blob));
}

/* -------- Apps with custom SVG icons -------- */

const apps = [
  ["NextBrowser","NXB","aHR0cHM6Ly85Mjg1MC52ZXJjZWwuYXBw", icon("🌐")],
  ["KB Browser","KBB","aHR0cHM6Ly9rYnNpZ21hYm95NjctaGFja3MuYm9sdC5ob3N0", icon("🧠")],
  ["Google","GGL","aHR0cHM6Ly9nb29nbGUuY29tP2lndT0x", icon("G")],
  ["RammerHead","RHM","aHR0cHM6Ly9lZmx5LjEwOC0xODEtMzItNzcuc3NsaXAuaW8=", icon("⚡")],
  ["PeteZah Games","PZG","aHR0cHM6Ly90dWJtbGVkeGVuaS52aWFyM2QuY29t", icon("🎮")],
  ["EaglerCraft 1.12","EGL","aHR0cHM6Ly9rYnNpZ21hYm95NjcuZ2l0aHViLmlvL21jLzEuMTI=", icon("⬛")],
  ["XVG Links","XVG","aHR0cHM6Ly9rYi0wMy52ZXJjZWwuYXBw", icon("XV", "#7dd3fc","cursive")],
  ["MacVG MiniGames","MAC","aHR0cHM6Ly9rYnNpZ21hYm95NjcuZ2l0aHViLmlvL21hY3Zn", icon("🎮")],
  ["Minecraft Apps","MCA","minecraft", icon("⛏️")],
  ["Settings","SET","settings", icon("⚙️")],
  ["Editor","EDT","editor", icon("📝")],
  ["README","RDM","readme", icon("📘")],
  ["NextVG Apps","NVG","aHR0cHM6Ly9rYnNpZ21hYm95NjcuZ2l0aHViLmlvL25leHRWRy9udmctYXBwcy5odG1s", icon("▦","var(--accent)")]
];

function icon(text,color="var(--accent)",font="Orbitron"){
  return `<svg viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="#000"/>
    <text x="50" y="65" text-anchor="middle"
      font-size="48"
      fill="${color}"
      font-family="${font}">
      ${text}
    </text>
  </svg>`;
}

apps.forEach(([name,id,url,icon])=>{
  const el=document.createElement("div");
  el.className="appicon";
  el.innerHTML=icon;
  el.title=name;
  el.onclick=()=>createWindow(id,name,url);
  appsBar.appendChild(el);
});

setInterval(()=>{
  const d=new Date();
  clock.textContent=d.toLocaleTimeString()+" "+d.toLocaleDateString();
},1000);
