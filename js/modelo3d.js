var radioV = 30, anguloHV = 0, anguloVV = 0.25, objetivoV;
var arrastrando = false, ultimoX = 0, ultimoY = 0;
var autoRotarV = false, idleTimerV = null, IDLE_MS = 20000;
var enRecorrido = false, puntoActual = 0, progresoTour = 0;
var puntosTour = [
  { pos: { x: 0, y: 6, z: 30 }, obj: { x: 0, y: 4, z: 0 } },
  { pos: { x: 28, y: 8, z: 18 }, obj: { x: 0, y: 4, z: 0 } },
  { pos: { x: 32, y: 5, z: 0 }, obj: { x: 0, y: 4, z: 0 } },
  { pos: { x: 18, y: 12, z: -22 }, obj: { x: 0, y: 4, z: 0 } },
  { pos: { x: -28, y: 8, z: 18 }, obj: { x: 0, y: 4, z: 0 } },
  { pos: { x: 0, y: 22, z: 12 }, obj: { x: 0, y: 0, z: 0 } }
];
var modoExplorador = false;
var teclas = { w: false, a: false, s: false, d: false };
var exploradorPos, exploradorYaw = 0, exploradorPitch = 0;
var VEL_EXP = 0.12;
var controlesIniciados = false;

var modos = {
  dia: { cielo: 0x87CEEB, niebla: 0x9ad5e8, ambColor: 0xfff0e0, ambInt: 0.70, dirColor: 0xfff8ee, dirInt: 1.20, punColor: 0xFFEEAA, punInt: 0.20, sAmb: 70, sDir: 120, sPun: 20 },
  atardecer: { cielo: 0xd45c1a, niebla: 0xb04010, ambColor: 0xff8844, ambInt: 0.40, dirColor: 0xff5500, dirInt: 0.60, punColor: 0xFF9944, punInt: 1.20, sAmb: 40, sDir: 60, sPun: 120 },
  noche: { cielo: 0x0a0e14, niebla: 0x0a0e14, ambColor: 0x223355, ambInt: 0.12, dirColor: 0x334488, dirInt: 0.15, punColor: 0xFFCC77, punInt: 3.00, sAmb: 12, sDir: 15, sPun: 150 }
};

function actualizarCamaraVisor() {
  if (modoExplorador) actualizarExplorador();
  else if (enRecorrido) actualizarRecorrido();
  else if (autoRotarV) { anguloHV += 0.0022; updateCam(); }
}

function updateCam() {
  if (!objetivoV) return;
  camera3d.position.set(
    objetivoV.x + radioV * Math.sin(anguloHV) * Math.cos(anguloVV),
    objetivoV.y + radioV * Math.sin(anguloVV),
    objetivoV.z + radioV * Math.cos(anguloHV) * Math.cos(anguloVV)
  );
  camera3d.lookAt(objetivoV);
}

function entrarVisor(iniciarTour) {
  visorActivo = true;
  objetivoV = objetivoFondo ? objetivoFondo.clone() : new THREE.Vector3(0, 4, 0);
  anguloHV = anguloFondo;
  radioV = 30;
  document.getElementById('fondo-3d').style.pointerEvents = 'auto';
  document.querySelector('nav').style.opacity = '0';
  document.querySelector('nav').style.pointerEvents = 'none';
  var intro = document.getElementById('vista-intro');
  intro.style.opacity = '0';
  setTimeout(function () {
    intro.style.display = 'none';
    var ctrl = document.getElementById('visor-controles');
    var btnS = document.getElementById('btn-salir-visor');
    ctrl.style.display = 'flex';
    btnS.style.display = 'flex';
    setTimeout(function () { ctrl.style.opacity = '1'; btnS.style.opacity = '1'; }, 30);
  }, 400);
  if (!controlesIniciados) { controlesIniciados = true; initControlesVisor(); }
  aplicarModo('dia');
  if (iniciarTour) setTimeout(iniciarRecorrido, 500);
  else reiniciarIdleV();
}

function salirVisor() {
  if (modoExplorador) salirExplorador();
  enRecorrido = false; autoRotarV = false; clearTimeout(idleTimerV);
  anguloFondo = anguloHV; visorActivo = false;
  document.getElementById('fondo-3d').style.pointerEvents = 'none';
  document.querySelector('nav').style.opacity = '1';
  document.querySelector('nav').style.pointerEvents = 'auto';
  var ctrl = document.getElementById('visor-controles');
  var btnS = document.getElementById('btn-salir-visor');
  ctrl.style.opacity = '0'; btnS.style.opacity = '0';
  setTimeout(function () {
    ctrl.style.display = 'none'; btnS.style.display = 'none';
    var intro = document.getElementById('vista-intro');
    intro.style.display = 'flex';
    setTimeout(function () { intro.style.opacity = '1'; }, 30);
  }, 400);
}

function aplicarModo(nombre) {
  var m = modos[nombre];
  scene3d.background = new THREE.Color(m.cielo);
  scene3d.fog.color.set(m.niebla);
  luzAmb3d.color.set(m.ambColor); luzAmb3d.intensity = m.ambInt;
  luzDir3d.color.set(m.dirColor); luzDir3d.intensity = m.dirInt;
  luzPun3d.color.set(m.punColor); luzPun3d.intensity = m.punInt;
  var sA = document.getElementById('slider-ambiental');
  var sD = document.getElementById('slider-direccional');
  var sP = document.getElementById('slider-puntual');
  if (sA) { sA.value = m.sAmb; document.getElementById('val-ambiental').textContent = m.sAmb + '%'; }
  if (sD) { sD.value = m.sDir; document.getElementById('val-direccional').textContent = m.sDir + '%'; }
  if (sP) { sP.value = m.sPun; document.getElementById('val-puntual').textContent = m.sPun + '%'; }
  document.querySelectorAll('.btn-modo').forEach(function (b) { b.classList.remove('is-active'); });
  var ba = document.getElementById('btn-modo-' + nombre);
  if (ba) ba.classList.add('is-active');
}

function lerp(a, b, t) { return a + (b - a) * t; }

function iniciarRecorrido() {
  enRecorrido = true; autoRotarV = false; puntoActual = 0; progresoTour = 0; clearTimeout(idleTimerV);
  var btn = document.getElementById('btn-tour');
  if (btn) { btn.classList.add('is-active'); btn.textContent = '⏹ Detener'; }
}

function detenerRecorrido() {
  enRecorrido = false;
  var btn = document.getElementById('btn-tour');
  if (btn) { btn.classList.remove('is-active'); btn.textContent = '🎬 Recorrido'; }
  reiniciarIdleV();
}

function actualizarRecorrido() {
  var desde = puntosTour[puntoActual];
  var hasta = puntosTour[(puntoActual + 1) % puntosTour.length];
  progresoTour += 0.004;
  if (progresoTour >= 1) { progresoTour = 0; puntoActual = (puntoActual + 1) % puntosTour.length; }
  var t = progresoTour * progresoTour * (3 - 2 * progresoTour);
  camera3d.position.set(lerp(desde.pos.x, hasta.pos.x, t), lerp(desde.pos.y, hasta.pos.y, t), lerp(desde.pos.z, hasta.pos.z, t));
  camera3d.lookAt(lerp(desde.obj.x, hasta.obj.x, t), lerp(desde.obj.y, hasta.obj.y, t), lerp(desde.obj.z, hasta.obj.z, t));
}

function iniciarExplorador() {
  modoExplorador = true;
  exploradorYaw = anguloHV;
  exploradorPitch = 0;
  exploradorPos = new THREE.Vector3(
    camera3d.position.x,
    1.7,
    camera3d.position.z
  );
  renderer3d.domElement.requestPointerLock();
  var btn = document.getElementById('btn-explorador');
  if (btn) { btn.classList.add('is-active'); btn.textContent = '⏹ Salir (ESC)'; }
  document.querySelector('.canvas-controls-hint').style.display = 'flex';
  document.getElementById('visor-controles').style.pointerEvents = 'none';
  document.getElementById('btn-explorador').style.pointerEvents = 'auto';
  var ov = document.getElementById('explorador-overlay');
  if (ov) { ov.style.opacity = '1'; setTimeout(function () { ov.style.opacity = '0'; }, 3000); }
}

function salirExplorador() {
  modoExplorador = false;
  document.exitPointerLock();
  var btn = document.getElementById('btn-explorador');
  if (btn) { btn.classList.remove('is-active'); btn.textContent = '🚶 Explorar'; }
  document.querySelector('.canvas-controls-hint').style.display = 'none';
  document.getElementById('visor-controles').style.pointerEvents = 'auto';
}

function actualizarExplorador() {
  var cosY = Math.cos(exploradorYaw);
  var sinY = Math.sin(exploradorYaw);
  var adelante = new THREE.Vector3(-sinY, 0, -cosY);
  var derecha = new THREE.Vector3(cosY, 0, -sinY);

  if (teclas.w) exploradorPos.addScaledVector(adelante, VEL_EXP);
  if (teclas.s) exploradorPos.addScaledVector(adelante, -VEL_EXP);
  if (teclas.a) exploradorPos.addScaledVector(derecha, -VEL_EXP);
  if (teclas.d) exploradorPos.addScaledVector(derecha, VEL_EXP);

  exploradorPos.y = 1.7;

  camera3d.position.copy(exploradorPos);
  camera3d.lookAt(
    exploradorPos.x - sinY * 10,
    exploradorPos.y + Math.sin(exploradorPitch) * 10,
    exploradorPos.z - cosY * 10
  );
}

function reiniciarIdleV() { clearTimeout(idleTimerV); idleTimerV = setTimeout(function () { if (!enRecorrido && !modoExplorador) autoRotarV = true; }, IDLE_MS); }
function pausarAutoV() { autoRotarV = false; reiniciarIdleV(); }

function initControlesVisor() {
  var canvas = renderer3d.domElement;
  canvas.addEventListener('mousedown', function (e) { if (modoExplorador) return; arrastrando = true; pausarAutoV(); ultimoX = e.clientX; ultimoY = e.clientY; });
  window.addEventListener('mouseup', function () { arrastrando = false; });
  window.addEventListener('mousemove', function (e) {
    if (modoExplorador && document.pointerLockElement) { exploradorYaw -= e.movementX * 0.002; exploradorPitch -= e.movementY * 0.002; exploradorPitch = Math.max(-1.2, Math.min(1.2, exploradorPitch)); return; }
    if (!arrastrando) return;
    var dx = e.clientX - ultimoX, dy = e.clientY - ultimoY; ultimoX = e.clientX; ultimoY = e.clientY;
    anguloHV -= dx * 0.005; anguloVV += dy * 0.005; anguloVV = Math.max(0.05, Math.min(1.3, anguloVV)); updateCam();
  });
  canvas.addEventListener('wheel', function (e) {
    e.preventDefault(); if (modoExplorador) {
      var cosY = Math.cos(exploradorYaw), sinY = Math.sin(exploradorYaw);
      var adelante = new THREE.Vector3(-sinY, 0, -cosY);
      exploradorPos.addScaledVector(adelante, e.deltaY > 0 ? -VEL_EXP * 3 : VEL_EXP * 3);
      exploradorPos.y = Math.max(1.8, exploradorPos.y);
      return;
    }
    pausarAutoV(); radioV += e.deltaY * 0.02; radioV = Math.max(6, Math.min(70, radioV)); updateCam();
  }, { passive: false });
  canvas.addEventListener('touchstart', function (e) { if (e.touches.length === 1) { arrastrando = true; pausarAutoV(); ultimoX = e.touches[0].clientX; ultimoY = e.touches[0].clientY; } }, { passive: true });
  canvas.addEventListener('touchmove', function (e) { if (!arrastrando || e.touches.length !== 1) return; var dx = e.touches[0].clientX - ultimoX, dy = e.touches[0].clientY - ultimoY; ultimoX = e.touches[0].clientX; ultimoY = e.touches[0].clientY; anguloHV -= dx * 0.006; anguloVV += dy * 0.006; anguloVV = Math.max(0.05, Math.min(1.3, anguloVV)); updateCam(); }, { passive: true });
  canvas.addEventListener('touchend', function () { arrastrando = false; });
  document.addEventListener('keydown', function (e) { if (!visorActivo) return; if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') teclas.w = true; if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') teclas.s = true; if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') teclas.a = true; if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') teclas.d = true; if (e.key === 'Escape' && modoExplorador) salirExplorador(); });
  document.addEventListener('keyup', function (e) { if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') teclas.w = false; if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') teclas.s = false; if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') teclas.a = false; if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') teclas.d = false; });
  document.addEventListener('pointerlockchange', function () { if (!document.pointerLockElement && modoExplorador) salirExplorador(); });
  var bZI = document.getElementById('btn-zoom-in');
  var bZO = document.getElementById('btn-zoom-out');
  var bTour = document.getElementById('btn-tour');
  var bExp = document.getElementById('btn-explorador');
  if (bZI) bZI.addEventListener('click', function () { pausarAutoV(); radioV = Math.max(6, radioV - 3); updateCam(); });
  if (bZO) bZO.addEventListener('click', function () { pausarAutoV(); radioV = Math.min(70, radioV + 3); updateCam(); });
  if (bTour) bTour.addEventListener('click', function () { if (enRecorrido) detenerRecorrido(); else iniciarRecorrido(); });
  if (bExp) bExp.addEventListener('click', function () { if (modoExplorador) salirExplorador(); else iniciarExplorador(); });
  document.getElementById('btn-modo-dia').addEventListener('click', function () { aplicarModo('dia'); });
  document.getElementById('btn-modo-atardecer').addEventListener('click', function () { aplicarModo('atardecer'); });
  document.getElementById('btn-modo-noche').addEventListener('click', function () { aplicarModo('noche'); });
  var sA = document.getElementById('slider-ambiental');
  var sD = document.getElementById('slider-direccional');
  var sP = document.getElementById('slider-puntual');
  if (sA) sA.addEventListener('input', function () { luzAmb3d.intensity = sA.value / 100; document.getElementById('val-ambiental').textContent = sA.value + '%'; });
  if (sD) sD.addEventListener('input', function () { luzDir3d.intensity = sD.value / 100; document.getElementById('val-direccional').textContent = sD.value + '%'; });
  if (sP) sP.addEventListener('input', function () { luzPun3d.intensity = sP.value / 100; document.getElementById('val-puntual').textContent = sP.value + '%'; });
  var bL = document.getElementById('btn-luces');
  var pL = document.getElementById('luz-panel');
  if (bL && pL) {
    bL.addEventListener('click', function (e) { e.stopPropagation(); pL.classList.toggle('is-open'); bL.classList.toggle('is-active'); });
    document.addEventListener('click', function (e) { if (!pL.contains(e.target) && e.target !== bL) { pL.classList.remove('is-open'); bL.classList.remove('is-active'); } });
  }
}

document.getElementById('btn-entrar').addEventListener('click', function () { entrarVisor(false); });
document.getElementById('btn-recorrer-intro').addEventListener('click', function () { entrarVisor(true); });
document.getElementById('btn-salir-visor').addEventListener('click', salirVisor);