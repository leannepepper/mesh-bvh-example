import { OrbitControls, Points, Sparkles } from "@react-three/drei";
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

function getPosition(index): [number, number, number] {
  const offset = -1.75;
  const rowLength = 33;
  const offsetY = index > rowLength ? 1.4 : 1.3;
  const offsetX = index % rowLength;

  const x = offsetX * 0.1 + offset;
  const y = offsetY;
  const z = 0;

  return [x, y, z];
}

const createBody = (index: number): InstancedRigidBodyProps => ({
  key: Math.random(),
  position: getPosition(index),
  mass: 10,
  linearDamping: 10.5,
});

function Sand() {
  const api = useRef<RapierRigidBody[]>([]);
  const ref = useRef<InstancedMesh>(null);

  const [bodies, setBodies] = useState<InstancedRigidBodyProps[]>(() =>
    Array.from({
      length: 66,
    }).map((value, index) => createBody(index))
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

  return (
    <group>
      <InstancedRigidBodies
        // type="fixed"
        instances={bodies}
        ref={api}
        colliders="hull"
      >
        <instancedMesh
          ref={ref}
          castShadow
          args={[geometry, undefined, MAX_COUNT]}
          count={bodies.length}
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
      {/* <RigidBody type="fixed" colliders="hull" name="mark">
        <ConvexHullCollider args={[verticesArray]} />
      </RigidBody> */}

      {shapes.paths.map((path, i) => (
        // <RigidBody key={i} type="fixed" colliders={"trimesh"}>
        <mesh key={i}>
          {/* <extrudeGeometry
            attach="geometry"
            args={[path.toShapes(true), extrudeSettings]}
          /> */}
          <shapeGeometry attach="geometry" args={[path.toShapes(true)]} />
          <meshBasicMaterial
            attach="material"
            color={new THREE.Color("#8066CD")}
            side={THREE.DoubleSide}
            transparent
            opacity={0.2}
          />
          <Sparkles
            position={[37, 25, 0]}
            count={3000}
            scale={[65, 50, 0]}
            size={1.0}
            speed={0.2}
            color={new THREE.Color("lightgreen")}
            noise={3}
          />
        </mesh>
        // </RigidBody>
      ))}
    </group>
  );
}

const JSXUI = () => {
  return (
    <Suspense fallback={null}>
      {/* <Physics> */}
      {/* <Sand /> */}
      <Mark />
      <OrbitControls />
      {/* </Physics> */}
    </Suspense>
  );
};

export default JSXUI;
