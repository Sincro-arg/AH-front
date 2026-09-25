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

// Fallback a la URL real del back en Render: si el servicio de AH-front no
// tiene configurada NG_API_URL en su panel, el build no debe romperse (deja
// el deploy entero caido). Se usa esta URL conocida y se avisa por consola;
// lo correcto sigue siendo setear NG_API_URL en el panel de Render.
const FALLBACK_API_URL = 'https://ah-back.onrender.com/api';

let apiUrl = process.env['NG_API_URL'];
if (!apiUrl) {
  console.warn(
    `[replace-env] AVISO: falta la variable de entorno NG_API_URL. Usando fallback ${FALLBACK_API_URL}. ` +
    'Configura NG_API_URL en el panel de Render para no depender de este valor por defecto.'
  );
  apiUrl = FALLBACK_API_URL;
}

let content = fs.readFileSync(envFile, 'utf8');
content = content.replace(/%%API_URL%%/g, apiUrl);
fs.writeFileSync(envFile, content, 'utf8');

console.log('[replace-env] environment.ts actualizado con NG_API_URL.');
