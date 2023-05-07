import { useFrame } from "@react-three/fiber";
import React, { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

interface BloomProps {
  blendFunction: number;
  luminanceThreshold?: number;
  luminanceSmoothing?: number;
  height?: number;
  intensity?: number;
}

export default function CircleArt() {
  const ref = useRef(null);
  const count = 6;
  const angle = (Math.PI * 2) / count;
  const radius = 0.05;

  const bloomProps: BloomProps = {
    blendFunction: 0,
    luminanceSmoothing: 0.025,
    luminanceThreshold: 0.1,
    height: 100,
    intensity: 0.7,
  };

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
    //ref.current.rotation.y += 0.03;
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
      <EffectComposer>
        <Bloom {...bloomProps} />
      </EffectComposer>
    </>
  );
}
