import { Box, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  EffectComposer,
  Pixelation,
  Vignette,
} from "@react-three/postprocessing";
import { Effect } from "postprocessing";
import React, { forwardRef, useMemo } from "react";
import { Uniform, Vector3 } from "three";

const fragmentShader = `
uniform float size;

float circleSDF(vec2 st) {
    float pct = distance(st + vec2(0.5 + (st.x / 0.5), 0.5 + (st.y * 0.4)), vec2(0.5,0.5));
    return pct * 0.14;
}

float stroke(float x, float start, float width) {
    float d = step(start, x + width * 0.5) 
            - step(start, x - width * 0.5);
    return clamp(d, 0.0, 1.0);
}

float fill( float x, float size) {
    return 1.0 - step(size, x);
}

vec2 rotate(vec2 st, float angle) {
    st = mat2(cos(angle), -sin(angle),
         sin(angle), cos(angle)) * (st - 0.5);

    return st + 0.5;
}

float triangleSDF(vec2 st) {
    st = (st * 2.0 - 1.0) * 2.0;

  // Introduce a sine wave pattern to the triangle's edges
    float frequency = 65.0;  // frequency of the wave
    float amplitude = 0.07;  // amplitude of the wave

    float wave = amplitude * sin(frequency * st.x + time);

    return max(abs(st.x) * 1.769025 + (st.y - wave) * 0.5, -st.y * 0.5 );
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 st = uv;
    st.x *= aspect;
    vec3 color = inputColor.rgb;

    vec2 walkingPath = vec2(sin(time) * -cos(time), sin(time));
    st.y = 1.0 - st.y;
    vec2 centeredST = st - (vec2(0.5 , 0.5));
    centeredST = rotate(centeredST, radians(5.0));

    float headSDF= circleSDF(centeredST / vec2(0.2, 0.2));

    vec2 tailOffset = vec2(-0.5, -0.36); // Adjust the tail position
    float tailSDF = triangleSDF(centeredST - tailOffset);

    color += fill(headSDF, 0.1);
    color += fill(tailSDF, 0.2);

    outputColor = vec4(color, inputColor.a);
}
`;

let _uSize;

// Effect implementation
class MyCustomEffectImpl extends Effect {
  constructor(size) {
    super("MyCustomEffect", fragmentShader, {
      uniforms: new Map([["size", new Uniform(size)]]),
    });

    _uSize = size;
  }

  //   update(renderer, inputBuffer, deltaTime) {
  //     this.uniforms.get("weights").value = new Vector3(0.2, 0.5, 1.0);
  //   }
}

// Effect component
type Params = {
  size?: number;
};
export const Ghost = forwardRef(({ size }: Params, ref) => {
  const effect = useMemo(() => new MyCustomEffectImpl(size), [size]);
  return <primitive ref={ref} object={effect} dispose={null} />;
});

export function PostProcessing() {
  const myRef = React.useRef(null);
  return (
    <Canvas
      camera={{
        position: new Vector3(0, 0, 2),
      }}
      gl={{
        powerPreference: "high-performance",
        antialias: false,
        stencil: false,
        depth: false,
      }}
    >
      <color attach="background" args={["#000"]} />
      <Box args={[0.5, 0.5, 0.5]}>
        <meshBasicMaterial color="red" />
      </Box>
      <Box args={[0.2, 0.2, 0.2]} position={[1, 0, 0]}>
        <meshBasicMaterial color="blue" />
      </Box>
      <EffectComposer>
        <Ghost ref={myRef} size={0.001} />
      </EffectComposer>
      <OrbitControls />
    </Canvas>
  );
}
