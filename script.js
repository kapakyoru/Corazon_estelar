const canvas = document.getElementById('lienzo');
const ctx = canvas.getContext('2d');

let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
});

const estrellasFondo = Array.from({ length: 160 }, () => ({
    x: Math.random(), y: Math.random(),
    tamano: Math.random() * 1.6,
    alfa: Math.random() * 0.6 + 0.2
}));

const puntos = [
    { x: 0.50, y: 0.35, texto: "El inicio ✨", recuerdo: "Ese primer día en que nuestras miradas coincidieron por casualidad..." },
    { x: 0.65, y: 0.22, texto: "Tu sonrisa 😊", recuerdo: "La primera vez que te reíste de mis tonterías y supe que quería escucharlo siempre." },
    { x: 0.82, y: 0.35, texto: "Nuestras charlas 💬", recuerdo: "Esas madrugadas hablando de todo y de nada perdiendo la noción del tiempo." },
    { x: 0.50, y: 0.78, texto: "Este momento ❤️", recuerdo: "Hoy, agradeciendo al universo por haberme cruzado en tu órbita." },
    { x: 0.18, y: 0.35, texto: "Mi suerte 🍀", recuerdo: "De todas las líneas temporales posibles, qué fortuna estar en la tuya." },
    { x: 0.35, y: 0.22, texto: "Conocerte 🤍", recuerdo: "Descubrir que detrás de tu mirada hay un universo entero por admirar." }
];

let pasoActual = 0;
let arrastrando = false;
let punteroX = 0, punteroY = 0;
let recuerdoActivo = null;

let temporizadorCascada = -1;
let alfaRevelacion = 0;

const chispasTrazo = [];
const ondasExpansivas = [];
const meteorosFugaces = Array.from({ length: 14 }, () => ({
    x: Math.random() * W * 1.5 - W * 0.5,
    y: Math.random() * H - H,
    longitud: Math.random() * 80 + 40,
    velocidad: Math.random() * 10 + 12
}));

function obtenerCoordenadas(relX, relY) {
    const ladoCaja = Math.min(W, H * 0.75) * 0.84;
    const centroX = W / 2;
    const centroY = H / 2;
    return {
        x: centroX + (relX - 0.5) * ladoCaja,
        y: centroY + (relY - 0.5) * ladoCaja
    };
}

function crearChispaDorada(x, y) {
    for (let i = 0; i < 3; i++) {
        chispasTrazo.push({
            x: x + (Math.random() - 0.5) * 12,
            y: y + (Math.random() - 0.5) * 12,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            alfa: 1,
            tam: Math.random() * 2.5 + 1
        });
    }
}

function detonarSoldadura(x, y) {
    ondasExpansivas.push({ x, y, radio: 4, alfa: 1 });
    for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2;
        chispasTrazo.push({
            x, y,
            vx: Math.cos(ang) * (Math.random() * 4 + 2),
            vy: Math.sin(ang) * (Math.random() * 4 + 2),
            alfa: 1, tam: Math.random() * 3 + 1.5
        });
    }
}

canvas.addEventListener('pointerdown', (e) => {
    if (pasoActual >= puntos.length) {
        puntos.forEach(p => {
            const pos = obtenerCoordenadas(p.x, p.y);
            if (Math.hypot(e.clientX - pos.x, e.clientY - pos.y) < 45) {
                recuerdoActivo = p.recuerdo;
                detonarSoldadura(pos.x, pos.y);
            }
        });
        return;
    }

    const objetivo = puntos[pasoActual];
    const posObj = obtenerCoordenadas(objetivo.x, objetivo.y);
    if (Math.hypot(e.clientX - posObj.x, e.clientY - posObj.y) < 48) {
        arrastrando = true;
        punteroX = e.clientX; punteroY = e.clientY;
        crearChispaDorada(punteroX, punteroY);
    }
});

canvas.addEventListener('pointermove', (e) => {
    if (pasoActual >= puntos.length) {
        if (e.pointerType === 'mouse') {
            const tocado = puntos.find(p => {
                const pos = obtenerCoordenadas(p.x, p.y);
                return Math.hypot(e.clientX - pos.x, e.clientY - pos.y) < 35;
            });
            if (tocado && recuerdoActivo !== tocado.recuerdo) {
                recuerdoActivo = tocado.recuerdo;
                const posToc = obtenerCoordenadas(tocado.x, tocado.y);
                crearChispaDorada(posToc.x, posToc.y);
            }
        }
        return;
    }

    if (!arrastrando) return;
    punteroX = e.clientX; punteroY = e.clientY;
    crearChispaDorada(punteroX, punteroY);

    const meta = puntos[(pasoActual + 1) % puntos.length];
    const posMeta = obtenerCoordenadas(meta.x, meta.y);
    if (Math.hypot(punteroX - posMeta.x, punteroY - posMeta.y) < 45) {
        pasoActual++;
        arrastrando = false;
        detonarSoldadura(posMeta.x, posMeta.y);

        if (pasoActual >= puntos.length && temporizadorCascada < 0) {
            temporizadorCascada = 0;
        }
    }
});

window.addEventListener('pointerup', () => { arrastrando = false; });

let tiempo = 0;

function renderizar() {
    tiempo += 0.04;
    ctx.fillStyle = '#030308';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#ffffff';
    estrellasFondo.forEach(e => {
        ctx.globalAlpha = e.alfa;
        ctx.fillRect(e.x * W, e.y * H, e.tamano, e.tamano);
    });

    if (pasoActual >= puntos.length) {
        if (temporizadorCascada >= 0) temporizadorCascada += 0.068;
        if (temporizadorCascada > 5.9 && alfaRevelacion < 1) {
            alfaRevelacion = Math.min(1, alfaRevelacion + 0.015);
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        meteorosFugaces.forEach(m => {
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - m.longitud * 0.7, m.y - m.longitud);
            ctx.stroke();
            m.x += m.velocidad * 0.7; m.y += m.velocidad;
            if (m.y > H + 100) { m.x = Math.random() * W * 1.2; m.y = -50; }
        });
    }

    const latido = pasoActual >= puntos.length ? 1 + Math.sin(tiempo * 3) * 0.025 : 1;
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(latido, latido);
    ctx.translate(-W / 2, -H / 2);

    if (pasoActual >= puntos.length && alfaRevelacion > 0) {
        ctx.beginPath();
        const posIni = obtenerCoordenadas(puntos[0].x, puntos[0].y);
        ctx.moveTo(posIni.x, posIni.y);
        for (let i = 1; i < puntos.length; i++) {
            const pos = obtenerCoordenadas(puntos[i].x, puntos[i].y);
            ctx.lineTo(pos.x, pos.y);
        }
        ctx.closePath();

        const gradienteRelleno = ctx.createRadialGradient(W / 2, H * 0.45, 10, W / 2, H * 0.45, W * 0.4);
        gradienteRelleno.addColorStop(0, `rgba(255, 50, 130, ${0.38 * alfaRevelacion})`);
        gradienteRelleno.addColorStop(0.7, `rgba(255, 0, 80, ${0.12 * alfaRevelacion})`);
        gradienteRelleno.addColorStop(1, 'rgba(255, 0, 80, 0)');
        ctx.fillStyle = gradienteRelleno;
        ctx.fill();
    }

    ctx.globalAlpha = 1;
    for (let i = 0; i < pasoActual; i++) {
        const pA = obtenerCoordenadas(puntos[i].x, puntos[i].y);
        const pB = obtenerCoordenadas(puntos[(i + 1) % puntos.length].x, puntos[(i + 1) % puntos.length].y);

        let destelloLinea = 0;
        if (pasoActual >= puntos.length && temporizadorCascada >= 0) {
            const tiempoTramo = temporizadorCascada - i;
            if (tiempoTramo > 0 && tiempoTramo < 1.3) {
                destelloLinea = Math.sin((tiempoTramo / 1.3) * Math.PI);
            }
        }

        ctx.strokeStyle = destelloLinea > 0.2 ? '#ffffff' : '#ff3399';
        ctx.lineWidth = 3.5 + (destelloLinea * 7.5);
        ctx.shadowColor = destelloLinea > 0.2 ? '#ffffff' : '#ff0066';
        ctx.shadowBlur = 18 + (destelloLinea * 25);

        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.stroke();
    }
    ctx.shadowBlur = 0;

    if (arrastrando && pasoActual < puntos.length) {
        const origen = obtenerCoordenadas(puntos[pasoActual].x, puntos[pasoActual].y);
        ctx.strokeStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.moveTo(origen.x, origen.y);
        ctx.lineTo(punteroX, punteroY);
        ctx.stroke();
    }
    ctx.shadowBlur = 0;

    puntos.forEach((p, idx) => {
        const pos = obtenerCoordenadas(p.x, p.y);

        let destelloEstrella = 0;
        if (pasoActual >= puntos.length && temporizadorCascada >= 0) {
            const tiempoEstrella = temporizadorCascada - idx;
            if (tiempoEstrella > 0 && tiempoEstrella < 1.3) {
                destelloEstrella = Math.sin((tiempoEstrella / 1.3) * Math.PI);
            }
        }

        if (idx === pasoActual && pasoActual < puntos.length) {
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 12 + Math.sin(tiempo * 4) * 6, 0, Math.PI * 2);
            ctx.stroke();
        }

        const radioDinamico = (idx <= pasoActual ? 6 : 4) + (destelloEstrella * 15);
        const resplandorDinamico = (idx <= pasoActual ? 12 : 0) + (destelloEstrella * 34);

        ctx.fillStyle = idx <= pasoActual ? '#ffffff' : '#33334d';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = resplandorDinamico;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radioDinamico, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (idx <= pasoActual) {
            const tamanoEtiqueta = Math.min(15, Math.max(11, Math.floor(W * 0.034)));
            ctx.font = `italic bold ${tamanoEtiqueta}px Georgia`;
            ctx.fillStyle = '#ffccd8';

            let desvX = 0;
            if (p.x < 0.48) { ctx.textAlign = 'right'; desvX = -12; }
            else if (p.x > 0.52) { ctx.textAlign = 'left'; desvX = 12; }
            else { ctx.textAlign = 'center'; desvX = 0; }

            ctx.fillText(p.texto, pos.x + desvX, pos.y - 14);
        }
    });

    ctx.restore();

    for (let i = ondasExpansivas.length - 1; i >= 0; i--) {
        const o = ondasExpansivas[i];
        ctx.strokeStyle = `rgba(255, 255, 255, ${o.alfa})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.radio, 0, Math.PI * 2); ctx.stroke();
        o.radio += 3.5; o.alfa -= 0.04;
        if (o.alfa <= 0) ondasExpansivas.splice(i, 1);
    }

    for (let i = chispasTrazo.length - 1; i >= 0; i--) {
        const c = chispasTrazo[i];
        ctx.fillStyle = `rgba(255, 215, 0, ${c.alfa})`;
        ctx.fillRect(c.x, c.y, c.tam, c.tam);
        c.x += c.vx; c.y += c.vy; c.alfa -= 0.025;
        if (c.alfa <= 0) chispasTrazo.splice(i, 1);
    }

    if (pasoActual >= puntos.length && alfaRevelacion > 0) {
        ctx.save();
        ctx.globalAlpha = alfaRevelacion;
        ctx.textAlign = 'center';
        
        const tamanoTit = Math.min(28, Math.max(17, Math.floor(W * 0.052)));
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${tamanoTit}px Georgia`;
        ctx.shadowColor = '#ff0066'; ctx.shadowBlur = 25;
        ctx.fillText("Tú eres mi constelación favorita ❤️", W / 2, H * 0.48);
        ctx.shadowBlur = 0;

        const tamanoSub = Math.min(18, Math.max(12, Math.floor(W * 0.038)));
        ctx.fillStyle = '#88ddff';
        ctx.font = `italic ${tamanoSub}px Georgia`;
        const textoMostrar = recuerdoActivo || "✨ (Toca cualquier estrella para descubrir un recuerdo) ✨";
        ctx.fillText(textoMostrar, W / 2, H * 0.56, W * 0.88);
        
        ctx.restore();
    }

    requestAnimationFrame(renderizar);
}

renderizar();