import { Text3D } from "@react-three/drei";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.x - 2.0, position.y ,0.0, 1.0);
  }
`;

const fragmentShader = `
varying vec2 vUv;
uniform sampler2D map;
void main() {
   vec3 col = texture2D(map, vUv).xyz;
    gl_FragColor = vec4(pow(col, vec3(1.75)) * 2.5, 1.0);
}
`;

const uniforms = {
  map: { type: "t", value: null },
};

const materialProperties = {
  uniforms,
  vertexShader,
  fragmentShader,
  depthWrite: false,
  stencilWrite: true,
  stencilFunc: THREE.EqualStencilFunc,
};

export function TextFill({ map, maskId }) {
  const textMaterial = useRef(null);

  useEffect(() => {
    textMaterial.current.uniforms.map.value = map;
  }, [map]);

  return (
    <>
      <Text3D
        font={font}
        scale={1}
        letterSpacing={0.03}
        height={0.01}
        curveSegments={32}
      >
        {`Three.js`}
        <shaderMaterial
          attach="material"
          ref={textMaterial}
          {...materialProperties}
          stencilRef={maskId}
        />
      </Text3D>
    </>
  );
}

const font = "./fonts/pacifico/pacifico-regular-normal-400.json";
