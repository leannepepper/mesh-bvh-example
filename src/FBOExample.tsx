import { Box, Plane, Point, PointMaterial, Text3D } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useLayoutEffect } from "react";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 10.0;
  }
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
void main() {
   vec3 col = vec3(0.2, 0.2, 0.2);
    gl_FragColor = vec4(vUv.x * sin(uTime), vUv.y * sin(uTime),1.0, 1.0);
}
`;

const uniforms = {
  uTime: { value: 0 },
};

const materialProperties = {
  uniforms,
  vertexShader,
  fragmentShader,
  //size: 0.1,
  //   wireframe: true,
};

export default function FBOExample() {
  useFrame((state) => {
    uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <points>
      <planeGeometry args={[10, 10, 10, 10]} />
      <shaderMaterial attach="material" {...materialProperties} />
    </points>
  );
}
