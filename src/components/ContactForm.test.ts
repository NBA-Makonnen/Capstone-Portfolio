import { describe, it, expect } from "vitest";
import { validateForm } from "./ContactForm";

describe("validateForm", () => {
  it("returns no errors for valid input", () => {
    const errors = validateForm({ name: "Jane Doe", email: "jane@example.com", message: "This is a valid message." });
    expect(errors).toEqual({});
  });

  it("flags missing name", () => {
    const errors = validateForm({ name: "", email: "jane@example.com", message: "This is a valid message." });
    expect(errors.name).toBeDefined();
  });

  it("flags missing email", () => {
    const errors = validateForm({ name: "Jane", email: "", message: "This is a valid message." });
    expect(errors.email).toBeDefined();
  });

  it("flags invalid email format", () => {
    const errors = validateForm({ name: "Jane", email: "not-an-email", message: "This is a valid message." });
    expect(errors.email).toBeDefined();
  });

  it("flags missing message", () => {
    const errors = validateForm({ name: "Jane", email: "jane@example.com", message: "" });
    expect(errors.message).toBeDefined();
  });

  it("flags message below minimum length", () => {
    const errors = validateForm({ name: "Jane", email: "jane@example.com", message: "short" });
    expect(errors.message).toBeDefined();
  });

  it("flags message above maximum length", () => {
    const errors = validateForm({ name: "Jane", email: "jane@example.com", message: "a".repeat(1001) });
    expect(errors.message).toBeDefined();
  });

  it("accepts message at exactly the minimum length", () => {
    const errors = validateForm({ name: "Jane", email: "jane@example.com", message: "a".repeat(10) });
    expect(errors.message).toBeUndefined();
  });
});