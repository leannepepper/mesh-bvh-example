import React from "react";
import * as THREE from "three";
import { DoubleSide } from "three";

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
   vec3 col = vec3(1.0, 1.0, 1.0);
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
};

export default function FluorescentMaterial() {
  const boxRef2 = React.useRef(null);

  return (
    <>
      <mesh ref={boxRef2} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 5]} />
        <shaderMaterial
          side={DoubleSide}
          attach="material"
          {...materialProperties}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, -1]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial side={DoubleSide} color={"orange"} />
      </mesh>
      <mesh position={[0, 0, -2]}>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial side={DoubleSide} color={"#ffffff"} />
      </mesh>
    </>
  );
}
