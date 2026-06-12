// Logger JSON structure a niveaux, avec sanitization des champs sensibles.
// LOG_LEVEL (debug|info|warn|error|fatal) fixe le niveau minimum journalise.

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, fatal: 50 };

const SENSITIVE_KEYS = [
  "password",
  "token",
  "authorization",
  "secret",
  "api_key",
  "apikey",
  "cookie"
];

function minLevel() {
  const configured = (process.env.LOG_LEVEL || "info").toLowerCase();
  return LEVELS[configured] || LEVELS.info;
}

function sanitize(value) {
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }
  if (value && typeof value === "object") {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      clean[key] = SENSITIVE_KEYS.includes(key.toLowerCase())
        ? "[REDACTED]"
        : sanitize(val);
    }
    return clean;
  }
  return value;
}

function log(level, message, fields = {}) {
  if ((LEVELS[level] || LEVELS.info) < minLevel()) {
    return;
  }

  console.log(
    JSON.stringify({
      level,
      message,
      ...sanitize(fields),
      timestamp: new Date().toISOString()
    })
  );
}

module.exports = {
  debug: (msg, fields) => log("debug", msg, fields),
  info: (msg, fields) => log("info", msg, fields),
  warn: (msg, fields) => log("warn", msg, fields),
  error: (msg, fields) => log("error", msg, fields),
  fatal: (msg, fields) => log("fatal", msg, fields),
  sanitize
};
