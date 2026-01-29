/* ============================
   FULLSCREEN APP OPEN LOGIC
============================ */
async function openApp(app) {
  let html = "";

  if (app.type === "url") {
    html = `
      <iframe src="${app.src}"
        style="
          position:fixed;
          inset:0;
          width:100vw;
          height:100vh;
          border:0;
        "
        sandbox="allow-scripts allow-forms allow-same-origin">
      <\/iframe>`;
  }

  if (app.type === "base64") {
    html = atob(app.src);
  }

  if (app.type === "file") {
    const res = await fetch(app.src);
    html = await res.text();
  }

  const doc = `
<!DOCTYPE html>
<html>
<body style="
  margin:0;
  background:black;
  overflow:hidden;
">
<iframe name="embed:d"
  style="
    position:fixed;
    inset:0;
    width:100vw;
    height:100vh;
    border:0;
  "
  sandbox="allow-scripts allow-forms allow-same-origin">
<\/iframe>

<script>
document.oncontextmenu = () => false;

const iframe = document.querySelector("iframe");
iframe.srcdoc = \`${html.replace(/`/g,"\\`")}\`;

/* Force fullscreen */
const goFull = () => {
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
};

setTimeout(goFull, 50);
<\/script>
</body>
</html>`;

  const blob = new Blob([doc], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  window.open(
    url,
    "_blank",
    "popup=yes,width=1280,height=720"
  );
}
