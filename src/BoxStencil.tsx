import { useFrame } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";
import { ConeGeometry, ShapePath } from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
varying vec2 vUv;
uniform sampler2D map;
void main() {
   vec3 col = vec3(0.2, 0.2, 0.2);
    gl_FragColor = vec4(pow(col, vec3(1.75)) * 2.5, 1.0);
}
`;

const uniforms = {
  map: { type: "t", value: null },
};

const materialProperties = {
  uniforms,
  vertexShader,
  fragmentShader,
  depthWrite: false,
  stencilWrite: true,
  stencilFunc: THREE.EqualStencilFunc,
};

export default function BoxStencil() {
  const cubeFace = React.useRef(null);
  const objectRef = React.useRef(null);
  const boxRef2 = React.useRef(null);

  const x = 0,
    y = 0;
  const heartShape = new THREE.Shape();

  heartShape.moveTo(x + 5, y + 5);
  heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
  heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
  heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
  heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
  heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
  heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

  const shape = new THREE.ShapeGeometry(heartShape);

  React.useEffect(() => {
    cubeFace.current.material.stencilWrite = true;
    cubeFace.current.material.depthWrite = false;
    cubeFace.current.material.stencilFunc = THREE.AlwaysStencilFunc;
    cubeFace.current.material.stencilRef = 1;
    cubeFace.current.material.stencilZPass = THREE.ReplaceStencilOp;

    objectRef.current.material.stencilWrite = true;
    objectRef.current.material.stencilFunc = THREE.EqualStencilFunc;
    objectRef.current.material.stencilRef = 1;
  }, []);

  //   React.useEffect(() => {
  //     boxRef2.current.material.stencilWrite = true;
  //     boxRef2.current.material.stencilFunc = THREE.EqualStencilFunc;
  //     boxRef2.current.material.stencilRef = 1;
  //     boxRef2.current.material.stencilMask = 1;
  //     boxRef2.current.material.stencilFail = THREE.ReplaceStencilOp;
  //     boxRef2.current.material.stencilZFail = THREE.ReplaceStencilOp;
  //     boxRef2.current.material.stencilZPass = THREE.ReplaceStencilOp;
  //   }, []);

  useFrame(({ gl, scene, camera }, delta) => {
    // occasalate the position of the cube
    //cubeFace.current.position.x += Math.sin(delta) * 0.5;
  });

  return (
    <>
      <mesh ref={cubeFace} geometry={shape} rotation={[0, 0, 180]}>
        <meshBasicMaterial
          attach="material"
          color="white"
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={objectRef} position={[0, 0, 0]}>
        <coneGeometry attach="geometry" args={[0.5, 1, 32]} />
        <meshBasicMaterial attach="material" color="green" />
      </mesh>

      {/* <mesh ref={boxRef2}>
        <boxGeometry attach="geometry" args={[1, 1, 1]} />
        <shaderMaterial attach="material" {...materialProperties} />
      </mesh> */}
    </>
  );
}
