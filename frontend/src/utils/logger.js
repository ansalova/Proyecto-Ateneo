/**
 * Utilidad centralizada para manejo de logs.
 * Permite controlar qué se muestra en consola según el ambiente.
 */
const logger = {
  info: (msg, data = "") => {
    if (import.meta.env.DEV) console.info(`[INFO] ${msg}`, data);
  },
  warn: (msg, data = "") => {
    if (import.meta.env.DEV) console.warn(`[WARN] ${msg}`, data);
  },
  error: (msg, error = "") => {
    // Los errores siempre se muestran, pero podrías enviarlos a un servicio externo aquí
    console.error(`[ERROR] ${msg}`, error);
  },
  debug: (msg, data = "") => {
    if (import.meta.env.DEV) console.log(`[DEBUG] ${msg}`, data);
  }
};

export default logger;