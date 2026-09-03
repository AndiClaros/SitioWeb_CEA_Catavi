var scene3d, camera3d, renderer3d;
var modeloFondo, objetivoFondo;
var luzAmb3d, luzDir3d, luzPun3d;
var anguloFondo = -0.3;
var visorActivo = false;

var camaraDestX = 0, camaraDestY = 7, camaraDestZ = 22;
var camaraActX = 0, camaraActY = 7, camaraActZ = 22;
var lookDestX = 0, lookDestY = 4, lookDestZ = 0;
var lookActX = 0, lookActY = 4, lookActZ = 0;

var autoOrbitando = true;
var timerScroll = null;
var enModeloPag = window.location.pathname.indexOf('modelo3d') !== -1;
var IDLE_MODELO = 20000;
var IDLE_OTROS = 1500;

var sistemaClima = null;
var velocidadClima = 0;

var keyframes = [
  { scroll: 0.00, x: 0, y: 7, z: 22, lx: 0, ly: 4, lz: 0 },
  { scroll: 0.25, x: 20, y: 9, z: 14, lx: 0, ly: 4, lz: 0 },
  { scroll: 0.50, x: 20, y: 5, z: 0, lx: 0, ly: 4, lz: 0 },
  { scroll: 0.75, x: -20, y: 9, z: 14, lx: 0, ly: 4, lz: 0 },
  { scroll: 1.00, x: 0, y: 7, z: 22, lx: 0, ly: 4, lz: 0 }
];

function iniciarOrbitaDesde(cx, cy, cz) {
  anguloFondo = Math.atan2(cx, cz);
  camaraActX = cx; camaraActY = cy; camaraActZ = cz;
  camaraDestX = cx; camaraDestY = cy; camaraDestZ = cz;
  autoOrbitando = true;
}

function aplicarCalidad(nivel) {
  if (nivel === 'alta') {
    renderer3d.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer3d.shadowMap.enabled = true;
    luzDir3d.shadow.mapSize.width = 2048;
    luzDir3d.shadow.mapSize.height = 2048;
  } else if (nivel === 'media') {
    renderer3d.setPixelRatio(1);
    renderer3d.shadowMap.enabled = true;
    luzDir3d.shadow.mapSize.width = 1024;
    luzDir3d.shadow.mapSize.height = 1024;
  } else {
    renderer3d.setPixelRatio(0.75);
    renderer3d.shadowMap.enabled = false;
  }
}

function crearParticulasClima(color, size, opacidad, cantidad, velocidad) {
  if (sistemaClima) scene3d.remove(sistemaClima);
  var geo = new THREE.BufferGeometry();
  var pos = new Float32Array(cantidad * 3);
  for (var i = 0; i < cantidad * 3; i += 3) {
    pos[i] = (Math.random() - 0.5) * 80;
    pos[i + 1] = Math.random() * 40;
    pos[i + 2] = (Math.random() - 0.5) * 80;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var mat = new THREE.PointsMaterial({ color: color, size: size, transparent: true, opacity: opacidad });
  sistemaClima = new THREE.Points(geo, mat);
  velocidadClima = velocidad;
  scene3d.add(sistemaClima);
}

function crearLluvia() { crearParticulasClima(0xaaaacc, 0.12, 0.6, 2000, 0.35); }
function crearNieve() { crearParticulasClima(0xffffff, 0.28, 0.85, 1200, 0.06); }
function quitarClima() {
  if (sistemaClima) { scene3d.remove(sistemaClima); sistemaClima = null; velocidadClima = 0; }
}

function ocultarPantallaCarga() {
  var pc = document.getElementById('pantalla-carga');
  if (!pc) return;
  var relleno = document.getElementById('carga-relleno');
  var pct = document.getElementById('carga-pct');
  if (relleno) relleno.style.width = '100%';
  if (pct) pct.textContent = '100%';
  setTimeout(function () {
    pc.style.transition = 'opacity 0.6s';
    pc.style.opacity = '0';
    setTimeout(function () { pc.style.display = 'none'; }, 650);
  }, 300);
}

function initFondo3D() {
  scene3d = new THREE.Scene();
  scene3d.background = new THREE.Color(0x87CEEB);
  scene3d.fog = new THREE.FogExp2(0x6aabcc, 0.010);
  objetivoFondo = new THREE.Vector3(0, 4, 0);

  camera3d = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera3d.position.set(0, 8, 22);
  camera3d.lookAt(objetivoFondo);

  renderer3d = new THREE.WebGLRenderer({ antialias: true });
  renderer3d.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer3d.setSize(window.innerWidth, window.innerHeight);
  renderer3d.shadowMap.enabled = true;
  renderer3d.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('fondo-3d').appendChild(renderer3d.domElement);

  var piso = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshLambertMaterial({ color: 0x8a7055 })
  );
  piso.rotation.x = -Math.PI / 2;
  piso.receiveShadow = true;
  scene3d.add(piso);

  var grid = new THREE.GridHelper(120, 30, 0x5a4a38, 0x4a3a28);
  grid.position.y = 0.01;
  scene3d.add(grid);

  luzAmb3d = new THREE.AmbientLight(0xfff0e0, 0.70);
  scene3d.add(luzAmb3d);

  luzDir3d = new THREE.DirectionalLight(0xfff8ee, 1.20);
  luzDir3d.position.set(15, 30, 10);
  luzDir3d.target.position.set(0, 0, 0);
  luzDir3d.castShadow = true;
  luzDir3d.shadow.mapSize.width = 1024;
  luzDir3d.shadow.mapSize.height = 1024;
  luzDir3d.shadow.camera.near = 0.5;
  luzDir3d.shadow.camera.far = 200;
  luzDir3d.shadow.camera.left = -30;
  luzDir3d.shadow.camera.right = 30;
  luzDir3d.shadow.camera.top = 30;
  luzDir3d.shadow.camera.bottom = -30;
  scene3d.add(luzDir3d);
  scene3d.add(luzDir3d.target);

  luzPun3d = new THREE.PointLight(0xFFEEAA, 0.20, 80);
  luzPun3d.position.set(0, 8, 15);
  scene3d.add(luzPun3d);

  var fbxLoader = new THREE.FBXLoader();
  fbxLoader.load(
    'modelos/InteriorV2.fbx',
    function (objeto) {
      objeto.scale.set(0.02, 0.02, 0.02);
      var caja = new THREE.Box3().setFromObject(objeto);
      var centro = caja.getCenter(new THREE.Vector3());
      objeto.position.set(-centro.x, -caja.min.y, -centro.z);
      objeto.traverse(function (child) {
        if (child.isMesh) {
          child.material.side = THREE.DoubleSide;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      modeloFondo = objeto;
      scene3d.add(objeto);
      var cajaF = new THREE.Box3().setFromObject(objeto);
      objetivoFondo.copy(cajaF.getCenter(new THREE.Vector3()));
      ocultarPantallaCarga();
    },
    function (xhr) {
      if (xhr.total > 0) {
        var pct = Math.round(xhr.loaded / xhr.total * 100);
        var elPct = document.getElementById('carga-pct');
        var elBar = document.getElementById('carga-relleno');
        if (elPct) elPct.textContent = pct + '%';
        if (elBar) elBar.style.width = pct + '%';
      }
    }
  );

  window.addEventListener('resize', function () {
    camera3d.aspect = window.innerWidth / window.innerHeight;
    camera3d.updateProjectionMatrix();
    renderer3d.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener('scroll', function () {
    if (visorActivo) return;
    autoOrbitando = false;
    clearTimeout(timerScroll);
    var delay = enModeloPag ? IDLE_MODELO : IDLE_OTROS;
    timerScroll = setTimeout(function () {
      iniciarOrbitaDesde(camaraActX, camaraActY, camaraActZ);
    }, delay);

    var scrollMax = document.body.scrollHeight - window.innerHeight;
    if (scrollMax <= 0) return;
    var t = Math.max(0, Math.min(1, window.scrollY / scrollMax));

    var desde = keyframes[0];
    var hasta = keyframes[keyframes.length - 1];
    for (var i = 0; i < keyframes.length - 1; i++) {
      if (t >= keyframes[i].scroll && t <= keyframes[i + 1].scroll) {
        desde = keyframes[i]; hasta = keyframes[i + 1]; break;
      }
    }
    var p = (hasta.scroll === desde.scroll) ? 1 : (t - desde.scroll) / (hasta.scroll - desde.scroll);
    camaraDestX = desde.x + (hasta.x - desde.x) * p;
    camaraDestY = desde.y + (hasta.y - desde.y) * p;
    camaraDestZ = desde.z + (hasta.z - desde.z) * p;
    lookDestX = desde.lx + (hasta.lx - desde.lx) * p;
    lookDestY = desde.ly + (hasta.ly - desde.ly) * p;
    lookDestZ = desde.lz + (hasta.lz - desde.lz) * p;
  });

  animarFondo();
}

function animarFondo() {
  requestAnimationFrame(animarFondo);

  if (visorActivo && typeof actualizarCamaraVisor === 'function') {
    actualizarCamaraVisor();
  } else if (modeloFondo) {
    if (autoOrbitando) {
      anguloFondo += 0.0008;
      var nx = Math.sin(anguloFondo) * 22;
      var ny = 7 + Math.sin(anguloFondo * 0.3) * 2;
      var nz = Math.cos(anguloFondo) * 22;
      camera3d.position.set(nx, ny, nz);
      camera3d.lookAt(objetivoFondo);
      camaraActX = nx; camaraActY = ny; camaraActZ = nz;
      camaraDestX = nx; camaraDestY = ny; camaraDestZ = nz;
      lookActX = objetivoFondo.x; lookActY = objetivoFondo.y; lookActZ = objetivoFondo.z;
      lookDestX = lookActX; lookDestY = lookActY; lookDestZ = lookActZ;
    } else {
      var s = 0.04;
      camaraActX += (camaraDestX - camaraActX) * s;
      camaraActY += (camaraDestY - camaraActY) * s;
      camaraActZ += (camaraDestZ - camaraActZ) * s;
      lookActX += (lookDestX - lookActX) * s;
      lookActY += (lookDestY - lookActY) * s;
      lookActZ += (lookDestZ - lookActZ) * s;
      camera3d.position.set(camaraActX, camaraActY, camaraActZ);
      camera3d.lookAt(lookActX, lookActY, lookActZ);
      anguloFondo = Math.atan2(camaraActX, camaraActZ);
    }
  }

  if (sistemaClima) {
    var pos = sistemaClima.geometry.attributes.position.array;
    for (var i = 1; i < pos.length; i += 3) {
      pos[i] -= velocidadClima;
      if (pos[i] < -1) pos[i] = 40;
    }
    sistemaClima.geometry.attributes.position.needsUpdate = true;
  }

  renderer3d.render(scene3d, camera3d);
}

initFondo3D();