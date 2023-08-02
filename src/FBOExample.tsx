import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import texture from "./textures/rock.png";

const vertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform sampler2D uTexture;

  void main() {
    vUv = uv;
    vec3 newPosition = position;
    vec4 color = texture2D(uTexture, vUv);
    newPosition.xy = color.xy;

    vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );

    gl_PointSize =  ( 10.0 / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform sampler2D uTexture;
void main() {
   vec4 color = texture2D(uTexture, vUv);
    gl_FragColor = vec4(color);
}
`;

const uniforms = {
  uTime: { value: 0 },
  uTexture: { value: new THREE.TextureLoader().load(texture) },
};

const materialProperties = {
  uniforms,
  vertexShader,
  fragmentShader,
};

export default function FBOExample() {
  const size = 32;
  const number = size * size;
  const data = new Float32Array(number * 4);

  // Create positions and uvs for the bufferGeometry
  const bufferGeometry = useRef<THREE.BufferGeometry>();
  const positions = new Float32Array(number * 3);
  const uvs = new Float32Array(number * 2);

  for (let i = 0; i < number; i++) {
    const i3 = i * 3;
    const i2 = i * 2;

    positions[i3 + 0] = (i % size) / size;
    positions[i3 + 1] = Math.floor(i / size) / size;
    positions[i3 + 2] = 0;

    uvs[i2 + 0] = (i % size) / size;
    uvs[i2 + 1] = Math.floor(i / size) / size;
  }

  useEffect(() => {
    if (bufferGeometry.current) {
      bufferGeometry.current.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      bufferGeometry.current.setAttribute(
        "uv",
        new THREE.BufferAttribute(uvs, 2)
      );
    }
  }, [bufferGeometry]);

  // Create data for the DataTexture
  for (let i = 0; i < number; i++) {
    const i4 = i * 4;
    data[i4 + 0] = Math.random();
    data[i4 + 1] = Math.random();
    data[i4 + 2] = Math.random();
    data[i4 + 3] = Math.random();
  }

  const texture = new THREE.DataTexture(
    data,
    size,
    size,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  texture.needsUpdate = true;

  useEffect(() => {
    uniforms.uTexture.value = texture;
  }, []);

  useFrame((state) => {
    uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <points>
      <bufferGeometry ref={bufferGeometry} />
      <shaderMaterial attach="material" {...materialProperties} />
    </points>
  );
}
