import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import React from "react";
import { CustomText } from "./CustomText";
import { TextWithMask } from "./TextWithMask";

export default function App() {
  return (
    <Canvas>
      <Perf position="top-left" />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      {/* <CustomText /> */}
      <TextWithMask />
      <OrbitControls />
    </Canvas>
  );
}
