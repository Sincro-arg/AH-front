/**
 * replace-env.js — Injeccion de la URL del back en tiempo de build.
 *
 * Lee la variable de entorno NG_API_URL y la escribe en environment.ts antes
 * de que corra `ng build`. Asi el build de produccion no queda apuntando a
 * localhost: la URL real del back (deploy en Render u otro host) se define
 * en el entorno del build, no en el codigo.
 */

const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');

if (!process.env['NG_API_URL']) {
  console.error('[replace-env] ERROR: falta la variable de entorno NG_API_URL (URL del back, con /api al final).');
  process.exit(1);
}

let content = fs.readFileSync(envFile, 'utf8');
content = content.replace(/%%API_URL%%/g, process.env['NG_API_URL']);
fs.writeFileSync(envFile, content, 'utf8');

console.log('[replace-env] environment.ts actualizado con NG_API_URL.');
