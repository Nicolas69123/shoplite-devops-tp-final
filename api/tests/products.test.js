const fs = require("fs");
const path = require("path");
const request = require("supertest");
const app = require("../src/app");
const db = require("../src/db");

const initSql = fs.readFileSync(
  path.join(__dirname, "..", "..", "database", "init.sql"),
  "utf8"
);

beforeAll(async () => {
  await db.query(initSql);
  await db.query("TRUNCATE products RESTART IDENTITY");
  await db.query(initSql);
});

afterAll(async () => {
  await db.getPool().end();
});

describe("GET /products (integration avec PostgreSQL)", () => {
  test("retourne 200 et la liste des produits du catalogue", async () => {
    const response = await request(app).get("/products");

    expect(response.status).toBe(200);
    expect(response.body.source).toBe("database");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(4);
    expect(response.body.data[0]).toHaveProperty("name");
    expect(response.body.data[0]).toHaveProperty("price_cents");
  });
});

describe("GET /products/:id", () => {
  test("retourne 200 et le produit demande", async () => {
    const response = await request(app).get("/products/1");

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(1);
    expect(response.body.data.name).toBe("Clavier compact");
  });

  test("retourne 400 si l'id n'est pas un entier positif", async () => {
    const response = await request(app).get("/products/abc");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid product id");
  });

  test("retourne 404 si le produit n'existe pas", async () => {
    const response = await request(app).get("/products/999999");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Product not found");
  });
});

describe("Scenarios d'erreur controles", () => {
  test("retourne 404 sur une route inconnue", async () => {
    const response = await request(app).get("/route-inexistante");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Route not found");
  });

  test("retourne 500 si la base de donnees echoue sur /products", async () => {
    const spy = jest
      .spyOn(db, "query")
      .mockRejectedValueOnce(new Error("connexion db perdue"));

    const response = await request(app).get("/products");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Internal server error");

    spy.mockRestore();
  });

  test("retourne 503 sur /health si la base de donnees est indisponible", async () => {
    const spy = jest
      .spyOn(db, "query")
      .mockRejectedValueOnce(new Error("connexion db perdue"));

    const response = await request(app).get("/health");

    expect(response.status).toBe(503);
    expect(response.body.checks.database).toBe("error");

    spy.mockRestore();
  });
});
