import React, { Suspense, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF, Bounds } from "@react-three/drei";
import * as THREE from "three";
const VIEW_AZIMUTH_OFFSET = Math.PI / 2; // 90° fix voor Tripo orientation

const CAMERA_PRESETS = {
  free: null,

  // FRONT: gezicht
  front: { azimuth: 0 + VIEW_AZIMUTH_OFFSET, polar: Math.PI / 2.25 },

  // SIDE: rechter profiel
  side: { azimuth: -Math.PI / 2 + VIEW_AZIMUTH_OFFSET, polar: Math.PI / 2.25 },

  // BACK: achterkant
  back: { azimuth: Math.PI + VIEW_AZIMUTH_OFFSET, polar: Math.PI / 2.25 },
};


// 🔹 Veel duidelijkere environment styles
const ENV_PRESETS = {
  studio: {
    id: "studio",
    label: "Studio",
    bg: "#050816",
    mainLightColor: "#ffffff",
    fillLightColor: "#a5b4fc",
    intensity: 1.2,
  },
  dusk: {
    id: "dusk",
    label: "Dusk",
    bg: "#1b1025",
    mainLightColor: "#f97316",
    fillLightColor: "#a855f7",
    intensity: 1.1,
  },
  neon: {
    id: "neon",
    label: "Neon",
    bg: "#020617",
    mainLightColor: "#22c55e",
    fillLightColor: "#f97316",
    intensity: 1.4,
  },
  desert: {
    id: "desert",
    label: "Desert",
    bg: "#261308",
    mainLightColor: "#facc15",
    fillLightColor: "#fb923c",
    intensity: 1.3,
  },
  arctic: {
    id: "arctic",
    label: "Arctic",
    bg: "#071422",
    mainLightColor: "#93c5fd",
    fillLightColor: "#e0f2fe",
    intensity: 1.2,
  },
  horror: {
    id: "horror",
    label: "Horror",
    bg: "#05010a",
    mainLightColor: "#fb7185",
    fillLightColor: "#22d3ee",
    intensity: 1.1,
  },
};

function CharacterModel({ url }) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    if (!scene) return;

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

// Stuurt OrbitControls naar front/side/back
function CameraViewController({ view }) {
  const { controls } = useThree();

  useEffect(() => {
    if (!controls) return;

    const preset = CAMERA_PRESETS[view];
    if (!preset) return;

    const { azimuth, polar } = preset;
    const startAz = controls.getAzimuthalAngle();
    const startPol = controls.getPolarAngle();
    const duration = 350;
    let startTime;

    function animate(time) {
      if (!startTime) startTime = time;
      const t = Math.min((time - startTime) / duration, 1);

      controls.setAzimuthalAngle(THREE.MathUtils.lerp(startAz, azimuth, t));
      controls.setPolarAngle(THREE.MathUtils.lerp(startPol, polar, t));
      controls.update();

      if (t < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [view, controls]);

  return null;
}

function Scene({ url, view, env }) {
  if (!url) return null;

  return (
    <>
      {/* Sterkere verschillen per environment */}
      <ambientLight intensity={0.3 * env.intensity} />

      {/* Key light */}
      <directionalLight
        intensity={env.intensity}
        position={[4, 6, 3]}
        castShadow
        color={env.mainLightColor}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Fill / rim light */}
      <directionalLight
        intensity={0.5 * env.intensity}
        position={[-3, 2, -4]}
        color={env.fillLightColor}
      />

      {/* Heel lichte ground "fake shadow" */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.3, 0]} receiveShadow>
        <circleGeometry args={[6, 32]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.4}
        />
      </mesh>

      <Suspense
        fallback={
          <Html center>
            <div className="viewer-loading">Loading model…</div>
          </Html>
        }
      >
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

      <CameraViewController view={view} />
    </>
  );
}

export default function ModelViewer({ model }) {
  const [view, setView] = useState("free");
  const [envId, setEnvId] = useState("studio");

  const status = model?.status ?? "idle";
  const url = model?.downloadUrl ?? null;

  const isReady = status === "ready" && !!url;
  const isPending = status === "pending";
  const env = ENV_PRESETS[envId];

  return (
    <div className="viewer-wrapper">
      <div className="viewer-header">
        <div>
          <h2>3D Preview</h2>
          <p className="viewer-subtitle">
            Spin, inspect & download your generated character.
          </p>
        </div>
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
            <color attach="background" args={[env.bg]} />
            <Scene url={url} view={view} env={env} />
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
        <div className="viewer-control-group">
          <span className="viewer-control-label">View</span>
          <div className="viewer-views">
            {["free", "front", "side", "back"].map((id) => (
              <button
                key={id}
                type="button"
                className={`viewer-view-btn ${view === id ? "active" : ""}`}
                onClick={() => setView(id)}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="viewer-control-group">
          <span className="viewer-control-label">Environment</span>
          <div className="viewer-envs">
            {Object.values(ENV_PRESETS).map((envOpt) => (
              <button
                key={envOpt.id}
                type="button"
                className={
                  "viewer-env-btn" +
                  (envId === envOpt.id ? " viewer-env-btn--active" : "")
                }
                onClick={() => setEnvId(envOpt.id)}
                style={
                  envId === envOpt.id
                    ? {
                        background: `linear-gradient(120deg, ${envOpt.mainLightColor}, ${envOpt.fillLightColor})`,
                        color: "#020617",
                      }
                    : {}
                }
              >
                {envOpt.label}
              </button>
            ))}
          </div>
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
