import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface PolyModelViewerProps {
  modelUrl: string;
  accentColor?: string;
  name: string;
}

export function PolyModelViewer({ modelUrl, accentColor = '#8b5cf6', name }: PolyModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frameId = 0;
    let mixer: THREE.AnimationMixer | null = null;
    const clock = new THREE.Clock();
    const color = new THREE.Color(accentColor);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const stage = new THREE.Group();
    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.7, 0.035, 16, 96),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 2.5 }),
    );
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = -1.55;
    stage.add(outerRing);
    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.02, 16, 72),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x06b6d4, emissiveIntensity: 2 }),
    );
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = -1.5;
    stage.add(innerRing);
    const grid = new THREE.GridHelper(11, 24, color, 0x171926);
    grid.position.y = -1.52;
    stage.add(grid);
    scene.add(stage);

    scene.add(new THREE.AmbientLight(0xffffff, 3.5));
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.6);
    frontLight.position.set(0, 0, 10);
    scene.add(frontLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controls.minDistance = 2;
    controls.maxDistance = 12;
    controls.target.set(0, 0, 0);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const placeholder = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.55),
      new THREE.MeshStandardMaterial({ color, wireframe: true, emissive: color, emissiveIntensity: 1.5 }),
    );
    modelGroup.add(placeholder);

    new GLTFLoader().load(
      modelUrl,
      (gltf) => {
        setLoading(false);
        modelGroup.remove(placeholder);
        const model = gltf.scene;
        model.scale.setScalar(0.018);
        model.position.set(0, -2, 0);
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = false;
            mesh.receiveShadow = false;
            if (mesh.material && !Array.isArray(mesh.material)) {
              mesh.material.depthWrite = true;
              mesh.material.transparent = false;
              mesh.material.alphaTest = 0.5;
            }
          }
        });
        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const idle = gltf.animations.find((anim) => /idle|wait|stand/i.test(anim.name)) ?? gltf.animations[0];
          mixer.clipAction(idle).play();
        }
        modelGroup.add(model);
      },
      undefined,
      () => {
        setLoading(false);
        setFailed(true);
      },
    );

    const resize = () => {
      if (!container.clientWidth || !container.clientHeight) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', resize);

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      outerRing.rotation.z += delta * 0.5;
      innerRing.rotation.z -= delta * 0.8;
      mixer?.update(delta);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      controls.dispose();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [accentColor, modelUrl]);

  return (
    <div className="relative h-[430px] min-h-[360px] overflow-hidden rounded-[2rem] border border-violet-400/20 bg-[#07080e] shadow-[0_0_50px_rgba(139,92,246,0.22)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.24),transparent_55%)]" />
      <div ref={containerRef} className="relative z-10 h-full w-full" aria-label={`${name} interactive 3D model viewer`} />
      {(loading || failed) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/25 text-sm font-bold text-violet-100 backdrop-blur-sm">
          {failed ? 'Could not load 3D model' : 'Loading 3D model...'}
        </div>
      )}
      <div className="absolute bottom-4 left-4 z-20 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-200 backdrop-blur-md">
        Drag • Zoom • Rotate
      </div>
    </div>
  );
}