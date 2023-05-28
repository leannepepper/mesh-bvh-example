import { useLoader } from "@react-three/fiber";
import React, { Suspense } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

function Mark() {
  const shapes = useLoader(SVGLoader, "/svg/roundedTriangle.svg");

  return (
    <>
      {shapes.paths.map((path, i) => (
        <mesh key={i}>
          <shapeBufferGeometry attach="geometry" args={[path.toShapes(true)]} />
          <meshBasicMaterial
            attach="material"
            color="black"
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

const JSXUI = () => {
  return (
    <Suspense fallback={null}>
      <group position={[-1.8, -1.8, 0]} scale={0.05}>
        <Mark />
      </group>
    </Suspense>
  );
};

export default JSXUI;
