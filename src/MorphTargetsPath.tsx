import { useFrame } from "@react-three/fiber";
import React, { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { MeshPhongMaterial } from "three";

export default function MorphTargetsPath() {
  const ref = useRef(null);
  const geometry = new THREE.TorusKnotGeometry(2, 0.2, 100, 8, 1, 5);

  //geometry.morphTargetsRelative = true;
  /** Clear all the groups and make two groups for each face of the cube */
  //   geometry.clearGroups();
  //   geometry.addGroup(0, 3, 0);
  //   geometry.addGroup(3, 3, 1);
  //   geometry.addGroup(6, 3, 2);
  //   geometry.addGroup(9, 3, 3);
  //   geometry.addGroup(12, 3, 4);
  //   geometry.addGroup(15, 3, 5);
  //   geometry.addGroup(18, 3, 6);
  //   geometry.addGroup(21, 3, 7);
  //   geometry.addGroup(24, 3, 8);
  //   geometry.addGroup(27, 3, 9);
  //   geometry.addGroup(30, 3, 10);
  //   geometry.addGroup(33, 3, 11);

  /** Create the MorphTarget for the sphere position */
  //   const positionAttribute = geometry.attributes.position;
  //   const indecesAttribute = geometry.attributes;

  //   const group1Positions = [];
  //   const group2Positions = [];

  //   for (let i = 0; i < positionAttribute.count; i = i + 3) {
  //     const x = positionAttribute.getX(i);
  //     const y = positionAttribute.getY(i);
  //     const z = positionAttribute.getZ(i);

  //     const x2 = positionAttribute.getX(i + 1);
  //     const y2 = positionAttribute.getY(i + 1);
  //     const z2 = positionAttribute.getZ(i + 1);

  //     const x3 = positionAttribute.getX(i + 2);
  //     const y3 = positionAttribute.getY(i + 2);
  //     const z3 = positionAttribute.getZ(i + 2);

  //     if (i > 3) {
  //       group1Positions.push(x, y, z, x2, y2, z2, x3, y3, z3);
  //     } else {
  //       group1Positions.push(
  //         x * 0.002,
  //         y * 0.002,
  //         z * 0.002,
  //         x2 * 0.002,
  //         y2 * 0.002,
  //         z2 * 0.002,
  //         x3 * 0.002,
  //         y3 * 0.002,
  //         z3 * 0.002
  //       );
  //     }
  //   }

  //   geometry.morphAttributes.position = [];
  //   geometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(
  //     group1Positions,
  //     3
  //   );

  // geometryRef.morphAttributes.position[1] = new THREE.Float32BufferAttribute(
  //   group2Positions,
  //   3
  // );

  //   useFrame((state, delta) => {
  //     if (ref.current) {
  //       ref.current.morphTargetInfluences[0] = Math.abs(
  //         Math.sin(state.clock.elapsedTime)
  //       );
  //     }
  //   });

  //   useLayoutEffect(() => {
  //     ref.current.updateMorphTargets();
  //     ref.current.morphTargetInfluences = [];
  //   }, []);

  return (
    <>
      <mesh
        ref={ref}
        geometry={geometry}
        material={new MeshPhongMaterial({ color: "red", wireframe: false })}
      ></mesh>
    </>
  );
}
