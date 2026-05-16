import { describe, expect, it } from "vitest";

import {
  assertTransition,
  canTransition,
  getNextStatuses,
  isTerminalStatus
} from "../domain/state-machine";

describe("state-machine", () => {
  it("allows core happy-path transitions", () => {
    expect(canTransition("draft", "created")).toBe(true);
    expect(canTransition("created", "received_at_origin")).toBe(true);
    expect(canTransition("awaiting_receiver_pickup", "delivered")).toBe(true);
    expect(canTransition("out_for_delivery", "delivered")).toBe(true);
  });

  it("rejects impossible status jumps", () => {
    expect(canTransition("created", "in_transit")).toBe(false);
    expect(() => assertTransition("created", "in_transit")).toThrow(
      "Invalid status transition: created -> in_transit"
    );
  });

  it("models issue and hold exception flows", () => {
    expect(canTransition("awaiting_driver_assignment", "issue_reported")).toBe(true);
    expect(canTransition("awaiting_receiver_pickup", "on_hold")).toBe(true);
    expect(canTransition("issue_reported", "delivery_failed")).toBe(true);
  });

  it("marks terminal states as terminal", () => {
    expect(isTerminalStatus("delivery_failed")).toBe(true);
    expect(isTerminalStatus("cancelled")).toBe(true);
    expect(isTerminalStatus("closed")).toBe(true);
  });

  it("returns the documented next states", () => {
    expect(getNextStatuses("received_at_destination")).toEqual([
      "awaiting_receiver_pickup",
      "awaiting_final_mile_assignment",
      "issue_reported"
    ]);
  });
});
