import { Text3D } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect } from "react";
import * as THREE from "three";

export default function FollowCurve() {
  const cubeRef = React.useRef(null);
  const textRef = React.useRef(null);

  let pathGeometry;
  let curves;

  useEffect(() => {
    if (!textRef.current) return;

    // get the path from the text curves
    curves = new THREE.CurvePath();
    textRef.current.geometry.parameters.shapes.forEach((letter) => {
      letter.curves.forEach((curve) => {
        curves.add(curve);
      });
    });

    // const points = curves.getPoints(10);
    // pathGeometry = new THREE.BufferGeometry().setFromPoints(points);
  }, [textRef]);

  useEffect(() => {
    cubeRef.current.material.stencilWrite = true;
    cubeRef.current.material.depthWrite = false;
    cubeRef.current.material.stencilFunc = THREE.AlwaysStencilFunc;
    cubeRef.current.material.stencilRef = 1;
    cubeRef.current.material.stencilZPass = THREE.ReplaceStencilOp;

    textRef.current.material.stencilWrite = true;
    textRef.current.material.stencilFunc = THREE.EqualStencilFunc;
    textRef.current.material.stencilRef = 1;
  }, []);

  useFrame(() => {
    // move the cube along the path every frame
    if (cubeRef.current) {
      const t = (performance.now() / 50000) % 1;
      const pos = curves.getPointAt(t);
      cubeRef.current.position.set(pos.x, pos.y, 0);
    }
  });

  return (
    <>
      <mesh ref={cubeRef} rotation={[0, 0, 0]}>
        <boxGeometry attach="geometry" args={[1.0, 1.0, 1.0]} />
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
