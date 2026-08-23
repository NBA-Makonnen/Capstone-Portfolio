// Shared between the client (ChatPanel) and the server (chat API route) so
// the two enforce the same limits and can't silently drift apart. This is
// not real rate limiting (no shared store, no per-IP tracking) — it's a
// cheap bound on the token cost a single anonymous visitor can run up
// against the shared Gemini API key. See README's known limitations.

// Generous enough for a real question about the projects on this site,
// small enough to cap the token cost of a single message.
export const MAX_MESSAGE_CHARS = 2000;

// Caps total conversation length (both roles, not just user turns) since
// that's what actually determines the token cost of every subsequent
// request — the full `messages` array is resent each time.
export const MAX_MESSAGES = 40;
