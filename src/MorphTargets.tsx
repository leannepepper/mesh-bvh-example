import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useLayoutEffect } from "react";
import * as THREE from "three";
import { BoxGeometry } from "three";

export default function MorphTargets() {
  const ref = React.useRef(null);
  const geometryRef = new THREE.BoxGeometry();
  const { scene } = useThree() as any;

  useLayoutEffect(() => {
    ref.current.updateMorphTargets();
  }, []);

  useEffect(() => {
    const positionAttribute = geometryRef.attributes.position;

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

    ref.current.updateMorphTargets();

    geometryRef.morphAttributes.position[0] = new THREE.Float32BufferAttribute(
      spherePositions,
      3
    );

    ref.current.morphTargetInfluences[0] = 0.5;
  }, []);

  useFrame(() => {
    ref.current.morphTargetInfluences[0] += 0.01;
  });

  return (
    <>
      <mesh ref={ref} geometry={geometryRef}>
        <meshStandardMaterial attach="material" color="red" />
      </mesh>
    </>
  );
}
