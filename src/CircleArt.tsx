import { useFrame } from "@react-three/fiber";
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

interface BloomProps {
  blendFunction: number;
  luminanceThreshold?: number;
  luminanceSmoothing?: number;
  height?: number;
  intensity?: number;
}

const bloomProps: BloomProps = {
  blendFunction: 0,
  luminanceThreshold: 0.1,
  height: 200,
  intensity: 1.0,
};

export default function CircleArt() {
  const pinkRef = useRef(null);
  const blueRef = useRef(null);

  useFrame(() => {
    const pinkMesh = pinkRef.current;
    const blueMesh = blueRef.current;
  });

  return (
    <>
      <PinkCircles ref={pinkRef} />
      <BlueCircles ref={blueRef} />
      <EffectComposer>
        <Bloom {...bloomProps} />
      </EffectComposer>
    </>
  );
}

const PinkCircles = forwardRef(function PinkCircles(
  props,
  ref: React.RefObject<THREE.InstancedMesh>
) {
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
    }
  }, []);

  useFrame(() => {
    ref.current.rotation.y += 0.01;
  });

  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <sphereGeometry args={[radius]} />
      <meshStandardMaterial
        attach="material"
        color="deeppink"
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
});

const BlueCircles = forwardRef(function BlueCircles(
  props,
  ref: React.RefObject<THREE.InstancedMesh>
) {
  const count = 6;
  const radius = 0.025;
  const angle = (Math.PI * 2) / count;

  useLayoutEffect(() => {
    for (let i = 0; i < count; i++) {
      ref.current.setMatrixAt(
        i,
        new THREE.Matrix4().makeTranslation(
          Math.cos(angle * i) * 0.2,
          0,
          Math.sin(angle * i) * 0.2
        )
      );
    }
  }, []);

  useFrame(({ clock: { elapsedTime } }) => {
    ref.current.rotation.y -= 0.01;

    for (let i = 0; i < count; i++) {
      ref.current.setMatrixAt(
        i,
        new THREE.Matrix4().makeTranslation(
          Math.cos(angle * i) * (Math.sin(elapsedTime) * 0.3),
          0,
          Math.sin(angle * i) * (Math.sin(elapsedTime) * 0.3)
        )
      );
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <sphereGeometry args={[0.05]} />
      <meshStandardMaterial
        attach="material"
        color="lightblue"
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
});
