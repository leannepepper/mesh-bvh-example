import { Text3D } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
// import { StencilPass } from "three/examples/jsm/postprocessing/StencilPass";
import * as THREE from "three";
import { TextFill } from "./TextFill";

const scene2 = new THREE.Scene();

scene2.background = new THREE.Color(0xff0000);
const target = new THREE.WebGLRenderTarget(
  window.innerWidth,
  window.innerHeight,
  {
    stencilBuffer: false,
  }
);

window.addEventListener("resize", () => {
  target.setSize(window.innerWidth, window.innerHeight);
});

export function TextWithMask() {
  const textRef = useRef(null);
  const textMask = useRef(null);
  const { camera } = useThree();

  useFrame((state) => {
    state.gl.setRenderTarget(target);
    state.gl.render(scene2, camera);
    state.gl.setRenderTarget(null);
  });

  useEffect(() => {
    if (!textMask.current || !textRef.current) return;
    textRef.current.material.envMapIntensity = 3.5;

    textMask.current.material.side = THREE.DoubleSide;
    textMask.current.material.transparent = false;
    textMask.current.material.stencilWrite = true;
    textMask.current.material.stencilRef = 1;
    textMask.current.material.stencilFunc = THREE.AlwaysStencilFunc;
    textMask.current.material.stencilZPass = THREE.ReplaceStencilOp;
  }, [textMask, textRef]);

  return (
    <>
      <Text3D
        ref={textRef}
        font={font}
        scale={1}
        letterSpacing={0.03}
        height={0.01}
        curveSegments={32}
        position={[-2, 0, 0]}
      >
        {`Three.js`}
      </Text3D>

      <Text3D
        ref={textMask}
        font={font}
        scale={1}
        letterSpacing={0.03}
        height={0.01}
        curveSegments={32}
        position={[-2, 0, 0]}
      >
        {`Three.js`}
      </Text3D>
      <TextFill map={target.texture} maskId={1} />
    </>
  );
}

const font = "./fonts/pacifico/pacifico-regular-normal-400.json";
