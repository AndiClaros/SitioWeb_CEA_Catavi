var radioV = 10, anguloHV = 0, anguloVV = 0.25, objetivoV;
var arrastrando = false, ultimoX = 0, ultimoY = 0;
var autoRotarV = false, idleTimerV = null, IDLE_MS = 20000;
var enRecorrido = false, puntoActual = 0, progresoTour = 0;
var puntosTour = [
  { pos: { x: 0, y: 18, z: 65 }, obj: { x: 0, y: 4, z: 0 } },
  { pos: { x: 40, y: 15, z: 30 }, obj: { x: 0, y: 4, z: 0 } },
  { pos: { x: 45, y: 12, z: 0 }, obj: { x: 0, y: 4, z: 0 } },
  { pos: { x: 25, y: 18, z: -35 }, obj: { x: 0, y: 4, z: 0 } },
  { pos: { x: -40, y: 15, z: 30 }, obj: { x: 0, y: 4, z: 0 } },
  { pos: { x: 0, y: 35, z: 20 }, obj: { x: 0, y: 0, z: 0 } }
];

// ==========================================
// SISTEMA DE PANELES INTERACTIVOS (HISTORIA)
// ==========================================
var puntosHistoria = [
  {
    id: 'entrada',
    posicion: { x: 2.14, y: 2.31, z: 15.92 },
    titulo: "De la Mina a las Aulas",
    contenido: `
      <img src="images/hero-cea.jpg" alt="Fachada principal" style="width:100%; border-radius:4px; margin-bottom:1rem; border:1px solid var(--linea);">
      <p>El recorrido del C.E.A. "Catavi", desde la lucha obrera por la educación en el complejo minero Catavi–Siglo XX hasta convertirse en el centro de referencia técnica y humanística que hoy domina la ladera de Catavi.</p>
      <p>Fundado el 17 de agosto de 1972, nace como respuesta al retorno de los mineros a los campamentos, con el objetivo de ofrecer educación de adultos a la población minera y sus familias.</p>
    `,
    radio: 6
  },
  {
    id: 'linea_tiempo',
    posicion: { x: -17.82, y: 0.66, z: -13.40 },
    titulo: "Línea de Tiempo Histórica",
    contenido: `
      <ul style="list-style: none; padding: 0; margin: 0;">
        <li style="margin-bottom: 1.1rem; border-left: 2px solid var(--ocre); padding-left: 1rem;">
          <strong style="color: var(--ocre); font-family: 'JetBrains Mono', monospace;">1944</strong>
          <h4 style="margin: 0.3rem 0; font-family: 'Fraunces', serif;">La lucha obrera exige educación</h4>
          <p style="margin: 0; font-size: 0.88rem; line-height: 1.5; color: #c7cad3;">Se funda la Federación Sindical de Trabajadores Mineros de Bolivia (FSTMB), que desde sus inicios reclama educación gratuita y obligatoria para los hijos de los mineros.</p>
        </li>
        <li style="margin-bottom: 1.1rem; border-left: 2px solid var(--ocre); padding-left: 1rem;">
          <strong style="color: var(--ocre); font-family: 'JetBrains Mono', monospace;">1952</strong>
          <h4 style="margin: 0.3rem 0; font-family: 'Fraunces', serif;">Revolución Nacional y nacionalización de las minas</h4>
          <p style="margin: 0; font-size: 0.88rem; line-height: 1.5; color: #c7cad3;">Tras la Revolución del 9 de abril, las minas de Catavi-Siglo XX pasan a manos de COMIBOL. Se abre una etapa de mayor inversión social en los campamentos mineros.</p>
        </li>
        <li style="margin-bottom: 1.1rem; border-left: 2px solid var(--ocre); padding-left: 1rem;">
          <strong style="color: var(--ocre); font-family: 'JetBrains Mono', monospace;">1972</strong>
          <h4 style="margin: 0.3rem 0; font-family: 'Fraunces', serif;">Fundación oficial del centro</h4>
          <p style="margin: 0; font-size: 0.88rem; line-height: 1.5; color: #c7cad3;">El 17 de agosto de 1972 nace formalmente el centro educativo, como respuesta al retorno de los mineros a los campamentos y la necesidad de alfabetización de adultos.</p>
        </li>
        <li style="margin-bottom: 1.1rem; border-left: 2px solid var(--ocre); padding-left: 1rem;">
          <strong style="color: var(--ocre); font-family: 'JetBrains Mono', monospace;">1980 – 1990</strong>
          <h4 style="margin: 0.3rem 0; font-family: 'Fraunces', serif;">Consolidación de la educación de adultos</h4>
          <p style="margin: 0; font-size: 0.88rem; line-height: 1.5; color: #c7cad3;">Se consolidan los programas de Educación de Personas Jóvenes y Adultas (EPJA), permitiendo que trabajadores y madres de familia concluyan sus estudios primarios y secundarios.</p>
        </li>
        <li style="margin-bottom: 1.1rem; border-left: 2px solid var(--ocre); padding-left: 1rem;">
          <strong style="color: var(--ocre); font-family: 'JetBrains Mono', monospace;">1992</strong>
          <h4 style="margin: 0.3rem 0; font-family: 'Fraunces', serif;">Inicio de la formación técnica</h4>
          <p style="margin: 0; font-size: 0.88rem; line-height: 1.5; color: #c7cad3;">Se incorporan los primeros talleres técnicos (Mecánica, Electricidad, Corte y Confección), ampliando la oferta más allá de la educación humanística.</p>
        </li>
        <li style="margin-bottom: 1.1rem; border-left: 2px solid var(--ocre); padding-left: 1rem;">
          <strong style="color: var(--ocre); font-family: 'JetBrains Mono', monospace;">2007 – 2011</strong>
          <h4 style="margin: 0.3rem 0; font-family: 'Fraunces', serif;">Construcción del edificio actual</h4>
          <p style="margin: 0; font-size: 0.88rem; line-height: 1.5; color: #c7cad3;">Se erige el moderno edificio de 1.133 m² que hoy domina la ladera de Catavi, con tres niveles, claraboya central y talleres equipados.</p>
        </li>
        <li style="margin-bottom: 1.1rem; border-left: 2px solid var(--ocre); padding-left: 1rem;">
          <strong style="color: var(--ocre); font-family: 'JetBrains Mono', monospace;">2012</strong>
          <h4 style="margin: 0.3rem 0; font-family: 'Fraunces', serif;">Reconocimiento como C.E.A.</h4>
          <p style="margin: 0; font-size: 0.88rem; line-height: 1.5; color: #c7cad3;">El centro es reconocido oficialmente como Centro de Educación Alternativa "Catavi", ampliando sus 8 especialidades técnicas.</p>
        </li>
        <li style="margin-bottom: 1.1rem; border-left: 2px solid var(--ocre); padding-left: 1rem;">
          <strong style="color: var(--ocre); font-family: 'JetBrains Mono', monospace;">2020</strong>
          <h4 style="margin: 0.3rem 0; font-family: 'Fraunces', serif;">Adaptación a la virtualidad</h4>
          <p style="margin: 0; font-size: 0.88rem; line-height: 1.5; color: #c7cad3;">Durante la pandemia, el centro implementa plataformas digitales para continuar con la enseñanza de forma semipresencial.</p>
        </li>
        <li style="margin-bottom: 1.1rem; border-left: 2px solid var(--ocre); padding-left: 1rem;">
          <strong style="color: var(--ocre); font-family: 'JetBrains Mono', monospace;">2022</strong>
          <h4 style="margin: 0.3rem 0; font-family: 'Fraunces', serif;">Bodas de Oro</h4>
          <p style="margin: 0; font-size: 0.88rem; line-height: 1.5; color: #c7cad3;">El C.E.A. Catavi celebra sus 50 años de historia, siendo reconocido oficialmente por el Senado de Bolivia como institución de referencia técnica y humanística.</p>
        </li>
      </ul>
    `,
    radio: 6
  }
];

var marcadoresHistoriaMesh = [];
var marcadorActivo = null;
var panelHistoriaAbierto = false;

function crearMarcadoresHistoria() {
  puntosHistoria.forEach(function(punto) {
    var geometria = new THREE.SphereGeometry(0.5, 16, 16);
    var material = new THREE.MeshBasicMaterial({ 
      color: 0xe8c87a,
      transparent: true,
      opacity: 0.7,
      wireframe: true,
      depthTest: false 
    });
    var esfera = new THREE.Mesh(geometria, material);
    esfera.position.set(punto.posicion.x, punto.posicion.y, punto.posicion.z);
    esfera.userData = { id: punto.id, tipo: 'historia' };
    scene3d.add(esfera);
    marcadoresHistoriaMesh.push(esfera);

    var nucleoGeo = new THREE.SphereGeometry(0.15, 8, 8);
    var nucleoMat = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false });
    var nucleo = new THREE.Mesh(nucleoGeo, nucleoMat);
    nucleo.position.set(punto.posicion.x, punto.posicion.y, punto.posicion.z);
    nucleo.userData = { id: punto.id, tipo: 'historia' };
    scene3d.add(nucleo);
    marcadoresHistoriaMesh.push(nucleo);
  });
}

function animarMarcadoresHistoria() {
  var tiempo = Date.now() * 0.002;
  marcadoresHistoriaMesh.forEach(function(mesh) {
    if (mesh.geometry.type === 'SphereGeometry' && mesh.material.wireframe) {
      mesh.scale.setScalar(1 + Math.sin(tiempo) * 0.2);
      mesh.rotation.y += 0.01;
    }
  });
}

function verificarProximidadHistoria() {
  if (!camera3d || panelHistoriaAbierto || panelMateriaAbierto) return;
  
  var camaraPos = camera3d.position;
  var cercano = null;
  
  puntosHistoria.forEach(function(punto) {
    var distancia = camaraPos.distanceTo(new THREE.Vector3(punto.posicion.x, punto.posicion.y, punto.posicion.z));
    if (distancia < punto.radio) {
      cercano = punto;
    }
  });
  
  marcadorActivo = cercano;
}

function mostrarPanelHistoria(punto) {
  if (!punto) return;
  document.getElementById('panel-historia-titulo').textContent = punto.titulo;
  document.getElementById('panel-historia-contenido').innerHTML = punto.contenido;
  document.getElementById('info-panel-historia').classList.add('active');
  panelHistoriaAbierto = true;
  var prompt = document.getElementById('interaction-prompt');
  if (prompt) prompt.classList.remove('visible');
}

function cerrarPanelHistoria() {
  document.getElementById('info-panel-historia').classList.remove('active');
  panelHistoriaAbierto = false;
  marcadorActivo = null;
}

// ==========================================
// SISTEMA DE PANELES INTERACTIVOS (MATERIAS)
// ==========================================
var puntosMaterias = [
  {
    id: 'gastronomia',
    posicion: { x: -13.21, y: 0.01, z: 4.00 },
    titulo: "Gastronomía y Alimentación",
    icono: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M6 13.5C6 10 8.5 7 12 7s6 3 6 6.5M4 13.5h16M5 17h14M8 21h8" />
    </svg>`,
    contenido: `
      <h4 style="color: #4fc3f7; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.5rem;">Sobre la carrera</h4>
      <p style="margin-bottom: 1rem;">Formación integral en el arte culinario, desde los fundamentos de la nutrición hasta técnicas avanzadas de servicio. Los estudiantes aprenden a preparar platos de la gastronomía boliviana e internacional, con énfasis en higiene alimentaria y manipulación segura de alimentos.</p>
      <h4 style="color: #4fc3f7; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.5rem;">Contenidos principales</h4>
      <ul style="list-style: none; padding: 0; margin-bottom: 1rem;">
        <li style="padding-left: 1rem; border-left: 2px solid #4fc3f7; margin-bottom: 0.4rem; font-size: 0.9rem; color: var(--texto);">Nutrición y dietética básica</li>
        <li style="padding-left: 1rem; border-left: 2px solid #4fc3f7; margin-bottom: 0.4rem; font-size: 0.9rem; color: var(--texto);">Panadería y repostería artesanal</li>
        <li style="padding-left: 1rem; border-left: 2px solid #4fc3f7; margin-bottom: 0.4rem; font-size: 0.9rem; color: var(--texto);">Cocina nacional e internacional</li>
        <li style="padding-left: 1rem; border-left: 2px solid #4fc3f7; margin-bottom: 0.4rem; font-size: 0.9rem; color: var(--texto);">Servicio de mesa y atención al cliente</li>
      </ul>
      <p style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--texto-tenue);"><strong style="color: #4fc3f7;">Duración:</strong> 2 años · Técnico Medio · Validez nacional (Ley 070)</p>
    `,
    radio: 6
  },
  {
    id: 'electronica',
    posicion: { x: -6.94, y: 6.09, z: 4.26 },
    titulo: "Electrónica",
    icono: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h1v1H9zM14 9h1v1h-1zM9 14h1v1H9zM14 14h1v1h-1z" />
    </svg>`,
    contenido: `
      <h4 style="color: #4fc3f7; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.5rem;">Sobre la carrera</h4>
      <p style="margin-bottom: 1rem;">Especialidad técnica orientada al diseño, montaje y reparación de circuitos electrónicos. Los estudiantes dominan tanto la electrónica analógica tradicional como los fundamentos de la electrónica digital moderna, con prácticas en equipos reales de audio, video y electrodomésticos.</p>
      <h4 style="color: #4fc3f7; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.5rem;">Contenidos principales</h4>
      <ul style="list-style: none; padding: 0; margin-bottom: 1rem;">
        <li style="padding-left: 1rem; border-left: 2px solid #4fc3f7; margin-bottom: 0.4rem; font-size: 0.9rem; color: var(--texto);">Circuitos analógicos y digitales</li>
        <li style="padding-left: 1rem; border-left: 2px solid #4fc3f7; margin-bottom: 0.4rem; font-size: 0.9rem; color: var(--texto);">Técnicas de soldadura y montaje</li>
        <li style="padding-left: 1rem; border-left: 2px solid #4fc3f7; margin-bottom: 0.4rem; font-size: 0.9rem; color: var(--texto);">Reparación de TV, audio y electrodomésticos</li>
        <li style="padding-left: 1rem; border-left: 2px solid #4fc3f7; margin-bottom: 0.4rem; font-size: 0.9rem; color: var(--texto);">Microcontroladores y automatización básica</li>
      </ul>
      <p style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--texto-tenue);"><strong style="color: #4fc3f7;">Duración:</strong> 2 años · Técnico Medio · Validez nacional (Ley 070)</p>
    `,
    radio: 6
  },
  {
    id: 'electricidad',
    posicion: { x: 20.96, y: 6.09, z: -2.06 },
    titulo: "Electricidad Industrial",
    icono: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>`,
    contenido: `
      <h4 style="color: #4fc3f7; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.5rem;">Sobre la carrera</h4>
      <p style="margin-bottom: 1rem;">Una de las especialidades con mayor demanda laboral en la región. Forma técnicos capaces de instalar, mantener y reparar sistemas eléctricos tanto en viviendas como en industrias, con conocimientos actualizados en energías renovables y eficiencia energética.</p>
      <h4 style="color: #4fc3f7; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.5rem;">Contenidos principales</h4>
      <ul style="list-style: none; padding: 0; margin-bottom: 1rem;">
        <li style="padding-left: 1rem; border-left: 2px solid #4fc3f7; margin-bottom: 0.4rem; font-size: 0.9rem; color: var(--texto);">Instalaciones eléctricas domiciliarias</li>
        <li style="padding-left: 1rem; border-left: 2px solid #4fc3f7; margin-bottom: 0.4rem; font-size: 0.9rem; color: var(--texto);">Tableros de control industrial</li>
        <li style="padding-left: 1rem; border-left: 2px solid #4fc3f7; margin-bottom: 0.4rem; font-size: 0.9rem; color: var(--texto);">Motores eléctricos y mantenimiento</li>
        <li style="padding-left: 1rem; border-left: 2px solid #4fc3f7; margin-bottom: 0.4rem; font-size: 0.9rem; color: var(--texto);">Introducción a la energía solar fotovoltaica</li>
      </ul>
      <p style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--texto-tenue);"><strong style="color: #4fc3f7;">Duración:</strong> 2 años · Técnico Medio · Validez nacional (Ley 070)</p>
    `,
    radio: 6
  },
  {
    id: 'confeccion',
    posicion: { x: -16.43, y: 12.00, z: 13.74 },
    titulo: "Corte y Confección",
    icono: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <path d="M14 2v5h5M9 13h6M9 17h6" />
    </svg>`,
    contenido: `
      <h4 style="color: #4fc3f7; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.5rem;">Sobre la carrera</h4>
      <p style="margin-bottom: 1rem;">Especialidad que combina creatividad y técnica. Los estudiantes aprenden desde el trazado de patrones básicos hasta la confección industrial de prendas, con énfasis en el escalado de tallas y la producción de uniformes escolares y laborales para el mercado local.</p>
      <h4 style="color: #4fc3f7; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.5rem;">Contenidos principales</h4>
      <ul style="list-style: none; padding: 0; margin-bottom: 1rem;">
        <li style="padding-left: 1rem; border-left: 2px solid #4fc3f7; margin-bottom: 0.4rem; font-size: 0.9rem; color: var(--texto);">Patronaje y diseño de moldes</li>
        <li style="padding-left: 1rem; border-left: 2px solid #4fc3f7; margin-bottom: 0.4rem; font-size: 0.9rem; color: var(--texto);">Escalado industrial de tallas</li>
        <li style="padding-left: 1rem; border-left: 2px solid #4fc3f7; margin-bottom: 0.4rem; font-size: 0.9rem; color: var(--texto);">Manejo de máquinas de coser industriales</li>
        <li style="padding-left: 1rem; border-left: 2px solid #4fc3f7; margin-bottom: 0.4rem; font-size: 0.9rem; color: var(--texto);">Confección de uniformes escolares y laborales</li>
      </ul>
      <p style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--texto-tenue);"><strong style="color: #4fc3f7;">Duración:</strong> 2 años · Técnico Medio · Validez nacional (Ley 070)</p>
    `,
    radio: 6
  }
];

var marcadoresMateriasMesh = [];
var marcadorMateriaActivo = null;
var panelMateriaAbierto = false;

function crearMarcadoresMaterias() {
  puntosMaterias.forEach(function(punto) {
    var geometria = new THREE.SphereGeometry(0.5, 16, 16);
    var material = new THREE.MeshBasicMaterial({ 
      color: 0x4fc3f7,
      transparent: true,
      opacity: 0.7,
      wireframe: true,
      depthTest: false 
    });
    var esfera = new THREE.Mesh(geometria, material);
    esfera.position.set(punto.posicion.x, punto.posicion.y, punto.posicion.z);
    esfera.userData = { id: punto.id, tipo: 'materia' };
    scene3d.add(esfera);
    marcadoresMateriasMesh.push(esfera);

    var nucleoGeo = new THREE.SphereGeometry(0.15, 8, 8);
    var nucleoMat = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false });
    var nucleo = new THREE.Mesh(nucleoGeo, nucleoMat);
    nucleo.position.set(punto.posicion.x, punto.posicion.y, punto.posicion.z);
    nucleo.userData = { id: punto.id, tipo: 'materia' };
    scene3d.add(nucleo);
    marcadoresMateriasMesh.push(nucleo);
  });
}

function animarMarcadoresMaterias() {
  var tiempo = Date.now() * 0.002;
  marcadoresMateriasMesh.forEach(function(mesh) {
    if (mesh.geometry.type === 'SphereGeometry' && mesh.material.wireframe) {
      mesh.scale.setScalar(1 + Math.sin(tiempo) * 0.2);
      mesh.rotation.y += 0.01;
    }
  });
}

function verificarProximidadMaterias() {
  if (!camera3d || panelHistoriaAbierto || panelMateriaAbierto) return;
  
  var camaraPos = camera3d.position;
  var cercano = null;
  
  puntosMaterias.forEach(function(punto) {
    var distancia = camaraPos.distanceTo(new THREE.Vector3(punto.posicion.x, punto.posicion.y, punto.posicion.z));
    if (distancia < punto.radio) {
      cercano = punto;
    }
  });
  
  marcadorMateriaActivo = cercano;
}

function mostrarPanelMateria(punto) {
  if (!punto) return;
  document.getElementById('panel-materia-titulo').textContent = punto.titulo;
  
  var html = '';
  if (punto.icono) {
    html += `<div class="panel-icono-materia">${punto.icono}</div>`;
  }
  html += punto.contenido;
  
  document.getElementById('panel-materia-contenido').innerHTML = html;
  document.getElementById('info-panel-materia').classList.add('active');
  panelMateriaAbierto = true;
  var prompt = document.getElementById('interaction-prompt');
  if (prompt) prompt.classList.remove('visible');
}

function cerrarPanelMateria() {
  document.getElementById('info-panel-materia').classList.remove('active');
  panelMateriaAbierto = false;
  marcadorMateriaActivo = null;
}
// ==========================================
// FIN SISTEMA DE PANELES INTERACTIVOS
// ==========================================

var modoExplorador = false;
var teclas = { w: false, a: false, s: false, d: false, q: false, e: false };
var exploradorPos, exploradorYaw = 0, exploradorPitch = 0;
var VEL_EXP = 0.32;
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
  
  // Animar marcadores
  animarMarcadoresHistoria();
  animarMarcadoresMaterias();
  
  // Verificar proximidad
  verificarProximidadHistoria();
  verificarProximidadMaterias();
  
  // Actualizar prompt visual
  var prompt = document.getElementById('interaction-prompt');
  if (prompt) {
    if (marcadorActivo || marcadorMateriaActivo) {
      prompt.classList.add('visible');
    } else {
      prompt.classList.remove('visible');
    }
  }
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
  anguloHV = anguloFondo; radioV = 30;
  document.getElementById('fondo-3d').style.pointerEvents = 'auto';
  document.querySelector('nav').style.opacity = '0';
  document.querySelector('nav').style.pointerEvents = 'none';
  var intro = document.getElementById('vista-intro');
  intro.style.opacity = '0';
  setTimeout(function () {
    intro.style.display = 'none';
    var ctrl = document.getElementById('visor-controles');
    var btnS = document.getElementById('btn-salir-visor');
    ctrl.style.display = 'flex'; btnS.style.display = 'flex';
    setTimeout(function () { ctrl.style.opacity = '1'; btnS.style.opacity = '1'; }, 30);
  }, 400);
  if (!controlesIniciados) { controlesIniciados = true; initControlesVisor(); }
  aplicarCalidad();
  aplicarModo('dia');
  
  if (marcadoresHistoriaMesh.length === 0) {
    crearMarcadoresHistoria();
  }
  if (marcadoresMateriasMesh.length === 0) {
    crearMarcadoresMaterias();
  }
  
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
  document.querySelectorAll('.btn-modo[data-modo]').forEach(function (b) { b.classList.remove('is-active'); });
  document.querySelectorAll('.btn-modo[data-modo="' + nombre + '"]').forEach(function (b) { b.classList.add('is-active'); });
}

function lerp(a, b, t) { return a + (b - a) * t; }

function iniciarRecorrido() {
  enRecorrido = true; autoRotarV = false; puntoActual = 0; progresoTour = 0; clearTimeout(idleTimerV);
  var btn = document.getElementById('btn-tour');
  if (btn) { btn.classList.add('is-active'); btn.textContent = ' Detener'; }
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
  progresoTour += 0.01;
  if (progresoTour >= 1) { progresoTour = 0; puntoActual = (puntoActual + 1) % puntosTour.length; }
  var t = progresoTour * progresoTour * (3 - 2 * progresoTour);
  camera3d.position.set(lerp(desde.pos.x, hasta.pos.x, t), lerp(desde.pos.y, hasta.pos.y, t), lerp(desde.pos.z, hasta.pos.z, t));
  camera3d.lookAt(lerp(desde.obj.x, hasta.obj.x, t), lerp(desde.obj.y, hasta.obj.y, t), lerp(desde.obj.z, hasta.obj.z, t));
}

function iniciarExplorador() {
  modoExplorador = true; exploradorYaw = anguloHV; exploradorPitch = 0;
  exploradorPos = new THREE.Vector3(camera3d.position.x, 1.7, camera3d.position.z);
  renderer3d.domElement.requestPointerLock();
  var btn = document.getElementById('btn-explorador');
  if (btn) { btn.classList.add('is-active'); btn.textContent = '⏹ Salir (ESC)'; }
  document.querySelector('.canvas-controls-hint').style.display = 'flex';
  document.getElementById('visor-controles').style.pointerEvents = 'none';
  document.getElementById('btn-explorador').style.pointerEvents = 'auto';

  var menuWrap = document.getElementById('explorador-menu-wrap');
  if (menuWrap) menuWrap.style.display = 'flex';

  var ov = document.getElementById('explorador-overlay');
  if (ov) { ov.style.opacity = '1'; setTimeout(function () { ov.style.opacity = '0'; }, 4500); }
}

function salirExplorador() {
  modoExplorador = false; document.exitPointerLock();
  var btn = document.getElementById('btn-explorador');
  if (btn) { btn.classList.remove('is-active'); btn.textContent = '🚶 Explorar'; }
  document.querySelector('.canvas-controls-hint').style.display = 'none';
  document.getElementById('visor-controles').style.pointerEvents = 'auto';

  var menuWrap = document.getElementById('explorador-menu-wrap');
  if (menuWrap) {
    menuWrap.style.display = 'none';
    document.getElementById('explorador-menu').classList.remove('is-open');
  }
}

function actualizarExplorador() {
  var cosY = Math.cos(exploradorYaw), sinY = Math.sin(exploradorYaw);
  var adelante = new THREE.Vector3(-sinY, 0, -cosY);
  var derecha = new THREE.Vector3(cosY, 0, -sinY);

  var nuevaPos = exploradorPos.clone();

  if (teclas.w) nuevaPos.addScaledVector(adelante, VEL_EXP);
  if (teclas.s) nuevaPos.addScaledVector(adelante, -VEL_EXP);
  if (teclas.a) nuevaPos.addScaledVector(derecha, -VEL_EXP);
  if (teclas.d) nuevaPos.addScaledVector(derecha, VEL_EXP);

  var volando = (teclas.q || teclas.e);
  if (teclas.q) nuevaPos.y += VEL_EXP;
  if (teclas.e) nuevaPos.y -= VEL_EXP;

  if (!volando) {
    nuevaPos = aplicarColisionParedes(exploradorPos, nuevaPos);
    nuevaPos.y = detectarSuelo(nuevaPos);
  }

  if (!teclas.e) {
    nuevaPos.y = Math.max(ALTURA_OJOS, nuevaPos.y);
  }

  exploradorPos.copy(nuevaPos);
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
    if (modoExplorador && document.pointerLockElement) {
      exploradorYaw -= e.movementX * 0.002;
      exploradorPitch -= e.movementY * 0.002;
      exploradorPitch = Math.max(-1.2, Math.min(1.2, exploradorPitch)); return;
    }
    if (!arrastrando) return;
    var dx = e.clientX - ultimoX, dy = e.clientY - ultimoY; ultimoX = e.clientX; ultimoY = e.clientY;
    anguloHV -= dx * 0.005; anguloVV += dy * 0.005; anguloVV = Math.max(0.05, Math.min(1.3, anguloVV)); updateCam();
  });
  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    if (modoExplorador) {
      var cosY = Math.cos(exploradorYaw), sinY = Math.sin(exploradorYaw);
      var adelante = new THREE.Vector3(-sinY, 0, -cosY);
      exploradorPos.addScaledVector(adelante, e.deltaY > 0 ? -VEL_EXP * 3 : VEL_EXP * 3);
      exploradorPos.y = Math.max(1.7, exploradorPos.y); return;
    }
    pausarAutoV(); radioV += e.deltaY * 0.02; radioV = Math.max(6, Math.min(70, radioV)); updateCam();
  }, { passive: false });
  canvas.addEventListener('touchstart', function (e) { if (e.touches.length === 1) { arrastrando = true; pausarAutoV(); ultimoX = e.touches[0].clientX; ultimoY = e.touches[0].clientY; } }, { passive: true });
  canvas.addEventListener('touchmove', function (e) { if (!arrastrando || e.touches.length !== 1) return; var dx = e.touches[0].clientX - ultimoX, dy = e.touches[0].clientY - ultimoY; ultimoX = e.touches[0].clientX; ultimoY = e.touches[0].clientY; anguloHV -= dx * 0.006; anguloVV += dy * 0.006; anguloVV = Math.max(0.05, Math.min(1.3, anguloVV)); updateCam(); }, { passive: true });
  canvas.addEventListener('touchend', function () { arrastrando = false; });

  document.addEventListener('keydown', function (e) {
    if (!visorActivo) return;
    
    // === MANEJO DE TECLA 'E' Y 'ESCAPE' PARA PANELES ===
    if (e.key === 'e' || e.key === 'E') {
      if (panelHistoriaAbierto) {
        cerrarPanelHistoria();
      } else if (panelMateriaAbierto) {
        cerrarPanelMateria();
      } else if (marcadorActivo) {
        mostrarPanelHistoria(marcadorActivo);
      } else if (marcadorMateriaActivo) {
        mostrarPanelMateria(marcadorMateriaActivo);
      } else {
        teclas.e = true; // Solo permite bajar si NO hay panel abierto ni marcador activo
      }
      return;
    }
    
    if (e.key === 'Escape') {
      if (panelHistoriaAbierto) {
        cerrarPanelHistoria();
        return;
      } else if (panelMateriaAbierto) {
        cerrarPanelMateria();
        return;
      } else if (modoExplorador) {
        salirExplorador();
        return;
      }
    }
    // ==================================================

    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') teclas.w = true;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') teclas.s = true;
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') teclas.a = true;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') teclas.d = true;
    if (e.key === 'q' || e.key === 'Q') teclas.q = true;
  });
  
  document.addEventListener('keyup', function (e) {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') teclas.w = false;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') teclas.s = false;
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') teclas.a = false;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') teclas.d = false;
    if (e.key === 'q' || e.key === 'Q') teclas.q = false;
    if (e.key === 'e' || e.key === 'E') teclas.e = false;
  });
  
  document.addEventListener('pointerlockchange', function () { if (!document.pointerLockElement && modoExplorador) salirExplorador(); });

  var bZI = document.getElementById('btn-zoom-in');
  var bZO = document.getElementById('btn-zoom-out');
  var bTour = document.getElementById('btn-tour');
  var bExp = document.getElementById('btn-explorador');
  if (bZI) bZI.addEventListener('click', function () { pausarAutoV(); radioV = Math.max(6, radioV - 3); updateCam(); });
  if (bZO) bZO.addEventListener('click', function () { pausarAutoV(); radioV = Math.min(70, radioV + 3); updateCam(); });
  if (bTour) bTour.addEventListener('click', function () { if (enRecorrido) detenerRecorrido(); else iniciarRecorrido(); });
  if (bExp) bExp.addEventListener('click', function () { if (modoExplorador) salirExplorador(); else iniciarExplorador(); });

  document.querySelectorAll('.btn-modo[data-modo]').forEach(function (b) {
    b.addEventListener('click', function () { aplicarModo(b.getAttribute('data-modo')); });
  });

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

  var bFS = document.getElementById('btn-fullscreen');
  if (bFS) {
    bFS.addEventListener('click', function () {
      if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); bFS.title = 'Salir de pantalla completa'; }
      else { document.exitFullscreen(); bFS.title = 'Pantalla completa'; }
    });
    document.addEventListener('fullscreenchange', function () {
      var icon = bFS.querySelector('svg');
      if (document.fullscreenElement) { icon.innerHTML = '<path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 0 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/>'; }
      else { icon.innerHTML = '<path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3"/>'; }
    });
  }

  var bMenu = document.getElementById('btn-explorador-menu');
  var pMenu = document.getElementById('explorador-menu');
  if (bMenu && pMenu) {
    bMenu.addEventListener('click', function (e) { e.stopPropagation(); pMenu.classList.toggle('is-open'); });
    document.addEventListener('click', function (e) { if (!pMenu.contains(e.target) && e.target !== bMenu) pMenu.classList.remove('is-open'); });
  }

  // 🛠️ HERRAMIENTA DE ESCANEO: Obtener coordenadas
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'p' || e.key === 'P') && modoExplorador && document.pointerLockElement) {
      var raycasterPicker = new THREE.Raycaster();
      raycasterPicker.setFromCamera(new THREE.Vector2(0, 0), camera3d);
      var intersects = raycasterPicker.intersectObjects(scene3d.children, true);
      
      if (intersects.length > 0) {
        var p = intersects[0].point;
        console.log(`📍 COORDENADA: { x: ${p.x.toFixed(2)}, y: ${p.y.toFixed(2)}, z: ${p.z.toFixed(2)} }`);
      } else {
        console.log("❌ No estás apuntando a ningún objeto del modelo.");
      }
    }
  });
}

document.getElementById('btn-entrar').addEventListener('click', function () { entrarVisor(false); });
document.getElementById('btn-recorrer-intro').addEventListener('click', function () { entrarVisor(true); });
document.getElementById('btn-salir-visor').addEventListener('click', salirVisor);