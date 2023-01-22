import React, { useEffect } from "react";
import * as THREE from "three";

export const CustomLineSegments = ({ bvh, model }) => {
  console.log({ bvh });
  const ref = React.useRef<THREE.LineSegments>();
  const positions = new Float32Array([
    ...bvh.geometry.attributes.position.array,
  ]);

  // apply the bvh transform to the positions

  const transform = new THREE.Matrix4();
  transform.makeTranslation(-2, 0, 0);

  useEffect(() => {
    if (ref.current) {
      // apply the bvh transform to the ref.current
      ref.current.applyMatrix4(transform);
    }
  }, []);

  return (
    <lineSegments ref={ref}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          count={positions?.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color="red" />
    </lineSegments>
  );
};
