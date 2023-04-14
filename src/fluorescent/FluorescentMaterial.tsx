import React, { useRef } from "react";
import * as THREE from "three";
import { DoubleSide } from "three";
import { useHelper } from "@react-three/drei";

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
   vec3 col = vec3(1.0, 0.65, 0.0);
    gl_FragColor = vec4(col, 1.0);
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
      <Lights />
      <group position={[0, 0, 2]}>
        <mesh ref={boxRef2} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5, 5]} />
          <meshStandardMaterial side={DoubleSide} color={"#ffffff"} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, -1]}>
          <planeGeometry args={[2, 2]} />
          {/* <shaderMaterial
          side={DoubleSide}
          attach="material"
          {...materialProperties}
        /> */}
          <meshStandardMaterial side={DoubleSide} color={"orange"} />
        </mesh>
        <mesh position={[0, 0, -2]}>
          <planeGeometry args={[5, 5]} />
          <meshStandardMaterial side={DoubleSide} color={"#ffffff"} />
        </mesh>
      </group>
    </>
  );
}

function Lights() {
  const light = useRef();
  useHelper(light, THREE.SpotLightHelper, "green");
  return (
    <spotLight
      ref={light}
      intensity={5.0}
      position={[0, 0.5, 1.0]}
      //   shadow-mapSize-width={120}
      //   shadow-mapSize-height={32}
      //   castShadow
      shadow-bias={-0.001}
      penumbra={0.5}
      angle={-Math.PI / 6}
      color="green"
    />
  );
}
