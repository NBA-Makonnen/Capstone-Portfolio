"use client";

import { useEffect, useRef, useState } from "react";
import { vertexShaderSource, fragmentShaderSource } from "./shader-source";
import { StaticGradientFallback } from "./StaticGradientFallback";

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function ShaderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Real (unsupported-WebGL2) failure state, separate from the
  // prefers-reduced-motion check one level up in HeroShader — this
  // covers the "gl context creation just failed" case, e.g. an old
  // browser or a locked-down environment, as a second safety net.
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    if (!gl) {
      setUnsupported(true);
      return;
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) {
      setUnsupported(true);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setUnsupported(true);
      return;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      setUnsupported(true);
      return;
    }
    gl.useProgram(program);

    const timeLoc = gl.getUniformLocation(program, "u_time");
    const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");

    // Mouse target vs. eased mouse: the raw pointer position jumps
    // instantly, but the shader reads an eased value that chases it a
    // little each frame. This is what makes the flow field "gently
    // lean" toward the cursor instead of snapping.
    const mouseTarget = { x: 0.5, y: 0.5 };
    const mouseEased = { x: 0.5, y: 0.5 };

    function handlePointerMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseTarget.x = (event.clientX - rect.left) / rect.width;
      // Flip Y: browser pointer coords are top-down, shader UV is
      // bottom-up (matches gl_FragCoord's convention).
      mouseTarget.y = 1.0 - (event.clientY - rect.top) / rect.height;
    }
    window.addEventListener("pointermove", handlePointerMove);

    // Cap devicePixelRatio at 2: on a 3x phone, rendering fbm's 5
    // fractal octaves per pixel at full native resolution is real,
    // avoidable GPU cost for a background decoration that no one is
    // examining pixel-by-pixel.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const { clientWidth, clientHeight } = canvas!;
      canvas!.width = Math.max(1, Math.floor(clientWidth * dpr));
      canvas!.height = Math.max(1, Math.floor(clientHeight * dpr));
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    resize();
    window.addEventListener("resize", resize);

    let rafId = 0;
    let running = true;
    const startTime = performance.now();

    function frame() {
      if (!running) return;
      const elapsed = (performance.now() - startTime) / 1000;

      // Ease the mouse position 8% of the remaining distance per frame
      // — a simple exponential smoothing, frame-rate-dependent but
      // subtle enough that it doesn't matter for a decorative effect.
      mouseEased.x += (mouseTarget.x - mouseEased.x) * 0.08;
      mouseEased.y += (mouseTarget.y - mouseEased.y) * 0.08;

      gl!.uniform1f(timeLoc, elapsed);
      gl!.uniform2f(resolutionLoc, canvas!.width, canvas!.height);
      gl!.uniform2f(mouseLoc, mouseEased.x, mouseEased.y);

      // Fullscreen triangle: 3 vertices, no bound buffer needed — the
      // vertex shader hardcodes the positions from gl_VertexID.
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      rafId = requestAnimationFrame(frame);
    }

    // Ships responsibly: stop the render loop entirely while the tab
    // isn't visible, rather than relying on browsers throttling
    // background rAF (which they do, but inconsistently) — this is an
    // explicit guarantee of zero GPU work in a hidden tab.
    function handleVisibilityChange() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else if (!running) {
        running = true;
        rafId = requestAnimationFrame(frame);
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (!document.hidden) {
      rafId = requestAnimationFrame(frame);
    }

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [setUnsupported]);

  if (unsupported) {
    return <StaticGradientFallback />;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}
