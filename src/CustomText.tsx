import { Text3D } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import React, { useEffect } from "react";
import { useMemo } from "react";
import * as THREE from "three";
import { MeshBVH, MeshBVHVisualizer } from "three-mesh-bvh";

const font = "./fonts/pacifico/pacifico-regular-normal-400.json";

const vertexShader = `
  varying vec3 Normal;
  varying vec3 Position;

  void main() {
    Normal = normalize(normalMatrix * normal);
    Position = vec3(modelViewMatrix * vec4(position, 1.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 Normal;
  varying vec3 Position;

  uniform vec3 Ka;
  uniform vec3 Kd;
  uniform vec3 Ks;
  uniform vec4 LightPosition;
  uniform vec3 LightIntensity;
  uniform float Shininess;

  vec3 phong() {
    vec3 n = normalize(Normal);
    vec3 s = normalize(vec3(LightPosition) - Position);
    vec3 v = normalize(vec3(-Position));
    vec3 r = reflect(-s, n);

    vec3 ambient = Ka;
    vec3 diffuse = Kd * max(dot(s, n), 0.0);
    vec3 specular = Ks * pow(max(dot(r, v), 0.0), Shininess);

    return LightIntensity * (ambient + diffuse + specular);
  }

  void main() {
    vec3 blue = vec3(0.0, 0.0, 1.0);
    gl_FragColor = vec4(blue*phong(), 1.0);
}`;

export const CustomText = () => {
  const ref = React.useRef<THREE.Mesh>();
  const { scene } = useThree();
  const data = useMemo(
    () => ({
      uniforms: {
        Ka: { value: new THREE.Vector3(1, 1, 1) },
        Kd: { value: new THREE.Vector3(1, 1, 1) },
        Ks: { value: new THREE.Vector3(1, 1, 1) },
        LightIntensity: { value: new THREE.Vector4(0.5, 0.5, 0.5, 1.0) },
        LightPosition: { value: new THREE.Vector4(0.0, 2000.0, 0.0, 1.0) },
        Shininess: { value: 200.0 },
      },
      fragmentShader,
      vertexShader,
    }),
    []
  );

  useEffect(() => {
    if (ref.current) {
      const bvh = new MeshBVH(ref.current.geometry);
      ref.current.geometry.boundsTree = bvh;

      const visualizer = new MeshBVHVisualizer(ref.current, 10);
      scene.add(visualizer);
    }
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
        {`three.js`}
        <shaderMaterial attach={"material"} {...data} />
      </Text3D>
    </>
  );
};
