"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import dynamic from "next/dynamic";
import { DEFAULT_MODEL_URL } from "./constants";
import { ReducedMotionFallback } from "./ReducedMotionFallback";

const ViewerScene = dynamic(
  () => import("./ViewerScene").then((mod) => mod.ViewerScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-sm opacity-60">
        Loading scene&hellip;
      </div>
    ),
  }
);

// The Network Information API's saveData flag isn't in TS's lib.dom yet;
// feature-detect it defensively (Safari/Firefox simply don't have
// `navigator.connection`, which this treats the same as saveData: false).
function prefersSavedData(): boolean {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return Boolean(nav.connection?.saveData);
}

export function LazyViewer() {
  const [modelUrl, setModelUrl] = useState(DEFAULT_MODEL_URL);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Default to "show the interactive scene" so the server-rendered and
  // first client-hydration passes match exactly (no window/matchMedia
  // access is possible during SSR). The real check runs in an effect
  // right after hydration and flips this before the heavy Canvas chunk
  // has finished downloading, in practice.
  const [shouldDefer, setShouldDefer] = useState(false);
  const [userOverride, setUserOverride] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const evaluate = () => setShouldDefer(query.matches || prefersSavedData());
    evaluate();
    query.addEventListener("change", evaluate);
    return () => query.removeEventListener("change", evaluate);
  }, []);

  const revokePreviousObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const resetToDefault = useCallback(() => {
    revokePreviousObjectUrl();
    setModelUrl(DEFAULT_MODEL_URL);
    setIsCustomModel(false);
  }, [revokePreviousObjectUrl]);

  const loadFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith(".glb")) {
        setMessage("Only .glb files are supported — try exporting as glTF Binary.");
        return;
      }
      // 25MB is well past what's reasonable for an in-browser demo; reject
      // early rather than let the tab hang trying to parse a huge file.
      const MAX_BYTES = 25 * 1024 * 1024;
      if (file.size > MAX_BYTES) {
        setMessage("That file is over 25MB — try a smaller or compressed .glb.");
        return;
      }

      revokePreviousObjectUrl();
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setMessage(null);
      setIsCustomModel(true);
      setModelUrl(url);
    },
    [revokePreviousObjectUrl]
  );

  const handleModelError = useCallback(
    (errorMessage: string) => {
      setMessage(errorMessage);
      resetToDefault();
    },
    [resetToDefault]
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragOver(false);
      const file = event.dataTransfer.files?.[0];
      if (file) loadFile(file);
    },
    [loadFile]
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) loadFile(file);
      // Reset so selecting the same filename again still fires onChange.
      event.target.value = "";
    },
    [loadFile]
  );

  // Revoke any outstanding object URL if the viewer itself unmounts (e.g.
  // navigating away) rather than only on the next drop/reset.
  useEffect(() => {
    return () => revokePreviousObjectUrl();
  }, [revokePreviousObjectUrl]);

  if (shouldDefer && !userOverride) {
    return <ReducedMotionFallback onLoadAnyway={() => setUserOverride(true)} />;
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`aspect-square w-full max-w-xl mx-auto rounded-lg border overflow-hidden bg-canvas dark:bg-canvas-dark transition-colors ${
          isDragOver
            ? "border-brand dark:border-brand-dark border-dashed border-2"
            : "border-brand/20 dark:border-brand-dark/30"
        }`}
      >
        <ViewerScene modelUrl={modelUrl} onModelError={handleModelError} />
      </div>

      <div className="max-w-xl mx-auto mt-3 flex items-center justify-between text-xs gap-3">
        <p className="opacity-60">
          Drag and drop a .glb file onto the scene, or{" "}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="underline underline-offset-2"
          >
            browse files
          </button>
          , to view your own model.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb"
          onChange={handleFileInputChange}
          className="hidden"
        />
        {isCustomModel && (
          <button
            type="button"
            onClick={resetToDefault}
            className="rounded border border-brand/30 dark:border-brand-dark/40 px-2 py-1 shrink-0"
          >
            Reset to default
          </button>
        )}
      </div>

      {message && (
        <p className="max-w-xl mx-auto mt-2 text-xs text-brand-dark dark:text-accent">
          {message}
        </p>
      )}
    </div>
  );
}
