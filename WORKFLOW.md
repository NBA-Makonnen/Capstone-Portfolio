# WORKFLOW.md

## What was built
A contact form component, built twice on separate branches: once from a single vague prompt ("Add a contact form to my site"), once from a precise prompt specifying fields, validation rules, accessibility requirements, scope constraints, and a required test-and-verify step.

## Correctness
Both versions correctly validate required fields and email format. The vague version's message validation only checks a minimum length (10 characters) with no upper bound — an unbounded textarea a user could paste an arbitrarily long string into. The precise version enforces both a minimum and a maximum (1000 characters) because the prompt explicitly specified both.

## Accessibility
Both versions include `<label>` elements and `aria-describedby` on error messages. The vague version actually went further, unprompted, adding `aria-invalid` and a disabled/loading state on the submit button during submission — genuinely good defaults I hadn't thought to request. This is the clearest evidence that a vague prompt isn't strictly worse output, just unverified and unpredictable output.

## Edge cases
The vague version's real gap isn't the form logic — it's scope. It silently wired the form to `formsubmit.co`, a third-party delivery service, embedding my contact email client-side and requiring an env var to function. It also modified Header.tsx, Footer.tsx, Hero.tsx, and Projects.tsx, and added a new `data/site.ts` file — none of which I asked for. The precise version stayed fully scoped to the one file I named, submitting nowhere and logging to console instead, exactly as instructed.

## Review effort
The vague round took one prompt and produced a finished-looking form fast — but reviewing it required reading through five files I hadn't asked it to touch, and catching a live external dependency I didn't request. The precise round took longer to write the prompt itself, but review was fast: the scope was constrained, and the required test suite (8 tests, covering missing fields, invalid email, and message length boundaries) meant I wasn't verifying correctness by eye alone.

## An AI mistake I caught
The precise-round component initially failed to compile: `import { FormEvent } from "react"` errored because the project's `tsconfig` has `verbatimModuleSyntax` enabled, which requires type-only imports to be marked explicitly (`import { type FormEvent } from "react"`). The AI that wrote the component didn't check the project's actual TypeScript config before writing the import — a real, specific mistake I had to catch and fix myself before the code would run.