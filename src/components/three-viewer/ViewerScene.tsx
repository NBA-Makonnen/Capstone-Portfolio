"use client";

import { useEffect, useMemo, useRef } from "react";
import { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Bounds,
  Environment,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Leva, useControls } from "leva";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { DEFAULT_MODEL_URL } from "./constants";
import { ModelErrorBoundary } from "./ModelErrorBoundary";

const ENV_PRESETS = [
  "city",
  "sunset",
  "dawn",
  "night",
  "warehouse",
  "forest",
  "apartment",
  "studio",
  "park",
  "lobby",
] as const;

type EnvPreset = (typeof ENV_PRESETS)[number];

type ConfiguratorControls = {
  color: string;
  metalness: number;
  roughness: number;
  wireframe: boolean;
  envPreset: EnvPreset;
  autoRotateSpeed: number;
};

function Model({
  url,
  color,
  metalness,
  roughness,
  wireframe,
}: {
  url: string;
  color: string;
  metalness: number;
  roughness: number;
  wireframe: boolean;
}) {
  const { scene } = useGLTF(url);

  // Clone the scene (and every material on it) once per URL so leva controls
  // mutate our own copy, never the cache useGLTF keeps for this URL.
  const cloned = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material;
        child.material = Array.isArray(material)
          ? material.map((m) => m.clone())
          : material.clone();
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return copy;
  }, [scene]);

  // Apply the live control values every render — cheap, and avoids stale
  // closures if leva's onChange fires faster than a memo dependency would.
  cloned.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.color.set(color);
      child.material.metalness = metalness;
      child.material.roughness = roughness;
      child.material.wireframe = wireframe;
    }
  });

  return <primitive object={cloned} />;
}

function RotatingControls({ autoRotateSpeed }: { autoRotateSpeed: number }) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      makeDefault
      autoRotate={autoRotateSpeed > 0}
      autoRotateSpeed={autoRotateSpeed}
    />
  );
}

export function ViewerScene({
  modelUrl,
  onModelError,
}: {
  modelUrl: string;
  onModelError: (message: string) => void;
}) {
  const { color, metalness, roughness, wireframe, envPreset, autoRotateSpeed } =
    useControls("Material", {
      color: "#ffffff",
      metalness: { value: 1, min: 0, max: 1, step: 0.05 },
      roughness: { value: 1, min: 0, max: 1, step: 0.05 },
      wireframe: false,
      envPreset: { value: "city" as EnvPreset, options: ENV_PRESETS },
      autoRotateSpeed: { value: 0, min: 0, max: 10, step: 0.5 },
    }) as ConfiguratorControls;

  return (
    <>
      <Leva collapsed={false} titleBar={{ title: "Configurator" }} />
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ fov: 40, position: [0, 0, 3] }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[3, 5, 2]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <ModelErrorBoundary
          fallback={(error, reset) => (
            <ErrorNotice error={error} reset={reset} onModelError={onModelError} />
          )}
        >
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={1.2}>
              <Model
                url={modelUrl}
                color={color}
                metalness={metalness}
                roughness={roughness}
                wireframe={wireframe}
              />
            </Bounds>
            <Environment preset={envPreset} />
          </Suspense>
        </ModelErrorBoundary>
        <RotatingControls autoRotateSpeed={autoRotateSpeed} />
      </Canvas>
    </>
  );
}

// Lives inside the Canvas's R3F tree only as a way to run an effect once the
// error boundary trips; it renders nothing itself (no valid 3D content to
// show), it just reports upward so the DOM-level UI (outside the Canvas) can
// display the actual message and offer a reset.
function ErrorNotice({
  onModelError,
  reset,
}: {
  error: Error;
  reset: () => void;
  onModelError: (message: string) => void;
}) {
  useEffect(() => {
    onModelError(
      "That file couldn't be loaded as a glTF model. Reverted to the default."
    );
    reset();
    // Only ever run once when this boundary fallback mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

useGLTF.preload(DEFAULT_MODEL_URL);
