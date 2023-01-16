import { Text3D } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import React, { useEffect, useLayoutEffect } from "react";
import { useMemo } from "react";
import * as THREE from "three";
import { InstancedMesh, Mesh } from "three";
import { MeshBVH, MeshBVHVisualizer } from "three-mesh-bvh";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";

const font = "./fonts/pacifico/pacifico-regular-normal-400.json";

const Voxels = ({ bvh, model }: { bvh: MeshBVH; model: Mesh }) => {
  const resolution = 10;
  const totalCount = resolution ** 3;
  const ref = React.useRef<InstancedMesh>();

  //   console.log("Voxels", { bvh }, { model });

  const voxelGeometry = useMemo(() => {
    const geometry = new RoundedBoxGeometry(0.1, 0.1, 0.1, 0.1, 0.1);
    geometry.computeBoundingBox();
    return geometry;
  }, []);

  useLayoutEffect(() => {
    ref.current.setMatrixAt(0, new THREE.Matrix4());

    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3().setScalar(0.5);
    const worldMatrix = new THREE.Matrix4();
    const box = new THREE.Box3();
    const invMat = new THREE.Matrix4().copy(model.matrixWorld).invert();

    const ray = new THREE.Ray();
    ray.direction.set(0, 0, 1);

    let voxelCount = 0;

    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        for (let z = 0; z < resolution; z++) {
          position
            .set(
              x / resolution - 0.5,
              y / resolution - 0.5,
              z / resolution - 0.5
            )
            .multiplyScalar(2);
          box.min.setScalar(-0.5 * 2).add(position);
          box.max.setScalar(0.5 * 2).add(position);

          const res = bvh.intersectsBox(box, invMat);

          if (res) {
            voxelCount++;

            worldMatrix.compose(position, quaternion, scale);
            ref.current.setMatrixAt(voxelCount, worldMatrix);
            ref.current.instanceMatrix.needsUpdate = true;
          }
        }
      }
    }
  }, [bvh, model]);

  return (
    <instancedMesh ref={ref} args={[voxelGeometry, null, totalCount]}>
      <meshPhongMaterial color="hotpink" />
    </instancedMesh>
  );
};

export const CustomText = () => {
  const ref = React.useRef<THREE.Mesh>();
  const { scene } = useThree();
  const [voxelData, setVoxelData] = React.useState<{
    bvh: MeshBVH;
    model: Mesh;
  } | null>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      const bvh: MeshBVH = new MeshBVH(ref.current.geometry);

      ref.current.geometry.boundsTree = bvh;

      setVoxelData({
        bvh,
        model: ref.current,
      });

      const visualizer = new MeshBVHVisualizer(ref.current, 10);

      scene.add(visualizer);
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
        {`three.js`}
        <meshPhongMaterial
          attach={"material"}
          color={"#000000"}
          wireframe={true}
        />
      </Text3D>
      {voxelData ? <Voxels {...voxelData} /> : null}
    </>
  );
};
