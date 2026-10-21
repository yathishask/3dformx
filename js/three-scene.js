/**
 * 3D FormX - Three.js Interactive 3D Engines
 * 1. Hero Ambient 3D Geometric Core
 * 2. Interactive CAD Inspection Studio with Materials & Wireframe Controls
 */

// Hero 3D Canvas
let heroRenderer, heroScene, heroCamera, heroCore, heroLattice, heroParticles, heroFrameId;

function initHero3D() {
  const container = document.getElementById("hero3dCanvasContainer");
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  heroScene = new THREE.Scene();
  heroCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  heroCamera.position.set(0, 0, 7);

  heroRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  heroRenderer.setSize(width, height);
  heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  heroRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  heroRenderer.toneMappingExposure = 1.2;

  container.innerHTML = "";
  container.appendChild(heroRenderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x22222a, 2.5);
  heroScene.add(ambientLight);

  const orangeLight = new THREE.PointLight(0xff6b00, 4, 20);
  orangeLight.position.set(4, 3, 4);
  heroScene.add(orangeLight);

  const blueLight = new THREE.PointLight(0x38bdf8, 2, 20);
  blueLight.position.set(-4, -2, -3);
  heroScene.add(blueLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 2);
  rimLight.position.set(0, 5, 5);
  heroScene.add(rimLight);

  // Group
  heroCore = new THREE.Group();
  heroScene.add(heroCore);

  // Outer Torus Knot (Sculpted CAD Form)
  const knotGeo = new THREE.TorusKnotGeometry(1.6, 0.45, 128, 32, 2, 3);
  const knotMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a1e27,
    metalness: 0.85,
    roughness: 0.18,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    reflectivity: 0.9,
    wireframe: false
  });
  const knotMesh = new THREE.Mesh(knotGeo, knotMat);
  heroCore.add(knotMesh);

  // Inner Glow Wireframe Core
  const wireGeo = new THREE.IcosahedronGeometry(1.1, 2);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xff7b00,
    wireframe: true,
    transparent: true,
    opacity: 0.65
  });
  heroLattice = new THREE.Mesh(wireGeo, wireMat);
  heroCore.add(heroLattice);

  // Add Glowing Floating Additive Particles
  const particleGeo = new THREE.BufferGeometry();
  const particleCount = 180;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 10;
    positions[i + 1] = (Math.random() - 0.5) * 8;
    positions[i + 2] = (Math.random() - 0.5) * 6;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xff8c00,
    size: 0.05,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  });
  heroParticles = new THREE.Points(particleGeo, particleMat);
  heroScene.add(heroParticles);

  // Mouse interaction
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
  });

  // Render loop
  function animate() {
    heroFrameId = requestAnimationFrame(animate);

    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    heroCore.rotation.x += 0.005 + targetY * 0.01;
    heroCore.rotation.y += 0.008 + targetX * 0.01;
    heroLattice.rotation.x -= 0.007;
    heroLattice.rotation.z += 0.006;

    if (heroParticles) {
      heroParticles.rotation.y -= 0.001;
    }

    heroRenderer.render(heroScene, heroCamera);
  }
  animate();

  // Resize handler
  window.addEventListener("resize", () => {
    if (!container) return;
    const newW = container.clientWidth;
    const newH = container.clientHeight;
    heroCamera.aspect = newW / newH;
    heroCamera.updateProjectionMatrix();
    heroRenderer.setSize(newW, newH);
  });
}

// -------------------------------------------------------------
// Interactive CAD Inspection Studio
// -------------------------------------------------------------
let cadRenderer, cadScene, cadCamera, cadModelGroup, cadMesh, cadWireframeMesh;
let cadIsDragging = false, cadPreviousMouseX = 0, cadPreviousMouseY = 0;
let cadAutoRotate = true;

const CAD_MATERIALS = {
  chrome: {
    name: "Liquid Chrome Silver",
    mat: () => new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.12,
      wireframe: false
    })
  },
  obsidian: {
    name: "Stealth Carbon PEEK",
    mat: () => new THREE.MeshStandardMaterial({
      color: 0x181c24,
      metalness: 0.4,
      roughness: 0.45,
      wireframe: false
    })
  },
  amber: {
    name: "Cyber Amber Resin",
    mat: () => new THREE.MeshPhysicalMaterial({
      color: 0xff6600,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.7,
      transparent: true,
      opacity: 0.9,
      wireframe: false
    })
  },
  titanium: {
    name: "Grade 5 Titanium DMLS",
    mat: () => new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.8,
      roughness: 0.35,
      wireframe: false
    })
  }
};

let currentCadMaterialKey = "chrome";

function initCadStudio() {
  const container = document.getElementById("cadStudioCanvas");
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  cadScene = new THREE.Scene();
  cadCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
  cadCamera.position.set(0, 1.8, 6.5);

  cadRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  cadRenderer.setSize(width, height);
  cadRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  cadRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  cadRenderer.toneMappingExposure = 1.3;

  container.innerHTML = "";
  container.appendChild(cadRenderer.domElement);

  // Lighting Setup
  const ambient = new THREE.AmbientLight(0x2a2e39, 3);
  cadScene.add(ambient);

  const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
  mainLight.position.set(5, 8, 5);
  cadScene.add(mainLight);

  const rimLight = new THREE.DirectionalLight(0xff7700, 2);
  rimLight.position.set(-6, -3, -4);
  cadScene.add(rimLight);

  const fillLight = new THREE.PointLight(0x38bdf8, 1.8, 15);
  fillLight.position.set(0, -4, 4);
  cadScene.add(fillLight);

  // Grid Plane Helper (Dark Tech Floor)
  const gridHelper = new THREE.GridHelper(10, 20, 0xff6b00, 0x222834);
  gridHelper.position.y = -2;
  cadScene.add(gridHelper);

  // CAD Model: Complex Mechanical Assembly
  cadModelGroup = new THREE.Group();
  cadScene.add(cadModelGroup);

  // Construct Multi-piece 3D mechanical part
  buildMechanicalAssembly();

  // Mouse & Touch Orbit
  const dom = cadRenderer.domElement;
  dom.addEventListener("mousedown", (e) => {
    cadIsDragging = true;
    cadPreviousMouseX = e.clientX;
    cadPreviousMouseY = e.clientY;
  });

  window.addEventListener("mouseup", () => {
    cadIsDragging = false;
  });

  window.addEventListener("mousemove", (e) => {
    if (!cadIsDragging) return;
    const deltaX = e.clientX - cadPreviousMouseX;
    const deltaY = e.clientY - cadPreviousMouseY;

    cadModelGroup.rotation.y += deltaX * 0.008;
    cadModelGroup.rotation.x += deltaY * 0.008;

    cadPreviousMouseX = e.clientX;
    cadPreviousMouseY = e.clientY;
  });

  // Touch support for mobile
  dom.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      cadIsDragging = true;
      cadPreviousMouseX = e.touches[0].clientX;
      cadPreviousMouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener("touchend", () => {
    cadIsDragging = false;
  });

  window.addEventListener("touchmove", (e) => {
    if (!cadIsDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - cadPreviousMouseX;
    const deltaY = e.touches[0].clientY - cadPreviousMouseY;

    cadModelGroup.rotation.y += deltaX * 0.01;
    cadModelGroup.rotation.x += deltaY * 0.01;

    cadPreviousMouseX = e.touches[0].clientX;
    cadPreviousMouseY = e.touches[0].clientY;
  }, { passive: true });

  // Zoom with Wheel
  dom.addEventListener("wheel", (e) => {
    e.preventDefault();
    cadCamera.position.z += e.deltaY * 0.005;
    cadCamera.position.z = Math.max(3.5, Math.min(10, cadCamera.position.z));
  }, { passive: false });

  // CAD Animation Loop
  function animateCad() {
    requestAnimationFrame(animateCad);

    if (cadAutoRotate && !cadIsDragging) {
      cadModelGroup.rotation.y += 0.006;
    }

    cadRenderer.render(cadScene, cadCamera);
  }
  animateCad();

  // Resize
  window.addEventListener("resize", () => {
    if (!container) return;
    const newW = container.clientWidth;
    const newH = container.clientHeight;
    cadCamera.aspect = newW / newH;
    cadCamera.updateProjectionMatrix();
    cadRenderer.setSize(newW, newH);
  });
}

function buildMechanicalAssembly() {
  // Clear group
  while (cadModelGroup.children.length > 0) {
    cadModelGroup.remove(cadModelGroup.children[0]);
  }

  const baseMat = CAD_MATERIALS[currentCadMaterialKey].mat();

  // Central Gear/Hub
  const hubGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.45, 36);
  cadMesh = new THREE.Mesh(hubGeo, baseMat);
  cadMesh.castShadow = true;
  cadModelGroup.add(cadMesh);

  // Outer Flange with Precision Cutouts
  const ringGeo = new THREE.TorusGeometry(1.7, 0.18, 16, 64);
  const ringMesh = new THREE.Mesh(ringGeo, baseMat);
  ringMesh.rotation.x = Math.PI / 2;
  cadModelGroup.add(ringMesh);

  // Radial Struts / Turbine Blades (6 struts)
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const strutGeo = new THREE.BoxGeometry(0.2, 0.12, 1.5);
    const strutMesh = new THREE.Mesh(strutGeo, baseMat);
    strutMesh.position.x = Math.cos(angle) * 0.9;
    strutMesh.position.z = Math.sin(angle) * 0.9;
    strutMesh.rotation.y = -angle + 0.35;
    cadModelGroup.add(strutMesh);
  }

  // Core Bearing / Shaft with Amber Accents
  const shaftGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.9, 32);
  const shaftMat = new THREE.MeshStandardMaterial({
    color: 0xff6b00,
    metalness: 0.8,
    roughness: 0.25,
    emissive: 0x441500
  });
  const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
  cadModelGroup.add(shaftMesh);

  // Wireframe Overlay (X-Ray toggleable)
  cadWireframeMesh = new THREE.Group();
  cadModelGroup.children.forEach(child => {
    if (child.isMesh) {
      const wireGeo = new THREE.WireframeGeometry(child.geometry);
      const wireMat = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.0 // starts invisible unless toggled
      });
      const wire = new THREE.LineSegments(wireGeo, wireMat);
      wire.position.copy(child.position);
      wire.rotation.copy(child.rotation);
      cadWireframeMesh.add(wire);
    }
  });
  cadModelGroup.add(cadWireframeMesh);
}

// Controls exported to Global window
window.setCadMaterial = function(matKey) {
  if (!CAD_MATERIALS[matKey]) return;
  currentCadMaterialKey = matKey;
  buildMechanicalAssembly();

  // Update active state in UI
  document.querySelectorAll("[data-cad-mat]").forEach(btn => {
    if (btn.getAttribute("data-cad-mat") === matKey) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  const labelEl = document.getElementById("activeMaterialLabel");
  if (labelEl) {
    labelEl.textContent = CAD_MATERIALS[matKey].name;
  }
};

window.toggleCadWireframe = function() {
  if (!cadWireframeMesh) return;
  const isWireActive = cadWireframeMesh.children[0].material.opacity > 0;
  const newOpacity = isWireActive ? 0.0 : 0.85;

  cadWireframeMesh.children.forEach(line => {
    line.material.opacity = newOpacity;
  });

  const wireBtn = document.getElementById("cadWireframeBtn");
  if (wireBtn) {
    wireBtn.classList.toggle("active", !isWireActive);
  }
};

window.toggleCadAutoRotate = function() {
  cadAutoRotate = !cadAutoRotate;
  const rotateBtn = document.getElementById("cadRotateBtn");
  if (rotateBtn) {
    rotateBtn.classList.toggle("active", cadAutoRotate);
  }
};

window.resetCadCamera = function() {
  if (cadModelGroup && cadCamera) {
    cadModelGroup.rotation.set(0, 0, 0);
    cadCamera.position.set(0, 1.8, 6.5);
  }
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (typeof THREE !== "undefined") {
      initHero3D();
      initCadStudio();
    }
  }, 200);
});
