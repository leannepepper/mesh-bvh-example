import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import rockTexture from "./textures/rock.png";

/**
 * Utility Functions
 */
function lerp(a, b, n) {
  return (1 - n) * a + n * b;
}

/**
 * Create the DataTexture and set the data
 */
const size = 32;
const number = size * size;
const data = new Float32Array(number * 4);
for (let i = 0; i < size; i++) {
  for (let j = 0; j < size; j++) {
    const index = i * size + j;
    data[index * 4 + 0] = lerp(-0.5, 0.5, i / (size - 1));
    data[index * 4 + 1] = lerp(-0.5, 0.5, j / (size - 1));
    data[index * 4 + 2] = 0;
    data[index * 4 + 3] = 1;
  }
}

const texture = new THREE.DataTexture(
  data,
  size,
  size,
  THREE.RGBAFormat,
  THREE.FloatType
);
texture.needsUpdate = true;

const renderedVertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform sampler2D uTexture;

  void main() {
    vUv = uv;
    vec3 newPosition = position;
    vec4 color = texture2D(uTexture, vUv);
    newPosition.xy = color.xy;

    vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );

    gl_PointSize =  ( 10.0 / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const renderedFragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform sampler2D uTexture;
void main() {
    gl_FragColor = vec4(vUv, 0.0, 1.0);
}
`;

const fboVertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform sampler2D uCurrentPosition;
uniform sampler2D uOriginalPosition;
uniform vec2 uMouse;

void main() {
    vUv = uv;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    gl_PointSize =  ( 10.0 / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
}
`;

const fboFragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform sampler2D uCurrentPosition;
uniform sampler2D uOriginalPosition;
uniform vec2 uMouse;

void main() {
    vec2 position = texture2D(uCurrentPosition, vUv).xy;
    vec2 original = texture2D(uOriginalPosition, vUv).xy;

    vec2 force = original - uMouse.xy;

    position = original + normalize(force) * 0.1;

    gl_FragColor = vec4(position, 0.0, 1.0);
}
`;

const uniforms = {
  uTime: { value: 0 },
  uTexture: { value: texture },
};

const materialProperties = {
  uniforms,
  vertexShader: renderedVertexShader,
  fragmentShader: renderedFragmentShader,
};

function MyParticles({ renderTarget }) {
  /**
   * Create the BufferGeometry and set the attributes
   */
  const bufferGeometry = useRef<THREE.BufferGeometry>();
  const positions = new Float32Array(number * 3);
  const uvs = new Float32Array(number * 2);

  for (let i = 0; i < number; i++) {
    const i3 = i * 3;
    const i2 = i * 2;

    positions[i3 + 0] = (i % size) / size;
    positions[i3 + 1] = Math.floor(i / size) / size;
    positions[i3 + 2] = 0;

    uvs[i2 + 0] = (i % size) / size;
    uvs[i2 + 1] = Math.floor(i / size) / size;
  }

  useEffect(() => {
    if (bufferGeometry.current) {
      bufferGeometry.current.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      bufferGeometry.current.setAttribute(
        "uv",
        new THREE.BufferAttribute(uvs, 2)
      );
    }
  }, [bufferGeometry]);

  /**
   * Use the RenderTarget as a texture and pass it to the shader
   */
  useEffect(() => {
    if (uniforms.uTexture) {
      uniforms.uTexture.value = renderTarget.texture;
    }
  }, [renderTarget]);

  return (
    <points onClick={(e) => console.log("CLICK!")}>
      <bufferGeometry ref={bufferGeometry} />
      <shaderMaterial attach="material" {...materialProperties} />
    </points>
  );
}

export function FBOTargets() {
  const mouseRef = useRef<THREE.Mesh>();
  const planeRef = useRef<THREE.Mesh>();
  const fboScene = new THREE.Scene();
  const fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -2, 2);
  fboCamera.position.z = 1;
  fboCamera.lookAt(new THREE.Vector3(0, 0, 0));

  /**
   * Create the FBO Mesh, Geometry and Material
   */
  const fboUniforms = {
    uTime: { value: 0 },
    uCurrentPosition: { value: texture },
    uOriginalPosition: { value: texture },
    uMouse: { value: new THREE.Vector2(0, 0) },
  };

  let fboGeometry = new THREE.PlaneGeometry(2, 2, 2, 2);
  let fboMaterial = new THREE.ShaderMaterial({
    uniforms: fboUniforms,
    vertexShader: fboVertexShader,
    fragmentShader: fboFragmentShader,
  });

  let fboMesh = new THREE.Mesh(fboGeometry, fboMaterial);
  fboScene.add(fboMesh);

  let renderTargetA = new THREE.WebGLRenderTarget(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  });

  let renderTargetB = new THREE.WebGLRenderTarget(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  });

  const { gl, scene, camera } = useThree();

  useFrame((state) => {
    fboUniforms.uTime.value = state.clock.elapsedTime;

    const intersections = state.raycaster.intersectObject(planeRef.current);
    // if there is an intersection, set the position of the mouseRef to the first intersection point
    if (intersections.length > 0) {
      mouseRef.current.position.copy(intersections[0].point);
      fboUniforms.uMouse.value = new THREE.Vector2(
        intersections[0].point.x,
        intersections[0].point.y
      );
    }
  });

  // first -3 then -2 then -1
  useFrame((state) => {
    gl.setRenderTarget(renderTargetA);
    gl.render(fboScene, fboCamera);
    gl.setRenderTarget(null);
    gl.render(scene, camera);
  }, -3);

  // swap render targets
  useFrame((state) => {
    const temp = renderTargetA;
    renderTargetA = renderTargetB;
    renderTargetB = temp;
  }, -2);

  useFrame((state) => {
    fboUniforms.uCurrentPosition.value =
      renderTargetB.texture as THREE.DataTexture;
  }, -1);

  return (
    <>
      <MyParticles renderTarget={renderTargetA} />
      <mesh ref={planeRef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial transparent opacity={0.0} />
      </mesh>
      <mesh ref={mouseRef}>
        <sphereGeometry args={[0.01]} />
        <meshNormalMaterial />
      </mesh>
    </>
  );
}

export default function FBOExample() {
  return <FBOTargets />;
}
