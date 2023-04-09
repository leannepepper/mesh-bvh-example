import React from "react";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
varying vec2 vUv;
uniform sampler2D map;
void main() {
   vec3 col = vec3(0.5, 0.2, 0.5);
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

export default function FluorescentMaterial() {
  const boxRef2 = React.useRef(null);

  return (
    <>
      <mesh ref={boxRef2}>
        <boxGeometry attach="geometry" args={[1, 1, 1]} />
        <shaderMaterial attach="material" {...materialProperties} />
      </mesh>
    </>
  );
}
