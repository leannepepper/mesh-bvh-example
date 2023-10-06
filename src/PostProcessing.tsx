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
    return length(st) - 0.5 * 0.5;
}

float stroke(float x, float start, float width) {
    float d = smoothstep(start, x + width * 0.2, x + width * 0.5) 
            - smoothstep(start, x - width * 0.1, x - width * 0.5);
    return clamp(d, 0.0, 1.0);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec3 color = inputColor.rgb;
    vec2 walkingPath = vec2(sin(time), cos(time));
    vec2 centeredUV = uv - (vec2(0.5 , 0.5) * walkingPath);

    float circleSDFValue = circleSDF(centeredUV);
    color += stroke(circleSDFValue, size, -0.03);

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
