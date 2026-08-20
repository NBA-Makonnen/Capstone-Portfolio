import type { Metadata } from "next";
import { LazyViewer } from "@/components/three-viewer/LazyViewer";

export const metadata: Metadata = {
  title: "3D Viewer — Makonnen Mulima",
  description:
    "An interactive glTF viewer and material configurator built with React Three Fiber.",
};

export default function ThreeDViewerPage() {
  return (
    <section className="px-6 py-16 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">3D Viewer</h1>
      <p className="opacity-70 mb-8 text-sm">
        A staged glTF scene, rendered with React Three Fiber. Drag to orbit.
      </p>

      <LazyViewer />

      <p className="max-w-xl mx-auto mt-4 text-xs opacity-50">
        Default model: &ldquo;Damaged Helmet&rdquo; by ctxwing, licensed{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/legalcode"
          className="underline underline-offset-2"
        >
          CC BY 4.0
        </a>
        , via the{" "}
        <a
          href="https://github.com/KhronosGroup/glTF-Sample-Assets"
          className="underline underline-offset-2"
        >
          Khronos glTF Sample Assets
        </a>{" "}
        (recompressed for this page — see README for details).
      </p>
    </section>
  );
}
