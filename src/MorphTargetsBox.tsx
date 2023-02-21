import { Text3D } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { MeshPhongMaterial } from "three";

export default function MorphTargetsBox() {
  const ref = useRef(null);
  const geometry = new THREE.BoxGeometry(2, 2, 2);

  /** Clear all the groups and make two groups for each face of the cube */
  geometry.clearGroups();
  geometry.addGroup(0, 3, 0);
  geometry.addGroup(3, 3, 1);
  geometry.addGroup(6, 3, 2);
  geometry.addGroup(9, 3, 3);
  geometry.addGroup(12, 3, 4);
  geometry.addGroup(15, 3, 5);
  geometry.addGroup(18, 3, 6);
  geometry.addGroup(21, 3, 7);
  geometry.addGroup(24, 3, 8);
  geometry.addGroup(27, 3, 9);
  geometry.addGroup(30, 3, 10);
  geometry.addGroup(33, 3, 11);

  /** Create the MorphTarget for the sphere position */
  const positionAttribute = geometry.attributes.position;
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

  geometry.morphAttributes.position = [];
  geometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(
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
        geometry={geometry}
        material={[
          new MeshPhongMaterial({ color: "red", wireframe: false }),
          new MeshPhongMaterial({ color: "green" }),
          new MeshPhongMaterial({ color: "blue" }),
          new MeshPhongMaterial({ color: "yellow" }),
          new MeshPhongMaterial({ color: "purple" }),
          new MeshPhongMaterial({ color: "orange" }),
          new MeshPhongMaterial({ color: "white" }),
          new MeshPhongMaterial({ color: "hotpink" }),
          new MeshPhongMaterial({ color: "pink" }),
          new MeshPhongMaterial({ color: "brown" }),
          new MeshPhongMaterial({ color: "grey" }),
          new MeshPhongMaterial({ color: "cyan" }),
        ]}
      ></mesh>
    </>
  );
}
