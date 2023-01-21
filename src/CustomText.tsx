import { Text3D } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useLayoutEffect, useEffect } from "react";
import * as THREE from "three";
import { Mesh } from "three";
import { MeshBVH, MeshBVHVisualizer } from "three-mesh-bvh";
import { CustomLineSegments } from "./CustomLineSegments";

const font = "./fonts/pacifico/pacifico-regular-normal-400.json";

const ClippingPlane = ({ bvh, model }: { bvh: MeshBVH; model: Mesh }) => {
  const ref = React.useRef<THREE.Plane>();

  useEffect(() => {
    if (ref.current) {
      const normal = new THREE.Vector3(0, -1, 0);
      const constant = 0;
      ref.current.normal.copy(normal);
      ref.current.constant = constant;
    }
  }, []);

  return null;
};

export const CustomText = () => {
  const ref = React.useRef<THREE.Mesh>();
  const { scene } = useThree();
  const [data, setData] = React.useState<{
    bvh: MeshBVH;
    model: Mesh;
  } | null>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      const bvh: MeshBVH = new MeshBVH(ref.current.geometry);
      ref.current.geometry.boundsTree = bvh;

      setData({ bvh, model: ref.current });

      const visualizer = new MeshBVHVisualizer(ref.current, 10);
      //   scene.add(visualizer);
    }
  }, []);

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
          clippingPlanes={
            [
              // new THREE.Plane(new THREE.Vector3(0, -1, 1), 0),
              //new THREE.Plane(new THREE.Vector3(0, 1, 1), 0),
              // new THREE.Plane(new THREE.Vector3(-1, 0, 1), 0),
              // new THREE.Plane(new THREE.Vector3(1, 0, 1), 0),
            ]
          }
        ></meshPhongMaterial>
      </Text3D>
      <CustomLineSegments />
    </>
  );
};
