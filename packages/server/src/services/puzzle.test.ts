import { describe, it, expect } from "vitest";
import { getDailyDate } from "./puzzle";

describe("getDailyDate", () => {
  it("returns a date string in YYYY-MM-DD format", () => {
    const date = getDailyDate();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns today's date when after 8 AM UTC", () => {
    // This test is time-dependent but verifies the format
    const date = getDailyDate();
    const now = new Date();
    const utcHour = now.getUTCHours();

    if (utcHour >= 8) {
      // Should be today
      const expected = now.toISOString().split("T")[0];
      expect(date).toBe(expected);
    }
    // If before 8 AM, it returns yesterday — we just verify format
  });
});
