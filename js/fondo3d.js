var scene3d, camera3d, renderer3d;
var modeloFondo, objetivoFondo;
var luzAmb3d, luzDir3d, luzPun3d;
var anguloFondo = -0.3;
var visorActivo = false;

var camaraDestX = 0, camaraDestY = 7, camaraDestZ = 35;
var camaraActX = 0, camaraActY = 7, camaraActZ = 35;
var lookDestX = 0, lookDestY = 4, lookDestZ = 0;
var lookActX = 0, lookActY = 4, lookActZ = 0;

var autoOrbitando = true;
var timerScroll = null;
var enModeloPag = window.location.pathname.indexOf('modelo3d') !== -1;
var IDLE_MODELO = 20000;
var IDLE_OTROS = 1500;

var sistemaClima = null;

var keyframes = [
  { scroll: 0.00, x: 0, y: 7, z: 22, lx: 0, ly: 4, lz: 0 },
  { scroll: 0.25, x: 20, y: 9, z: 14, lx: 0, ly: 4, lz: 0 },
  { scroll: 0.50, x: 20, y: 5, z: 0, lx: 0, ly: 4, lz: 0 },
  { scroll: 0.75, x: -20, y: 9, z: 14, lx: 0, ly: 4, lz: 0 },
  { scroll: 1.00, x: 0, y: 7, z: 22, lx: 0, ly: 4, lz: 0 }
];

// ===== COLISIONES  =====
var objetosPared = [];
var objetosSuelo = [];
var RADIO_JUGADOR = 0.4;
var ALTURA_OJOS = 1.8;
var ALTURA_MAX_PASO = 0.45;
var raycasterCol = new THREE.Raycaster();
var dirAux = new THREE.Vector3();

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
  }
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

function baseNombre(nombre) {
  return nombre.replace(/\.\d+$/, '');
}

function aplicarMaterialesPorNombre(objetoRaiz) {
  objetoRaiz.traverse(function (child) {
    if (!child.isMesh) return;

    child.castShadow = true;
    child.receiveShadow = true;

    var nombreOriginal = (child.name || '').toLowerCase();
    var n = baseNombre(child.name || '');

    // === DETECTAR VIDRIOS ===
    var esVidrio = false;

    if (nombreOriginal.indexOf('vidrio') !== -1 ||
      nombreOriginal.indexOf('glass') !== -1 ||
      nombreOriginal.indexOf('g.') === 0 ||
      nombreOriginal.indexOf('g001') !== -1 ||
      nombreOriginal.indexOf('g002') !== -1) {
      esVidrio = true;
    }

    if (Array.isArray(child.material)) {
      child.material.forEach(function (mat) {
        var matName = (mat.name || '').toLowerCase();
        if (matName.indexOf('vidrio') !== -1 ||
          matName.indexOf('glass') !== -1 ||
          matName.indexOf('g.') !== -1 ||
          matName.indexOf('g001') !== -1 ||
          matName.indexOf('g002') !== -1 ||
          matName === 'g') {
          esVidrio = true;
        }
      });
    } else if (child.material) {
      var matName = (child.material.name || '').toLowerCase();
      if (matName.indexOf('vidrio') !== -1 ||
        matName.indexOf('glass') !== -1 ||
        matName.indexOf('g.') !== -1 ||
        matName.indexOf('g001') !== -1 ||
        matName.indexOf('g002') !== -1 ||
        matName === 'g') {
        esVidrio = true;
      }
    }

    if (esVidrio) {
      if (Array.isArray(child.material)) {
        child.material = child.material.map(function (mat) {
          var matName = (mat.name || '').toLowerCase();
          if (matName.indexOf('vidrio') !== -1 ||
            matName.indexOf('glass') !== -1 ||
            matName.indexOf('g.') !== -1 ||
            matName.indexOf('g001') !== -1 ||
            matName.indexOf('g002') !== -1 ||
            matName === 'g' ||
            nombreOriginal.indexOf('vidrio') !== -1 ||
            nombreOriginal.indexOf('glass') !== -1) {
            return new THREE.MeshPhongMaterial({
              color: 0x9fc6e0,
              transparent: true,
              opacity: 0.3,
              shininess: 150,
              side: THREE.DoubleSide,
              wireframe: false
            });
          }
          mat.wireframe = false;
          mat.side = THREE.DoubleSide;
          return mat;
        });
      } else {
        child.material = new THREE.MeshPhongMaterial({
          color: 0x9fc6e0,
          transparent: true,
          opacity: 0.3,
          shininess: 150,
          side: THREE.DoubleSide,
          wireframe: false
        });
      }
      return;
    }

    if (n === 'Techo') {
      child.material = new THREE.MeshLambertMaterial({ color: 0xB54438, side: THREE.DoubleSide });
      return;
    }

    if (n === 'Grada' || nombreOriginal.indexOf('grada') !== -1) {
      if (Array.isArray(child.material)) {
        child.material = child.material.map(function (mat) {
          var matName = (mat.name || '').toLowerCase();
          if (matName.indexOf('gradabajo') !== -1) {
            return new THREE.MeshPhongMaterial({
              color: 0xFFFFFF,
              side: THREE.DoubleSide
            });
          }
          if (matName.indexOf('gomita') !== -1 || matName.indexOf('gomitadegrada') !== -1) {
            return new THREE.MeshPhongMaterial({
              color: 0x1a1a1a,
              side: THREE.DoubleSide
            });
          }
          return new THREE.MeshPhongMaterial({
            color: 0x8B4513,
            side: THREE.DoubleSide
          });
        });
      } else {
        child.material = new THREE.MeshPhongMaterial({
          color: 0x8B4513,
          side: THREE.DoubleSide
        });
      }
      return;
    }

    // colores del FBX ===
    if (Array.isArray(child.material)) {
      child.material = child.material.map(function (mat) {
        mat.wireframe = false;
        mat.side = THREE.DoubleSide;
        return mat;
      });
    } else if (child.material) {
      child.material.wireframe = false;
      child.material.side = THREE.DoubleSide;
    }
  });
}

function prepararColisiones(objetoRaiz) {
  objetosPared = [];
  objetosSuelo = [];

  objetoRaiz.traverse(function (child) {
    if (!child.isMesh) return;
    var n = (child.name || '').toLowerCase();

    // === BLOQUEADOS ===
    if (n === 'edificio' ||
      n === 'murodevidrio' ||
      n.indexOf('vent_media') === 0 ||
      n.indexOf('vent_grande') === 0 ||
      n === 'baranda' ||
      n === 'techo') {
      objetosPared.push(child);
    }

    // === SUELOS / ESCALERAS ===
    if (n === 'grada' || n === 'edificio') {
      objetosSuelo.push(child);
    }
  });

  console.log('✅ Colisiones configuradas:');
  console.log('   Paredes:', objetosPared.length, 'objetos');
  console.log('   Suelos:', objetosSuelo.length, 'objetos');
}

// === MOVIMIENTO ===

function aplicarColisionParedes(posActual, posNueva) {
  if (objetosPared.length === 0) return posNueva;

  var resultado = posNueva.clone();
  var ejes = ['x', 'z'];

  for (var i = 0; i < ejes.length; i++) {
    var eje = ejes[i];
    var prueba = posActual.clone();
    prueba[eje] = posNueva[eje];

    var dx = prueba.x - posActual.x;
    var dz = prueba.z - posActual.z;
    var dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 0.001) continue;

    var dir = new THREE.Vector3(dx, 0, dz).normalize();
    raycasterCol.set(posActual, dir);
    raycasterCol.far = dist + RADIO_JUGADOR;
    raycasterCol.near = 0;

    var hits = raycasterCol.intersectObjects(objetosPared, false);

    if (hits.length > 0 && hits[0].distance < dist + RADIO_JUGADOR) {
      resultado[eje] = posActual[eje];
    }
  }

  return resultado;
}

function detectarSuelo(posJugador) {
  if (objetosSuelo.length === 0) return ALTURA_OJOS;

  var origen = new THREE.Vector3(posJugador.x, posJugador.y + 0.5, posJugador.z);
  var direccion = new THREE.Vector3(0, -1, 0);

  raycasterCol.set(origen, direccion);
  raycasterCol.far = 3.0;
  raycasterCol.near = 0;

  var hits = raycasterCol.intersectObjects(objetosSuelo, false);

  if (hits.length > 0) {
    var hit = hits[0];
    var alturaSuelo = hit.point.y;
    var nuevaAltura = alturaSuelo + ALTURA_OJOS;

    var diff = nuevaAltura - posJugador.y;
    if (diff >= -0.5 && diff <= ALTURA_MAX_PASO + 0.5) {
      return nuevaAltura;
    }
  }

  return posJugador.y;
}

function initFondo3D() {
  scene3d = new THREE.Scene();
  scene3d.background = new THREE.Color(0x87CEEB);
  scene3d.fog = new THREE.FogExp2(0x6aabcc, 0.010);
  objetivoFondo = new THREE.Vector3(0, 4, 0);

  camera3d = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera3d.position.set(0, 8, 35);
  camera3d.lookAt(objetivoFondo);

  renderer3d = new THREE.WebGLRenderer({ antialias: true });
  renderer3d.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer3d.setSize(window.innerWidth, window.innerHeight);
  renderer3d.shadowMap.enabled = true;
  renderer3d.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('fondo-3d').appendChild(renderer3d.domElement);

  var piso = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshLambertMaterial({
      color: 0x2a2520
    })
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
  luzDir3d.position.set(100, 150, 100);
  luzDir3d.target.position.set(0, 0, 0);
  luzDir3d.castShadow = true;
  luzDir3d.shadow.mapSize.width = 1024;
  luzDir3d.shadow.mapSize.height = 1024;
  luzDir3d.shadow.camera.near = 0.5;
  luzDir3d.shadow.camera.far = 400;
  luzDir3d.shadow.camera.left = -30;
  luzDir3d.shadow.camera.right = 30;
  luzDir3d.shadow.camera.top = 30;
  luzDir3d.shadow.camera.bottom = -30;
  scene3d.add(luzDir3d);
  scene3d.add(luzDir3d.target);

  luzPun3d = new THREE.PointLight(0xFFEEAA, 0.15, 200);
  luzPun3d.position.set(50, 100, 50);  // ← MUY LEJOS, fuera del edificio
  scene3d.add(luzPun3d);

  var fbxLoader = new THREE.FBXLoader();
  fbxLoader.load(
    'modelos/Completa.fbx',
    function (objeto) {
      objeto.scale.set(0.012, 0.012, 0.012);

      var caja = new THREE.Box3().setFromObject(objeto);
      var centro = caja.getCenter(new THREE.Vector3());
      objeto.position.set(-centro.x, -caja.min.y, -centro.z);

      aplicarMaterialesPorNombre(objeto);
      prepararColisiones(objeto);

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
    // No hacer nada al hacer scroll
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
      var nx = Math.sin(anguloFondo) * 35;
      var ny = 7 + Math.sin(anguloFondo * 0.3) * 2;
      var nz = Math.cos(anguloFondo) * 35;
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