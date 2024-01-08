import { useFrame, useLoader } from "@react-three/fiber";
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { GLSL3, Quaternion, Vector3 } from "three";
import { GLTFLoader } from "three-stdlib";

interface PathVertex {
  // position of this point
  position: Vector3;
  // distance form this point to the previous one
  distance: number;
  // direction from this point to the next
  direction: Vector3;
  // rotation from the prev point to this one
  rotation: Quaternion;
  // rotation from the first point to this one
  addedQuaternion: Quaternion;
}

interface PathVertices {
  pathVertices: PathVertex[];
  totalDistance: number;
  numVertices: number;
}

interface BranchUniforms {
  progress: { value: number };
  branchRadius: { value: number };
  branchGrowOffset: { value: number };
}

// Create some default uniforms
const branchUniforms: BranchUniforms = {
  progress: { value: 0 },
  branchRadius: { value: 0.02 },
  branchGrowOffset: { value: 0.0 },
};

const finishedSegments = [];
export const CustomText = () => {
  const textModel = useLoader(GLTFLoader, "/models/TextCurves7.gltf") as any;

  const textMeshs = useMemo(() => {
    return Object.values(textModel.nodes).filter(
      (node: any) =>
        node.name.startsWith("CurveMesh") && node.type === "LineSegments"
    ) as THREE.LineSegments[];
  }, [textModel]);

  const segmentIsFinished = (index) => {
    finishedSegments.push(index);
  };

  if (!textMeshs) return null;

  return (
    <>
      {textMeshs.map((textMesh, index) => (
        <Letter
          key={index}
          index={index}
          line={textMesh}
          finishCallback={segmentIsFinished}
        />
      ))}
    </>
  );
};

const Letter = (props) => {
  const { line, finishCallback, index } = props;
  const [uniforms, setUniforms] = React.useState(branchUniforms);
  const [grow, setGrow] = React.useState(0.0);

  const { letterMesh, letterPath } = useMemo(() => {
    return getBranchMesh(line.clone(true), uniforms);
  }, [line, uniforms.progress.value]);

  // The grow value will be used to update the progress uniform
  useEffect(() => {
    return setUniforms({
      ...uniforms,
      progress: { value: grow },
    });
  }, [grow]);

  useFrame(() => {
    // if the index is 0 then start the grow animation. Otherwise, wait for the previous letter to finish
    if (index > 0 && !finishedSegments.includes(index - 1)) return;
    if (grow >= 1.0) {
      finishCallback(index);
      return;
    }
    const growFactor = grow >= 1.0 ? 0.0 : grow + 0.01;
    setGrow(growFactor);
  });

  return (
    <primitive
      object={letterMesh}
      position={[0, 0, -1]}
      rotation={[0, -Math.PI / 2, 0]}
    />
  );
};

const getBranchMesh = (
  branch: THREE.LineSegments,
  branchUniforms: BranchUniforms
) => {
  const branchPath = verticesFromLineSegment(branch);
  const { pathVertices, totalDistance, numVertices } = branchPath;

  const branchMaterial = new THREE.ShaderMaterial({
    name: branch.name + "material",
    vertexShader: branchVertexShader,
    fragmentShader: branchFragmentShader,
    glslVersion: GLSL3,
    defines: {
      NUM_VERTICES: numVertices,
    },
    uniforms: {
      pathVertices: {
        value: pathVertices,
      },
      totalDistance: { value: totalDistance },
      ...branchUniforms,
    },
  });

  const branchResolution = 20;
  const normalizedCylinder = new THREE.CylinderGeometry(
    1,
    1,
    1,
    branchResolution, // radialSegments
    numVertices * 2 // heightSegments
  );

  const branchMesh = new THREE.Mesh(normalizedCylinder, branchMaterial);
  return {
    letterMesh: branchMesh,
    letterPath: branchPath,
    position: branch.position,
    rotation: branch.rotation,
  };
};

const verticesFromLineSegment = (line: THREE.LineSegments): PathVertices => {
  const positions = line.geometry.attributes.position.array;
  const index = line.geometry.index;
  const vertices: Vector3[] = [];
  const useIndexes = new Set<number>();

  // build vertices using index
  for (let i = 0; i < index.array.length; i++) {
    const vertexIndex = index.array[i];

    if (useIndexes.has(vertexIndex)) continue;
    useIndexes.add(vertexIndex);

    vertices.push(
      new Vector3(
        positions[vertexIndex * 3],
        positions[vertexIndex * 3 + 1],
        positions[vertexIndex * 3 + 2]
      )
    );
  }
  // remove duplicates from vertices
  const uniqueVertices = vertices.filter((v, i) => {
    return vertices.findIndex((v2) => v2.equals(v)) === i;
  });

  return vectorsToPathVertices(uniqueVertices);
};

const vectorsToPathVertices = (vertices: Vector3[]): PathVertices => {
  const numVertices = vertices.length;

  let totalDistance = 0;

  const distances = vertices.map((v, i) => {
    if (i === 0) return 0;
    const dist = v.distanceTo(vertices[i - 1]);
    totalDistance += dist;
    return dist;
  });

  let prevDirection = new Vector3(0, 1, 0);

  const addedQuaternions = new Quaternion(0, 0, 0, 1);

  const pathVertices: PathVertex[] = vertices.map((v, i) => {
    const direction = new Vector3();
    if (i < vertices.length - 1) {
      direction
        .copy(vertices[i + 1])
        .sub(v)
        .normalize();
    } else {
      // final vertex
      direction.copy(prevDirection);
    }
    const rotation = new Quaternion().setFromUnitVectors(
      direction,
      prevDirection
    );

    if (i === 0) {
      addedQuaternions.copy(rotation);
    } else {
      addedQuaternions.multiplyQuaternions(addedQuaternions, rotation);
    }

    prevDirection.copy(direction);

    return {
      position: v,
      distance: distances[i],
      direction,
      rotation,
      addedQuaternion: addedQuaternions.clone(),
    };
  });

  return {
    pathVertices,
    totalDistance,
    numVertices,
  };
};

/** VERTEX SHADER */

const getPositionOnPath = /* glsl */ `
PathPos getPositionOnPath(float percentage) {

  percentage = clamp(percentage, 0.0, 1.0);

  // Calculate the target distance along the path
  float targetDistance = percentage * totalDistance;
  
  // Find the index of the vertices
  // indexPrev ------> iNext
  int iNext = 1;
  float traveledDistance = pathVertices[1].distance;
  while (traveledDistance < targetDistance) {
    if (iNext == NUM_VERTICES - 1) {
      // reached the end of the path
      break;
    }
    iNext++;
    traveledDistance += pathVertices[iNext].distance;
  }
  int iPrev = max(0, iNext - 1);

  // Get the two adjacent vertices
  vec3 posPrev = pathVertices[iPrev].position;
  vec3 posNext = pathVertices[iNext].position;

  float distancePrevToNext = pathVertices[iNext].distance;

  // Calculate the interpolation factor based on distances
  // 0 ------ tDist ------ offsetDist
  float offsetDist = traveledDistance - distancePrevToNext;
  float tDist = targetDistance - offsetDist;
  float t = tDist / distancePrevToNext;

  // Interpolate the position
  vec3 position = mix(posPrev, posNext, t);

  // Calculate the direction as the normalized direction between the two vertices
  vec3 direction = mix(pathVertices[iPrev].direction, pathVertices[iNext].direction, t);

  //mix quaterions
  vec4 rotation = mix(pathVertices[iPrev].addedQuaternion, pathVertices[iNext].addedQuaternion, t);

  return PathPos(
    position,
    direction,
    rotation
  );
}
`;

const rotate = /*glsl*/ `
vec4 getQuaternionFromVectors(vec3 fromVector, vec3 toVector) {
	vec3 crossProduct = cross(fromVector, toVector);
	float dotProduct = dot(fromVector, toVector);
	float angle = acos(dotProduct);
	float halfAngle = angle * 0.5;
	float s = sin(halfAngle);
	vec4 quaternion = vec4(crossProduct * s, cos(halfAngle));
	return normalize(quaternion);
}

// https://community.khronos.org/t/quaternion-functions-for-glsl/50140/3
vec3 qtransform( vec4 q, vec3 v ){ 
	return v + 2.0*cross(cross(v, q.xyz ) + q.w*v, q.xyz);
} 

mat3 rotate(mat3 m, float angle, vec3 axis) {
	float c = cos(angle);
	float s = sin(angle);
	float t = 1.0 - c;

	vec3 normalizedAxis = normalize(axis);
	float x = normalizedAxis.x;
	float y = normalizedAxis.y;
	float z = normalizedAxis.z;

	mat3 rotationMatrix = mat3(
			t * x * x + c, t * x * y - s * z, t * x * z + s * y,
			t * x * y + s * z, t * y * y + c, t * y * z - s * x,
			t * x * z - s * y, t * y * z + s * x, t * z * z + c
	);

	return rotationMatrix * m;
}

vec3 rotateToY(vec3 v, vec3 newY) {
	vec3 currentY = vec3(0, 1, 0);
	vec3 rotationAxis = cross(currentY, newY);
	float rotationAngle = acos(dot(currentY, newY));

	// Apply the rotation using a rotation matrix
	mat3 rotationMatrix = mat3(1.0);
	rotationMatrix = rotate(rotationMatrix, rotationAngle, rotationAxis);

	// Apply the rotation to the vector
	vec3 rotatedVector = rotationMatrix * v;

	return rotatedVector;
}
`;

const valueRemap = `
float valueRemap(float value, float min, float max, float newMin, float newMax) {
  return newMin + (newMax - newMin) * (value - min) / (max - min);
}
`;

const branchVertexShader = /*glsl*/ `

struct PathVertex {
  vec3 position;
  float distance;
  vec3 direction;
  // quaternion rotation
  vec4 rotation;
  vec4 addedQuaternion;
};

struct PathPos {
  vec3 position;
  vec3 direction;
  vec4 rotation;
};

uniform PathVertex pathVertices[NUM_VERTICES];
uniform float totalDistance;
uniform float progress;
uniform float branchRadius;
uniform float branchGrowOffset;

varying vec2 vUv;
varying vec3 worldPos;
varying vec3 localPos;
varying float targetFactor;
varying float growFactorRaw;
varying float growFactor; // clamped

${rotate}
${getPositionOnPath}

float getGrowFactor(float p) {
  float totalLenght = totalDistance * p;
  float currentLenght = localPos.y * totalLenght;
  float growEnd = totalLenght - branchGrowOffset;

  float growFactor = (growEnd - currentLenght) / branchGrowOffset + 1.;
  return growFactor;
}

void main() {
  float clampedProgress = clamp(progress, 0.0, 1.0);
  localPos = position + vec3(0.0, 0.5, 0.0);
  targetFactor = localPos.y;

  // calculate grow factor
  growFactorRaw = getGrowFactor(clampedProgress);
  growFactor = clamp(growFactorRaw, 0.0, 1.0);
  float branchSize = branchRadius * growFactor;

  // move vertices to y = 0
  vec3 targetPos = position * vec3(branchSize, 0.0, branchSize);
  
  //translate to path
  PathPos pathPosition = getPositionOnPath(targetFactor * clampedProgress);

  // rotate the Y axis to the direction
  targetPos = qtransform(pathPosition.rotation, targetPos);

  // move to pos
  targetPos += pathPosition.position;


  vUv = uv;
  worldPos = (modelMatrix * vec4(targetPos, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(targetPos, 1.0);
}

`;

const branchFragmentShader = /*glsl*/ `
out vec4 fragColor;

varying vec3 worldPos;
varying vec2 vUv;
varying float targetFactor;
varying vec3 localPos;

uniform float totalDistance;
uniform float progress;
varying float growFactor;
//uniform sampler2D map;
vec3 uniformColor = vec3(1.0, 0.1, 0.1);

${valueRemap}

void main() {
  float clampedProgress = clamp(progress, 0.0, 1.0);
  //uniformColor = mix(vec3(0.0, 0.0, 0.0), uniformColor, clampedProgress);

  //vec2 mapUv = vec2(vUv.x * 2.0, localPos.y * clampedProgress * totalDistance * 4.);
  //vec3 colorMap = texture2D(map, mapUv).rgb;
  vec3 colorMap = uniformColor;

  // result.y = growFactor;

  fragColor = vec4(colorMap, 1.0);
}
`;
