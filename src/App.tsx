import { Text3D, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Perf } from "r3f-perf";
import React from "react";

export default function App() {
  const font = "./fonts/pacifico/pacifico-regular-normal-400.json";
  return (
    <Canvas>
      <Perf position="top-left" />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <Text3D
        font={font}
        scale={1}
        letterSpacing={0.03}
        height={0.01}
        curveSegments={32}
        position={[-2, 0, 0]}
      >
        {`pepper`}
        <meshBasicMaterial wireframe={false} color={"hotpink"} />
      </Text3D>

      <OrbitControls />
    </Canvas>
  );
}
