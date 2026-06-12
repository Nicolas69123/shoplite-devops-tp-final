const request = require("supertest");
const app = require("../src/app");
const db = require("../src/db");
const log = require("../src/log");

afterAll(async () => {
  await db.getPool().end();
});

describe("GET /ready (readiness)", () => {
  test("retourne 200 quand la base de donnees repond", async () => {
    const response = await request(app).get("/ready");

    expect(response.status).toBe(200);
    expect(response.body.ready).toBe(true);
  });

  test("retourne 503 quand la base de donnees est injoignable", async () => {
    const spy = jest
      .spyOn(db, "query")
      .mockRejectedValueOnce(new Error("connexion db perdue"));

    const response = await request(app).get("/ready");

    expect(response.status).toBe(503);
    expect(response.body.ready).toBe(false);
    expect(response.body.reason).toBe("database unreachable");

    spy.mockRestore();
  });
});

describe("request_id", () => {
  test("genere un X-Request-Id si absent", async () => {
    const response = await request(app).get("/health");

    expect(response.headers["x-request-id"]).toBeDefined();
    expect(response.headers["x-request-id"].length).toBeGreaterThan(10);
  });

  test("reutilise le X-Request-Id fourni (propagation proxy)", async () => {
    const response = await request(app)
      .get("/health")
      .set("X-Request-Id", "req-test-12345");

    expect(response.headers["x-request-id"]).toBe("req-test-12345");
  });
});

describe("logger structure (niveaux + sanitization)", () => {
  test("masque les champs sensibles dans les logs", () => {
    const clean = log.sanitize({
      user: "nicolas",
      password: "supersecret",
      nested: { token: "abc", authorization: "Bearer xyz", ok: 1 },
      list: [{ api_key: "k" }]
    });

    expect(clean.user).toBe("nicolas");
    expect(clean.password).toBe("[REDACTED]");
    expect(clean.nested.token).toBe("[REDACTED]");
    expect(clean.nested.authorization).toBe("[REDACTED]");
    expect(clean.nested.ok).toBe(1);
    expect(clean.list[0].api_key).toBe("[REDACTED]");
  });

  test("respecte le niveau minimum LOG_LEVEL", () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => {});
    const previous = process.env.LOG_LEVEL;

    process.env.LOG_LEVEL = "warn";
    log.debug("invisible");
    log.info("invisible aussi");
    expect(spy).not.toHaveBeenCalled();

    log.warn("visible");
    log.error("visible aussi");
    log.fatal("visible egalement");
    expect(spy).toHaveBeenCalledTimes(3);

    const line = JSON.parse(spy.mock.calls[0][0]);
    expect(line.level).toBe("warn");
    expect(line.timestamp).toBeDefined();

    process.env.LOG_LEVEL = previous;
    spy.mockRestore();
  });
});
