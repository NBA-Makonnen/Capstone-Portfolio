"use client";

import Image from "next/image";

export function ReducedMotionFallback({
  onLoadAnyway,
}: {
  onLoadAnyway: () => void;
}) {
  return (
    <div className="aspect-square w-full max-w-xl mx-auto rounded-lg border border-brand/20 dark:border-brand-dark/30 overflow-hidden bg-canvas dark:bg-canvas-dark flex flex-col items-center justify-center gap-4 p-6 text-center">
      <Image
        src="/images/3d-viewer/helmet-poster.png"
        alt="Static preview of the default 3D model, a battle-damaged sci-fi helmet"
        width={130}
        height={126}
        className="rounded border border-brand/10 dark:border-brand-dark/20"
        unoptimized
      />
      <div className="max-w-xs">
        <p className="text-sm font-medium mb-1">Interactive scene paused</p>
        <p className="text-xs opacity-60">
          Your browser is set to reduce motion (or save data), so the 3D
          scene didn&apos;t load automatically.
        </p>
      </div>
      <button
        type="button"
        onClick={onLoadAnyway}
        className="text-xs rounded border border-brand/30 dark:border-brand-dark/40 px-3 py-1.5"
      >
        Load interactive 3D scene anyway
      </button>
    </div>
  );
}
