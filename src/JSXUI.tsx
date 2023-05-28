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
  MeshCollider,
} from "@react-three/rapier";
import { InstancedMesh, Color } from "three";

const MAX_COUNT = 500;

const createBody = (): InstancedRigidBodyProps => ({
  key: Math.random(),
  position: [Math.random() * 1, Math.random() * 1, Math.random() * 1],
  rotation: [
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
  ],
  scale: [0.5 + Math.random(), 0.5 + Math.random(), 0.5 + Math.random()],
  mass: 10,
  linearDamping: 0.95,
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

  return (
    <group>
      <InstancedRigidBodies instances={bodies} ref={api} colliders="hull">
        <instancedMesh
          ref={ref}
          castShadow
          args={[geometry, undefined, MAX_COUNT]}
          count={bodies.length}
          onClick={(evt) => {
            api.current![evt.instanceId!].applyTorqueImpulse(
              {
                x: 0,
                y: 50,
                z: 0,
              },
              true
            );
          }}
        >
          <meshPhysicalMaterial />
        </instancedMesh>
      </InstancedRigidBodies>
    </group>
  );
}

function Mark() {
  const shapes = useLoader(SVGLoader, "/svg/roundedTriangle.svg");

  return (
    <group scale={0.05} rotation={[Math.PI / 2, 0, 0]} position={[-2, -1, 0.5]}>
      {shapes.paths.map((path, i) => (
        <mesh key={i}>
          <shapeGeometry attach="geometry" args={[path.toShapes(true)]} />
          <meshBasicMaterial
            attach="material"
            color={new THREE.Color("#8066CD")}
            side={THREE.DoubleSide}
            transparent
            opacity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

const JSXUI = () => {
  return (
    <Suspense fallback={null}>
      <Physics interpolate debug>
        <Sand />
        <RigidBody type="fixed" colliders="hull" name="floor">
          <Mark />
        </RigidBody>
        <OrbitControls />
      </Physics>
    </Suspense>
  );
};

export default JSXUI;
