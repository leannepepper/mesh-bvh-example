import { useFrame } from "@react-three/fiber";
import React, { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom } from "react-postprocessing";

export default function CircleArt() {
  const ref = useRef(null);
  const count = 6;
  const angle = (Math.PI * 2) / count;
  const radius = 0.05;
  useLayoutEffect(() => {
    for (let i = 0; i < count; i++) {
      ref.current.setMatrixAt(
        i,
        new THREE.Matrix4().makeTranslation(
          Math.cos(angle * i) * 0.3,
          0,
          Math.sin(angle * i) * 0.3
        )
      );
      console.log(ref.current);
    }
  }, []);
  useFrame(() => {
    ref.current.rotation.y += 0.03;
  });
  return (
    <>
      <instancedMesh ref={ref} args={[null, null, count]}>
        <sphereGeometry args={[radius]} />
        <meshStandardMaterial
          attach="material"
          color="deeppink"
          side={THREE.DoubleSide}
        />
      </instancedMesh>
      {/* <EffectComposer>
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
      </EffectComposer> */}
    </>
  );
}
