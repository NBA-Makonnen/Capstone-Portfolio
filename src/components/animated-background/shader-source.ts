// Fullscreen-triangle vertex shader. Instead of a 2-triangle quad (6
// vertices, a VBO, an attribute), this draws ONE triangle big enough to
// cover the whole clip-space area — the corners past [-1,1] just get
// clipped by the GPU for free. gl_VertexID is WebGL2-only, which is why
// ShaderCanvas requests a "webgl2" context specifically.
export const vertexShaderSource = `#version 300 es
void main() {
  vec2 corners[3] = vec2[3](
    vec2(-1.0, -1.0),
    vec2( 3.0, -1.0),
    vec2(-1.0,  3.0)
  );
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}
`;

// Aurora / flow-field hero shader, remixed from the session's shader
// playground. Kept from the playground: the value-noise hash, the fbm
// (fractal Brownian motion) loop shape, and the overall "domain-warp two
// fbm layers, ramp through a palette" structure. Changed to make it mine:
// the palette is driven by three color uniforms (see below) rather than
// hardcoded, the vertical curtain falloff so it reads as an aurora rather
// than a flat blob, the mouse term (the playground had none), and the
// grain pass.
export const fragmentShaderSource = `#version 300 es
precision highp float;

uniform float u_time;       // seconds since the canvas mounted
uniform vec2  u_resolution; // canvas size in device pixels
uniform vec2  u_mouse;      // pointer position, normalized 0..1, eased

// Palette, supplied from JS rather than hardcoded here. This is what
// makes the whole effect theme-aware: the light/dark toggle doesn't
// touch the shader logic at all, it just swaps which three colors get
// passed in each frame (see ShaderCanvas.tsx). u_colorBase is the page's
// own background color (so the hero/ambient background actually matches
// the surrounding UI instead of always being black), u_colorMid is the
// brand color for the active theme, u_colorHigh is a paler highlight
// used sparingly for the brightest ribbon cores.
uniform vec3 u_colorBase;
uniform vec3 u_colorMid;
uniform vec3 u_colorHigh;

out vec4 fragColor;

// --- Hash / noise ---------------------------------------------------
// A cheap 2D hash: no texture lookups, no branching, "good enough" to
// look organic without a real gradient-noise implementation. This is
// the part that makes the flow field look like flow instead of ripples.
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Bilinear-interpolated value noise built on top of the hash above.
float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f); // smoothstep-style easing, not linear
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Fractal Brownian motion: stack several octaves of the noise above,
// each one higher-frequency and lower-amplitude than the last. This is
// what turns a single blobby noise function into something that reads
// as drifting cloud/aurora texture at multiple scales at once.
float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    sum += amp * valueNoise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return sum;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  // Correct for aspect ratio so the noise field isn't stretched on wide
  // screens, and center it so (0,0) sits in the middle of the viewport.
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  vec2 mouse = (u_mouse - 0.5) * vec2(aspect, 1.0);

  // Mouse influence: nudge the sampling domain toward the cursor by a
  // small, capped amount. This is deliberately subtle — "gently leans
  // toward the cursor", not "snaps to it" — so it reads as ambient life
  // in the background rather than a cursor-follower effect.
  p += (mouse - p) * 0.06;

  // First fbm layer, slowly drifting upward over time.
  float n1 = fbm(p * 1.6 + vec2(0.0, u_time * 0.05));

  // Domain warp: feed the first layer's output back in as an offset to
  // the second layer's sampling position. This single step is what
  // turns "two noise layers" into a flow field — the second layer's
  // shape is now bent by the first, instead of just overlaid on it.
  vec2 warped = p + vec2(n1, n1 * 0.8) * 0.45;
  float n2 = fbm(warped * 2.2 - vec2(u_time * 0.08, u_time * 0.02));

  // Vertical curtain falloff: aurora light is brighter high in the sky
  // and fades toward the horizon. Reusing uv.y (not the centered p.y)
  // keeps this tied to actual screen position regardless of aspect
  // ratio.
  float curtain = smoothstep(1.05, -0.1, uv.y);

  float intensity = n2 * curtain;

  // --- Palette ---------------------------------------------------
  // All three stops now come from JS as uniforms (see declarations
  // above) instead of being hardcoded here, so the exact same shader
  // renders correctly in both light mode (pale background, purple
  // brand glow) and dark mode (black background, red brand glow)
  // without any branching in the GLSL itself.
  vec3 color = mix(u_colorBase, u_colorMid, smoothstep(0.15, 0.55, intensity));
  color = mix(color, u_colorHigh, smoothstep(0.6, 0.95, intensity));

  // --- Grain pass ---------------------------------------------------
  // Cheap dithering: a small amount of per-pixel, per-frame noise breaks
  // up the smooth gradient bands the eye would otherwise pick out, and
  // gives the whole thing a slightly filmic texture. Re-hashing on
  // u_time each frame means the grain itself animates instead of
  // looking like a static overlay.
  float grain = hash21(gl_FragCoord.xy + u_time * 60.0) - 0.5;
  color += grain * 0.035;

  fragColor = vec4(color, 1.0);
}
`;
