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
 * Studio-Grade Signed Distance Field (SDF) 3D WebGL Typography.
 * Pairs Bricolage Grotesque 800 Display with Instrument Serif Italic in Three.js
 * with brushed warm-ivory & champagne-gold PBR lighting and an accessible fallback.
 */
export const WebGLKineticHeroText: React.FC<WebGLKineticHeroTextProps> = ({
  primaryLine = "CONCOURSE",
  secondaryLine = "Christ Central Campus — Bengaluru",
  telemetryLine = "12.9345° N · 77.6060° E · ZERO-TRUST CAMPUS EVENT OPERATING SYSTEM",
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
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
    camera.position.set(0, 0, 7.1);

    // Sculpted Warm Platinum & Champagne Studio Lighting Rig
    const ambient = new THREE.AmbientLight(0xf5f2eb, 1.55);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfffaf0, 2.4);
    keyLight.position.set(2.8, 4.2, 5.5);
    scene.add(keyLight);

    const champagneRim = new THREE.PointLight(0xe5ba6b, 3.8, 15);
    champagneRim.position.set(3.2, 1.6, 3.0);
    scene.add(champagneRim);

    const warmVermilionFill = new THREE.PointLight(0xff5224, 2.6, 14);
    warmVermilionFill.position.set(-3.4, -1.4, 2.8);
    scene.add(warmVermilionFill);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Subtle Precision Astrolabe Arcs behind SDF Typography
    const ringGeoOuter = new THREE.TorusGeometry(2.45, 0.0055, 12, 140);
    const ringMatOuter = new THREE.MeshBasicMaterial({
      color: 0xe5ba6b,
      transparent: true,
      opacity: 0.22,
    });
    const outerRing = new THREE.Mesh(ringGeoOuter, ringMatOuter);
    outerRing.position.set(0, 0.04, -1.2);
    outerRing.rotation.x = 0.35;
    rootGroup.add(outerRing);

    const ringGeoInner = new THREE.TorusGeometry(1.82, 0.0045, 12, 110);
    const ringMatInner = new THREE.MeshBasicMaterial({
      color: 0xf5f2eb,
      transparent: true,
      opacity: 0.12,
    });
    const innerRing = new THREE.Mesh(ringGeoInner, ringMatInner);
    innerRing.position.set(0, 0.04, -0.95);
    innerRing.rotation.x = -0.48;
    rootGroup.add(innerRing);

    // Custom GLSL Uniforms for Silky GPU Kinetic Vertex Motion
    const shaderUniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uVelocity: { value: 0 },
    };

    const heroMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#F5F2EB"),
      roughness: 0.28,
      metalness: 0.38,
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
          float proximity = smoothstep(2.0, 0.0, distToCursor);
          float wave = sin(transformed.x * 2.1 - uTime * 2.4) * 0.024;
          transformed.z += proximity * (0.22 + uVelocity * 0.26) + wave;
          transformed.y += proximity * uVelocity * 0.05 * sin(transformed.x * 3.6 + uTime * 4.2);
          `,
        );
    };

    // Layer 1: Primary Monumental SDF Headline (Crisp Bricolage Grotesque 800)
    const mainText = new Text();
    mainText.text = primaryLine;
    mainText.font = "/fonts/bricolage-800.woff";
    mainText.anchorX = "center";
    mainText.anchorY = "middle";
    mainText.letterSpacing = -0.038;
    mainText.material = heroMaterial;
    mainText.position.set(0, 0.16, 0.14);
    rootGroup.add(mainText);

    // Layer 2: Subtle Champagne-Gold Depth Shadow (-Z)
    const echoText = new Text();
    echoText.text = primaryLine;
    echoText.font = "/fonts/bricolage-800.woff";
    echoText.anchorX = "center";
    echoText.anchorY = "middle";
    echoText.letterSpacing = -0.038;
    echoText.color = "#E5BA6B";
    echoText.fillOpacity = 0.04;
    echoText.strokeWidth = "0.9%";
    echoText.strokeColor = "#E5BA6B";
    echoText.strokeOpacity = 0.24;
    echoText.position.set(0, 0.18, -0.34);
    rootGroup.add(echoText);

    // Layer 3: Editorial Luxury Subtitle in Instrument Serif Italic!
    const subText = new Text();
    subText.text = secondaryLine;
    subText.font = "/fonts/instrument-serif-italic.woff";
    subText.anchorX = "center";
    subText.anchorY = "middle";
    subText.letterSpacing = 0.01;
    subText.color = "#E5BA6B";
    subText.position.set(0, -0.68, 0.18);
    rootGroup.add(subText);

    // Layer 4: Precision Coordinate Overline
    const topTag = new Text();
    topTag.text = telemetryLine;
    topTag.font = "/fonts/space-grotesk-700.woff";
    topTag.anchorX = "center";
    topTag.anchorY = "middle";
    topTag.letterSpacing = 0.16;
    topTag.color = "#9BA6B8";
    topTag.position.set(0, 0.96, 0.08);
    rootGroup.add(topTag);

    // Delicate Floating Starlight Dust
    const particleCount = 44;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 9.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3.6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.2 - 0.6;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xe5ba6b,
      size: 0.026,
      transparent: true,
      opacity: 0.42,
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

      // Bricolage 800 has clean, balanced proportions (~5.6 width-to-em for CONCOURSE)
      const targetFontSize = THREE.MathUtils.clamp(
        (visibleWidth * 0.84) / 5.7,
        0.48,
        1.28,
      );
      mainText.fontSize = targetFontSize;
      echoText.fontSize = targetFontSize * 1.015;
      subText.fontSize = THREE.MathUtils.clamp(
        targetFontSize * 0.34,
        0.18,
        0.38,
      );
      topTag.fontSize = THREE.MathUtils.clamp(
        targetFontSize * 0.115,
        0.075,
        0.125,
      );

      subText.position.y = -targetFontSize * 0.68;
      topTag.position.y = targetFontSize * 0.84;

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
      velocity = Math.min(1.2, velocity + Math.hypot(dx, dy) * 1.5);
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

      currentPointer.lerp(targetPointer, 0.07);
      velocity = THREE.MathUtils.lerp(velocity, 0, 0.06);

      shaderUniforms.uTime.value = elapsed;
      shaderUniforms.uPointer.value.copy(currentPointer);
      shaderUniforms.uVelocity.value = velocity;

      rootGroup.rotation.y = currentPointer.x * 0.11;
      rootGroup.rotation.x = -currentPointer.y * 0.07;

      echoText.position.x = -currentPointer.x * 0.16;
      echoText.position.y = 0.18 - currentPointer.y * 0.1;

      outerRing.rotation.z = elapsed * 0.08;
      innerRing.rotation.z = -elapsed * 0.11;

      champagneRim.position.x = 2.2 + currentPointer.x * 2.4;
      champagneRim.position.y = 1.2 + currentPointer.y * 1.5;

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
      <h1 className={webglActive ? "sr-only" : "text-center"}>
        {webglActive ? (
          `${primaryLine} — ${DESIGN_TOKENS_FALLBACK} ${secondaryLine}`
        ) : (
          <span className="block py-4">
            <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-silver sm:text-[11px]">
              {telemetryLine}
            </span>
            <span className="mt-3 block font-display text-5xl font-bold tracking-[-0.045em] text-bone sm:text-7xl lg:text-[6.25rem]">
              {primaryLine}
            </span>
            <span className="editorial-italic mt-2 block text-2xl text-gold sm:text-4xl">
              {secondaryLine}
            </span>
          </span>
        )}
      </h1>

      {webglActive && (
        <div
          ref={mountRef}
          aria-hidden="true"
          className="h-[230px] w-full select-none sm:h-[295px] lg:h-[340px]"
        />
      )}
    </div>
  );
};

const DESIGN_TOKENS_FALLBACK = "CHRIST (Deemed to be University)";
