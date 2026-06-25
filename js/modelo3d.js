// ════════════════════════════════════════════════════════════
// MODELO3D.JS — Visor 3D del edificio C.E.A. "Catavi"
// El modelo se ve de frente y quieto al entrar a la página.
// Si el usuario no interactúa por un momento, empieza a rotar solo.
// Arrastrar = rotar manualmente · Rueda = zoom · Botón "Recorrer" = forzar el giro.
// ════════════════════════════════════════════════════════════

var scene, camera, renderer;
var modeloEdificio;
var canvasFrame, canvasHolder, canvasEl;

// Luces (guardadas en variables para poder controlarlas con los sliders)
var luzAmbiental, luzDireccional, luzPuntual;

// Cámara orbital "casera" (sin depender de OrbitControls.js)
var radio = 30;
var anguloH = 0;          // 0 = vista totalmente de frente
var anguloV = 0.32;       // leve inclinación hacia abajo
var objetivo;             // se calcula al cargar el modelo (centro real del edificio)

var arrastrando = false;
var ultimoX = 0, ultimoY = 0;

// Auto-rotación por inactividad
var autoRotar = false;
var idleTimer = null;
var ESPERA_INACTIVIDAD_MS = 6000;


// ════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════
function init() {

  canvasFrame = document.getElementById('canvas-frame');
  canvasHolder = document.getElementById('canvas-holder');

  objetivo = new THREE.Vector3(0, 4, 0);

  scene = new THREE.Scene();
  scene.background = null; // transparente: se ve el degradé del CSS detrás
  scene.fog = new THREE.Fog(0x0a0e14, 35, 95);

  camera = new THREE.PerspectiveCamera(
    45,
    canvasFrame.clientWidth / canvasFrame.clientHeight,
    0.1,
    1000
  );
  actualizarCamara();

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvasFrame.clientWidth, canvasFrame.clientHeight);
  canvasHolder.appendChild(renderer.domElement);
  canvasEl = renderer.domElement;

  put_Piso();
  put_ModeloCEA();
  put_LuzAmbiental();
  put_LuzDireccional();
  put_LuzPuntual();

  initControles();
  initPanelLuces();
  reiniciarTemporizadorInactividad();

  window.addEventListener('resize', alRedimensionar);

  animate();
}


// ════════════════════════════════════════════════════════════
// PISO
// ════════════════════════════════════════════════════════════
function put_Piso() {
  const geometry = new THREE.PlaneGeometry(70, 70);
  const material = new THREE.MeshLambertMaterial({ color: 0x9B8B6E, transparent: true, opacity: 0.85 });
  const piso = new THREE.Mesh(geometry, material);
  piso.rotation.x = -Math.PI / 2;
  scene.add(piso);

  const grid = new THREE.GridHelper(70, 35, 0x3a4458, 0x222a38);
  grid.position.y = 0.01;
  scene.add(grid);
}


// ════════════════════════════════════════════════════════════
// CARGAR EL MODELO DE BLENDER (.fbx)
// ════════════════════════════════════════════════════════════
function put_ModeloCEA() {

  const loader = new THREE.FBXLoader();

  loader.load(

    'modelos/CEA_Catavi.fbx',

    function (objeto) {

      objeto.scale.set(0.02, 0.02, 0.02);
      objeto.position.set(0, 0, 0);

      objeto.traverse(function (child) {
        if (child.isMesh) {
          child.material.side = THREE.DoubleSide;
        }
      });

      modeloEdificio = objeto;
      scene.add(objeto);

      // Centramos la cámara según el tamaño real del modelo, para que
      // siempre se vea completo de frente sin importar su escala exacta.
      const caja = new THREE.Box3().setFromObject(objeto);
      const centro = caja.getCenter(new THREE.Vector3());
      const tamano = caja.getSize(new THREE.Vector3());
      const maxDim = Math.max(tamano.x, tamano.y, tamano.z);

      objetivo.set(centro.x, centro.y, centro.z);
      radio = Math.max(14, Math.min(60, maxDim * 1.7));
      actualizarCamara();

      ocultarCargando();
      console.log('✅ Modelo CEA Catavi cargado correctamente');
    },

    function (xhr) {
      if (xhr.total > 0) {
        actualizarPorcentajeCarga((xhr.loaded / xhr.total * 100).toFixed(0));
      }
    },

    function (error) {
      console.error('❌ Error al cargar el modelo FBX:', error);
      mostrarErrorCarga();
    }

  );
}


// ════════════════════════════════════════════════════════════
// LUCES — guardadas en variables globales para los sliders
// ════════════════════════════════════════════════════════════
function put_LuzAmbiental() {
  luzAmbiental = new THREE.AmbientLight(0xFFFFFF, 0.6);
  scene.add(luzAmbiental);
}

function put_LuzDireccional() {
  luzDireccional = new THREE.DirectionalLight(0xFFFFFF, 1.0);
  luzDireccional.position.set(-20, 30, 20);
  luzDireccional.target.position.set(0, 3, 0);
  scene.add(luzDireccional);
  scene.add(luzDireccional.target);
}

function put_LuzPuntual() {
  luzPuntual = new THREE.PointLight(0xFFEEAA, 0.6, 60);
  luzPuntual.position.set(0, 8, 15);
  scene.add(luzPuntual);
}


// ════════════════════════════════════════════════════════════
// PANEL DE ILUMINACIÓN (botón + sliders)
// ════════════════════════════════════════════════════════════
function initPanelLuces() {
  const btn = document.getElementById('btn-luces');
  const panel = document.getElementById('luz-panel');

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    panel.classList.toggle('is-open');
    btn.classList.toggle('is-active');
  });

  document.addEventListener('click', function (e) {
    if (!panel.contains(e.target) && e.target !== btn) {
      panel.classList.remove('is-open');
      btn.classList.remove('is-active');
    }
  });

  const sAmb = document.getElementById('slider-ambiental');
  const sDir = document.getElementById('slider-direccional');
  const sPun = document.getElementById('slider-puntual');
  const vAmb = document.getElementById('val-ambiental');
  const vDir = document.getElementById('val-direccional');
  const vPun = document.getElementById('val-puntual');

  sAmb.addEventListener('input', function () {
    luzAmbiental.intensity = sAmb.value / 100;
    vAmb.textContent = sAmb.value + '%';
  });
  sDir.addEventListener('input', function () {
    luzDireccional.intensity = sDir.value / 100;
    vDir.textContent = sDir.value + '%';
  });
  sPun.addEventListener('input', function () {
    luzPuntual.intensity = sPun.value / 100;
    vPun.textContent = sPun.value + '%';
  });
}


// ════════════════════════════════════════════════════════════
// CONTROLES DE CÁMARA
// ════════════════════════════════════════════════════════════
function initControles() {

  canvasEl.addEventListener('mousedown', function (e) {
    arrastrando = true;
    pausarAutoRotacion();
    ultimoX = e.clientX;
    ultimoY = e.clientY;
  });

  window.addEventListener('mouseup', function () { arrastrando = false; });

  window.addEventListener('mousemove', function (e) {
    if (!arrastrando) return;
    const dx = e.clientX - ultimoX;
    const dy = e.clientY - ultimoY;
    ultimoX = e.clientX;
    ultimoY = e.clientY;

    anguloH -= dx * 0.005;
    anguloV += dy * 0.005;
    anguloV = Math.max(0.08, Math.min(1.3, anguloV));

    actualizarCamara();
  });

  canvasEl.addEventListener('wheel', function (e) {
    e.preventDefault();
    pausarAutoRotacion();
    radio += e.deltaY * 0.02;
    radio = Math.max(8, Math.min(70, radio));
    actualizarCamara();
  }, { passive: false });

  canvasEl.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
      arrastrando = true;
      pausarAutoRotacion();
      ultimoX = e.touches[0].clientX;
      ultimoY = e.touches[0].clientY;
    }
  }, { passive: true });

  canvasEl.addEventListener('touchmove', function (e) {
    if (!arrastrando || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - ultimoX;
    const dy = e.touches[0].clientY - ultimoY;
    ultimoX = e.touches[0].clientX;
    ultimoY = e.touches[0].clientY;

    anguloH -= dx * 0.006;
    anguloV += dy * 0.006;
    anguloV = Math.max(0.08, Math.min(1.3, anguloV));
    actualizarCamara();
  }, { passive: true });

  canvasEl.addEventListener('touchend', function () { arrastrando = false; });

  document.getElementById('btn-zoom-in').addEventListener('click', function () {
    pausarAutoRotacion();
    radio = Math.max(8, radio - 3);
    actualizarCamara();
  });
  document.getElementById('btn-zoom-out').addEventListener('click', function () {
    pausarAutoRotacion();
    radio = Math.min(70, radio + 3);
    actualizarCamara();
  });
  document.getElementById('btn-reset').addEventListener('click', function () {
    anguloH = 0; anguloV = 0.32;
    pausarAutoRotacion();
    actualizarCamara();
  });

  // Botón "Recorrer" — fuerza el giro automático de inmediato y lo puede pausar
  const btnRecorrer = document.getElementById('btn-recorrer');
  btnRecorrer.addEventListener('click', function () {
    autoRotar = !autoRotar;
    clearTimeout(idleTimer);
    if (autoRotar) {
      btnRecorrer.classList.add('is-active');
      btnRecorrer.lastChild.textContent = ' Pausar';
    } else {
      btnRecorrer.classList.remove('is-active');
      btnRecorrer.lastChild.textContent = ' Recorrer';
      reiniciarTemporizadorInactividad();
    }
  });

  function actualizarBotonRecorrer() {
    if (autoRotar) {
      btnRecorrer.classList.add('is-active');
      btnRecorrer.lastChild.textContent = ' Pausar';
    } else {
      btnRecorrer.classList.remove('is-active');
      btnRecorrer.lastChild.textContent = ' Recorrer';
    }
  }
  // se actualiza también cuando la auto-rotación arranca sola por inactividad
  window.addEventListener('cea-autorotate-cambio', actualizarBotonRecorrer);
}

function pausarAutoRotacion() {
  if (autoRotar) {
    autoRotar = false;
    window.dispatchEvent(new Event('cea-autorotate-cambio'));
  }
  reiniciarTemporizadorInactividad();
}

function reiniciarTemporizadorInactividad() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(function () {
    autoRotar = true;
    window.dispatchEvent(new Event('cea-autorotate-cambio'));
  }, ESPERA_INACTIVIDAD_MS);
}

function actualizarCamara() {
  const x = objetivo.x + radio * Math.sin(anguloH) * Math.cos(anguloV);
  const y = objetivo.y + radio * Math.sin(anguloV);
  const z = objetivo.z + radio * Math.cos(anguloH) * Math.cos(anguloV);
  camera.position.set(x, y, z);
  camera.lookAt(objetivo);
}


// ════════════════════════════════════════════════════════════
// PANTALLA DE CARGA
// ════════════════════════════════════════════════════════════
function actualizarPorcentajeCarga(pct) {
  const el = document.getElementById('loading-pct');
  if (el) el.textContent = pct + '%';
}

function ocultarCargando() {
  const pantalla = document.getElementById('loading-screen');
  if (pantalla) pantalla.classList.add('is-hidden');
}

function mostrarErrorCarga() {
  const pantalla = document.getElementById('loading-screen');
  const lbl = document.getElementById('loading-label');
  if (pantalla && lbl) {
    pantalla.classList.add('is-error');
    lbl.innerHTML = 'No se pudo cargar el modelo 3D.<br>Verifica que la carpeta "modelos/CEA_Catavi.fbx" exista junto a esta página.';
  }
}


// ════════════════════════════════════════════════════════════
// RESIZE
// ════════════════════════════════════════════════════════════
function alRedimensionar() {
  const ancho = canvasFrame.clientWidth;
  const alto = canvasFrame.clientHeight;
  camera.aspect = ancho / alto;
  camera.updateProjectionMatrix();
  renderer.setSize(ancho, alto);
}


// ════════════════════════════════════════════════════════════
// ANIMATE
// ════════════════════════════════════════════════════════════
function animate() {
  requestAnimationFrame(animate);

  if (autoRotar) {
    anguloH += 0.0022;
    actualizarCamara();
  }

  renderer.render(scene, camera);
}


// ════════════════════════════════════════════════════════════
// INICIO
// ════════════════════════════════════════════════════════════
init();