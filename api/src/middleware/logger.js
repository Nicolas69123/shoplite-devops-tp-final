const crypto = require("crypto");
const log = require("../log");

// Journalise chaque requete en JSON avec un request_id propage :
// - reutilise le header X-Request-Id si present (le proxy nginx l'injecte)
// - sinon en genere un
// Le request_id est renvoye au client et attache a req pour les autres logs.
module.exports = function logger(req, res, next) {
  const startedAt = Date.now();
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    const fields = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms: Date.now() - startedAt,
      request_id: requestId
    };

    if (res.statusCode >= 500) {
      log.error("request failed", fields);
    } else if (res.statusCode >= 400) {
      log.warn("request rejected", fields);
    } else {
      log.info("request completed", fields);
    }
  });

  next();
};
