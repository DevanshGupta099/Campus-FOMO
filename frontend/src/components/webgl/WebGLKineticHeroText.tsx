import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Text } from "troika-three-text";

interface WebGLKineticHeroTextProps {
  primaryLine?: string;
  secondaryLine?: string;
  telemetryLine?: string;
}

function canUseWebGL(): boolean {
  if (typeof window === "undefined") return false;
  if (import.meta.env.MODE === "test") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * AAA Game-Engine Signed Distance Field (SDF) 3D WebGL Typography.
 * Uses troika-three-text + custom GLSL vertex wave displacement + 3D parallax
 * depth layers, with an automatic accessible non-WebGL / reduced-motion fallback.
 */
export const WebGLKineticHeroText: React.FC<WebGLKineticHeroTextProps> = ({
  primaryLine = "CONCOURSE",
  secondaryLine = "CHRIST CENTRAL // BLR",
  telemetryLine = "12.9345 N · 77.6060 E · ZERO-TRUST EVENT OS",
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglActive, setWebglActive] = useState<boolean>(() => canUseWebGL());

  useEffect(() => {
    if (!webglActive || !mountRef.current) return;

    const container = mountRef.current;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setWebglActive(false);
      return;
    }

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 220);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(0, 0, 7.2);

    // Studio AAA Lighting Rig
    const ambient = new THREE.AmbientLight(0xf4f0e6, 1.35);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff6e5, 2.2);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);

    const vermilionPoint = new THREE.PointLight(0xff4d1c, 4.5, 14);
    vermilionPoint.position.set(-3.2, -1.2, 3.2);
    scene.add(vermilionPoint);

    const goldRim = new THREE.PointLight(0xe2b45a, 3.2, 14);
    goldRim.position.set(3.4, 1.8, 2.6);
    scene.add(goldRim);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Gyroscopic Anodized Telemetry Rings behind SDF Typography
    const ringGeoOuter = new THREE.TorusGeometry(2.35, 0.009, 12, 120);
    const ringMatOuter = new THREE.MeshBasicMaterial({
      color: 0xff4d1c,
      transparent: true,
      opacity: 0.34,
    });
    const outerRing = new THREE.Mesh(ringGeoOuter, ringMatOuter);
    outerRing.position.set(0, 0.05, -1.15);
    rootGroup.add(outerRing);

    const ringGeoInner = new THREE.TorusGeometry(1.75, 0.007, 12, 96);
    const ringMatInner = new THREE.MeshBasicMaterial({
      color: 0xe2b45a,
      transparent: true,
      opacity: 0.26,
    });
    const innerRing = new THREE.Mesh(ringGeoInner, ringMatInner);
    innerRing.position.set(0, 0.05, -0.95);
    innerRing.rotation.x = 0.55;
    rootGroup.add(innerRing);

    // Custom GLSL Uniforms for GPU Kinetic Vertex Distortion
    const shaderUniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uVelocity: { value: 0 },
    };

    const heroMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#F4F0E6"),
      roughness: 0.24,
      metalness: 0.52,
    });

    heroMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = shaderUniforms.uTime;
      shader.uniforms.uPointer = shaderUniforms.uPointer;
      shader.uniforms.uVelocity = shaderUniforms.uVelocity;

      shader.vertexShader =
        `
        uniform float uTime;
        uniform vec2 uPointer;
        uniform float uVelocity;
        ` +
        shader.vertexShader.replace(
          "#include <begin_vertex>",
          `
          #include <begin_vertex>
          float distToCursor = distance(transformed.xy, uPointer * vec2(3.6, 1.4));
          float proximity = smoothstep(2.1, 0.0, distToCursor);
          float wave = sin(transformed.x * 2.4 - uTime * 3.1) * 0.035;
          transformed.z += proximity * (0.28 + uVelocity * 0.35) + wave;
          transformed.y += proximity * uVelocity * 0.08 * sin(transformed.x * 4.0 + uTime * 5.0);
          `,
        );
    };

    // Layer 1: Primary Monumental SDF Headline
    const mainText = new Text();
    mainText.text = primaryLine;
    mainText.font = "/fonts/syne-800.woff";
    mainText.anchorX = "center";
    mainText.anchorY = "middle";
    mainText.letterSpacing = -0.045;
    mainText.material = heroMaterial;
    mainText.outlineWidth = "2%";
    mainText.outlineColor = "#FF4D1C";
    mainText.outlineOpacity = 0.28;
    mainText.position.set(0, 0.14, 0.12);
    rootGroup.add(mainText);

    // Layer 2: Deep Parallax Wireframe Ghost Echo (-Z)
    const echoText = new Text();
    echoText.text = primaryLine;
    echoText.font = "/fonts/syne-800.woff";
    echoText.anchorX = "center";
    echoText.anchorY = "middle";
    echoText.letterSpacing = -0.04;
    echoText.color = "#FF4D1C";
    echoText.fillOpacity = 0.06;
    echoText.strokeWidth = "1.4%";
    echoText.strokeColor = "#FF4D1C";
    echoText.strokeOpacity = 0.45;
    echoText.position.set(0, 0.18, -0.42);
    rootGroup.add(echoText);

    // Layer 3: Sharp Sub-Headline SDF Tag
    const subText = new Text();
    subText.text = secondaryLine;
    subText.font = "/fonts/space-grotesk-700.woff";
    subText.anchorX = "center";
    subText.anchorY = "middle";
    subText.letterSpacing = 0.18;
    subText.color = "#E2B45A";
    subText.position.set(0, -0.68, 0.18);
    rootGroup.add(subText);

    // Layer 4: Top HUD Coordinate SDF Tag
    const topTag = new Text();
    topTag.text = telemetryLine;
    topTag.font = "/fonts/space-grotesk-700.woff";
    topTag.anchorX = "center";
    topTag.anchorY = "middle";
    topTag.letterSpacing = 0.14;
    topTag.color = "#9DA8B8";
    topTag.position.set(0, 0.96, 0.08);
    rootGroup.add(topTag);

    // Floating Instanced Coordinate Particles
    const particleCount = 65;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 9.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.4 - 0.5;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xe2b45a,
      size: 0.032,
      transparent: true,
      opacity: 0.55,
    });
    const particles = new THREE.Points(pGeo, pMat);
    rootGroup.add(particles);

    const updateResponsiveLayout = (w: number, h: number) => {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      const vFovRad = THREE.MathUtils.degToRad(camera.fov);
      const visibleHeight = 2 * Math.tan(vFovRad / 2) * camera.position.z;
      const visibleWidth = visibleHeight * camera.aspect;

      // Guarantee "CONCOURSE" (~6.4 width-to-em ratio in Syne 800) fits cleanly
      const targetFontSize = THREE.MathUtils.clamp(
        (visibleWidth * 0.86) / 6.3,
        0.42,
        1.18,
      );
      mainText.fontSize = targetFontSize;
      echoText.fontSize = targetFontSize * 1.03;
      subText.fontSize = THREE.MathUtils.clamp(
        targetFontSize * 0.2,
        0.11,
        0.22,
      );
      topTag.fontSize = THREE.MathUtils.clamp(
        targetFontSize * 0.14,
        0.085,
        0.15,
      );

      subText.position.y = -targetFontSize * 0.74;
      topTag.position.y = targetFontSize * 0.92;

      mainText.sync();
      echoText.sync();
      subText.sync();
      topTag.sync();
    };

    updateResponsiveLayout(width, height);

    const targetPointer = new THREE.Vector2(0, 0);
    const currentPointer = new THREE.Vector2(0, 0);
    let lastX = 0;
    let lastY = 0;
    let velocity = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
      const dx = nx - lastX;
      const dy = ny - lastY;
      velocity = Math.min(1.4, velocity + Math.hypot(dx, dy) * 1.8);
      lastX = nx;
      lastY = ny;
      targetPointer.set(
        THREE.MathUtils.clamp(nx, -1, 1),
        THREE.MathUtils.clamp(ny, -1, 1),
      );
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    const resizeObs =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const cw = Math.max(entry.contentRect.width, 280);
            const ch = Math.max(entry.contentRect.height, 200);
            updateResponsiveLayout(cw, ch);
          })
        : null;
    resizeObs?.observe(container);

    let rafId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = window.requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      currentPointer.lerp(targetPointer, 0.08);
      velocity = THREE.MathUtils.lerp(velocity, 0, 0.06);

      shaderUniforms.uTime.value = elapsed;
      shaderUniforms.uPointer.value.copy(currentPointer);
      shaderUniforms.uVelocity.value = velocity;

      // Subtle AAA HUD camera & parallax tilt
      rootGroup.rotation.y = currentPointer.x * 0.14;
      rootGroup.rotation.x = -currentPointer.y * 0.09;

      echoText.position.x = -currentPointer.x * 0.22;
      echoText.position.y = 0.18 - currentPointer.y * 0.14;

      outerRing.rotation.z = elapsed * 0.12;
      outerRing.rotation.y = Math.sin(elapsed * 0.4) * 0.22;
      innerRing.rotation.z = -elapsed * 0.18;

      vermilionPoint.position.x = currentPointer.x * 3.5;
      vermilionPoint.position.y = currentPointer.y * 1.8;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handlePointerMove);
      resizeObs?.disconnect();
      mainText.dispose();
      echoText.dispose();
      subText.dispose();
      topTag.dispose();
      ringGeoOuter.dispose();
      ringMatOuter.dispose();
      ringGeoInner.dispose();
      ringMatInner.dispose();
      pGeo.dispose();
      pMat.dispose();
      heroMaterial.dispose();
      renderer.dispose();
    };
  }, [webglActive, primaryLine, secondaryLine, telemetryLine]);

  return (
    <div className="relative w-full">
      {/* Accessible Primary Document Heading */}
      <h1 className={webglActive ? "sr-only" : "text-center"}>
        {webglActive ? (
          `${primaryLine} — ${DESIGN_TOKENS_FALLBACK} ${secondaryLine}`
        ) : (
          <span className="block py-4">
            <span className="block font-mono text-[11px] uppercase tracking-[0.26em] text-silver">
              {telemetryLine}
            </span>
            <span className="mt-2 block font-display text-5xl font-extrabold tracking-tight text-bone sm:text-7xl lg:text-8xl">
              {primaryLine}
            </span>
            <span className="mt-2 block font-mono text-xs font-semibold uppercase tracking-[0.28em] text-gold sm:text-sm">
              {secondaryLine}
            </span>
          </span>
        )}
      </h1>

      {webglActive && (
        <div
          ref={mountRef}
          aria-hidden="true"
          className="h-[230px] w-full cursor-crosshair select-none sm:h-[300px] lg:h-[350px]"
        />
      )}
    </div>
  );
};

const DESIGN_TOKENS_FALLBACK = "CHRIST (Deemed to be University)";
