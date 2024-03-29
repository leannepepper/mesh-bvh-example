import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import React from "react";
import BoxStencil from "./BoxStencil";
import { CustomText } from "./CustomText";
import { TextWithMask } from "./TextWithMask";
import MorphTargets from "./MorphTargets";
import MorphTargetsBox from "./MorphTargetsBox";
import MorphTargetsPath from "./MorphTargetsPath";
import FollowCurve from "./FollowCurve";
import FluorescentMaterial from "./fluorescent/FluorescentMaterial";
import CircleArt from "./CircleArt";
import JSXUI from "./JSXUI";
import * as THREE from "three";
import FBOExample from "./FBOExample";
import { PostProcessing } from "./PostProcessing";

export default function App() {
  return (
    <Canvas
      camera={{
        //position: [0, 0.4, 1.2],
        position: new THREE.Vector3(0, 0, 1),
        near: 0.01,
        far: 300,
      }}
    >
      {/* <color attach="background" args={["#171d6c"]} /> */}
      {/* <Perf position="top-left" /> */}
      <ambientLight intensity={0.5} />
      <CustomText />
      {/* <TextWithMask /> */}
      {/* <BoxStencil /> */}
      {/* <MorphTargets /> */}
      {/* <MorphTargetsBox /> */}
      {/* <MorphTargetsPath /> */}
      {/* <FollowCurve /> */}
      {/* <CircleArt /> */}
      {/* <FluorescentMaterial /> */}
      {/* <JSXUI /> */}
      {/* <FBOExample /> */}
      <OrbitControls />
    </Canvas>
    // <PostProcessing />
  );
}
