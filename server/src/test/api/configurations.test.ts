import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../app.js";
import { getBundleConfig } from "../../db/catalog.js";
import { closeDb, createMemoryDatabase, getDb, setDb } from "../../db/index.js";

describe("API /api/v1", () => {
  beforeEach(() => {
    setDb(createMemoryDatabase());
  });

  afterEach(() => {
    closeDb();
  });

  describe("GET /config", () => {
    it("returns the catalog seed with steps and initial selections", async () => {
      const app = createApp();
      const catalog = getBundleConfig(getDb());

      const response = await request(app).get("/api/v1/config");

      expect(response.status).toBe(200);
      expect(response.body.meta.currency).toBe("USD");
      expect(response.body.steps).toHaveLength(4);
      expect(response.body.initialSelections.openStepId).toBe("cameras");
      expect(
        response.body.initialSelections.selections["wyze-cam-v4:white"],
      ).toBe(1);
      expect(response.body.initialSelections.selections).toEqual(
        catalog.initialSelections.selections,
      );
    });
  });

  describe("POST /configurations", () => {
    it("creates a draft using catalog initial selections by default", async () => {
      const app = createApp();
      const catalog = getBundleConfig(getDb());

      const response = await request(app)
        .post("/api/v1/configurations")
        .send({});

      expect(response.status).toBe(201);
      expect(response.body.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(response.body.openStepId).toBe(
        catalog.initialSelections.openStepId,
      );
      expect(response.body.selections).toEqual(
        catalog.initialSelections.selections,
      );
      expect(response.body.activeVariants).toEqual(
        catalog.initialSelections.activeVariants,
      );
      expect(response.body.savedAt).toBeUndefined();
    });

    it("merges caller overrides onto catalog defaults", async () => {
      const app = createApp();

      const response = await request(app)
        .post("/api/v1/configurations")
        .send({
          openStepId: "plan",
          selections: { "wyze-cam-v4:black": 3 },
          activeVariants: { "wyze-cam-v4": "black" },
        });

      expect(response.status).toBe(201);
      expect(response.body.openStepId).toBe("plan");
      expect(response.body.selections["wyze-cam-v4:black"]).toBe(3);
      expect(response.body.selections["wyze-cam-v4:white"]).toBe(1);
      expect(response.body.activeVariants["wyze-cam-v4"]).toBe("black");
    });

    it("returns a clone that does not mutate the stored configuration", async () => {
      const app = createApp();

      const created = await request(app)
        .post("/api/v1/configurations")
        .send({});
      created.body.selections["wyze-cam-v4:white"] = 99;

      const loaded = await request(app).get(
        `/api/v1/configurations/${created.body.id}`,
      );

      expect(loaded.status).toBe(200);
      expect(loaded.body.selections["wyze-cam-v4:white"]).toBe(1);
    });
  });

  describe("GET /configurations/:id", () => {
    it("returns 404 for unknown ids", async () => {
      const app = createApp();

      const response = await request(app).get(
        "/api/v1/configurations/missing-id",
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("missing-id");
    });
  });

  describe("PATCH /configurations/:id", () => {
    it("merges partial selection and variant updates", async () => {
      const app = createApp();

      const created = await request(app)
        .post("/api/v1/configurations")
        .send({});

      const patched = await request(app)
        .patch(`/api/v1/configurations/${created.body.id}`)
        .send({
          openStepId: "sensors",
          selections: { "wyze-sense-motion-sensor:default": 5 },
          activeVariants: { "wyze-cam-pan-v3": "black" },
        });

      expect(patched.status).toBe(200);
      expect(patched.body.openStepId).toBe("sensors");
      expect(patched.body.selections["wyze-sense-motion-sensor:default"]).toBe(
        5,
      );
      expect(patched.body.selections["wyze-cam-v4:white"]).toBe(1);
      expect(patched.body.activeVariants["wyze-cam-pan-v3"]).toBe("black");
    });

    it("rejects unknown keys with 400", async () => {
      const app = createApp();

      const created = await request(app)
        .post("/api/v1/configurations")
        .send({});

      const response = await request(app)
        .patch(`/api/v1/configurations/${created.body.id}`)
        .send({ subtotal: 500 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe("POST /configurations/:id/save", () => {
    it("sets savedAt without changing selections", async () => {
      const app = createApp();

      const created = await request(app)
        .post("/api/v1/configurations")
        .send({});

      const saved = await request(app).post(
        `/api/v1/configurations/${created.body.id}/save`,
      );

      expect(saved.status).toBe(200);
      expect(saved.body.savedAt).toBeDefined();
      expect(Date.parse(saved.body.savedAt)).not.toBeNaN();
      expect(saved.body.selections).toEqual(created.body.selections);
    });
  });

  describe("POST /configurations/:id/quote", () => {
    it("prices every selection with quantity greater than zero", async () => {
      const app = createApp();
      const catalog = getBundleConfig(getDb());

      const created = await request(app)
        .post("/api/v1/configurations")
        .send({
          selections: {
            "wyze-cam-v4:white": 1,
            "wyze-cam-pan-v3:white": 2,
            "cam-unlimited:default": 1,
            "wyze-sense-motion-sensor:default": 0,
            "wyze-sense-hub:default": 0,
            "wyze-microsd-card-256gb:default": 0,
          },
        });

      const quote = await request(app).post(
        `/api/v1/configurations/${created.body.id}/quote`,
      );

      expect(quote.status).toBe(200);
      expect(quote.body.configurationId).toBe(created.body.id);
      expect(quote.body.currency).toBe("USD");
      expect(quote.body.lines).toHaveLength(3);
      expect(
        quote.body.lines.find(
          (line: { productId: string }) => line.productId === "wyze-cam-v4",
        ),
      ).toEqual(
        expect.objectContaining({
          quantity: 1,
          unitPrice: 27.98,
          lineTotal: 27.98,
          variantLabel: "White",
        }),
      );
      const panLine = quote.body.lines.find(
        (line: { productId: string }) => line.productId === "wyze-cam-pan-v3",
      );
      expect(panLine.lineTotal).toBeCloseTo(69.96);
      expect(quote.body.shipping).toBe(catalog.meta.shipping.price);
      expect(quote.body.total).toBeCloseTo(
        quote.body.subtotal + quote.body.shipping,
      );
      expect(quote.body.savingsMessage).toBe(catalog.meta.savingsMessage);
    });

    it("ignores zero-quantity selections", async () => {
      const app = createApp();

      const created = await request(app)
        .post("/api/v1/configurations")
        .send({
          selections: {
            "wyze-cam-v4:white": 0,
            "wyze-cam-pan-v3:white": 0,
            "cam-unlimited:default": 0,
            "wyze-sense-motion-sensor:default": 0,
            "wyze-sense-hub:default": 0,
            "wyze-microsd-card-256gb:default": 0,
          },
        });

      const quote = await request(app).post(
        `/api/v1/configurations/${created.body.id}/quote`,
      );

      expect(quote.status).toBe(200);
      expect(quote.body.lines).toHaveLength(0);
      expect(quote.body.subtotal).toBe(0);
    });
  });

  describe("POST /configurations/:id/checkout", () => {
    it("returns an order id and authoritative quote snapshot", async () => {
      const app = createApp();

      const created = await request(app)
        .post("/api/v1/configurations")
        .send({
          selections: {
            "wyze-cam-v4:white": 1,
            "wyze-cam-pan-v3:white": 0,
            "cam-unlimited:default": 0,
            "wyze-sense-motion-sensor:default": 0,
            "wyze-sense-hub:default": 0,
            "wyze-microsd-card-256gb:default": 0,
          },
        });

      const checkout = await request(app).post(
        `/api/v1/configurations/${created.body.id}/checkout`,
      );

      expect(checkout.status).toBe(200);
      expect(checkout.body.configurationId).toBe(created.body.id);
      expect(checkout.body.orderId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
      expect(checkout.body.quote.lines).toHaveLength(1);
      expect(checkout.body.quote.total).toBeCloseTo(27.98);
    });
  });
});
