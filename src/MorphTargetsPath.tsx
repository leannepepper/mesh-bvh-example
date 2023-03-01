import { useFrame } from "@react-three/fiber";
import React, { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { MeshPhongMaterial } from "three";

export default function MorphTargetsPath() {
  const ref = useRef(null);
  const segments = 10;
  const geometry = new THREE.TorusKnotGeometry(2, 0.2, segments, 8, 1, 1);

  geometry.morphTargetsRelative = true;
  geometry.clearGroups();

  let materialIndex = 0;
  for (let i = 0; i < geometry.index.count; i += 48) {
    geometry.addGroup(i, 48, materialIndex);
    materialIndex++;
  }
  console.log({ geometry, ref });

  /** Create the MorphTarget for start positions */
  const positionAttribute = geometry.attributes.position;
  const group1Positions = [];

  for (let i = 0; i < geometry.groups[0].count; i = i + 3) {
    let x = positionAttribute.array[i] * 0.1;
    let y = positionAttribute.array[i + 1] * 0.1;
    let z = positionAttribute.array[i + 2] * 0.1;

    // if this is the first group, add the morph target to the geometry

    group1Positions.push(x, y, z);
  }

  geometry.morphAttributes.position = [];
  geometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(
    group1Positions,
    3
  );

  useFrame((state, delta) => {
    if (ref.current) {
      // increace the morphTargetInfluence to 1, then back to 0
      ref.current.morphTargetInfluences[0] = Math.sin(state.clock.elapsedTime);
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
        wireframe: false,
        visible: true,
      })
    );
  }

  return <mesh ref={ref} geometry={geometry} material={colors}></mesh>;
}
