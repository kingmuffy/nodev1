import React, { useRef, useEffect } from "react";
import { useHelper } from "@react-three/drei";
import \* as THREE from "three";
import { useControls } from "leva";

const useAmbientLightControls = (light) => {
return useControls(`${light?.type || "Unknown"} Controls`, {
intensity: { value: light?.intensity || 1, min: 0, max: 10 },
});
};

const useHemisphereLightControls = (light) => {
return useControls(`${light?.type || "Unknown"} Controls`, {
intensity: { value: light?.intensity || 1, min: 0, max: 10 },
});
};

const useDirectionalLightControls = (light) => {
return useControls(`${light?.type || "Unknown"} Controls`, {
intensity: { value: light?.intensity || 1, min: 0, max: 10 },
position: {
value: light?.position || [0, 5, 5],
min: -10,
max: 10,
step: 0.1,
},
});
};

const usePointLightControls = (light) => {
return useControls(`${light?.type || "Unknown"} Controls`, {
intensity: { value: light?.intensity || 1, min: 0, max: 10 },
position: {
value: light?.position || [5, 5, 5],
min: -10,
max: 10,
step: 0.1,
},
});
};

const useSpotLightControls = (light) => {
return useControls(`${light?.type || "Unknown"} Controls`, {
intensity: { value: light?.intensity || 1, min: 0, max: 10 },
position: {
value: light?.position || [5, 5, 5],
min: -10,
max: 10,
step: 0.1,
},
angle: { value: light?.angle || Math.PI / 6, min: 0, max: Math.PI / 2 },
decay: { value: light?.decay || 2, min: 0, max: 2 },
});
};

const LightComponent = ({ light, updateLightContext }) => {
const lightRef = useRef();

if (!light || !light.type) {
console.error("Light or light type is undefined");
return null;
}

const ambientLightControls = useAmbientLightControls(light);
const hemisphereLightControls = useHemisphereLightControls(light);
const directionalLightControls = useDirectionalLightControls(light);
const pointLightControls = usePointLightControls(light);
const spotLightControls = useSpotLightControls(light);

let controls = {};
let applicableProps = {};

if (light.type.includes("Ambient Light")) {
controls = ambientLightControls;
applicableProps = { intensity: controls.intensity };
} else if (light.type.includes("Hemisphere Light")) {
controls = hemisphereLightControls;
applicableProps = { intensity: controls.intensity };
} else if (light.type.includes("Directional Light")) {
controls = directionalLightControls;
applicableProps = {
intensity: controls.intensity,
position: controls.position,
};
} else if (light.type.includes("Point Light")) {
controls = pointLightControls;
applicableProps = {
intensity: controls.intensity,
position: controls.position,
};
} else if (light.type.includes("Spot Light")) {
controls = spotLightControls;
applicableProps = {
intensity: controls.intensity,
position: controls.position,
angle: controls.angle,
decay: controls.decay,
};
}

useHelper(
lightRef,
light.type.includes("Hemisphere Light")
? THREE.HemisphereLightHelper
: light.type.includes("Directional Light")
? THREE.DirectionalLightHelper
: light.type.includes("Point Light")
? THREE.PointLightHelper
: light.type.includes("Spot Light")
? THREE.SpotLightHelper
: null,
1
);

useEffect(() => {
if (lightRef.current) {
const pos = controls.position || [0, 0, 0];

      if (
        light.type.includes("Directional Light") ||
        light.type.includes("Point Light") ||
        light.type.includes("Spot Light")
      ) {
        lightRef.current.position.set(...pos);
      }
      if (light.type.includes("Spot Light")) {
        lightRef.current.angle = controls.angle || Math.PI / 6;
        lightRef.current.decay = controls.decay || 2;
      }

      lightRef.current.intensity = controls.intensity;

      // Up context Ji
      if (updateLightContext) {
        updateLightContext(light.id, {
          ...light,
          ...applicableProps,
        });
      }
    }

}, [
controls.position,
controls.angle,
controls.decay,
controls.intensity,
light,
updateLightContext,
]);

return (
<>
{light.type.includes("Ambient Light") && (
<ambientLight ref={lightRef} intensity={controls.intensity} />
)}
{light.type.includes("Hemisphere Light") && (
<hemisphereLight ref={lightRef} intensity={controls.intensity} />
)}
{light.type.includes("Directional Light") && (
<directionalLight
          ref={lightRef}
          intensity={controls.intensity}
          position={controls.position}
          castShadow
        />
)}
{light.type.includes("Point Light") && (
<pointLight
          ref={lightRef}
          intensity={controls.intensity}
          position={controls.position}
          castShadow
        />
)}
{light.type.includes("Spot Light") && (
<spotLight
          ref={lightRef}
          intensity={controls.intensity}
          position={controls.position}
          angle={controls.angle}
          decay={controls.decay}
          castShadow
        />
)}
</>
);
};

export default LightComponent;
