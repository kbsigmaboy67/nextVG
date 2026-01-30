/* ============================
   APP LIST (EDIT HERE)
============================ */
const apps = [
  {
    name: "MacVG Best Version",
    category: "Games / MiniGames",
    type: "url",
    src: "https://kbsigmaboy67.github.io/macvg",
    icon: "https://kbsigmaboy67.github.io/macvg/media/logo.png",
    theme: "rgb(120,80,255)"
  },
  {
    name: "EaglerCraft 1.12 WASM",
    category: "Games / MiniGames",
    type: "file",
    src: "1.12.html",
    icon: "",
    theme: "rgb(255,80,120)"
  },
  {
    name: "NextVG Operating System",
    category: "Browsers / Proxies",
    type: "url",
    src: "https://kbsigmaboy67.github.io/-/next",
    icon: "logo-img-8.png",
    theme: "rgb(0,255,180)"
  }
];

/* ============================
   HELPERS
============================ */
function normalize(str) {
  return str.toLowerCase().replace(/\s+/g, "");
}

/* ============================
   RENDER APPS
============================ */
const content = document.getElementById("content");
const search = document.getElementById("search");

function render(filter = "") {
  content.innerHTML = "";
  const f = normalize(filter);
  const categories = [...new Set(apps.map(a => a.category))];

  categories.forEach(cat => {
    const catApps = apps.filter(app =>
      app.category === cat &&
      normalize(app.name).startsWith(f)
    );
    if (!catApps.length) return;

    const section = document.createElement("div");
    section.className = "category";
    section.innerHTML = `<h2>${cat}</h2><div class="grid"></div>`;

    const grid = section.querySelector(".grid");

    catApps.forEach(app => {
      const el = document.createElement("div");
      el.className = "app";
      el.style.setProperty("--theme", app.theme);

      el.innerHTML = `
        <div class="icon-wrap">
          <div class="icon">
            <img src="${app.icon}">
          </div>
        </div>
        <div class="name">${app.name}</div>
      `;

      el.onclick = () => openApp(app);
      grid.appendChild(el);
    });

    content.appendChild(section);
  });
}

search.oninput = () => render(search.value);
render();

/* ============================
   FULLSCREEN APP OPEN (STABLE)
============================ */
async function openApp(app) {
  let payload = "";

  if (app.type === "url") {
    payload = `
<!DOCTYPE html>
<html>
<body style="margin:0;overflow:hidden;background:black">
<iframe
  name="embed:d"
  src="${app.src}"
  style="position:fixed;inset:0;width:100vw;height:100vh;border:0"
  sandbox="allow-scripts allow-forms allow-same-origin">
<\/iframe>
<script>
document.oncontextmenu = () => false;
<\/script>
</body>
</html>`;
  }

  if (app.type === "base64") {
    payload = atob(app.src);
  }

  if (app.type === "file") {
    const res = await fetch(app.src);
    payload = await res.text();
  }

  if (app.type !== "url") {
    payload = `
<!DOCTYPE html>
<html>
<body style="margin:0;overflow:hidden;background:black">
<iframe
  name="embed:d"
  style="position:fixed;inset:0;width:100vw;height:100vh;border:0"
  sandbox="allow-scripts allow-forms allow-same-origin">
<\/iframe>
<script>
document.oncontextmenu = () => false;
document.querySelector("iframe").srcdoc =
\`${payload.replace(/`/g,"\\`")}\`;
<\/script>
</body>
</html>`;
  }

  const blob = new Blob([payload], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  window.open(url, "_blank", "popup=yes,width=1280,height=720");
}
