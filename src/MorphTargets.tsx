import { Text3D } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useLayoutEffect, useRef } from "react";
import * as THREE from "three";

export default function MorphTargets() {
  const ref = useRef(null);
  console.log({ ref });
  const geometryRef = ref.current?.geometry; //new THREE.BoxGeometry(2, 2, 2, 32, 32);

  const positionAttribute = geometryRef.attributes.position;
  //geometryRef.morphTargetsRelative = true;

  const spherePositions = [];

  for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i);
    const y = positionAttribute.getY(i);
    const z = positionAttribute.getZ(i);

    spherePositions.push(
      x * Math.sqrt(1 - (y * y) / 2 - (z * z) / 2 + (y * y * z * z) / 3),
      y * Math.sqrt(1 - (z * z) / 2 - (x * x) / 2 + (z * z * x * x) / 3),
      z * Math.sqrt(1 - (x * x) / 2 - (y * y) / 2 + (x * x * y * y) / 3)
    );
  }

  geometryRef.morphAttributes.position = [];

  geometryRef.morphAttributes.position[0] = new THREE.Float32BufferAttribute(
    spherePositions,
    3
  );

  useFrame((state, delta) => {
    // oscillate the morphTargetInfluences
    if (ref.current) {
      ref.current.morphTargetInfluences[0] = Math.sin(state.clock.elapsedTime);
    }
  });

  useLayoutEffect(() => {
    ref.current.updateMorphTargets();
    // Another hack that might work is from https://codepen.io/ghostcc/pen/mweMwj?css-preprocessor=less:
    // geometry.morphTargets = [];
    // then push as many morph targets as you have
  }, []);

  return (
    <Text3D
      ref={ref}
      font={font}
      scale={1}
      letterSpacing={0.03}
      height={0.01}
      curveSegments={32}
      position={[-2, 0, 0]}
    >
      T
      <meshPhongMaterial attach="material" color="red" />
    </Text3D>
  );
}

const font = "./fonts/pacifico/pacifico-regular-normal-400.json";
