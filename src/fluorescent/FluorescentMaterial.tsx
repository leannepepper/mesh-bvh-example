import React, { useRef } from "react";
import * as THREE from "three";
import { DoubleSide } from "three";
import { useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function FluorescentMaterial() {
  const boxRef2 = React.useRef(null);

  return (
    <>
      <Lights />
      <group position={[0, 0, 2]}>
        <mesh ref={boxRef2} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5, 5]} />
          <meshStandardMaterial side={DoubleSide} color={"#ffffff"} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, -1]}>
          <planeGeometry args={[2, 2]} />
          <shaderMaterial attach="material" {...materialProperties} />
        </mesh>
        <mesh position={[0, 0, -2]}>
          <planeGeometry args={[5, 5]} />
          <meshStandardMaterial side={DoubleSide} color={"#ffffff"} />
        </mesh>
      </group>
    </>
  );
}

function Lights() {
  const light = useRef();
  useHelper(light, THREE.SpotLightHelper, "green");
  return (
    <spotLight
      ref={light}
      intensity={5.0}
      position={[0, 0.5, 1.0]}
      //   shadow-mapSize-width={120}
      //   shadow-mapSize-height={32}
      //   castShadow
      shadow-bias={-0.001}
      penumbra={0.5}
      angle={-Math.PI / 6}
      color="green"
    />
  );
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
varying vec2 vUv;
  
uniform float u_concentration;
uniform sampler2D u_emission_spectrum;
uniform sampler2D u_absorption_spectrum;
uniform sampler2D u_reflectance_spectrum;
uniform float u_quantum_yield;

void main() {
    vec3 radiance = vec3(0.0);

    // Get incident and outgoing directions and wavelengths
    vec3 i = normalize(v_incident_dir);
    vec3 o = normalize(v_outgoing_dir);
    float lambda_i = v_incident_wavelength;
    float lambda_o = v_outgoing_wavelength;

    // Calculate fluorescent and non-fluorescent contributions to radiance
    float absorption = texture(u_absorption_spectrum, vec2(lambda_i, 0.0)).r;
    float emission = texture(u_emission_spectrum, vec2(lambda_o, 0.0)).r;
    float reflectance = texture(u_reflectance_spectrum, vec2(lambda_i, 0.0)).r;
    float c = u_concentration;
    float Q = u_quantum_yield;
    vec3 fluorescent_contribution = c * absorption * Q * emission / PI;
    vec3 nonfluorescent_contribution = (1.0 - c * absorption) * reflectance / PI;
    radiance += fluorescent_contribution + nonfluorescent_contribution;

    // Output final radiance
    gl_FragColor = vec4(radiance, 1.0);
    }
`;

const uniforms = {
  u_concentration: { value: 1.0 },
  u_emission_spectrum: { value: new THREE.Texture() },
  u_absorption_spectrum: { value: new THREE.Texture() },
  u_reflectance_spectrum: { value: new THREE.Texture() },
  u_quantum_yield: { value: 0.5 },
};

const materialProperties = {
  uniforms,
  vertexShader,
  fragmentShader,
  side: THREE.DoubleSide,
  transparent: true,
};
