/// <reference types="vite/client" />

declare module "troika-three-text" {
  import * as THREE from "three";

  export class Text extends THREE.Mesh {
    text: string;
    font: string | null;
    fontSize: number;
    color: number | string | THREE.Color;
    letterSpacing: number;
    lineHeight: number | string;
    maxWidth: number;
    textAlign: "left" | "right" | "center" | "justify";
    anchorX: number | "left" | "center" | "right" | string;
    anchorY:
      | number
      | "top"
      | "top-baseline"
      | "middle"
      | "bottom-baseline"
      | "bottom"
      | string;
    outlineWidth: number | string;
    outlineColor: number | string | THREE.Color;
    outlineOpacity: number;
    fillOpacity: number;
    strokeWidth: number | string;
    strokeColor: number | string | THREE.Color;
    strokeOpacity: number;
    curveRadius: number;
    material: THREE.Material | THREE.Material[];
    sync(callback?: () => void): void;
    dispose(): void;
  }

  export function preloadFont(
    options: { font?: string; characters?: string },
    callback?: () => void,
  ): void;
}
