// EndLab-Startseite: Service Worker anmelden und Installationshinweis zeigen (nur wenn die Seite installierbar ist)
(() => {
  const box = document.getElementById("install");
  const button = document.getElementById("install-button");
  const text = document.getElementById("install-text");
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  if (!box) return;
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (standalone) return;
  // iPhone und iPad: kein Installationsknopf im Browser – nur der Weg über „Teilen“
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (ios) {
    text.textContent = "Als App auf dem iPhone: unten auf „Teilen“ tippen, dann „Zum Home-Bildschirm“. Alle Projekte an einem Ort, eure Daten bleiben beisammen.";
    box.hidden = false;
    return;
  }
  // Android und Rechner: der Browser bietet die Installation an
  let prompt = null;
  addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    prompt = e;
    button.hidden = false;
    box.hidden = false;
  });
  button.addEventListener("click", async () => {
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice.catch(() => null);
    prompt = null;
    box.hidden = true;
  });
  addEventListener("appinstalled", () => { box.hidden = true; });
})();
