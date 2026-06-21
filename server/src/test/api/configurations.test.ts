import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app.js";
import { closeDb, createMemoryDatabase, getDb, setDb } from "../../db/index.js";
import { getBundleConfig } from "../../db/catalog.js";

describe("API /api/v1", () => {
  beforeEach(() => {
    setDb(createMemoryDatabase());
  });

  afterEach(() => {
    closeDb();
  });

  it("GET /config returns catalog with initial selections", async () => {
    const app = createApp();
    const catalog = getBundleConfig(getDb());

    const response = await request(app).get("/api/v1/config");

    expect(response.status).toBe(200);
    expect(response.body.meta.currency).toBe("USD");
    expect(response.body.steps).toHaveLength(4);
    expect(response.body.initialSelections.openStepId).toBe("cameras");
    expect(response.body.initialSelections.selections).toEqual(
      catalog.initialSelections.selections,
    );
  });

  it("POST /configurations creates draft with catalog defaults", async () => {
    const app = createApp();
    const catalog = getBundleConfig(getDb());

    const response = await request(app).post("/api/v1/configurations").send({});

    expect(response.status).toBe(201);
    expect(response.body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(response.body.selections).toEqual(
      catalog.initialSelections.selections,
    );
    expect(response.body.savedAt).toBeUndefined();
  });

  it("GET /configurations/:id returns 404 for unknown id", async () => {
    const app = createApp();

    const response = await request(app).get("/api/v1/configurations/missing");

    expect(response.status).toBe(404);
    expect(response.body.message).toContain("missing");
  });

  it("PATCH /configurations/:id merges partial updates", async () => {
    const app = createApp();

    const created = await request(app).post("/api/v1/configurations").send({});

    const patched = await request(app)
      .patch(`/api/v1/configurations/${created.body.id}`)
      .send({
        openStepId: "sensors",
        selections: { "wyze-sense-motion-sensor:default": 5 },
      });

    expect(patched.status).toBe(200);
    expect(patched.body.openStepId).toBe("sensors");
    expect(patched.body.selections["wyze-sense-motion-sensor:default"]).toBe(5);
    expect(patched.body.selections["wyze-cam-v4:white"]).toBe(1);
  });

  it("POST /configurations/:id/save sets savedAt", async () => {
    const app = createApp();

    const created = await request(app).post("/api/v1/configurations").send({});

    const saved = await request(app).post(
      `/api/v1/configurations/${created.body.id}/save`,
    );

    expect(saved.status).toBe(200);
    expect(saved.body.savedAt).toBeDefined();
    expect(Date.parse(saved.body.savedAt)).not.toBeNaN();
  });

  it("POST /configurations/:id/quote prices selections", async () => {
    const app = createApp();

    const created = await request(app).post("/api/v1/configurations").send({});

    const quote = await request(app).post(
      `/api/v1/configurations/${created.body.id}/quote`,
    );

    expect(quote.status).toBe(200);
    expect(quote.body.configurationId).toBe(created.body.id);
    expect(quote.body.currency).toBe("USD");
    expect(quote.body.lines.length).toBeGreaterThan(0);
    expect(quote.body.total).toBeCloseTo(
      quote.body.subtotal + quote.body.shipping,
    );
  });

  it("POST /configurations/:id/checkout returns order draft", async () => {
    const app = createApp();

    const created = await request(app).post("/api/v1/configurations").send({});

    const checkout = await request(app).post(
      `/api/v1/configurations/${created.body.id}/checkout`,
    );

    expect(checkout.status).toBe(200);
    expect(checkout.body.configurationId).toBe(created.body.id);
    expect(checkout.body.orderId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(checkout.body.quote.lines.length).toBeGreaterThan(0);
  });

  it("PATCH rejects unknown keys with 400", async () => {
    const app = createApp();

    const created = await request(app).post("/api/v1/configurations").send({});

    const response = await request(app)
      .patch(`/api/v1/configurations/${created.body.id}`)
      .send({ subtotal: 500 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });
});
