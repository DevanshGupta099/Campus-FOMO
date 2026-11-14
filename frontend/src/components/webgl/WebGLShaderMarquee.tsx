import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function supportsShaderBanner(): boolean {
  if (typeof window === "undefined") return false;
  if (import.meta.env.MODE === "test") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const BANNER_COPY =
  "CONCOURSE // ATOMIC SEATS // 30S ROTATING HMAC QR // SHA-256 COMMIT-REVEAL DRAWS // ZERO-TRUST PBAC // CHRIST CENTRAL BLR // ";

/**
 * Interactive WebGL GLSL Velocity-Shear & RGB Chromatic Typography Ribbon.
 */
export const WebGLShaderMarquee: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState<boolean>(() => supportsShaderBanner());

  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    const host = containerRef.current;

    // 1. Render ultra-sharp offscreen typography atlas on 2D canvas
    const texCanvas = document.createElement("canvas");
    texCanvas.width = 2048;
    texCanvas.height = 256;
    const ctx = texCanvas.getContext("2d");
    if (!ctx) {
      setEnabled(false);
      return;
    }

    ctx.fillStyle = "#07090D";
    ctx.fillRect(0, 0, texCanvas.width, texCanvas.height);
    ctx.font = '800 84px "Syne Variable", "Space Grotesk Variable", sans-serif';
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#F4F0E6";
    ctx.fillText(BANNER_COPY, 24, 132);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      setEnabled(false);
      return;
    }

    const w = Math.max(host.clientWidth, 320);
    const h = Math.max(host.clientHeight, 84);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    host.innerHTML = "";
    host.appendChild(renderer.domElement);

    const texture = new THREE.CanvasTexture(texCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTex: { value: texture },
      uTime: { value: 0 },
      uHover: { value: 0 },
      uMouseX: { value: 0.5 },
      uRepeatX: { value: Math.max(0.45, w / 1500) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTex;
        uniform float uTime;
        uniform float uHover;
        uniform float uMouseX;
        uniform float uRepeatX;
        varying vec2 vUv;

        void main() {
          vec2 uv = vec2(vUv.x * uRepeatX + uTime * 0.055, vUv.y);
          float dist = abs(vUv.x - uMouseX);
          float wave = sin(vUv.y * 14.0 + uTime * 6.0) * 0.012 * uHover * smoothstep(0.35, 0.0, dist);
          float shift = 0.0045 * uHover + 0.001;

          float r = texture2D(uTex, uv + vec2(wave + shift, 0.0)).r;
          float g = texture2D(uTex, uv + vec2(wave, 0.0)).g;
          float b = texture2D(uTex, uv + vec2(wave - shift, 0.0)).b;

          vec3 col = vec3(r, g * 0.96, b * 0.90);
          col += vec3(1.0, 0.30, 0.11) * max(0.0, r - g) * 1.4;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    let targetHover = 0;
    const onEnter = () => {
      targetHover = 1;
    };
    const onLeave = () => {
      targetHover = 0;
    };
    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      uniforms.uMouseX.value =
        (e.clientX - rect.left) / Math.max(rect.width, 1);
    };

    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointermove", onMove);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const nw = Math.max(entry.contentRect.width, 280);
            const nh = Math.max(entry.contentRect.height, 72);
            renderer.setSize(nw, nh);
            uniforms.uRepeatX.value = Math.max(0.45, nw / 1500);
          })
        : null;
    ro?.observe(host);

    let raf = 0;
    const clock = new THREE.Clock();
    const tick = () => {
      raf = window.requestAnimationFrame(tick);
      uniforms.uTime.value = clock.getElapsedTime();
      uniforms.uHover.value = THREE.MathUtils.lerp(
        uniforms.uHover.value,
        targetHover,
        0.08,
      );
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      window.cancelAnimationFrame(raf);
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointermove", onMove);
      ro?.disconnect();
      quad.geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [enabled]);

  if (!enabled) {
    return (
      <div className="overflow-hidden border-y border-rule bg-void py-4">
        <div className="animate-marquee whitespace-nowrap font-display text-2xl font-extrabold tracking-tight text-bone sm:text-4xl">
          <span className="mx-6">{BANNER_COPY}</span>
          <span className="mx-6 text-vermilion">{BANNER_COPY}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      aria-label={BANNER_COPY}
      className="h-20 w-full cursor-ew-resize overflow-hidden border-y border-rule bg-void sm:h-24"
    />
  );
};
