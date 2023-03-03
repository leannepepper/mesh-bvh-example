import { Text3D } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect } from "react";
import * as THREE from "three";

export default function FollowCurve() {
  const cube = React.useRef(null);
  const textRef = React.useRef(null);

  let pathGeometry;
  let curves;

  useEffect(() => {
    if (!textRef.current) return;

    curves = new THREE.CurvePath();

    textRef.current.geometry.parameters.shapes.forEach((letter) => {
      letter.curves.forEach((curve) => {
        curves.add(curve);
      });
    });

    const points = curves.getPoints(10);
    pathGeometry = new THREE.BufferGeometry().setFromPoints(points);
  }, [textRef]);

  // move the cube along the path every frame
  useFrame(() => {
    if (cube.current) {
      const t = (performance.now() / 50000) % 1;
      const pos = curves.getPointAt(t);

      cube.current.position.set(pos.x, pos.y, 0);
      //cube.current.lookAt(curve.getPointAt(t + 0.01));
    }
  });

  return (
    <>
      <mesh ref={cube} rotation={[0, 0, 0]}>
        <boxGeometry attach="geometry" args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial attach="material" color="hotpink" />
      </mesh>

      <Text3D
        ref={textRef}
        font={font}
        scale={1}
        letterSpacing={0.03}
        height={0.01}
        curveSegments={32}
        position={[0, 0, 0]}
      >
        {`Three.js`}
        <meshPhongMaterial
          color={0x80ee10}
          shininess={100}
          side={THREE.DoubleSide}
          wireframe={false}
        ></meshPhongMaterial>
      </Text3D>
    </>
  );
}

const font = "./fonts/pacifico/pacifico-regular-normal-400.json";
