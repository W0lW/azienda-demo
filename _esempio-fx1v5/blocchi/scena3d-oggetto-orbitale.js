// Oggetto 3D guidato dallo scroll: la camera orbita, l'oggetto ruota, i testi scorrono sopra.
export default function init(radice, ctx) {
  const { THREE, GLTFLoader, RoomEnvironment, gsap, ScrollTrigger, tema, mobile, webgl, riduciMovimento } = ctx;
  const passi = [...radice.querySelectorAll('.b-s3d__passo')];

  if (!webgl || riduciMovimento) { radice.classList.add('statico'); return; }

  const canvas = radice.querySelector('.b-s3d__canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  const colLuce = new THREE.Color(tema.luce || '#ffd9a0');
  const colAccento = new THREE.Color(tema.accento || '#d4a24c');

  const luce = new THREE.PointLight(colLuce, 30, 20);
  luce.position.set(3, 2, 4);
  scena.add(luce);
  const controluce = new THREE.PointLight(colAccento, 20, 20);
  controluce.position.set(-4, -1, -3);
  scena.add(controluce);

  const gruppo = new THREE.Group();
  scena.add(gruppo);

  // Oggetto: modello del cliente oppure cristallo procedurale
  const urlModello = radice.dataset.modello;
  if (urlModello) {
    new GLTFLoader().load(urlModello, (gltf) => {
      const m = gltf.scene;
      const box = new THREE.Box3().setFromObject(m);
      const dim = box.getSize(new THREE.Vector3()).length();
      m.position.sub(box.getCenter(new THREE.Vector3()));
      const contenitore = new THREE.Group();
      contenitore.add(m);
      contenitore.scale.setScalar(2.4 / dim);
      gruppo.add(contenitore);
    }, undefined, (e) => { console.warn('[scena3d] modello non caricato, uso il cristallo', e); gruppo.add(cristallo()); });
  } else {
    gruppo.add(cristallo());
  }

  function cristallo() {
    const geo = new THREE.IcosahedronGeometry(1, 0);
    const mat = new THREE.MeshPhysicalMaterial({
      color: colAccento, metalness: 0.15, roughness: 0.08,
      transmission: 0.9, thickness: 1.2, ior: 1.6, iridescence: 0.4,
      clearcoat: 1, clearcoatRoughness: 0.05, flatShading: true,
    });
    return new THREE.Mesh(geo, mat);
  }

  // Polvere luminosa in orbita
  const n = mobile ? 250 : 900;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 1.8 + Math.random() * 2.2, a = Math.random() * Math.PI * 2, h = (Math.random() - 0.5) * 2.2;
    pos.set([Math.cos(a) * r, h, Math.sin(a) * r], i * 3);
  }
  const geoPolvere = new THREE.BufferGeometry();
  geoPolvere.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const polvere = new THREE.Points(geoPolvere, new THREE.PointsMaterial({
    color: colLuce, size: mobile ? 0.03 : 0.02, transparent: true, opacity: 0.8,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scena.add(polvere);

  // Stato guidato dallo scroll (0 → 1) e dal mouse
  const stato = { p: 0 };
  const mouse = { x: 0, y: 0 };
  if (!mobile) addEventListener('pointermove', (e) => {
    mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5;
  });

  ScrollTrigger.create({
    trigger: radice, start: 'top top', end: 'bottom bottom', scrub: 1,
    onUpdate: (st) => { stato.p = st.progress; },
  });

  // Testi: ogni passo entra ed esce mentre la sezione scorre
  passi.forEach((el) => {
    gsap.fromTo(el.children, { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 70%', end: 'top 30%', scrub: true },
    });
  });

  function ridimensiona() {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < h ? 50 : 35;
    camera.updateProjectionMatrix();
  }
  ridimensiona();
  addEventListener('resize', ridimensiona);

  // Render solo quando la sezione è visibile
  let visibile = false;
  new IntersectionObserver(([e]) => { visibile = e.isIntersecting; }).observe(radice);

  const orologio = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!visibile) return;
    const t = orologio.getElapsedTime();
    const p = stato.p;
    const ang = -0.6 + p * Math.PI * 1.2;
    const dist = 6.2 - p * 1.8;
    camera.position.set(Math.sin(ang) * dist, 0.6 - p * 0.8 + mouse.y * 0.4, Math.cos(ang) * dist);
    camera.lookAt(0, 0, 0);
    gruppo.rotation.y = p * Math.PI * 2 + t * 0.15 + mouse.x * 0.3;
    gruppo.rotation.x = Math.sin(t * 0.4) * 0.1;
    gruppo.position.y = Math.sin(t * 0.8) * 0.06;
    polvere.rotation.y = t * 0.03 + p * 0.8;
    renderer.render(scena, camera);
  });
}
