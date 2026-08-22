import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "./ContactForm";

describe("ContactForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a labeled field for name, email, and message", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("shows a field error, wired via aria-describedby, once the field is touched", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const nameInput = screen.getByLabelText("Name");
    await user.click(nameInput);
    await user.tab(); // blur without typing anything

    const error = screen.getByText("Name is required.");
    expect(error).toBeInTheDocument();
    expect(nameInput).toHaveAccessibleDescription("Name is required.");
    // role="alert" makes this an assertive live region so screen readers
    // announce it the moment it appears, not only when the field regains
    // focus (aria-describedby alone doesn't announce proactively).
    expect(screen.getByRole("alert")).toHaveTextContent("Name is required.");
  });

  it("flags an invalid email format after blur", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "not-an-email");
    await user.tab();

    expect(screen.getByText("Please enter a valid email address.")).toBeInTheDocument();
  });

  it("shows every required-field error at once when submitted empty", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Message is required.")).toBeInTheDocument();
  });

  it("submits with no visible errors once all fields are valid", async () => {
    const user = userEvent.setup();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<ContactForm />);

    await user.type(screen.getByLabelText("Name"), "Jane Doe");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Message"), "This is a valid message.");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(screen.queryByText("Name is required.")).not.toBeInTheDocument();
    expect(screen.queryByText("Email is required.")).not.toBeInTheDocument();
    expect(screen.queryByText("Message is required.")).not.toBeInTheDocument();
    expect(logSpy).toHaveBeenCalledWith(
      "Contact form submitted:",
      expect.objectContaining({ name: "Jane Doe", email: "jane@example.com" })
    );
  });

  it("disables Send after a valid submission and ignores a rapid second click", async () => {
    const user = userEvent.setup();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    render(<ContactForm />);

    await user.type(screen.getByLabelText("Name"), "Jane Doe");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Message"), "This is a valid message.");

    const sendButton = screen.getByRole("button", { name: "Send" });
    await user.click(sendButton);
    expect(sendButton).toBeDisabled();

    await user.click(sendButton);
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it("re-enables Send once the user edits a field after submitting", async () => {
    const user = userEvent.setup();
    vi.spyOn(console, "log").mockImplementation(() => {});
    render(<ContactForm />);

    await user.type(screen.getByLabelText("Name"), "Jane Doe");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Message"), "This is a valid message.");

    const sendButton = screen.getByRole("button", { name: "Send" });
    await user.click(sendButton);
    expect(sendButton).toBeDisabled();

    await user.type(screen.getByLabelText("Message"), " More.");
    expect(sendButton).not.toBeDisabled();
  });
});
