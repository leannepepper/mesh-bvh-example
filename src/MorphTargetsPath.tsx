import { useFrame } from "@react-three/fiber";
import React, { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { MeshPhongMaterial } from "three";

export default function MorphTargetsPath() {
  const ref = useRef(null);
  const segments = 10;
  const geometry = new THREE.TorusKnotGeometry(2, 0.2, segments, 8, 1, 5);

  //   geometry.morphTargetsRelative = true;
  geometry.clearGroups();

  let materialIndex = 0;
  for (let i = 0; i < geometry.attributes.position.array.length; i += 48) {
    geometry.addGroup(i, 48, materialIndex);
    materialIndex++;
  }
  console.log({ geometry });

  /** Create the MorphTarget for start positions */
  const positionAttribute = geometry.attributes.position;
  const group1Positions = [];

  // for the first group in the geometry, create a morph target that goes to the last set of vertices in the group
  const group1 = geometry.groups[0];

  // loop through all the groups
  for (let i = 0; i < geometry.groups.length; i++) {
    const group = geometry.groups[i];
    // loop through all the vertices in the group
    for (let j = group.start; j < group.start + group.count; j++) {
      // get the x, y, and z values for the vertex
      const x = positionAttribute.getX(j);
      const y = positionAttribute.getY(j);
      const z = positionAttribute.getZ(j);
      // add the x, y, and z values to the morph target array
      group1Positions.push(x, y, z);
    }

    // if this is the first group, add the morph target to the geometry
    if (i === 0) {
      geometry.morphAttributes.position = [];
      geometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(
        group1Positions,
        3
      );
    }
  }

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.morphTargetInfluences[0] = Math.abs(
        Math.sin(state.clock.elapsedTime)
      );
    }
  });

  useLayoutEffect(() => {
    ref.current.updateMorphTargets();
    ref.current.morphTargetInfluences = [];
  }, []);

  // make an array of meshPhong materials of different colors
  const colors = [];
  for (let i = 0; i < segments; i++) {
    colors.push(
      new MeshPhongMaterial({
        color: Math.random() * 0xffffff,
        wireframe: true,
        visible: true,
      })
    );
  }

  return (
    <>
      <mesh ref={ref} geometry={geometry} material={colors}></mesh>
    </>
  );
}
