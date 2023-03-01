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

export default function App() {
  return (
    <Canvas>
      <color attach="background" args={["#171d6c"]} />
      {/* <Perf position="top-left" /> */}
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      {/* <CustomText /> */}
      {/* <TextWithMask /> */}
      {/* <BoxStencil /> */}
      {/* <MorphTargets /> */}
      {/* <MorphTargetsBox /> */}
      {/* <MorphTargetsPath /> */}
      <FollowCurve />
      <OrbitControls />
    </Canvas>
  );
}
