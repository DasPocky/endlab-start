// Dateien aus public/ in den Worker-Code legen (src/dateien.js) – so braucht die Startseite keinen Datei-Upload.
// Nach jeder Änderung in public/: node scripts/dateien.mjs
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TYPES = { ".js": "text/javascript; charset=utf-8", ".webmanifest": "application/manifest+json", ".png": "image/png" };
const out = {};
const walk = (dir, base = "") => {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, `${base}/${name}`);
    else out[`${base}/${name}`] = { type: TYPES[name.slice(name.lastIndexOf("."))] ?? "application/octet-stream", b64: readFileSync(p).toString("base64") };
  }
};
walk("public");
writeFileSync("src/dateien.js", `// Erzeugt von scripts/dateien.mjs – nicht von Hand ändern\nexport const DATEIEN = ${JSON.stringify(out, null, 0)};\n`);
console.log(Object.keys(out).join("\n"));
