/* ===========================
   Heart 3D Viewer with GLTF/GLB Support
   Requires: THREE.js + OrbitControls + GLTFLoader
   =========================== */

(function initHeart3D() {
  const canvas = document.getElementById("heartCanvas");
  if (!canvas) return;

  // Loading indicator
  const container = canvas.parentElement;
  let loadingEl = document.createElement("div");
  loadingEl.className = "heart-loading";
  loadingEl.innerHTML = '<div class="heart-loading-spinner"></div><p>Loading 3D model...</p>';
  container.appendChild(loadingEl);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x151515);

  // Camera
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 0.4);

  // OrbitControls (touch-friendly)
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = true;
  controls.enableZoom = true;
  controls.rotateSpeed = 0.6;
  controls.zoomSpeed = 0.8;
  controls.panSpeed = 0.8;
  controls.minDistance = 0.15;
  controls.maxDistance = 2;

  // Lighting setup for realistic rendering
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
  keyLight.position.set(2, 3, 2);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
  fillLight.position.set(-2, 1, 2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
  rimLight.position.set(0, -1, -2);
  scene.add(rimLight);

  // Add subtle point light for depth
  const pointLight = new THREE.PointLight(0xffcccc, 0.3, 10);
  pointLight.position.set(0, 0, 0.5);
  scene.add(pointLight);

  // Heart model reference
  let heartModel = null;
  let autoRotate = false;

  // Create fallback procedural heart (used if model fails to load)
  function createProceduralHeart() {
    const shape = new THREE.Shape();
    const x = 0, y = 0;

    shape.moveTo(x + 0, y + 0.6);
    shape.bezierCurveTo(x + 0, y + 0.9, x - 0.6, y + 1.1, x - 0.8, y + 0.6);
    shape.bezierCurveTo(x - 1.0, y + 0.1, x - 0.4, y - 0.2, x + 0, y - 0.55);
    shape.bezierCurveTo(x + 0.4, y - 0.2, x + 1.0, y + 0.1, x + 0.8, y + 0.6);
    shape.bezierCurveTo(x + 0.6, y + 1.1, x + 0, y + 0.9, x + 0, y + 0.6);

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.6,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.12,
      bevelSegments: 6,
      steps: 2,
    });

    geometry.center();
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: 0x8b1e1e,
      metalness: 0.1,
      roughness: 0.55,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI * 0.08;
    mesh.scale.set(0.1, 0.1, 0.1);
    return mesh;
  }

  // Load GLTF/GLB model
  function loadHeartModel(url) {
    const loader = new THREE.GLTFLoader();

    loader.load(
      url,
      // Success callback
      function (gltf) {
        heartModel = gltf.scene;

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(heartModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center the model
        heartModel.position.sub(center);

        // Scale to fit nicely in view (target size ~0.25 units)
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 0.25 / maxDim;
        heartModel.scale.setScalar(scale);

        // Rotate to better initial view
        heartModel.rotation.x = -Math.PI / 12;

        scene.add(heartModel);

        // Hide loading indicator
        if (loadingEl) {
          loadingEl.style.display = "none";
        }

        console.log("Heart model loaded successfully!");
      },
      // Progress callback
      function (xhr) {
        if (xhr.lengthComputable) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          if (loadingEl) {
            loadingEl.querySelector("p").textContent = `Loading... ${percent}%`;
          }
        }
      },
      // Error callback
      function (error) {
        console.warn("Failed to load GLB model, using procedural fallback:", error);
        heartModel = createProceduralHeart();
        scene.add(heartModel);

        if (loadingEl) {
          loadingEl.style.display = "none";
        }
      }
    );
  }

  // Try to load the model from the models folder
  // You need to place your .glb file here
  const modelPath = "models/heart.glb";

  // Check if model exists, otherwise use fallback
  fetch(modelPath, { method: "HEAD" })
    .then((response) => {
      if (response.ok) {
        loadHeartModel(modelPath);
      } else {
        throw new Error("Model not found");
      }
    })
    .catch(() => {
      console.log("No GLB model found at", modelPath, "- using procedural heart");
      heartModel = createProceduralHeart();
      scene.add(heartModel);
      if (loadingEl) {
        loadingEl.style.display = "none";
      }
    });

  // Resize handler
  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;

    const w = parent.clientWidth;
    const h = parent.clientHeight;

    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    if (autoRotate && heartModel) {
      heartModel.rotation.y += 0.005;
    }

    controls.update();
    renderer.render(scene, camera);
  }

  // Event listeners
  window.addEventListener("resize", resize, { passive: true });

  // Expose API for page switching
  window.__heart3D = {
    resize,
    loadModel: loadHeartModel,
  };

  // Initialize
  resize();
  animate();
})();
