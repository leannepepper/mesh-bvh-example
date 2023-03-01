import { useFrame } from "@react-three/fiber";
import React, { useEffect } from "react";
import * as THREE from "three";

export default function FollowCurve() {
  const cube = React.useRef(null);
  const line = React.useRef(null);

  const curve = new THREE.CubicBezierCurve(
    new THREE.Vector2(-5, 0),
    new THREE.Vector2(-2, 5),
    new THREE.Vector2(10, 5),
    new THREE.Vector2(5, 0)
  );

  const points = curve.getPoints(50);
  const pathGeometry = new THREE.BufferGeometry().setFromPoints(points);

  // move the cube along the path every frame
  useFrame(() => {
    if (cube.current) {
      const t = (performance.now() / 10000) % 1;
      const pos = curve.getPointAt(t);

      cube.current.position.set(pos.x, pos.y, 0);
      //cube.current.lookAt(curve.getPointAt(t + 0.01));
    }
  });

  return (
    <>
      <mesh ref={cube} rotation={[0, 0, 0]}>
        <boxGeometry attach="geometry" args={[1, 1, 1]} />
        <meshBasicMaterial attach="material" color="white" />
      </mesh>
      <line ref={line}>
        <bufferGeometry attach="geometry" {...pathGeometry} />
        <lineBasicMaterial attach="material" color="yellow" />
      </line>
    </>
  );
}
