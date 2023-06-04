import { OrbitControls, Points, Stars } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import React, { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import {
  Physics,
  InstancedRigidBodies,
  InstancedRigidBodyProps,
  RapierRigidBody,
  RigidBody,
  ConvexHullCollider,
} from "@react-three/rapier";
import { InstancedMesh, Color } from "three";

const MAX_COUNT = 500;
const extrudeSettings = {
  steps: 2,
  depth: 26,
  bevelEnabled: false,
  bevelThickness: 1,
  bevelSize: 1,
  bevelOffset: 0,
  bevelSegments: 1,
};

function getRandomNumber(min, max) {
  const randomNumber = Math.random() * (max - min) + min;
  return randomNumber;
}

const createBody = (): InstancedRigidBodyProps => ({
  key: Math.random(),
  position: [getRandomNumber(-1.7, 1.5), 1, getRandomNumber(-0.7, 0.5)],
  mass: 10,
  linearDamping: 0.5,
});

function Sand() {
  const api = useRef<RapierRigidBody[]>([]);
  const ref = useRef<InstancedMesh>(null);

  const [bodies, setBodies] = useState<InstancedRigidBodyProps[]>(() =>
    Array.from({
      length: 100,
    }).map(() => createBody())
  );

  useEffect(() => {
    if (ref.current) {
      for (let i = 0; i < MAX_COUNT; i++) {
        ref.current!.setColorAt(i, new Color(Math.random() * 0xffffff));
      }
      ref.current!.instanceColor!.needsUpdate = true;
    }
  }, []);

  const geometry = new THREE.SphereGeometry(0.05, 32, 32);

  const handleFall = (instanceId: number) => {
    api.current![instanceId].setLinvel(new THREE.Vector3(0, -1, 0), true);
  };

  return (
    <group>
      <InstancedRigidBodies instances={bodies} ref={api} colliders="hull">
        <instancedMesh
          ref={ref}
          castShadow
          args={[geometry, undefined, MAX_COUNT]}
          count={bodies.length}
          onClick={(evt) => handleFall(evt.instanceId!)}
        >
          <meshPhysicalMaterial />
        </instancedMesh>
      </InstancedRigidBodies>
    </group>
  );
}

function Mark() {
  const shapes = useLoader(SVGLoader, "/svg/roundedTriangle.svg");

  const vertices = shapes.paths[0].toShapes(true)[0].getPoints();
  const points = vertices.map((vertex) => [vertex.x, vertex.y, 0]);
  const verticesArray = new Float32Array(points.flat());

  return (
    <group scale={0.05} rotation={[Math.PI, 0, 0]} position={[-2, 1.5, 0.5]}>
      <RigidBody type="fixed" colliders="hull" name="mark">
        <ConvexHullCollider args={[verticesArray]} />
      </RigidBody>

      {shapes.paths.map((path, i) => (
        <RigidBody key={i} type="fixed" colliders={"trimesh"}>
          <mesh>
            <extrudeGeometry
              attach="geometry"
              args={[path.toShapes(true), extrudeSettings]}
            />
            <meshBasicMaterial
              attach="material"
              color={new THREE.Color("#8066CD")}
              side={THREE.DoubleSide}
              transparent
              opacity={0.2}
            />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}

const JSXUI = () => {
  return (
    <Suspense fallback={null}>
      <Physics interpolate>
        <Sand />
        {/* <RigidBody type="fixed" colliders="hull" name="floor"> */}
        <Mark />
        {/* </RigidBody> */}
        <OrbitControls />
      </Physics>
    </Suspense>
  );
};

export default JSXUI;
