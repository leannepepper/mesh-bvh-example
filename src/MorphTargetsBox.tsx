import { Text3D } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { MeshPhongMaterial } from "three";

export default function MorphTargetsBox() {
  const ref = useRef(null);
  let geometryRef = new THREE.BoxGeometry(2, 2, 2, 32, 32);

  const positionAttribute = geometryRef.attributes.position;
  //geometryRef.morphTargetsRelative = true;

  const groups = geometryRef.groups;
  console.log({ ref });

  const group1Positions = [];
  const group2Positions = [];

  for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i);
    const y = positionAttribute.getY(i);
    const z = positionAttribute.getZ(i);

    group1Positions.push(
      x * Math.sqrt(1 - (y * y) / 2 - (z * z) / 2 + (y * y * z * z) / 3),
      y * Math.sqrt(1 - (z * z) / 2 - (x * x) / 2 + (z * z * x * x) / 3),
      z * Math.sqrt(1 - (x * x) / 2 - (y * y) / 2 + (x * x * y * y) / 3)
    );
  }

  geometryRef.morphAttributes.position = [];
  geometryRef.morphAttributes.position[0] = new THREE.Float32BufferAttribute(
    group1Positions,
    3
  );

  // geometryRef.morphAttributes.position[1] = new THREE.Float32BufferAttribute(
  //   group2Positions,
  //   3
  // );

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.morphTargetInfluences[0] = Math.sin(state.clock.elapsedTime);
    }
  });

  useLayoutEffect(() => {
    ref.current.updateMorphTargets();
    ref.current.morphTargetInfluences = [];
  }, []);

  return (
    <>
      <mesh
        ref={ref}
        geometry={geometryRef}
        material={[
          new MeshPhongMaterial({ color: "red" }),
          new MeshPhongMaterial({ color: "green" }),
          new MeshPhongMaterial({ color: "blue" }),
          new MeshPhongMaterial({ color: "yellow" }),
          new MeshPhongMaterial({ color: "purple" }),
          new MeshPhongMaterial({ color: "orange" }),
        ]}
      ></mesh>
    </>
  );
}
