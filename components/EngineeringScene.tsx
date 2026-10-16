'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { coreMotion } from '@/lib/core-motion';
import { useMediaQuery } from '@/lib/use-media-query';
import CoreFallback from './CoreFallback';
import { recordSceneError } from '@/lib/scene-diagnostics';
type Props = {
  progress: RefObject<{ value: number }>;
  paused: boolean;
  onReady: (invalidate: () => void) => void;
  onFail: () => void;
};
function Studio() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const generator = new THREE.PMREMGenerator(gl),
      room = new RoomEnvironment();
    const environment = generator.fromScene(room, 0.04);
    const previous = scene.environment;
    // R3F exposes an imperative Three.js scene, not immutable React state.
    // eslint-disable-next-line react-hooks/immutability
    scene.environment = environment.texture;
    return () => {
      scene.environment = previous;
      environment.dispose();
      room.dispose();
      generator.dispose();
    };
  }, [gl, scene]);
  return null;
}
function makePlate() {
  const shape = new THREE.Shape(),
    w = 1.45,
    h = 1.13,
    r = 0.09;
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h);
  shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r);
  shape.quadraticCurveTo(-w, -h, -w + r, -h);
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.26, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  for (const x of [-1.23, 1.23]) for (const z of [-0.9, 0.9]) {
    const mountingHole = new THREE.Path();
    mountingHole.absarc(x, z, 0.075, 0, Math.PI * 2, true);
    shape.holes.push(mountingHole);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.13,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.045,
    bevelThickness: 0.035,
    curveSegments: 18,
  });
  geometry.center();
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}
function Core({
  progress,
  paused,
  mobile,
}: {
  progress: Props['progress'];
  paused: boolean;
  mobile: boolean;
}) {
  const assembly = useRef<THREE.Group>(null),
    layers = useRef<THREE.Group>(null),
    chassis = useRef<THREE.Group>(null),
    carrier = useRef<THREE.Group>(null);
  const paths = useRef<THREE.LineSegments>(null),
    packets = useRef<THREE.Points>(null),
    clock = useRef(0),
    frames = useRef(0);
  const geometry = useMemo(() => {
    const plate = makePlate();
    const connections = new THREE.BufferGeometry();
    connections.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6 * 4 * 6), 3));
    const particles = new THREE.BufferGeometry();
    particles.setAttribute('position', new THREE.BufferAttribute(new Float32Array(24 * 3), 3));
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 512;
    labelCanvas.height = 256;
    const context = labelCanvas.getContext('2d')!;
    context.fillStyle = '#f6f3e9';
    context.textAlign = 'center';
    context.font = 'bold 92px Arial';
    context.fillText('C2C', 256, 125);
    context.font = '16px Arial';
    context.fillStyle = '#c8a968';
    context.fillText('SYSTEM ENGINEERING', 256, 181);
    const label = new THREE.CanvasTexture(labelCanvas);
    label.colorSpace = THREE.SRGBColorSpace;
    return { plate, connections, particles, label };
  }, []);
  useEffect(
    () => () => {
      geometry.plate.dispose();
      geometry.connections.dispose();
      geometry.particles.dispose();
      geometry.label.dispose();
    },
    [geometry],
  );
  useFrame(({ camera, gl, scene, pointer, invalidate }, delta) => {
    if (
      !assembly.current ||
      !layers.current ||
      !paths.current ||
      !packets.current ||
      !chassis.current
    )
      return;
    if (!paused) clock.current += Math.min(delta, 0.05);
    const p = progress.current.value,
      m = coreMotion(p);
    if (!paused && m.processing > 0.01) invalidate();
    assembly.current.rotation.set(0.035, m.rotation + pointer.x * 0.018, -0.025);
    const mobileScale = mobile ? 1.12 : 1;
    camera.position.set(m.cameraX * mobileScale, m.cameraY, m.cameraZ * mobileScale);
    camera.lookAt(0, 0.05, 0);
    layers.current.children.forEach((layer, i) => {
      const y = (i - 3) * 0.335;
      // Modules travel along actual guide rails instead of drifting randomly.
      layer.position.set(0, y * (1 + m.separation * 2.1), 0);
      layer.rotation.y = 0;
    });
    carrier.current?.scale.set(1, 1 + m.separation * 2.1, 1);
    chassis.current.scale.set(1, Math.max(0.001, m.integration), 1);
    chassis.current.visible = m.integration > 0.01;
    const coords = geometry.connections.getAttribute('position') as THREE.BufferAttribute;
    const dots = geometry.particles.getAttribute('position') as THREE.BufferAttribute;
    const corners = [
      [-1.23, -0.9],
      [1.23, -0.9],
      [1.23, 0.9],
      [-1.23, 0.9],
    ];
    let n = 0;
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 4; j++) {
        const a = layers.current.children[i].position,
          b = layers.current.children[i + 1].position;
        const [x, z] = corners[j];
        coords.setXYZ(n * 2, a.x + x, a.y, z);
        coords.setXYZ(n * 2 + 1, b.x + x, b.y, z);
        const t = (clock.current * 0.32 + n * 0.11) % 1;
        dots.setXYZ(n, a.x + (b.x - a.x) * t + x, a.y + (b.y - a.y) * t, z);
        n++;
      }
    coords.needsUpdate = true;
    dots.needsUpdate = true;
    (paths.current.material as THREE.LineBasicMaterial).opacity = m.processing * 0.6;
    (packets.current.material as THREE.PointsMaterial).opacity = m.processing * 0.9;
    // Runtime evidence is kept on the canvas for browser QA, without React frame updates.
    const element = gl.domElement;
    element.dataset.frames = String(++frames.current);
    element.dataset.separation = m.separation.toFixed(3);
    element.dataset.integration = m.integration.toFixed(3);
    element.dataset.camera = [camera.position.x, camera.position.y, camera.position.z]
      .map((v) => v.toFixed(2))
      .join(',');
    element.dataset.drawCalls = String(gl.info.render.calls);
    element.dataset.triangles = String(gl.info.render.triangles);
    element.dataset.model = 'industrial-modular-assembly';
    scene.userData.progress = p;
  });
  const corners = [
    [-1.23, -0.9],
    [1.23, -0.9],
    [1.23, 0.9],
    [-1.23, 0.9],
  ];
  return (
    <>
      <Studio />
      <ambientLight intensity={0.6} color="#f6f3e9" />
      <hemisphereLight args={['#f6f3e9', '#09291f', 1.7]} />
      <directionalLight position={[3, 7, 5]} intensity={3.2} color="#fff7de" />
      <directionalLight position={[-5, 1, -3]} intensity={2.2} color="#8ba38b" />
      <group ref={assembly}>
        <group ref={layers}>
          {Array.from({ length: 7 }, (_, i) => (
            <group key={i} position={[0, (i - 3) * 0.335, 0]}>
              <mesh geometry={geometry.plate}>
                <meshStandardMaterial
                  color={i === 0 || i === 6 ? '#c5c3ad' : i % 2 === 0 ? '#164f3b' : '#193d2c'}
                  metalness={i === 0 || i === 6 ? 0.82 : 0.68}
                  roughness={i === 0 || i === 6 ? 0.32 : 0.25}
                  envMapIntensity={1.35}
                />
              </mesh>
              <mesh position={[0, 0.095, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.28, 0.32, mobile ? 32 : 64]} />
                <meshStandardMaterial color="#a5b0a3" metalness={0.85} roughness={0.4} />
              </mesh>
              {corners.map(([x, z], j) => (
                <group key={j} position={[x, 0.11, z]}>
                  <mesh><cylinderGeometry args={[0.10, 0.10, 0.06, 6]} /><meshStandardMaterial color="#b4c0af" metalness={0.85} roughness={0.4} /></mesh>
                  <mesh position={[0, 0.034, 0]}><boxGeometry args={[0.08, 0.008, 0.018]} /><meshStandardMaterial color="#193d2c" /></mesh>
                </group>
              ))}
              {i > 0 &&
                i < 6 &&
                Array.from({ length: mobile ? 3 : 5 }, (_, j) => (
                  <group key={j}>
                    <mesh position={[-0.85 + j * 0.4, 0.095, -0.5]}>
                      <boxGeometry args={[0.17, 0.035, 0.28]} />
                      <meshStandardMaterial
                        color={j % 2 === 0 ? '#d7d6c9' : '#081e17'}
                        metalness={0.55}
                        roughness={0.35}
                      />
                    </mesh>
                    <mesh position={[-0.85 + j * 0.4, 0.095, 0.52]}>
                      <boxGeometry args={[0.012, 0.015, 0.42]} />
                      <meshStandardMaterial color="#c8a968" metalness={0.75} roughness={0.35} />
                    </mesh>
                  </group>
                ))}
              {i === 6 && <group position={[0, 0.14, 0]}>
                <mesh><boxGeometry args={[1.65, 0.09, 1.05]} /><meshStandardMaterial color="#244f3a" metalness={0.6} roughness={0.45} /></mesh>
                {Array.from({ length: mobile ? 7 : 11 }, (_, j) => <mesh key={j} position={[-0.65 + j * (mobile ? 0.21 : 0.13), 0.15, 0]}>
                  <boxGeometry args={[0.045, 0.26, 0.88]} /><meshStandardMaterial color="#a5b0a3" metalness={0.88} roughness={0.43} />
                </mesh>)}
              </group>}
              {i > 0 && i < 6 && <>
                <mesh position={[0.35, 0.14, 0.15]}><boxGeometry args={[0.64, 0.14, 0.6]} /><meshStandardMaterial color="#081e17" roughness={0.55} metalness={0.4} /></mesh>
                <mesh position={[0.35, 0.22, 0.15]}><boxGeometry args={[0.4, 0.025, 0.38]} /><meshStandardMaterial color="#c5c3ad" roughness={0.5} metalness={0.8} /></mesh>
                {[0,1].map(j => <mesh key={j} position={[-0.95 + j * .25, 0.19, 0.35]}><cylinderGeometry args={[.075,.075,.22,12]} /><meshStandardMaterial color="#a5b0a3" metalness={.8} roughness={.45} /></mesh>)}
                <group position={[0, 0.12, 1.08]}>
                  <mesh><boxGeometry args={[1.4,.2,.18]} /><meshStandardMaterial color="#a5b0a3" metalness={.85} roughness={.42} /></mesh>
                  {[-.38,.05,.42].map((x,j)=><mesh key={x} position={[x,.01,.095]}><boxGeometry args={[j===0?.3:.19,.115,.02]} /><meshStandardMaterial color="#081e17" /></mesh>)}
                </group>
              </>}
            </group>
          ))}
        </group>
        <group ref={carrier}>
          {corners.map(([x,z], index) => <mesh key={index} position={[x,0,z]}>
            <cylinderGeometry args={[0.043,0.043,2.35,12]} /><meshStandardMaterial color="#a5b0a3" metalness={.9} roughness={.4} />
          </mesh>)}
        </group>
        <mesh>
          <cylinderGeometry args={[0.24, 0.24, 2.4, mobile ? 24 : 48]} />
          <meshStandardMaterial color="#48634d" metalness={0.9} roughness={0.23} />
        </mesh>
        <group ref={chassis} visible={false}>
          {corners.map(([x, z], i) => (
            <mesh key={i} position={[x, 0, z]}>
              <boxGeometry args={[0.13, 2.35, 0.13]} />
              <meshStandardMaterial color="#c8a968" metalness={0.85} roughness={0.3} />
            </mesh>
          ))}
          {[-1, 1].map((sign) => (
            <group key={sign} position={[0, 0, sign * 1.215]}>
              <mesh><boxGeometry args={[2.85, 1.8, 0.065]} /><meshStandardMaterial color="#174432" metalness={0.75} roughness={0.36} /></mesh>
              {Array.from({length:mobile?7:11},(_,j)=><mesh key={j} position={[-1.05+j*(mobile ? .35 : .21),-.43,sign*.038]}><boxGeometry args={[.09,.32,.012]} /><meshStandardMaterial color="#081e17" roughness={.6} /></mesh>)}
            </group>
          ))}
          <mesh position={[-0.5, 0.35, 1.255]}>
            <planeGeometry args={[1.1, 0.55]} />
            <meshBasicMaterial map={geometry.label} transparent opacity={0.85} />
          </mesh>
          {[-1,1].map(sign=><group key={sign} position={[sign*1.5,0,.8]}>
            <mesh><boxGeometry args={[.08,1.15,.12]} /><meshStandardMaterial color="#a5b0a3" metalness={.85} roughness={.4} /></mesh>
            {[-.6,.6].map(y=><mesh key={y} position={[-sign*.08,y,0]}><boxGeometry args={[.23,.09,.12]} /><meshStandardMaterial color="#a5b0a3" metalness={.85} roughness={.4} /></mesh>)}
          </group>)}
        </group>
        <lineSegments ref={paths} geometry={geometry.connections} frustumCulled={false}>
          <lineBasicMaterial color="#c8a968" transparent opacity={0} />
        </lineSegments>
        <points ref={packets} geometry={geometry.particles} frustumCulled={false}>
          <pointsMaterial color="#f6f3e9" size={0.065} transparent opacity={0} sizeAttenuation />
        </points>
      </group>
    </>
  );
}
export default function EngineeringScene({ progress, paused, onReady, onFail }: Props) {
  const invalidateScene = useRef<() => void>(() => {});
  const mobile = useMediaQuery('(max-width:1023px)', true),
    host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true),
    [lost, setLost] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting && !document.hidden),
    );
    if (host.current) observer.observe(host.current);
    const change = () =>
      setVisible(
        !document.hidden &&
          Boolean(host.current && host.current.getBoundingClientRect().bottom > 0),
      );
    document.addEventListener('visibilitychange', change);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', change);
    };
  }, []);
  if (lost) return <CoreFallback />;
  return (
    <div ref={host} className="engineering-canvas">
      <Canvas
        camera={{ position: [5.8, 3.8, 7.5], fov: 39 }}
        dpr={[1, mobile ? 1 : 1.5]}
        frameloop={visible ? 'demand' : 'never'}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        fallback={<CoreFallback />}
        onPointerMove={() => invalidateScene.current()}
        onCreated={({ gl, invalidate }) => {
          invalidateScene.current = invalidate;
          onReady(invalidate);
          gl.domElement.addEventListener(
            'webglcontextlost',
            (event) => {
              event.preventDefault();
              recordSceneError('WebGL context kaybedildi; SVG alternatif gösteriliyor.');
              setLost(true);
              onFail();
            },
            { once: true },
          );
        }}
      >
        <Core progress={progress} paused={paused} mobile={mobile} />
      </Canvas>
    </div>
  );
}
