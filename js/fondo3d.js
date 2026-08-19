var scene3d, camera3d, renderer3d;
var modeloFondo, objetivoFondo;
var luzAmb3d, luzDir3d, luzPun3d;
var anguloFondo = -0.3;
var visorActivo = false;

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
    document.getElementById('fondo-3d').appendChild(renderer3d.domElement);
    var piso = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshLambertMaterial({ color: 0x8a7055 })
    );
    piso.rotation.x = -Math.PI / 2;
    scene3d.add(piso);
    var grid = new THREE.GridHelper(120, 30, 0x5a4a38, 0x4a3a28);
    grid.position.y = 0.01;
    scene3d.add(grid);
    luzAmb3d = new THREE.AmbientLight(0xfff0e0, 0.70);
    scene3d.add(luzAmb3d);
    luzDir3d = new THREE.DirectionalLight(0xfff8ee, 1.20);
    luzDir3d.position.set(15, 30, 10);
    luzDir3d.target.position.set(0, 0, 0);
    scene3d.add(luzDir3d);
    scene3d.add(luzDir3d.target);
    luzPun3d = new THREE.PointLight(0xFFEEAA, 0.20, 80);
    luzPun3d.position.set(0, 8, 15);
    scene3d.add(luzPun3d);
    var fbxLoader = new THREE.FBXLoader();
    fbxLoader.load('modelos/practicatextura.fbx', function (objeto) {
        objeto.scale.set(0.02, 0.02, 0.02);
        var caja = new THREE.Box3().setFromObject(objeto);
        var centro = caja.getCenter(new THREE.Vector3());
        objeto.position.set(-centro.x, -caja.min.y, -centro.z);
        objeto.traverse(function (child) {
            if (child.isMesh) child.material.side = THREE.DoubleSide;
        });
        modeloFondo = objeto;
        scene3d.add(objeto);
        var cajaF = new THREE.Box3().setFromObject(objeto);
        objetivoFondo.copy(cajaF.getCenter(new THREE.Vector3()));
    });

    animarFondo();
}

function animarFondo() {
    requestAnimationFrame(animarFondo);
    if (visorActivo && typeof actualizarCamaraVisor === 'function') {
        actualizarCamaraVisor();
    } else if (modeloFondo) {
        anguloFondo += 0.0008;
        camera3d.position.x = Math.sin(anguloFondo) * 22;
        camera3d.position.z = Math.cos(anguloFondo) * 22;
        camera3d.position.y = 7 + Math.sin(anguloFondo * 0.3) * 2;
        camera3d.lookAt(objetivoFondo);
    }
    renderer3d.render(scene3d, camera3d);
}

initFondo3D();