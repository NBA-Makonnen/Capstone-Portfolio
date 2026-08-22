"use client";
import { useState, type FormEvent } from "react";

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Name is required.";
  } else if (data.name.trim().length > 100) {
    errors.name = "Name must be under 100 characters.";
  }

  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!data.message.trim()) {
    errors.message = "Message is required.";
  } else if (data.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  } else if (data.message.trim().length > 1000) {
    errors.message = "Message must be under 1000 characters.";
  }

  return errors;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    name: false,
    email: false,
    message: false,
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateForm(formData));
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasSubmitted(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (hasSubmitted) return;

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    setTouched({ name: true, email: true, message: true });

    if (Object.keys(validationErrors).length === 0) {
      setHasSubmitted(true);
      console.log("Contact form submitted:", formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-md mx-auto space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
          aria-describedby={errors.name && touched.name ? "name-error" : undefined}
          className="w-full border rounded px-3 py-2"
        />
        {errors.name && touched.name && <p id="name-error" role="alert" className="text-red-700 dark:text-red-400 text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          aria-describedby={errors.email && touched.email ? "email-error" : undefined}
          className="w-full border rounded px-3 py-2"
        />
        {errors.email && touched.email && <p id="email-error" role="alert" className="text-red-700 dark:text-red-400 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
        <textarea
          id="message"
          rows={5}
          value={formData.message}
          onChange={(e) => handleChange("message", e.target.value)}
          onBlur={() => handleBlur("message")}
          aria-describedby={errors.message && touched.message ? "message-error" : undefined}
          className="w-full border rounded px-3 py-2"
        />
        {errors.message && touched.message && <p id="message-error" role="alert" className="text-red-700 dark:text-red-400 text-sm mt-1">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={hasSubmitted}
        className="bg-brand dark:bg-brand-dark text-white px-4 py-2 rounded hover:bg-brand/90 dark:hover:bg-brand-dark/90 transition-colors disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}