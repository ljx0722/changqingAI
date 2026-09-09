import * as THREE from "three";
import { WebGPURenderer, PMREMGenerator } from "three/webgpu";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export type RegionId =
  | "philosophy"
  | "academy"
  | "tools"
  | "studio"
  | "works"
  | "team";
export interface WorldController {
  select(id: RegionId): void;
  reset(): void;
  setPaused(paused: boolean): void;
  setInteractive(interactive: boolean): void;
  dispose(): void;
}
interface WorldOptions {
  onSelect(id: RegionId): void;
  onReady(backend: "webgpu" | "webgl"): void;
  onError(message: string): void;
  reducedMotion: boolean;
  forceWebGL?: boolean;
}

const REGIONS: Record<
  RegionId,
  { x: number; z: number; label: string; number: string }
> = {
  philosophy: { x: 0, z: 0.9, label: "理念中枢", number: "01" },
  academy: { x: -3.3, z: -2.15, label: "长晴学院", number: "02" },
  tools: { x: 2.4, z: -2.75, label: "工具实验室", number: "03" },
  studio: { x: 4.1, z: 1.8, label: "企业共创", number: "04" },
  works: { x: -3.7, z: 2.55, label: "成果展馆", number: "05" },
  team: { x: -0.5, z: -4.8, label: "团队基地", number: "06" },
};

/** A self-contained architectural campus. The content UI remains usable without a GPU. */
export async function createWorld(
  host: HTMLElement,
  options: WorldOptions,
): Promise<WorldController> {
  let disposed = false;
  let failed = false;
  let initialized = false;
  let paused = options.reducedMotion;
  let inView = true;
  let interactive = false;
  let raf = 0;
  let inFrame = false;
  let lastFrame = 0;
  let elapsed = 0;
  let movingCamera = false;
  let needsRender = true;
  let qualityMeasured = false;
  let measuredFrames = 0;
  let measuredTime = 0;
  let selected: RegionId | null = null;
  let environmentTarget: THREE.RenderTarget | null = null;
  let renderer: WebGPURenderer | null = null;
  let controls: OrbitControls | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let intersectionObserver: IntersectionObserver | null = null;
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const scene = new THREE.Scene();
  const campus = new THREE.Group();
  scene.add(campus);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  const defaultTarget = new THREE.Vector3(0, 0.6, -0.6);
  const cameraGoal = new THREE.Vector3();
  const targetGoal = defaultTarget.clone();
  const defaultPosition = new THREE.Vector3(13.3, 12.6, 17.9);
  camera.position.copy(defaultPosition);
  camera.lookAt(defaultTarget);
  const pickingRoots: THREE.Object3D[] = [];
  const selectionOutlines = new Map<RegionId, THREE.Mesh>();
  const regionGroups = new Map<RegionId, THREE.Group>();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const treeCrowns: THREE.Group[] = [];
  const birds: THREE.Group[] = [];
  const activePointers = new Set<number>();
  let pointerDown: { x: number; y: number; id: number; moved: boolean } | null =
    null;

  const geometry = <T extends THREE.BufferGeometry>(value: T): T => {
    geometries.add(value);
    return value;
  };
  const material = <T extends THREE.Material>(value: T): T => {
    materials.add(value);
    return value;
  };
  const texture = <T extends THREE.Texture>(value: T): T => {
    textures.add(value);
    return value;
  };
  let seed = 1737;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // Fine grain is shared by the architecture, avoiding the untextured plastic-model look.
  const stoneCanvas = document.createElement("canvas");
  stoneCanvas.width = stoneCanvas.height = 256;
  const stoneContext = stoneCanvas.getContext("2d");
  if (stoneContext) {
    stoneContext.fillStyle = "#d8d2c3";
    stoneContext.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 17000; i++) {
      const shade = Math.floor(145 + random() * 100);
      stoneContext.fillStyle = `rgba(${shade},${shade},${shade - 8},${0.04 + random() * 0.12})`;
      stoneContext.fillRect(
        random() * 256,
        random() * 256,
        0.5 + random() * 1.5,
        0.5 + random() * 1.2,
      );
    }
  }
  const stoneMap = texture(new THREE.CanvasTexture(stoneCanvas));
  stoneMap.colorSpace = THREE.SRGBColorSpace;
  stoneMap.wrapS = stoneMap.wrapT = THREE.RepeatWrapping;
  stoneMap.repeat.set(2, 2);
  const stone = material(
    new THREE.MeshStandardMaterial({
      color: "#efebe1",
      map: stoneMap,
      roughness: 0.86,
    }),
  );
  const ivory = material(
    new THREE.MeshStandardMaterial({ color: "#e8e4dc", roughness: 0.72 }),
  );
  const concrete = material(
    new THREE.MeshStandardMaterial({
      color: "#b9b8ad",
      map: stoneMap,
      roughness: 0.92,
    }),
  );
  const darkMetal = material(
    new THREE.MeshStandardMaterial({
      color: "#454b46",
      metalness: 0.7,
      roughness: 0.37,
    }),
  );
  const silver = material(
    new THREE.MeshStandardMaterial({
      color: "#bfc2bc",
      metalness: 0.8,
      roughness: 0.31,
    }),
  );
  const copper = material(
    new THREE.MeshStandardMaterial({
      color: "#956c4a",
      metalness: 0.55,
      roughness: 0.46,
    }),
  );
  const timber = material(
    new THREE.MeshStandardMaterial({ color: "#977656", roughness: 0.72 }),
  );
  const timberLight = material(
    new THREE.MeshStandardMaterial({ color: "#b89a78", roughness: 0.7 }),
  );
  const glass = material(
    new THREE.MeshPhysicalMaterial({
      color: "#b9d2cf",
      metalness: 0.05,
      roughness: 0.12,
      transparent: true,
      opacity: 0.27,
      depthWrite: false,
      side: THREE.DoubleSide,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
    }),
  );
  const darkGlass = material(
    new THREE.MeshPhysicalMaterial({
      color: "#738d85",
      metalness: 0.25,
      roughness: 0.18,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      side: THREE.DoubleSide,
      clearcoat: 1,
    }),
  );
  const soil = material(
    new THREE.MeshStandardMaterial({ color: "#605e4e", roughness: 1 }),
  );
  const grass = material(
    new THREE.MeshStandardMaterial({ color: "#8a9274", roughness: 1 }),
  );
  const foliage = ["#6d7859", "#839071", "#a0a287", "#647660"].map((color) =>
    material(new THREE.MeshStandardMaterial({ color, roughness: 0.92 })),
  );
  const bark = material(
    new THREE.MeshStandardMaterial({ color: "#7e7060", roughness: 1 }),
  );
  const warmLight = material(
    new THREE.MeshStandardMaterial({
      color: "#f7ddb0",
      emissive: "#efc591",
      emissiveIntensity: 0.55,
      roughness: 0.4,
    }),
  );
  const artDark = material(
    new THREE.MeshStandardMaterial({ color: "#33443c", roughness: 0.85 }),
  );
  const artClay = material(
    new THREE.MeshStandardMaterial({ color: "#a87458", roughness: 0.85 }),
  );
  const artCream = material(
    new THREE.MeshStandardMaterial({ color: "#ddd8c7", roughness: 0.85 }),
  );
  const waterMaterial = material(
    new THREE.MeshPhysicalMaterial({
      color: "#7eaaa3",
      metalness: 0.35,
      roughness: 0.16,
      clearcoat: 1,
      transparent: true,
      opacity: 0.86,
    }),
  );
  const boxGeometry = geometry(new THREE.BoxGeometry(1, 1, 1));
  const cylinderGeometry = geometry(new THREE.CylinderGeometry(1, 1, 1, 32));
  const sphereGeometry = geometry(new THREE.SphereGeometry(1, 12, 8));
  const leafGeometry = geometry(new THREE.IcosahedronGeometry(1, 1));
  const mesh = (
    parent: THREE.Object3D,
    shape: THREE.BufferGeometry,
    surface: THREE.Material,
    x: number,
    y: number,
    z: number,
    sx = 1,
    sy = 1,
    sz = 1,
  ) => {
    const object = new THREE.Mesh(shape, surface);
    object.position.set(x, y, z);
    object.scale.set(sx, sy, sz);
    object.castShadow = !surface.transparent;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  };
  const box = (
    parent: THREE.Object3D,
    surface: THREE.Material,
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number,
  ) => mesh(parent, boxGeometry, surface, x, y, z, width, height, depth);
  const cylinder = (
    parent: THREE.Object3D,
    surface: THREE.Material,
    x: number,
    y: number,
    z: number,
    radius: number,
    height: number,
  ) => mesh(parent, cylinderGeometry, surface, x, y, z, radius, height, radius);
  const roundedBox = (
    parent: THREE.Object3D,
    surface: THREE.Material,
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number,
    radius = 0.08,
  ) =>
    mesh(
      parent,
      geometry(new RoundedBoxGeometry(width, height, depth, 2, radius)),
      surface,
      x,
      y,
      z,
    );
  const beamBetween = (
    parent: THREE.Object3D,
    start: THREE.Vector3,
    end: THREE.Vector3,
    radius: number,
    surface: THREE.Material,
  ) => {
    const middle = start.clone().add(end).multiplyScalar(0.5);
    const object = cylinder(
      parent,
      surface,
      middle.x,
      middle.y,
      middle.z,
      radius,
      start.distanceTo(end),
    );
    object.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      end.clone().sub(start).normalize(),
    );
    return object;
  };

  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const shadowContext = shadowCanvas.getContext("2d");
  if (shadowContext) {
    const gradient = shadowContext.createRadialGradient(64, 64, 10, 64, 64, 64);
    gradient.addColorStop(0, "rgba(48,48,37,0.34)");
    gradient.addColorStop(0.42, "rgba(48,48,37,0.14)");
    gradient.addColorStop(1, "rgba(48,48,37,0)");
    shadowContext.fillStyle = gradient;
    shadowContext.fillRect(0, 0, 128, 128);
  }
  const shadowMap = texture(new THREE.CanvasTexture(shadowCanvas));
  const contactShadowMaterial = material(
    new THREE.MeshBasicMaterial({
      map: shadowMap,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    }),
  );
  const planeGeometry = geometry(new THREE.PlaneGeometry(1, 1));
  const contactShadow = (
    parent: THREE.Object3D,
    x: number,
    z: number,
    width: number,
    depth: number,
    y = 0.045,
  ) => {
    const object = mesh(
      parent,
      planeGeometry,
      contactShadowMaterial,
      x,
      y,
      z,
      width,
      depth,
      1,
    );
    object.rotation.x = -Math.PI / 2;
    object.castShadow = false;
    object.receiveShadow = false;
    return object;
  };

  // One continuous landscaped site: sandstone paving, expansion joints, water, planted beds.
  roundedBox(campus, stone, 0, -0.18, -0.5, 14.2, 0.34, 12.25, 0.3);
  roundedBox(campus, concrete, 0, -0.39, -0.5, 13.92, 0.16, 12.02, 0.25);
  const jointMaterial = material(
    new THREE.MeshStandardMaterial({ color: "#c2bfb3", roughness: 1 }),
  );
  for (let x = -6; x <= 6; x += 1)
    box(campus, jointMaterial, x, 0.004, -0.5, 0.014, 0.004, 11.6);
  for (let z = -6; z <= 5; z += 1)
    box(campus, jointMaterial, 0, 0.006, z, 13.5, 0.004, 0.012);
  contactShadow(scene, 0.8, 0.1, 21, 18, -0.53);
  const ground = mesh(
    scene,
    geometry(new THREE.PlaneGeometry(200, 200)),
    material(new THREE.ShadowMaterial({ color: "#766957", opacity: 0.12 })),
    0,
    -0.55,
    0,
  );
  ground.rotation.x = -Math.PI / 2;
  ground.castShadow = false;
  scene.fog = new THREE.Fog("#f7f5ef", 32, 65);

  const planter = (x: number, z: number, width: number, depth: number) => {
    roundedBox(campus, concrete, x, 0.1, z, width, 0.2, depth, 0.08);
    roundedBox(
      campus,
      soil,
      x,
      0.21,
      z,
      width - 0.12,
      0.025,
      depth - 0.12,
      0.03,
    );
    roundedBox(
      campus,
      grass,
      x,
      0.23,
      z,
      width - 0.19,
      0.045,
      depth - 0.19,
      0.04,
    );
  };
  const tree = (x: number, z: number, size: number, baseY = 0.23) => {
    const root = new THREE.Group();
    root.position.set(x, baseY, z);
    campus.add(root);
    cylinder(root, bark, 0, size * 0.57, 0, size * 0.042, size * 1.14);
    const crown = new THREE.Group();
    crown.position.y = size * 1.12;
    root.add(crown);
    treeCrowns.push(crown);
    for (let i = 0; i < 5; i++) {
      const a = i * 2.399;
      const radius = size * (0.2 + random() * 0.21);
      beamBetween(
        root,
        new THREE.Vector3(0, size * 0.6, 0),
        new THREE.Vector3(
          Math.cos(a) * radius,
          size * (1 + random() * 0.3),
          Math.sin(a) * radius,
        ),
        size * 0.018,
        bark,
      );
    }
    // Small overlapping foliage clusters give a botanical silhouette rather than a single sphere.
    for (let i = 0; i < 33; i++) {
      const a = random() * Math.PI * 2;
      const r = Math.sqrt(random()) * size * 0.47;
      const y =
        Math.sqrt(Math.max(0, 1 - (r / (size * 0.55)) ** 2)) * size * 0.45;
      const cluster = mesh(
        crown,
        leafGeometry,
        foliage[i % foliage.length],
        Math.cos(a) * r,
        y + (random() - 0.5) * size * 0.36,
        Math.sin(a) * r,
        size * (0.17 + random() * 0.09),
        size * (0.16 + random() * 0.1),
        size * (0.18 + random() * 0.1),
      );
      cluster.rotation.set(random(), random(), random());
    }
    contactShadow(campus, x, z, size * 1.7, size * 1.7);
  };
  const bench = (
    parent: THREE.Object3D,
    x: number,
    z: number,
    rotation = 0,
    length = 1.4,
  ) => {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    parent.add(group);
    for (let i = 0; i < 4; i++)
      box(group, timberLight, 0, 0.38, (i - 1.5) * 0.095, length, 0.06, 0.073);
    for (const side of [-1, 1]) {
      box(group, darkMetal, side * length * 0.36, 0.19, 0, 0.04, 0.34, 0.37);
      box(group, darkMetal, side * length * 0.36, 0.04, 0, 0.27, 0.04, 0.4);
    }
  };
  planter(-6, -3.5, 0.95, 4.4);
  planter(5.95, -2.75, 1.05, 5.5);
  planter(-5.7, 4.65, 1.6, 0.8);
  planter(2.9, 4.9, 5.6, 0.7);
  [
    [-6, -4.9, 1.55],
    [-6, -2.4, 1.35],
    [5.95, -4.1, 1.6],
    [6, -1.45, 1.45],
    [-5.65, 4.6, 1.25],
    [1.1, 4.9, 1.4],
    [4.8, 4.9, 1.3],
    [-0.4, -5.45, 1.5],
  ].forEach(([x, z, size]) => tree(x, z, size));
  bench(campus, -5.2, -0.7, Math.PI / 2);
  bench(campus, 5.1, -0.7, Math.PI / 2);
  bench(campus, 2.8, 4.45, 0, 1.8);

  const makeRegion = (id: RegionId, width: number, depth: number) => {
    const region = REGIONS[id];
    const group = new THREE.Group();
    group.position.set(region.x, 0.01, region.z);
    group.userData.regionId = id;
    campus.add(group);
    pickingRoots.push(group);
    regionGroups.set(id, group);
    const borderMaterial = material(
      new THREE.MeshBasicMaterial({
        color: "#ba895c",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    const borderShape = new THREE.Shape();
    const w = width / 2 + 0.18;
    const d = depth / 2 + 0.18;
    borderShape.moveTo(-w, -d);
    borderShape.lineTo(w, -d);
    borderShape.lineTo(w, d);
    borderShape.lineTo(-w, d);
    borderShape.closePath();
    const hole = new THREE.Path();
    hole.moveTo(-w + 0.035, -d + 0.035);
    hole.lineTo(-w + 0.035, d - 0.035);
    hole.lineTo(w - 0.035, d - 0.035);
    hole.lineTo(w - 0.035, -d + 0.035);
    hole.closePath();
    borderShape.holes.push(hole);
    const border = mesh(
      group,
      geometry(new THREE.ShapeGeometry(borderShape)),
      borderMaterial,
      0,
      0.032,
      0,
    );
    border.rotation.x = -Math.PI / 2;
    selectionOutlines.set(id, border);
    border.castShadow = false;
    contactShadow(group, 0.12, 0.17, width * 1.7, depth * 1.8);
    // Site wayfinding is legible but quiet; all these destinations have equivalent HTML controls.
    const labelCanvas = document.createElement("canvas");
    labelCanvas.width = 512;
    labelCanvas.height = 128;
    const context = labelCanvas.getContext("2d");
    if (context) {
      context.fillStyle = "#f1eee4";
      context.fillRect(0, 0, 512, 128);
      context.fillStyle = "#927459";
      context.font = "500 38px sans-serif";
      context.fillText(region.number, 27, 78);
      context.fillStyle = "#343c35";
      context.font = '500 38px "Microsoft YaHei", sans-serif';
      context.fillText(region.label, 110, 78);
    }
    const labelTexture = texture(new THREE.CanvasTexture(labelCanvas));
    labelTexture.colorSpace = THREE.SRGBColorSpace;
    const plaque = mesh(
      group,
      planeGeometry,
      material(
        new THREE.MeshBasicMaterial({
          map: labelTexture,
          side: THREE.DoubleSide,
        }),
      ),
      0,
      0.11,
      depth / 2 + 0.21,
      1.25,
      0.3125,
      1,
    );
    plaque.rotation.x = -Math.PI / 2;
    plaque.castShadow = false;
    return group;
  };
  const mullions = (
    parent: THREE.Object3D,
    width: number,
    depth: number,
    height: number,
    surface: THREE.Material = darkMetal,
  ) => {
    for (const z of [-depth / 2, depth / 2]) {
      for (let i = 0; i <= Math.ceil(width / 0.62); i++)
        box(
          parent,
          surface,
          -width / 2 + (i * width) / Math.ceil(width / 0.62),
          height / 2 + 0.17,
          z,
          0.035,
          height,
          0.045,
        );
      for (const y of [0.17, height * 0.76, height + 0.17])
        box(parent, surface, 0, y, z, width, 0.035, 0.045);
      box(
        parent,
        glass,
        0,
        height / 2 + 0.17,
        z,
        width - 0.04,
        height - 0.04,
        0.012,
      );
    }
    for (const x of [-width / 2, width / 2]) {
      box(parent, glass, x, height / 2 + 0.17, 0, 0.012, height - 0.04, depth);
      for (let i = 1; i < Math.ceil(depth / 0.62); i++)
        box(
          parent,
          surface,
          x,
          height / 2 + 0.17,
          -depth / 2 + (i * depth) / Math.ceil(depth / 0.62),
          0.04,
          height,
          0.035,
        );
      box(parent, surface, x, height + 0.17, 0, 0.04, 0.04, depth);
    }
  };
  const table = (
    parent: THREE.Object3D,
    x: number,
    z: number,
    width: number,
    depth: number,
    height = 0.59,
  ) => {
    box(parent, timberLight, x, height + 0.17, z, width, 0.05, depth);
    for (const a of [-1, 1])
      for (const b of [-1, 1])
        box(
          parent,
          darkMetal,
          x + a * width * 0.39,
          height / 2 + 0.17,
          z + b * depth * 0.36,
          0.032,
          height,
          0.032,
        );
  };
  const chair = (
    parent: THREE.Object3D,
    x: number,
    z: number,
    rotation: number,
  ) => {
    const group = new THREE.Group();
    group.position.set(x, 0.17, z);
    group.rotation.y = rotation;
    parent.add(group);
    roundedBox(group, timber, 0, 0.34, 0, 0.31, 0.05, 0.32, 0.015);
    roundedBox(group, timber, 0, 0.57, -0.14, 0.31, 0.35, 0.04, 0.015);
    for (const a of [-1, 1])
      for (const b of [-1, 1])
        box(group, darkMetal, a * 0.115, 0.16, b * 0.115, 0.024, 0.32, 0.024);
  };

  // 01 / Open circular forum: a copper colonnade wraps a shaded reflecting pool.
  const philosophy = makeRegion("philosophy", 3.35, 3.25);
  cylinder(philosophy, concrete, 0, 0.055, 0, 1.65, 0.11);
  cylinder(philosophy, stone, 0, 0.13, 0, 1.55, 0.06);
  cylinder(philosophy, darkMetal, 0, 0.169, 0, 1.15, 0.015);
  cylinder(philosophy, waterMaterial, 0, 0.18, 0, 1.08, 0.01);
  const pergolaArc = geometry(
    new THREE.TorusGeometry(1.46, 0.042, 8, 80, Math.PI * 1.66),
  );
  for (const height of [2.05, 2.18]) {
    const arc = mesh(philosophy, pergolaArc, copper, 0, height, 0);
    arc.rotation.x = Math.PI / 2;
    arc.rotation.z = Math.PI * 0.16;
  }
  for (let i = 0; i < 29; i++) {
    const angle = (i / 28) * Math.PI * 1.66 + Math.PI * 0.16;
    const x = Math.cos(angle) * 1.46;
    const z = -Math.sin(angle) * 1.46;
    cylinder(philosophy, copper, x, 1.1, z, 0.027, 2.1);
    const slat = box(
      philosophy,
      timberLight,
      Math.cos(angle) * 1.26,
      2.15,
      -Math.sin(angle) * 1.26,
      0.47,
      0.025,
      0.055,
    );
    slat.rotation.y = angle;
  }
  // A restrained sun disc sculpture, with an aperture and a reflected pool beneath it.
  cylinder(philosophy, concrete, 0, 0.28, 0, 0.32, 0.2);
  const sun = mesh(
    philosophy,
    geometry(new THREE.TorusGeometry(0.64, 0.085, 12, 72)),
    copper,
    0,
    1.08,
    0,
  );
  sun.rotation.y = -0.45;
  cylinder(philosophy, copper, 0, 0.59, 0, 0.026, 0.64);
  const sunInner = mesh(
    philosophy,
    geometry(new THREE.CircleGeometry(0.47, 64)),
    material(
      new THREE.MeshPhysicalMaterial({
        color: "#d6af74",
        metalness: 0.82,
        roughness: 0.23,
        side: THREE.DoubleSide,
      }),
    ),
    0,
    1.08,
    0,
  );
  sunInner.rotation.y = -0.45;
  bench(philosophy, -0.8, 1.16, 0, 1.08);

  // 02 / A two-level academy with curtain walls, interior desks and a shaded terrace.
  const academy = makeRegion("academy", 3.7, 2.8);
  roundedBox(academy, concrete, 0, 0.08, 0, 3.9, 0.16, 2.95);
  roundedBox(academy, stone, 0, 0.18, 0, 3.7, 0.09, 2.8, 0.04);
  mullions(academy, 3.4, 2.5, 2.1);
  box(academy, ivory, 0, 2.35, 0, 3.8, 0.15, 2.9);
  box(academy, darkMetal, 0, 2.44, 0, 3.45, 0.025, 2.55);
  box(academy, ivory, -1.3, 1.12, -0.48, 0.18, 2.1, 1.46);
  box(academy, concrete, 0, 1.18, -0.48, 3.34, 0.1, 1.45);
  for (let i = 0; i < 7; i++)
    box(
      academy,
      timberLight,
      -1.68,
      0.52 + i * 0.07,
      0.9 - i * 0.16,
      0.53,
      0.1,
      0.17,
    );
  for (const x of [-0.62, 0.7]) {
    table(academy, x, 0.4, 0.83, 0.65);
    chair(academy, x, 0.95, Math.PI);
    chair(academy, x, -0.1, 0);
    box(academy, artCream, x, 0.83, 0.4, 0.25, 0.025, 0.2);
  }
  for (let i = 0; i < 14; i++)
    box(
      academy,
      i % 3 ? timberLight : artDark,
      -1.54 + i * 0.115,
      1.62,
      -1.16,
      0.055,
      0.35 + (i % 3) * 0.04,
      0.18,
    );
  for (let i = 0; i < 12; i++)
    box(academy, copper, -1.77 + i * 0.32, 2.55, 0, 0.035, 0.08, 2.75);
  box(academy, warmLight, 0, 2.24, 0.65, 2.7, 0.012, 0.065);

  // 03 / Research pavilion with a brushed-metal exoskeleton and visible workstations.
  const tools = makeRegion("tools", 3.5, 2.6);
  roundedBox(tools, concrete, 0, 0.1, 0, 3.6, 0.2, 2.7);
  mullions(tools, 3.2, 2.35, 1.75, silver);
  roundedBox(tools, silver, 0, 2.04, 0, 3.6, 0.18, 2.72, 0.065);
  for (let i = 0; i < 8; i++) {
    const x = -1.52 + i * 0.435;
    box(tools, silver, x, 1.12, -1.26, 0.065, 2, 0.12);
    box(tools, silver, x, 1.12, 1.26, 0.065, 2, 0.12);
    box(tools, silver, x, 2.13, 0, 0.065, 0.055, 2.66);
  }
  table(tools, 0, -0.25, 2.55, 0.78, 0.66);
  for (const x of [-0.85, 0, 0.85]) {
    box(tools, darkMetal, x, 1.08, -0.39, 0.46, 0.29, 0.037);
    box(
      tools,
      material(
        new THREE.MeshStandardMaterial({
          color: "#789e9a",
          emissive: "#46625b",
          emissiveIntensity: 0.3,
          roughness: 0.35,
        }),
      ),
      x,
      1.08,
      -0.367,
      0.41,
      0.245,
      0.008,
    );
    cylinder(tools, darkMetal, x, 0.89, -0.39, 0.025, 0.13);
    chair(tools, x, 0.61, Math.PI);
  }
  // A real scale articulated research arm on a workbench.
  cylinder(tools, darkMetal, 1.06, 0.94, -0.1, 0.16, 0.12);
  beamBetween(
    tools,
    new THREE.Vector3(1.06, 1, -0.1),
    new THREE.Vector3(1.2, 1.42, -0.1),
    0.064,
    silver,
  );
  mesh(tools, sphereGeometry, darkMetal, 1.2, 1.42, -0.1, 0.09, 0.09, 0.09);
  beamBetween(
    tools,
    new THREE.Vector3(1.2, 1.42, -0.1),
    new THREE.Vector3(0.84, 1.62, -0.03),
    0.047,
    silver,
  );
  box(tools, darkMetal, 0.8, 1.57, -0.025, 0.1, 0.13, 0.12);

  // 04 / A timber-screened co-creation studio, with a long communal table.
  const studio = makeRegion("studio", 2.65, 3.25);
  roundedBox(studio, concrete, 0, 0.09, 0, 2.8, 0.18, 3.3);
  mullions(studio, 2.5, 3.05, 1.65);
  box(studio, ivory, 0, 1.97, 0, 2.8, 0.16, 3.35);
  for (let i = 0; i < 17; i++)
    box(studio, timberLight, 1.34, 1.13, -1.49 + i * 0.187, 0.045, 1.7, 0.055);
  for (let i = 0; i < 11; i++)
    box(studio, timberLight, -1.23 + i * 0.246, 1.13, -1.58, 0.055, 1.7, 0.05);
  table(studio, 0, 0, 0.9, 2.05, 0.62);
  for (const z of [-0.7, 0, 0.7]) {
    chair(studio, -0.79, z, Math.PI / 2);
    chair(studio, 0.79, z, -Math.PI / 2);
  }
  box(studio, darkMetal, 0, 1.15, -1.49, 1.2, 0.68, 0.035);
  box(studio, artCream, 0, 1.15, -1.46, 1.12, 0.59, 0.01);
  box(studio, artClay, -0.28, 1.15, -1.44, 0.28, 0.39, 0.01);
  box(studio, artDark, 0.12, 1.07, -1.44, 0.37, 0.22, 0.01);
  box(studio, warmLight, 0, 1.65, 0, 0.04, 0.045, 1.8);

  // 05 / A contemporary gallery with curved glass, fluted stone and large art panels.
  const works = makeRegion("works", 3.4, 2.8);
  roundedBox(works, concrete, 0, 0.1, 0, 3.55, 0.2, 2.85);
  const galleryShell = geometry(
    new THREE.CylinderGeometry(
      1.48,
      1.48,
      1.8,
      56,
      1,
      true,
      Math.PI * 0.4,
      Math.PI * 1.2,
    ),
  );
  mesh(works, galleryShell, darkGlass, 0, 1.08, -0.1, 1, 1, 0.78);
  for (let i = 0; i < 30; i++) {
    const a = Math.PI * 0.4 + (i / 29) * Math.PI * 1.2;
    cylinder(
      works,
      copper,
      Math.sin(a) * 1.5,
      1.12,
      Math.cos(a) * 1.5 * 0.78 - 0.1,
      0.019,
      1.88,
    );
  }
  const galleryRoof = cylinder(works, ivory, 0, 2.07, -0.1, 1.65, 0.14);
  galleryRoof.scale.z = 1.65 * 0.8;
  const galleryOculus = cylinder(works, darkGlass, 0, 2.15, -0.1, 0.8, 0.025);
  galleryOculus.scale.z = 0.8 * 0.8;
  const artPanel = (
    x: number,
    z: number,
    rotation: number,
    first: THREE.Material,
    second: THREE.Material,
  ) => {
    const panel = new THREE.Group();
    panel.position.set(x, 0, z);
    panel.rotation.y = rotation;
    works.add(panel);
    box(panel, darkMetal, 0, 0.73, 0, 0.92, 1.3, 0.07);
    box(panel, artCream, 0, 0.87, 0.047, 0.83, 0.96, 0.025);
    box(panel, first, -0.13, 0.97, 0.064, 0.38, 0.57, 0.012);
    const circle = mesh(
      panel,
      geometry(new THREE.CircleGeometry(0.23, 32)),
      second,
      0.16,
      0.79,
      0.074,
    );
    circle.castShadow = false;
    box(panel, ivory, 0, 0.11, 0, 1, 0.08, 0.48);
  };
  artPanel(-0.68, -0.24, 0.14, artDark, artClay);
  artPanel(0.59, -0.5, -0.32, artClay, artDark);
  bench(works, 0, 0.79, 0, 1.4);

  // 06 / A low team lounge, book-lined and open to a planted roof terrace.
  const team = makeRegion("team", 2.5, 1.65);
  roundedBox(team, concrete, 0, 0.08, 0, 2.65, 0.16, 1.7);
  box(team, ivory, 0, 0.77, -0.66, 2.4, 1.45, 0.15);
  for (const x of [-1.2, 1.2]) box(team, ivory, x, 0.82, 0, 0.12, 1.45, 1.44);
  box(team, glass, 0, 0.82, 0.73, 2.3, 1.45, 0.014);
  for (const x of [-1.15, -0.38, 0.38, 1.15])
    box(team, darkMetal, x, 0.8, 0.75, 0.028, 1.5, 0.035);
  box(team, concrete, 0, 1.61, 0, 2.67, 0.17, 1.75);
  roundedBox(team, grass, 0, 1.72, 0, 2.45, 0.06, 1.55, 0.06);
  for (let i = 0; i < 15; i++)
    box(
      team,
      i % 3 ? timberLight : artDark,
      -1 + i * 0.13,
      0.97,
      -0.51,
      0.055,
      0.38,
      0.13,
    );
  table(team, 0, 0.1, 1.45, 0.55, 0.55);
  chair(team, -0.45, 0.55, Math.PI);
  chair(team, 0.45, 0.55, Math.PI);

  // Human scale: understated monochrome figures and bollard lighting along the walk.
  const clothing = [artDark, artCream, timber];
  const person = (x: number, z: number, angle: number, index: number) => {
    const group = new THREE.Group();
    group.position.set(x, 0.01, z);
    group.rotation.y = angle;
    campus.add(group);
    const cloth = clothing[index % clothing.length];
    cylinder(group, cloth, -0.062, 0.19, 0, 0.035, 0.38);
    cylinder(group, cloth, 0.062, 0.19, 0, 0.035, 0.38);
    mesh(group, sphereGeometry, cloth, 0, 0.47, 0, 0.13, 0.21, 0.075);
    mesh(group, sphereGeometry, timberLight, 0, 0.74, 0, 0.07, 0.085, 0.07);
    beamBetween(
      group,
      new THREE.Vector3(-0.12, 0.58, 0),
      new THREE.Vector3(-0.16, 0.34, 0.04),
      0.026,
      cloth,
    );
    beamBetween(
      group,
      new THREE.Vector3(0.12, 0.58, 0),
      new THREE.Vector3(0.17, 0.36, -0.03),
      0.026,
      cloth,
    );
    contactShadow(campus, x, z, 0.55, 0.6);
  };
  person(-1.93, 0.8, 0.2, 0);
  person(-1.66, 1.25, 2.7, 1);
  person(2, 0.5, -0.5, 2);
  person(-0.5, 3.72, 1.8, 0);
  person(0.1, -2.6, -1, 1);
  for (const [x, z] of [
    [-2.15, 4.6],
    [-6.35, 0.6],
    [6.35, 1.7],
    [1, -1.65],
    [-0.95, -3.2],
  ]) {
    cylinder(campus, darkMetal, x, 0.23, z, 0.045, 0.46);
    cylinder(campus, warmLight, x, 0.46, z, 0.046, 0.055);
  }
  for (let i = 0; i < 3; i++) {
    const bird = new THREE.Group();
    bird.position.set(-1 + i * 0.7, 5.2 + i * 0.22, -2 - i * 0.4);
    campus.add(bird);
    birds.push(bird);
    for (const side of [-1, 1]) {
      const wing = box(bird, darkMetal, side * 0.08, 0, 0, 0.18, 0.012, 0.045);
      wing.rotation.z = side * 0.19;
    }
    bird.scale.setScalar(0.75);
  }

  // Batch fixed architectural details by material. Each building remains one picking root,
  // but its dozens of mullions, chairs and slabs no longer cost separate draw calls.
  const batchStaticMeshes = (
    root: THREE.Group,
    excluded = new Set<THREE.Object3D>(),
  ) => {
    root.updateWorldMatrix(true, true);
    const rootInverse = root.matrixWorld.clone().invert();
    const batches = new Map<
      string,
      {
        surface: THREE.Material;
        meshes: THREE.Mesh[];
        cast: boolean;
        receive: boolean;
      }
    >();
    const collect = (object: THREE.Object3D) => {
      if (excluded.has(object)) return;
      if (
        object instanceof THREE.Mesh &&
        !Array.isArray(object.material) &&
        !object.material.transparent
      ) {
        const key = `${object.material.uuid}:${object.castShadow}:${object.receiveShadow}`;
        if (!batches.has(key))
          batches.set(key, {
            surface: object.material,
            meshes: [],
            cast: object.castShadow,
            receive: object.receiveShadow,
          });
        batches.get(key)!.meshes.push(object);
      }
      object.children.forEach(collect);
    };
    collect(root);
    batches.forEach((batch) => {
      if (batch.meshes.length < 2) return;
      const parts = batch.meshes.map((object) => {
        const copy = object.geometry.index
          ? object.geometry.toNonIndexed()
          : object.geometry.clone();
        copy.applyMatrix4(rootInverse.clone().multiply(object.matrixWorld));
        return copy;
      });
      const merged = mergeGeometries(parts);
      parts.forEach((part) => part.dispose());
      if (!merged) return;
      const combined = new THREE.Mesh(geometry(merged), batch.surface);
      combined.castShadow = batch.cast;
      combined.receiveShadow = batch.receive;
      batch.meshes.forEach((object) => object.removeFromParent());
      root.add(combined);
    });
  };
  regionGroups.forEach((group) => batchStaticMeshes(group));
  treeCrowns.forEach((group) => batchStaticMeshes(group));
  batchStaticMeshes(
    campus,
    new Set([...regionGroups.values(), ...treeCrowns, ...birds]),
  );

  scene.add(new THREE.HemisphereLight("#eaf0ee", "#c8baa0", 2.1));
  const sunLight = new THREE.DirectionalLight("#fff0d6", 4.1);
  sunLight.position.set(-8, 15, 6);
  sunLight.castShadow = true;
  const shadowSize = window.innerWidth < 700 ? 1024 : 2048;
  sunLight.shadow.mapSize.set(shadowSize, shadowSize);
  sunLight.shadow.camera.left = -11;
  sunLight.shadow.camera.right = 11;
  sunLight.shadow.camera.top = 11;
  sunLight.shadow.camera.bottom = -11;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 42;
  sunLight.shadow.normalBias = 0.035;
  sunLight.shadow.bias = -0.0003;
  sunLight.shadow.radius = 3;
  scene.add(sunLight);
  const fillLight = new THREE.DirectionalLight("#d9e6eb", 1.05);
  fillLight.position.set(6, 7, -8);
  scene.add(fillLight);

  const fail = (message: string) => {
    if (disposed || failed) return;
    failed = true;
    cancelAnimationFrame(raf);
    raf = 0;
    options.onError(message);
  };
  const pick = (event: PointerEvent): RegionId | null => {
    const bounds = host.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    for (const hit of raycaster.intersectObjects(pickingRoots, true)) {
      let parent: THREE.Object3D | null = hit.object;
      while (parent) {
        if (parent.userData.regionId)
          return parent.userData.regionId as RegionId;
        parent = parent.parent;
      }
    }
    return null;
  };
  const highlight = (id: RegionId | null) => {
    selectionOutlines.forEach((outline, key) => {
      (outline.material as THREE.MeshBasicMaterial).opacity =
        key === id ? 0.8 : 0;
    });
    needsRender = true;
  };
  const wake = () => {
    needsRender = true;
    if (
      initialized &&
      !raf &&
      !inFrame &&
      !disposed &&
      !failed &&
      inView &&
      !document.hidden
    )
      raf = requestAnimationFrame(frame);
  };
  const focus = (id: RegionId) => {
    selected = id;
    highlight(id);
    const { x, z } = REGIONS[id];
    targetGoal.set(x * 0.53, 0.8, z * 0.53);
    cameraGoal
      .copy(defaultPosition)
      .sub(defaultTarget)
      .multiplyScalar(0.83)
      .add(targetGoal);
    if (options.reducedMotion) {
      camera.position.copy(cameraGoal);
      controls?.target.copy(targetGoal);
      controls?.update();
      movingCamera = false;
    } else movingCamera = true;
    wake();
  };
  const down = (event: PointerEvent) => {
    if (event.button !== 0 || !renderer || failed) return;
    activePointers.add(event.pointerId);
    if (activePointers.size !== 1) {
      pointerDown = null;
      return;
    }
    pointerDown = {
      x: event.clientX,
      y: event.clientY,
      id: event.pointerId,
      moved: false,
    };
  };
  const move = (event: PointerEvent) => {
    if (
      pointerDown &&
      pointerDown.id === event.pointerId &&
      Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) >
        7
    )
      pointerDown.moved = true;
    if (event.pointerType !== "mouse" || pointerDown || !renderer) return;
    const hit = pick(event);
    renderer.domElement.style.cursor = hit
      ? "pointer"
      : interactive
        ? "grab"
        : "default";
    highlight(hit || selected);
    wake();
  };
  const up = (event: PointerEvent) => {
    activePointers.delete(event.pointerId);
    const start = pointerDown;
    pointerDown = null;
    if (
      !start ||
      start.id !== event.pointerId ||
      start.moved ||
      Math.hypot(event.clientX - start.x, event.clientY - start.y) > 7
    )
      return;
    const id = pick(event);
    if (id) {
      focus(id);
      options.onSelect(id);
    }
  };
  const cancel = () => {
    pointerDown = null;
    activePointers.clear();
  };
  const leave = () => {
    cancel();
    highlight(selected);
    wake();
  };
  const controlStart = () => {
    movingCamera = false;
    wake();
  };
  const controlChange = () => {
    needsRender = true;
    wake();
  };
  const visibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
      lastFrame = 0;
    } else wake();
  };
  const resized = () => {
    if (!renderer || disposed) return;
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (width < 1 || height < 1) {
      cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = THREE.MathUtils.radToDeg(
      2 *
        Math.atan(
          Math.tan(THREE.MathUtils.degToRad(39 / 2)) *
            Math.max(1, 1.1 / camera.aspect),
        ),
    );
    camera.updateProjectionMatrix();
    wake();
  };
  function frame(time: number) {
    raf = 0;
    if (
      disposed ||
      failed ||
      document.hidden ||
      !inView ||
      !renderer ||
      !controls ||
      !host.clientWidth ||
      !host.clientHeight
    )
      return;
    inFrame = true;
    const delta = lastFrame
      ? Math.min((time - lastFrame) / 1000, 0.05)
      : 1 / 60;
    lastFrame = time;
    let changed = false;
    if (movingCamera) {
      const step = 1 - Math.exp(-delta * 4.5);
      camera.position.lerp(cameraGoal, step);
      controls.target.lerp(targetGoal, step);
      if (
        camera.position.distanceToSquared(cameraGoal) < 0.0001 &&
        controls.target.distanceToSquared(targetGoal) < 0.0001
      )
        movingCamera = false;
      changed = true;
    }
    changed = controls.update() || changed;
    if (!paused) {
      elapsed += delta;
      treeCrowns.forEach((crown, index) => {
        crown.rotation.z = Math.sin(elapsed * 0.55 + index * 0.91) * 0.013;
      });
      birds.forEach((bird, index) => {
        bird.position.x = Math.sin(elapsed * 0.07 + index * 0.2) * 4 - 2;
        bird.position.z = Math.cos(elapsed * 0.07 + index * 0.2) * 2 - 3.5;
        bird.rotation.y = elapsed * 0.07 + index * 0.2;
        bird.children.forEach((wing, side) => {
          wing.rotation.z =
            (side ? 1 : -1) * (0.12 + Math.sin(elapsed * 3 + index) * 0.14);
        });
      });
      changed = true;
    }
    if (needsRender || changed) {
      try {
        renderer.render(scene, camera);
        needsRender = false;
      } catch {
        inFrame = false;
        fail("三维场景暂时无法渲染，您仍可继续浏览完整官网内容。");
        return;
      }
      if (!qualityMeasured && measuredFrames++ > 20) {
        measuredTime += delta;
        if (measuredFrames > 100) {
          qualityMeasured = true;
          // `delta` is the frame duration in seconds. Compare the measured
          // average directly; dividing by the frame count again made this
          // guard effectively unreachable on slower mobile devices.
          const averageFrameTime =
            measuredTime / Math.max(1, measuredFrames - 20);
          if (averageFrameTime > 0.035 && renderer.getPixelRatio() > 1) {
            renderer.setPixelRatio(1);
            resized();
          }
        }
      }
    }
    inFrame = false;
    if (!paused || movingCamera || changed || needsRender)
      raf = requestAnimationFrame(frame);
    else lastFrame = 0;
  }
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    raf = 0;
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    document.removeEventListener("visibilitychange", visibility);
    host.removeEventListener("pointerdown", down);
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerup", up);
    host.removeEventListener("pointercancel", cancel);
    host.removeEventListener("pointerleave", leave);
    controls?.removeEventListener("start", controlStart);
    controls?.removeEventListener("change", controlChange);
    controls?.dispose();
    scene.environment = null;
    environmentTarget?.dispose();
    environmentTarget = null;
    sunLight.shadow.dispose();
    geometries.forEach((value) => value.dispose());
    materials.forEach((value) => value.dispose());
    textures.forEach((value) => value.dispose());
    renderer?.domElement.remove();
    renderer?.dispose();
    scene.clear();
  };
  const controller: WorldController = {
    select: focus,
    reset: () => {
      selected = null;
      highlight(null);
      targetGoal.copy(defaultTarget);
      cameraGoal.copy(defaultPosition);
      if (options.reducedMotion) {
        camera.position.copy(defaultPosition);
        controls?.target.copy(defaultTarget);
        controls?.update();
        movingCamera = false;
      } else movingCamera = true;
      wake();
    },
    // Reduced motion starts paused, while still allowing an explicit user
    // request to play the scene from the controls.
    setPaused: (value) => {
      paused = value;
      wake();
    },
    setInteractive: (value) => {
      interactive = value;
      if (controls) {
        controls.enabled = value;
        controls.enableZoom = value;
      }
      if (renderer) {
        renderer.domElement.style.touchAction = value ? "none" : "pan-y";
        renderer.domElement.style.cursor = value ? "grab" : "default";
      }
      wake();
    },
    dispose,
  };

  // Driver initialization and shader compilation are not abortable. Bound their visible
  // loading time and dispose late-resolving renderers after an attempt has been retired.
  const bounded = async <T>(
    operation: Promise<T>,
    milliseconds: number,
  ): Promise<T> => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        operation,
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(new Error("Graphics initialization timed out")),
            milliseconds,
          );
        }),
      ]);
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }
  };
  const releaseRenderer = (candidate: WebGPURenderer) => {
    candidate.onDeviceLost = () => {};
    candidate.domElement.remove();
    try {
      candidate.dispose();
    } catch {
      /* A backend can fail before all internal objects exist. */
    }
  };
  try {
    let readyRenderer: WebGPURenderer | null = null;
    for (const forceWebGL of options.forceWebGL ? [true] : [false, true]) {
      if (!host.isConnected || disposed) {
        dispose();
        return controller;
      }
      const candidate = new WebGPURenderer({
        antialias: true,
        alpha: true,
        forceWebGL,
      });
      renderer = candidate;
      let lostDuringSetup = false;
      candidate.onDeviceLost = () => {
        if (renderer !== candidate || disposed) return;
        if (!initialized) {
          lostDuringSetup = true;
          return;
        }
        fail("图形设备连接已中断，可切换兼容模式或继续阅读页面内容。");
      };
      candidate.setPixelRatio(
        Math.min(
          window.devicePixelRatio || 1,
          window.innerWidth < 700 ? 1.5 : 2,
        ),
      );
      candidate.setClearColor("#f7f5ef", 0);
      candidate.toneMapping = THREE.ACESFilmicToneMapping;
      candidate.toneMappingExposure = 1.08;
      candidate.shadowMap.enabled = true;
      candidate.shadowMap.type = THREE.PCFShadowMap;
      try {
        const initPromise = candidate.init();
        void initPromise.then(
          () => {
            if (renderer !== candidate || disposed) releaseRenderer(candidate);
          },
          () => {},
        );
        await bounded(initPromise, 8000);
        if (!host.isConnected || disposed) {
          dispose();
          return controller;
        }
        if (lostDuringSetup)
          throw new Error("Graphics device lost during initialization");
        // A small reflection bake is enough for brushed metal. The explicit recovery
        // attempt uses direct daylight only, avoiding a repeat of environment failures.
        if (!forceWebGL) {
          const room = new RoomEnvironment();
          const pmrem = new PMREMGenerator(candidate);
          try {
            environmentTarget = pmrem.fromScene(room, 0.04, 0.1, 100, {
              size: window.innerWidth < 700 ? 64 : 128,
            });
            scene.environment = environmentTarget.texture;
            scene.environmentIntensity = 0.32;
          } catch {
            scene.environment = null;
            environmentTarget?.dispose();
            environmentTarget = null;
          } finally {
            room.dispose();
            pmrem.dispose();
          }
        }
        resized();
        await bounded(candidate.compileAsync(scene, camera), 10000);
        if (!host.isConnected || disposed) {
          dispose();
          return controller;
        }
        if (lostDuringSetup)
          throw new Error("Graphics device lost during compilation");
        if (host.clientWidth && host.clientHeight)
          candidate.render(scene, camera);
        readyRenderer = candidate;
        break;
      } catch {
        if (renderer === candidate) renderer = null;
        scene.environment = null;
        environmentTarget?.dispose();
        environmentTarget = null;
        sunLight.shadow.dispose();
        sunLight.shadow.map = null;
        sunLight.shadow.mapPass = null;
        releaseRenderer(candidate);
      }
    }
    if (!readyRenderer) throw new Error("No graphics backend could initialize");
    renderer = readyRenderer;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.cssText =
      "display:block;width:100%;height:100%;touch-action:pan-y;outline:none;";
    host.appendChild(renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(defaultTarget);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enabled = false;
    controls.minDistance = 14;
    controls.maxDistance = 34;
    controls.minPolarAngle = Math.PI * 0.13;
    controls.maxPolarAngle = Math.PI * 0.41;
    controls.minAzimuthAngle = -Math.PI * 0.3;
    controls.maxAzimuthAngle = Math.PI * 0.69;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.7;
    controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
    controls.update();
    // OrbitControls installs touch-action:none; normal reading retains vertical touch scrolling.
    renderer.domElement.style.touchAction = "pan-y";
    controls.addEventListener("start", controlStart);
    controls.addEventListener("change", controlChange);
    host.addEventListener("pointerdown", down);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerup", up);
    host.addEventListener("pointercancel", cancel);
    host.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);
    resizeObserver = new ResizeObserver(resized);
    resizeObserver.observe(host);
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        if (inView) wake();
        else {
          cancelAnimationFrame(raf);
          raf = 0;
          lastFrame = 0;
        }
      },
      { rootMargin: "80px" },
    );
    intersectionObserver.observe(host);
    initialized = true;
    resized();
    const backend = renderer.backend as unknown as {
      isWebGPUBackend?: boolean;
    };
    host.dataset.renderer = backend.isWebGPUBackend ? "webgpu" : "webgl";
    options.onReady(backend.isWebGPUBackend ? "webgpu" : "webgl");
    wake();
  } catch {
    fail("当前设备未能启动三维场景，您可以使用兼容模式或直接浏览完整内容。");
    dispose();
  }
  return controller;
}
