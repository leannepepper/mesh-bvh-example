import { OrbitControls, Sparkles } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import React, { Suspense } from 'react'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { shaderMaterial, useFBO, useTexture } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import createStore from 'zustand'

import { useEffect, useRef, useState } from 'react'

import { Vector2 } from 'three'

const useStore = createStore((set, get) => ({
  fields: {
    sphereField: {
      radius: 12,
      position: new THREE.Vector3(0, 0, 100),
      range: [0, 10],
      falloff: undefined
    }
  },
  rTarget: null,
  gTarget: null,
  bTarget: null,
  aTarget: null,
  transforming: false,
  orbitControls: null
}))

function Mark () {
  const shapes = useLoader(SVGLoader, '/svg/roundedTriangle.svg')

  const vertices = shapes.paths[0].toShapes(true)[0].getPoints()
  const points = vertices.map(vertex => [vertex.x, vertex.y, 0])
  const verticesArray = new Float32Array(points.flat())

  return (
    <group scale={0.05} rotation={[Math.PI, 0, 0]} position={[-2, 1.5, 0.5]}>
      {shapes.paths.map((path, i) => (
        <mesh key={i}>
          <shapeGeometry attach='geometry' args={[path.toShapes(true)]} />
          <meshBasicMaterial
            attach='material'
            color={new THREE.Color('#8066CD')}
            side={THREE.DoubleSide}
            transparent
            opacity={0.2}
          />
          <Sparkles
            position={[37, 25, 0]}
            count={1000}
            scale={[65, 50, 10]}
            size={0.5}
            speed={0.1}
            color={new THREE.Color('lightgreen')}
            noise={3}
          />
        </mesh>
      ))}
    </group>
  )
}

const defaultVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vUv = uv;
}`

export const DepthSampleMaterial = shaderMaterial(
  {
    u_depth: null,
    u_resolution: [window.innerWidth, window.innerHeight],
    cameraNear: 0,
    cameraFar: 1
  },
  defaultVertexShader,
  /* glsl */ `
#include <packing>
  
varying vec2 vUv;
uniform sampler2D u_depth;

uniform float cameraNear;
uniform float cameraFar;

float readDepth( sampler2D depthSampler, vec2 coord ) {
  float fragCoordZ = texture2D( depthSampler, coord ).x;
  float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
  return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
}

void main() {
  float depth = readDepth( u_depth, vUv );

  gl_FragColor.rgb = 1.0 - vec3( depth );
  gl_FragColor.a = 1.0;
}
`
)

const DepthFadeMaterial = shaderMaterial(
  {
    u_depth: null,
    u_resolution: new Vector2(0, 0),
    u_map: null,
    u_range: new Vector2(0, 1),
    u_time: 0,
    cameraNear: 0,
    cameraFar: 1
  },
  /* glsl */ `
varying float vWorldZ;
varying vec2 vUv;

void main() {

    vec4 instancePosition = instanceMatrix * vec4(position, 1.);
    vec4 worldPosition = modelMatrix *  instancePosition;
    vec4 viewPosition = viewMatrix * worldPosition;

    vUv = uv;
  
    gl_Position = projectionMatrix  * viewPosition;
    vWorldZ = viewPosition.z;
}
`,
  /* glsl */ `
#include <packing>
  
uniform sampler2D u_depth;
uniform vec2 u_resolution;
uniform sampler2D u_map;
uniform float u_time;

uniform float cameraNear;
uniform float cameraFar;

uniform vec2 u_range;

varying vec2 vUv;
varying float vWorldZ;

float readDepth( sampler2D depthSampler, vec2 coord ) {
  float fragCoordZ = texture2D( depthSampler, coord ).x;
  float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
  return viewZ;
}

void main() {
  vec2  sUv = gl_FragCoord.xy / u_resolution;
  float depth = readDepth( u_depth, sUv);

  float x = vWorldZ - depth;

  x = smoothstep(u_range.x, u_range.y, x);

  vec4 color = texture2D(u_map, vUv);

  gl_FragColor.rgb = vec3(color.rgb);
  gl_FragColor.a = min(color.a * 2., x);
}
`
)

extend({ DepthFadeMaterial })

function MyParticles ({ depthTexture, ...props }) {
  const camera = useThree(state => state.camera)
  const smoke = useTexture('./textures/smoke.png')
  const dfMaterial = useRef(null)
  const instance = useRef(null)

  useFrame(({ clock }) => {
    if (dfMaterial.current) {
      dfMaterial.current.uniforms.u_time.value = clock.getElapsedTime()
      dfMaterial.current.uniforms.u_range.value.set(0, 10)
    }
  })

  const NUM = 2
  const [objects] = useState(() =>
    [...new Array(NUM * NUM)].map(() => new THREE.Object3D())
  )

  useEffect(() => {
    let id = 0

    for (let x = -NUM / 2; x < NUM / 2; x += 1) {
      for (let y = -NUM / 2; y < NUM / 2; y += 1) {
        objects[id].position.set(
          Math.sin(x + y) * Math.random() * 2,
          Math.cos(x + y) * Math.random() * 2,
          Math.random() * 0.8
        )

        objects[id].rotation.set(0, 0, Math.random() * Math.PI)
        objects[id].scale.setScalar(Math.random() * 4 + 1)

        // set direction of rotation randomly
        const randomDirection = Math.random() > 0.5 ? 1 : -1
        objects[id].randomDirection = randomDirection

        objects[id].updateMatrix()
        instance.current.setMatrixAt(id, objects[id++].matrix)
      }
    }
    instance.current.instanceMatrix.needsUpdate = true
  })

  useFrame(({ clock }) => {
    let id = 0

    for (let x = 0; x < NUM * NUM; x++) {
      objects[id].rotation.z += 0.003 * objects[id].randomDirection

      objects[id].updateMatrix()
      instance.current.setMatrixAt(id, objects[id++].matrix)
    }

    instance.current.instanceMatrix.needsUpdate = true
  })

  const size = useThree(({ size }) => size)

  return (
    <>
      <instancedMesh ref={instance} args={[null, null, NUM * NUM]}>
        <planeGeometry args={[1, 1]} />
        <depthFadeMaterial
          ref={dfMaterial}
          cameraNear={camera.near}
          cameraFar={camera.far}
          transparent
          depthWrite={false}
          u_map={smoke}
          u_resolution={[size.width, size.height]}
          u_depth={depthTexture}
        />
      </instancedMesh>
    </>
  )
}

function Scene () {
  useStore(state => state.rTarget)

  const depthFBO = useFBO(window.innerWidth, window.innerHeight)

  useEffect(() => {
    if (depthFBO) {
      depthFBO.depthBuffer = true
      depthFBO.depthTexture = new THREE.DepthTexture()
      depthFBO.depthTexture.format = THREE.DepthFormat
      depthFBO.depthTexture.type = THREE.UnsignedShortType
    }
  }, [depthFBO])

  useEffect(() => {
    useStore.setState({
      rTarget: depthFBO
    })
  })

  useFrame(({ gl, scene, camera }) => {
    gl.setRenderTarget(depthFBO)
    gl.render(scene, camera)
  }, -2)

  return (
    <>
      <MyParticles depthTexture={depthFBO?.depthTexture} />
      <Mark />
    </>
  )
}

useTexture.preload('./textures/smoke.png')

function Render () {
  useFrame(({ gl }) => {
    gl.autoClear = false
  }, -1)

  useFrame(({ gl, camera, scene }) => {
    // render main scene
    gl.setRenderTarget(null)
    gl.render(scene, camera)
  }, 1)

  return null
}

const JSXUI = () => {
  return (
    <>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <Render />
      <OrbitControls />
    </>
  )
}

export default JSXUI
