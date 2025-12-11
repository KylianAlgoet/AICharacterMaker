import React, { Suspense, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF, Bounds } from "@react-three/drei";
import * as THREE from "three";

const CAMERA_PRESETS = {
  free: null,
  // recht van voren
  front: { azimuth: 0, polar: Math.PI / 2.4 },
  // zijkant
  side: { azimuth: Math.PI / 2, polar: Math.PI / 2.4 },
  // rug
  back: { azimuth: Math.PI, polar: Math.PI / 2.4 },
};

function CharacterModel({ url }) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    if (!scene) return;

    // iets groter + shadows
    const s = 1.35;
    scene.scale.set(s, s, s);

    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}

// Stuurt de OrbitControls naar front/side/back
function CameraViewController({ view }) {
  const { controls } = useThree();

  useEffect(() => {
    if (!controls) return;

    const preset = CAMERA_PRESETS[view];
    if (!preset) return; // free mode

    const { azimuth, polar } = preset;

    const startAz = controls.getAzimuthalAngle();
    const startPol = controls.getPolarAngle();
    const duration = 350; // ms
    let startTime;

    function animate(time) {
      if (!startTime) startTime = time;
      const t = Math.min((time - startTime) / duration, 1);

      controls.setAzimuthalAngle(
        THREE.MathUtils.lerp(startAz, azimuth, t)
      );
      controls.setPolarAngle(
        THREE.MathUtils.lerp(startPol, polar, t)
      );
      controls.update();

      if (t < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [view, controls]);

  return null;
}

function Scene({ url, view }) {
  if (!url) return null;

  return (
    <>
      {/* Licht */}
      <ambientLight intensity={0.65} />
      <directionalLight
        intensity={1.1}
        position={[4, 6, 3]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <Suspense
        fallback={
          <Html center>
            <div className="viewer-loading">Loading model…</div>
          </Html>
        }
      >
        {/* Centreer & frame model automatisch */}
        <Bounds fit clip margin={1.1}>
          <CharacterModel url={url} />
        </Bounds>
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={8}
        minPolarAngle={0.6}
        maxPolarAngle={Math.PI - 0.9}
      />

      {/* stuurt de controls naar gekozen view */}
      <CameraViewController view={view} />
    </>
  );
}

export default function ModelViewer({ model }) {
  const [view, setView] = useState("free");

  const status = model?.status ?? "idle";
  const url = model?.downloadUrl ?? null;

  const isReady = status === "ready" && !!url;
  const isPending = status === "pending";

  return (
    <div className="viewer-wrapper">
      <div className="viewer-header">
        <h2>3D Preview</h2>
        <span
          className={`viewer-status viewer-status-${status}`}
          title={status}
        >
          {status === "ready"
            ? "ready"
            : status === "pending"
            ? "generating…"
            : "idle"}
        </span>
      </div>

      <div className="viewer-canvas-box">
        {isReady ? (
          <Canvas
            className="viewer-canvas"
            shadows
            camera={{ position: [0, 1.4, 4], fov: 35 }}
            dpr={[1, 2]}
          >
            <color attach="background" args={["#050816"]} />
            <Scene url={url} view={view} />
          </Canvas>
        ) : (
          <div className="viewer-empty">
            {isPending
              ? "Generating your character…"
              : "Generate a character to see it here."}
          </div>
        )}
      </div>

      <div className="viewer-controls-row">
        <div className="viewer-views">
          <button
            type="button"
            className={`viewer-view-btn ${view === "free" ? "active" : ""}`}
            onClick={() => setView("free")}
          >
            Free
          </button>
          <button
            type="button"
            className={`viewer-view-btn ${view === "front" ? "active" : ""}`}
            onClick={() => setView("front")}
          >
            Front
          </button>
          <button
            type="button"
            className={`viewer-view-btn ${view === "side" ? "active" : ""}`}
            onClick={() => setView("side")}
          >
            Side
          </button>
          <button
            type="button"
            className={`viewer-view-btn ${view === "back" ? "active" : ""}`}
            onClick={() => setView("back")}
          >
            Back
          </button>
        </div>

        {isReady && (
          <a
            href={url}
            download="character.glb"
            className="viewer-download-link"
          >
            ↓ Download model (.glb)
          </a>
        )}
      </div>
    </div>
  );
}
