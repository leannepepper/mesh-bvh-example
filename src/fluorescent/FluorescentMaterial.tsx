import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { DoubleSide } from "three";
import { useHelper } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function FluorescentMaterial() {
  const geomRef = new THREE.PlaneGeometry(2, 2, 32, 32);

  const incidentDirs = [];

  useEffect(() => {
    for (let i = 0; i < geomRef.attributes.position.count; i++) {
      incidentDirs.push(new THREE.Vector3(1, 1, 1));
    }

    const incidentDirsAttribute = new THREE.BufferAttribute(
      new Float32Array(incidentDirs.length * 3),
      3
    );
    incidentDirsAttribute.copyArray(incidentDirs);

    geomRef.setAttribute("a_incident_dir", incidentDirsAttribute);
    console.log({ geomRef });
  }, []);

  return (
    <>
      <Lights />
      <group position={[0, 0, 2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5, 5]} />
          <meshStandardMaterial side={DoubleSide} color={"#ffffff"} />
        </mesh>
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0.01, -1]}
          geometry={geomRef}
        >
          {/* <planeGeometry args={[2, 2, 32, 32]} /> */}
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
      shadow-bias={-0.001}
      penumbra={0.5}
      angle={-Math.PI / 6}
      color="green"
    />
  );
}

const vertexShader = `
  varying vec2 vUv;
  varying vec3 v_incident_dir;
  varying vec3 v_outgoing_dir;
  varying float v_incident_wavelength;
  varying float v_outgoing_wavelength;

  attribute vec3 a_incident_dir;
  attribute vec3 a_outgoing_dir;
  attribute float a_incident_wavelength;
  attribute float a_outgoing_wavelength;
  
  void main() {
    vUv = uv;
    v_incident_dir = a_incident_dir;
    v_outgoing_dir = a_outgoing_dir;
    v_incident_wavelength = a_incident_wavelength;
    v_outgoing_wavelength = a_outgoing_wavelength;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 v_incident_dir;
varying vec3 v_outgoing_dir;
varying float v_incident_wavelength;
varying float v_outgoing_wavelength;
  
uniform float u_concentration;
uniform sampler2D u_emission_spectrum;
uniform sampler2D u_absorption_spectrum;
uniform sampler2D u_reflectance_spectrum;
uniform float u_quantum_yield;

#define PI 3.14159265359

void main() {
    vec3 radiance = vec3(0.0);

    // Get incident and outgoing directions and wavelengths
    //vec3 i = normalize(v_incident_dir);
    vec3 o = normalize(v_outgoing_dir);
    float lambda_i = v_incident_wavelength;
    float lambda_o = v_outgoing_wavelength;

    // Calculate fluorescent and non-fluorescent contributions to radiance
    float absorption = texture(u_absorption_spectrum, vec2(lambda_i, 0.0)).r;
    float emission = texture(u_emission_spectrum, vec2(lambda_o, 0.0)).r;
    float reflectance = texture(u_reflectance_spectrum, vec2(lambda_i, 0.0)).r;
    float c = u_concentration;
    float Q = u_quantum_yield;
    float fluorescent_contribution = c * absorption * Q * emission / PI;
    float nonfluorescent_contribution = (1.0 - c * absorption) * reflectance / PI;
    radiance += fluorescent_contribution + nonfluorescent_contribution;

    // Output final radiance
    gl_FragColor = vec4(vec3(radiance), 1.0);
    //gl_FragColor = vec4(v_incident_dir.x, v_incident_dir.y, v_incident_dir.z, 1.0);
}
`;

const uniforms = {
  u_concentration: { value: 0.5 },
  u_emission_spectrum: { value: new THREE.Texture() },
  u_absorption_spectrum: { value: new THREE.Texture() },
  u_reflectance_spectrum: { value: new THREE.Texture() },
  u_quantum_yield: { value: 0.5 },
};

const attributes = {
  a_incident_dir: { value: new THREE.Vector3(0.5, 1, 1) },
  a_outgoing_dir: { value: new THREE.Vector3(0, 0, 1) },
  a_incident_wavelength: { value: 400 },
  a_outgoing_wavelength: { value: 500 },
};

const materialProperties = {
  uniforms,
  attributes,
  vertexShader,
  fragmentShader,
  side: THREE.DoubleSide,
  //transparent: true,
};
