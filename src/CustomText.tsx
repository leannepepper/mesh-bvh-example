import { Text3D } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useLayoutEffect, useEffect } from "react";
import * as THREE from "three";
import { Mesh, PlaneHelper } from "three";
import { MeshBVH, MeshBVHVisualizer } from "three-mesh-bvh";

const font = "./fonts/pacifico/pacifico-regular-normal-400.json";

export const CustomText = () => {
  const ref = React.useRef<THREE.Mesh>();
  const localPlanes = [];

  const [data, setData] = React.useState<{
    bvh: MeshBVH;
    model: Mesh;
  } | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const bvh = new MeshBVH(ref.current.geometry);
    setData({ bvh, model: ref.current });
  }, [ref]);

  return (
    <>
      <Text3D
        ref={ref}
        font={font}
        scale={1}
        letterSpacing={0.03}
        height={0.01}
        curveSegments={32}
        position={[-2, 0, 0]}
      >
        {`Three.js`}
        <meshPhongMaterial
          color={0x80ee10}
          shininess={100}
          side={THREE.DoubleSide}
          clippingPlanes={localPlanes}
        ></meshPhongMaterial>
      </Text3D>
    </>
  );
};
