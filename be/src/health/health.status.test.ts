import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildHealthReport } from "./health.status";

describe("buildHealthReport", () => {
  it("reports up when MongoDB is connected", () => {
    assert.deepEqual(buildHealthReport(1, 12.4), { status: "up", uptime: 12, details: { mongodb: "up" } });
  });

  it("reports down for every non-connected ready state", () => {
    for (const readyState of [0, 2, 3, 99]) {
      assert.equal(buildHealthReport(readyState, 1).status, "down");
    }
  });

  it("never reports a negative uptime", () => {
    assert.equal(buildHealthReport(1, -5).uptime, 0);
  });
});
