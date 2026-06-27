const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.015); 

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 16); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controles = new THREE.OrbitControls(camera, renderer.domElement);
controles.enableDamping = true;

controles.minDistance = 8.0;  
controles.maxDistance = 24.0; 

scene.add(new THREE.AmbientLight(0xffffff, 0.25));

const monumento = new THREE.Group();
scene.add(monumento);

const geomPolvo = new THREE.BufferGeometry();
const posPolvo = new Float32Array(3500 * 3);
for(let i=0; i<3500*3; i++) posPolvo[i] = (Math.random() - 0.5) * 90;
geomPolvo.setAttribute('position', new THREE.BufferAttribute(posPolvo, 3));
scene.add(new THREE.Points(geomPolvo, new THREE.PointsMaterial({ size: 0.022, color: 0xffffff, opacity: 0.35, transparent: true })));

function crearCartel(texto, tamano = 24, color = "#ffffff") {
    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
    canvas.width = 1024; canvas.height = 128; ctx.font = `italic bold ${tamano}px Georgia`; ctx.textAlign = "center";
    ctx.shadowColor = color === "#ffffff" ? "rgba(255, 120, 220, 0.95)" : "rgba(0, 180, 255, 0.95)"; 
    ctx.shadowBlur = 18; ctx.fillStyle = color; ctx.fillText(texto, 512, 70);
    ctx.shadowColor = "rgba(0, 0, 0, 0.85)"; ctx.shadowBlur = 4; ctx.fillText(texto, 512, 70);

    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }));
    sprite.scale.set(13, 1.62, 1); sprite.position.set(0, 0, 0.5); 
    return sprite;
}

function crearCartelClimax() {
    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
    canvas.width = 1024; canvas.height = 256; ctx.font = "italic bold 31px Georgia"; ctx.textAlign = "center";
    ctx.shadowColor = "rgba(255, 40, 140, 1)"; ctx.shadowBlur = 26; ctx.fillStyle = "#ffffff";
    ctx.fillText("Quería decirte que me encanta conocerte", 512, 95); ctx.fillText("y me gustaría seguir creando momentos contigo ❤️", 512, 175);
    ctx.shadowColor = "rgba(10, 0, 15, 0.95)"; ctx.shadowBlur = 6; 
    ctx.fillText("Quería decirte que me encanta conocerte", 512, 95); ctx.fillText("y me gustaría seguir creando momentos contigo ❤️", 512, 175);
    
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }));
    sprite.scale.set(0.01, 0.01, 1); sprite.position.set(0, 0, 1.0); 
    return sprite;
}

function generarTexturaHalo(colorHex) {
    const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 128; const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 3, 64, 64, 64);
    grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.25, colorHex); grad.addColorStop(1, 'rgba(0,0,0,0)'); 
    ctx.fillStyle = grad; ctx.fillRect(0,0,128,128); return new THREE.CanvasTexture(canvas);
}

function crearEstrella(colorHex, colorRgba, x, y, z, radioEsfera, escalaHalo, esPista = false) {
    const grupoEstrella = new THREE.Group(); grupoEstrella.position.set(x, y, z);
    grupoEstrella.add(new THREE.Mesh(new THREE.SphereGeometry(radioEsfera, 16, 16), new THREE.MeshBasicMaterial({ color: colorHex })));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: generarTexturaHalo(colorRgba), blending: THREE.AdditiveBlending, transparent: true }));
    halo.scale.set(escalaHalo, escalaHalo, 1); grupoEstrella.add(halo);
    grupoEstrella.userData = { encontrada: false, colorBase: colorHex, esPista: esPista }; 
    if(esPista) grupoEstrella.add(new THREE.PointLight(colorHex, 3.5, 14)); 
    return grupoEstrella;
}

const estrellasClickables = [];
const paletaGemas = [
    { c: 0xff3344, r: 'rgba(255, 51, 68, 1)' }, { c: 0x44ff66, r: 'rgba(68, 255, 102, 1)' },
    { c: 0x8844ff, r: 'rgba(136, 68, 255, 1)' }, { c: 0xff8833, r: 'rgba(255, 136, 51, 1)' },
    { c: 0x3388ff, r: 'rgba(51, 136, 255, 1)' }, { c: 0xffaa44, r: 'rgba(255, 170, 68, 1)' }
];

for(let i=0; i<18; i++) {
    const gema = paletaGemas[i % paletaGemas.length];
    const trampa = crearEstrella(gema.c, gema.r, (Math.random()-0.5)*58, (Math.random()-0.5)*38, -6 - Math.random()*14, 0.17, 2.1, false);
    monumento.add(trampa); estrellasClickables.push(trampa);
}

const p1 = crearEstrella(0x00ffff, 'rgba(0, 255, 255, 1)', -8.5, 4.2, -6, 0.17, 2.1, true); 
const p2 = crearEstrella(0xff00aa, 'rgba(255, 0, 170, 1)', 7.5, -3.8, -5.5, 0.17, 2.1, true); 
const p3 = crearEstrella(0xffff00, 'rgba(255, 255, 0, 1)', 2.2, 6.5, -9, 0.17, 2.1, true);  
estrellasClickables.push(p1, p2, p3);
estrellasClickables.forEach(e => monumento.add(e));

const grupoExplosiones = []; const ondasExpansivas = [];
const texAnillo = (() => {
    const c = document.createElement('canvas'); c.width=128; c.height=128; const cx=c.getContext('2d');
    cx.strokeStyle="white"; cx.lineWidth=6; cx.beginPath(); cx.arc(64,64,54,0,Math.PI*2); cx.stroke(); return new THREE.CanvasTexture(c);
})();

function detonarSupernova(posicion, colorHex) {
    const geo = new THREE.SphereGeometry(0.05, 8, 8); const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 1 });
    const chispas = [];
    for(let i=0; i<30; i++) {
        const m = new THREE.Mesh(geo, mat.clone()); m.position.copy(posicion);
        m.userData = { vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3, vz: (Math.random()-0.5)*0.3 };
        monumento.add(m); chispas.push(m);
    }
    grupoExplosiones.push(chispas);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texAnillo, color: colorHex, blending: THREE.AdditiveBlending, transparent: true, opacity: 1 }));
    sp.position.copy(posicion); sp.scale.set(0.1, 0.1, 1); monumento.add(sp); ondasExpansivas.push(sp);
}

const auraClimax = new THREE.Sprite(new THREE.SpriteMaterial({ 
    map: (() => {
        const c=document.createElement('canvas'); c.width=256; c.height=256; const cx=c.getContext('2d');
        const g=cx.createRadialGradient(128,128,10,128,128,128); g.addColorStop(0,'rgba(255,100,170,0.45)'); g.addColorStop(1,'rgba(0,0,0,0)');
        cx.fillStyle=g; cx.fillRect(0,0,256,256); return new THREE.CanvasTexture(c);
    })(), blending: THREE.AdditiveBlending, transparent: true, opacity: 0 
}));
auraClimax.position.set(0, 0, -4.0); auraClimax.scale.setScalar(26); monumento.add(auraClimax);

const meteoros = []; let activarLluvia = false;
function generarMeteoro() {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xffaa00 : 0xff88bb, transparent: true, opacity: 0.8 }));
    m.position.set((Math.random() - 0.5) * 50, 18 + Math.random() * 10, -10 + (Math.random() - 0.5) * 15);
    scene.add(m); meteoros.push(m);
}

const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2();

const memoriaProgreso = { 
    0: "He escondido 3 estrellas especiales para ti. Búscalas y hazles clic...",
    1: "Dicen que la curiosidad siempre encuentra respuestas ⭐", 
    2: "Gracias por llegar hasta aquí 🤍", 
    3: "Eso significa que valía la pena descubrir el final..." 
};

const frasesTrampa = [
    "¡Uy, casi! Sigue buscando... 👀", 
    "Frío, frío... por aquí no es 🧊", 
    "Brilla hermoso, pero no es el secreto ✨", 
    "Mmmm... prueba con otra 🪐", 
    "¡Casi! Pero esta es solo una trampa 🙈"
];

let encontradas = 0; let temblorIntensidad = 0; let animarZoomClimax = false; let factorZoom = 0.01;
let bloqueadoPorBroma = false; 

let cartelActual = crearCartel(memoriaProgreso[0], 23, "#ffffff");
monumento.add(cartelActual);


window.addEventListener('click', (event) => {
    if (encontradas === 3 || bloqueadoPorBroma) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1; mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersecciones = raycaster.intersectObjects(estrellasClickables, true);

    if (intersecciones.length > 0) {
        let tocada = intersecciones[0].object;
        if (tocada.parent && tocada.parent !== monumento) tocada = tocada.parent;

        if (!tocada.userData.encontrada) {
            tocada.userData.encontrada = true;
            tocada.visible = false;

            if (tocada.userData.esPista) {
               
                encontradas++; 
                temblorIntensidad = 0.35; 
                detonarSupernova(tocada.position, tocada.userData.colorBase);

                monumento.remove(cartelActual);
                cartelActual = crearCartel(memoriaProgreso[encontradas], 25, "#ffffff");
                monumento.add(cartelActual);

                if (encontradas === 3) {
                    setTimeout(() => {
                        monumento.remove(cartelActual); cartelActual = crearCartelClimax(); monumento.add(cartelActual);
                        animarZoomClimax = true; auraClimax.material.opacity = 1; 
                        activarLluvia = true; for(let k=0; k<30; k++) generarMeteoro(); 
                    }, 3800); 
                }
            } else {
                
                bloqueadoPorBroma = true;
                detonarSupernova(tocada.position, tocada.userData.colorBase);
                
                monumento.remove(cartelActual);
                const trampaElegida = frasesTrampa[Math.floor(Math.random() * frasesTrampa.length)];
                cartelActual = crearCartel(trampaElegida, 24, "#88ddff");
                monumento.add(cartelActual);

                setTimeout(() => {
                    if (encontradas < 3) {
                        monumento.remove(cartelActual);
                        
                        cartelActual = crearCartel(memoriaProgreso[encontradas], encontradas === 0 ? 23 : 25, "#ffffff");
                        monumento.add(cartelActual);
                        bloqueadoPorBroma = false;
                    }
                }, 1600);
            }
        }
    }
});


let tiempo = 0;

function animar() {
    requestAnimationFrame(animar); controles.update(); tiempo += 0.04;
    
    if (temblorIntensidad > 0.005) {
        monumento.position.set((Math.random()-0.5)*temblorIntensidad, (Math.random()-0.5)*temblorIntensidad, 0);
        temblorIntensidad *= 0.88; 
    } else { monumento.position.set(0,0,0); }

    if (animarZoomClimax && factorZoom < 0.999) {
        factorZoom += (1 - factorZoom) * 0.065; cartelActual.scale.set(14 * factorZoom, 3.5 * factorZoom, 1);
    }

    estrellasClickables.forEach(e => { if(!e.userData.encontrada) e.scale.setScalar(1 + Math.sin(tiempo * 1.5) * 0.22); });
    if (auraClimax.material.opacity > 0) auraClimax.scale.setScalar(26 + Math.sin(tiempo * 1.2) * 1.8);

    grupoExplosiones.forEach((chispas, indexG) => {
        chispas.forEach(c => { c.position.x += c.userData.vx; c.position.y += c.userData.vy; c.position.z += c.userData.vz; c.material.opacity -= 0.022; });
        if(chispas[0] && chispas[0].material.opacity <= 0) { chispas.forEach(c => monumento.remove(c)); grupoExplosiones.splice(indexG, 1); }
    });

    ondasExpansivas.forEach((anillo, idxA) => {
        anillo.scale.x += 0.38; anillo.scale.y += 0.38; anillo.material.opacity -= 0.035;
        if(anillo.material.opacity <= 0) { monumento.remove(anillo); ondasExpansivas.splice(idxA, 1); }
    });

    if (activarLluvia) {
        meteoros.forEach(m => {
            m.position.x += 0.28; m.position.y -= 0.28;
            if (m.position.y < -16) m.position.set((Math.random() - 0.5) * 50, 18, -10 + (Math.random() - 0.5) * 15);
        });
    }

    renderer.render(scene, camera);
}

animar();