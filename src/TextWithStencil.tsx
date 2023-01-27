import { shaderMaterial, Text3D } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
// import { StencilPass } from "three/examples/jsm/postprocessing/StencilPass";
import * as THREE from "three";
import {
  ClearMaskPass,
  MaskPass,
} from "three/examples/jsm/postprocessing/MaskPass";

const scene2 = new THREE.Scene();
// load example png image as scene background
scene2.background = new THREE.TextureLoader().load(
  "./texture/example.png",
  (texture) => {
    texture.encoding = THREE.LinearEncoding;
    texture.mapping = THREE.EquirectangularReflectionMapping;
  }
);

const target = new THREE.WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight
);

window.addEventListener("resize", () => {
  target.setSize(window.innerWidth, window.innerHeight);
});

export function TextWithStencil() {
  const textRef = useRef(null);

  const textMaterial = useRef(null);
  const { scene, gl, size, camera } = useThree();

  useFrame((state) => {
    state.gl.setRenderTarget(target);
    state.gl.render(scene2, camera);
    state.gl.setRenderTarget(null);
  });

  return (
    <>
      <Text3D
        ref={textRef}
        font={font}
        scale={1}
        letterSpacing={0.03}
        height={0.01}
        curveSegments={32}
        position={[-2, 0, 0]}
      >
        {`Three.js`}

        <textMaterial ref={textMaterial} />
      </Text3D>
    </>
  );
}

const font = "./fonts/pacifico/pacifico-regular-normal-400.json";

const TextMaterial = shaderMaterial(
  { progress: 0, color: [0, 0.7, 0.2] },
  // vertex shader
  /*glsl*/ `
    uniform float progress;
    void main() {
        //  if ( progress > 0.0 ) {
        if ( progress < 1.0 ) {
            float p = 1.0 - progress;
            gl_Position.x += p * gl_Position.x;
            gl_Position.y += p * gl_Position.y;
            gl_Position.z += p * gl_Position.z;
        } else {
            gl_Position.x = 10000.0;
            gl_Position.y = 10000.0;
            gl_Position.z = 10000.0;
        }
        // }
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  // fragment shader
  /*glsl*/ `
    uniform vec3 color;
    void main() {
        gl_FragColor = vec4( color, 1.0 );
    }
  `
);

extend({ TextMaterial, MaskPass, ClearMaskPass, EffectComposer });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      textMaterial: any;
    }
  }
}
