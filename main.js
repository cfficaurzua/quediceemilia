// juego.js
import {
    preguntas,
    preguntasTodoONada,
    preguntasDineroRapido,
} from "./data/preguntas.js";
const canvas = document.getElementById("juego");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const splashVideo = document.getElementById("splash");
const music = document.getElementById("music");
const sfxOk = document.getElementById("sfx-ok");
const sfxX = document.getElementById("sfx-x");

const preguntaEl = document.getElementById("pregunta");
const respuestaEl = document.getElementById("respuesta");
const puntajeEl = document.getElementById("puntajeGlobal");

const background = new Image();
background.src = "backdrop.png";
const splash = new Image();
splash.src = "splashscreen.png";
const xSprite = new Image();
xSprite.src = "x.png";

let currentScene = "splash";
let respuestaUsuario = "";
let preguntaActual = 0;
let currentTodoIndex = 0;
let dineroRapidoIndex = 0;
let dineroRapidoTimer = 20;
let dineroRapidoScore = 0;
let dineroRapidoInterval = null;
let respuestasDineroRapido = [];
let faseDineroRapido = 1;
let respuestasIngresadas = Array(8).fill("");
let puntajesMostrados = Array(8).fill(null);
let respuestaActualIndex = 0;
const videoTodoONada = document.getElementById("videoTodoONada");
const videoDineroRapido = document.getElementById("videoDineroRapido");

let scoreA = 0;
let scoreB = 0;
let lastAnswer = null;
let lastAnswerIndex = null;
let respuestasMostradas = Array(8).fill(false);
let animaciones = Array(8).fill(null);
let showX = false;
let xTimer = 0;
let xCount = 0;
let lastSpaceTime = 0;
let xMultiple = 1;
let sePermitioResponder = true;
let fondoTodoONada = null;

function gradualVolumeFade() {
    const targetVolume = 0.1;
    const duration = 20000;
    const steps = 60;
    let step = 0;
    const volumeStep = (music.volume - targetVolume) / steps;

    const interval = setInterval(() => {
        step++;
        music.volume = Math.max(targetVolume, music.volume - volumeStep);
        if (step >= steps) clearInterval(interval);
    }, duration / steps);
}

function updateUI(pregunta = "", respuesta = "") {
    if (!(currentScene === "dineroRapido" && faseDineroRapido === 1)) {
        preguntaEl.textContent = pregunta;
    } else {
        preguntaEl.textContent = "";
    }

    respuestaEl.textContent = respuesta;
    puntajeEl.textContent = `Equipo A: ${scoreA} — Equipo B: ${scoreB}`;
}

function drawSplash() {
    if (splash.complete) {
        ctx.drawImage(splash, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "30px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
            "Presiona cualquier tecla para comenzar",
            canvas.width / 2,
            canvas.height - 50
        );
    }
}

function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function drawTodoONada() {
    const pregunta = preguntasTodoONada[currentTodoIndex];
    if (!fondoTodoONada || fondoTodoONada.src.indexOf(pregunta.fondo) === -1) {
        fondoTodoONada = new Image();
        fondoTodoONada.src = pregunta.fondo;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(fondoTodoONada, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(pregunta.pregunta, canvas.width / 2, canvas.height - 100);

    if (showX) {
        const size = 500;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const gap = size + 40;
        let positions = [];

        if (xMultiple === 1) {
            positions = [centerX - size / 2];
        } else if (xMultiple === 2) {
            positions = [
                centerX - gap / 2 - size / 2,
                centerX + gap / 2 - size / 2,
            ];
        } else {
            positions = [
                centerX - gap - size / 2,
                centerX - size / 2,
                centerX + gap - size / 2,
            ];
        }

        positions.forEach((x) => {
            ctx.drawImage(xSprite, x, centerY - size / 2, size, size);
        });
    }
}

function drawGame() {
    drawBackground();
    const pregunta = preguntas[preguntaActual];

    const col1X = canvas.width * 0.25;
    const col2X = canvas.width * 0.75;
    const startY = 180;
    const spacingY = 115;

    ctx.fillStyle = "white";
    ctx.font = "32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(pregunta.texto, canvas.width / 2, 50);

    pregunta.respuestas.forEach((r, i) => {
        const col = i < 4 ? col1X : col2X;
        const y = startY + (i % 4) * spacingY;

        if (respuestasMostradas[i]) {
            let alpha = 1;
            let scale = 1;

            if (animaciones[i]) {
                alpha = animaciones[i].alpha;
                scale = animaciones[i].scale;
                animaciones[i].alpha = Math.min(1, alpha + 0.05);
                animaciones[i].scale = Math.min(1, scale + 0.05);
                if (alpha >= 1 && scale >= 1) {
                    animaciones[i] = null;
                }
            }

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(col, y);
            ctx.scale(scale, scale);
            ctx.fillText(`${r.texto.toUpperCase()} - ${r.puntaje}`, 0, 0);
            ctx.restore();
        } else {
            ctx.fillText(`${i + 1}`, col, y);
        }
    });

    if (showX) {
        const size = 500;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const gap = size + 40;
        let positions = [];

        if (xMultiple === 1) {
            positions = [centerX - size / 2];
        } else if (xMultiple === 2) {
            positions = [
                centerX - gap / 2 - size / 2,
                centerX + gap / 2 - size / 2,
            ];
        } else {
            positions = [
                centerX - gap - size / 2,
                centerX - size / 2,
                centerX + gap - size / 2,
            ];
        }

        positions.forEach((x) => {
            ctx.drawImage(xSprite, x, centerY - size / 2, size, size);
        });
    }
}

function mostrarPreguntaGeneral() {
    const p = preguntas[preguntaActual];
    updateUI(p.texto, "");
    respuestasMostradas = Array(8).fill(false);
    animaciones = Array(8).fill(null);
    lastAnswer = null;
    lastAnswerIndex = null;
    sePermitioResponder = true;
}

function avanzarEscenaSiCorresponde() {
    const todasRespondidas = respuestasMostradas.every((v) => v);
    if (todasRespondidas && preguntaActual === preguntas.length - 1) {
        currentScene = "videoTodoONada";
        videoTodoONada.style.display = "block";
        videoTodoONada.play();
        updateUI("", "");

        videoTodoONada.onended = () => {
            videoTodoONada.style.display = "none";
            currentScene = "todoonada";
        };
    }
}

function startGame() {
    currentScene = "game";
    splashVideo.remove();
    music.play();
    mostrarPreguntaGeneral();
    updateUI();
    gradualVolumeFade();
}
function startDineroRapidoTimer() {
    if (dineroRapidoInterval) clearInterval(dineroRapidoInterval);

    dineroRapidoTimer = 20;
    dineroRapidoIndex = 0;
    faseDineroRapido = 1;

    dineroRapidoInterval = setInterval(() => {
        dineroRapidoTimer--;
        if (dineroRapidoTimer <= 0) {
            clearInterval(dineroRapidoInterval);
            faseDineroRapido = 2;
            respuestaActualIndex = 0;
            respuestaUsuario = "";
            updateUI("Responde ahora", "");
        }
    }, 1000);
}
function drawDineroRapido() {
    drawBackground();
    ctx.fillStyle = "white";
    ctx.font = "40px sans-serif";
    ctx.textAlign = "center";

    if (faseDineroRapido === 1) {
        // Solo mostrar temporizador
        ctx.fillText(
            `${dineroRapidoTimer}s`,
            canvas.width / 2,
            canvas.height / 2
        );
    } else if (faseDineroRapido === 2) {
        const col1X = canvas.width * 0.25;
        const col2X = canvas.width * 0.75;
        const startY = 180;
        const spacingY = 115;

        // Mostrar pregunta actual
        if (preguntasDineroRapido[respuestaActualIndex]) {
            ctx.fillText(
                preguntasDineroRapido[respuestaActualIndex].pregunta,
                canvas.width / 2,
                100
            );
        }

        // Mostrar respuestas ingresadas con sus puntajes
        for (let i = 0; i < 8; i++) {
            const col = i < 4 ? col1X : col2X;
            const y = startY + (i % 4) * spacingY;
            const texto =
                i === respuestaActualIndex
                    ? respuestaUsuario
                    : respuestasIngresadas[i];
            const puntaje = puntajesMostrados[i];

            ctx.fillText(
                texto.toUpperCase() + (puntaje !== null ? ` - ${puntaje}` : ""),
                col,
                y
            );
        }

        // Mostrar puntaje total
        ctx.fillText(
            `Total acumulado: ${dineroRapidoScore}`,
            canvas.width / 2,
            canvas.height - 100
        );
    }
}

function loop() {
    if (currentScene === "splash") drawSplash();
    else if (currentScene === "game") drawGame();
    else if (currentScene === "todoonada") drawTodoONada();
    else if (currentScene === "dineroRapido") drawDineroRapido();
    if (showX && xTimer > 0) {
        xTimer--;
        if (xTimer <= 0) {
            showX = false;
        }
    }
    requestAnimationFrame(loop);
}

document.addEventListener("keydown", (e) => {
    if (currentScene === "splash") return startGame();

    if (e.key === " " && currentScene != "dineroRapido") {
        sfxX.currentTime = 0;
        sfxX.play();
        const now = Date.now();
        if (now - lastSpaceTime < 500) xCount++;
        else xCount = 1;
        lastSpaceTime = now;
        xMultiple = Math.min(3, xCount);
        showX = true;
        xTimer = 60;
    }

    if (
        e.key >= "1" &&
        e.key <= "8" &&
        currentScene === "game" &&
        sePermitioResponder
    ) {
        const index = parseInt(e.key) - 1;
        if (!respuestasMostradas[index]) {
            respuestasMostradas[index] = true;
            animaciones[index] = { alpha: 0, scale: 0.8 };
            sfxOk.currentTime = 0;
            sfxOk.play();
            lastAnswer = preguntas[preguntaActual].respuestas[index];
            lastAnswerIndex = index;
            sePermitioResponder = false;
        }
    }

    if (e.key === "1" && currentScene === "todoonada") {
        const p = preguntasTodoONada[currentTodoIndex];
        respuestaEl.textContent = p.respuesta;
        lastAnswer = p;
        sfxOk.play();
    }

    if ((e.key === "a" || e.key === "b") && lastAnswerIndex !== null) {
        const puntos =
            preguntas[preguntaActual].respuestas[lastAnswerIndex].puntaje;
        if (e.key === "a") scoreA += puntos;
        if (e.key === "b") scoreB += puntos;
        lastAnswerIndex = null;
        sePermitioResponder = true;
        updateUI();
        avanzarEscenaSiCorresponde();
    }

    if (e.key === "n" && currentScene === "game") {
        if (preguntaActual < preguntas.length - 1) {
            preguntaActual++;
            mostrarPreguntaGeneral();
        }
    }

    if (e.key === "b" && currentScene === "game") {
        if (preguntaActual > 0) {
            preguntaActual--;
            mostrarPreguntaGeneral();
        }
    }

    if (e.key === "n" && currentScene === "todoonada") {
        currentTodoIndex++;
        if (currentTodoIndex < preguntasTodoONada.length) {
            updateUI();
        } else {
            currentScene = "videoDineroRapido";
            videoDineroRapido.style.display = "block";
            videoDineroRapido.play();

            videoDineroRapido.onended = () => {
                videoDineroRapido.style.display = "none";
                currentScene = "dineroRapido";
                dineroRapidoIndex = 0;
                dineroRapidoTimer = 20;
                faseDineroRapido = 1;
                dineroRapidoScore = 0;
                respuestaUsuario = "";
                respuestasIngresadas = Array(8).fill("");
                puntajesMostrados = Array(8).fill(null);
                respuestaActualIndex = 0;
                startDineroRapidoTimer();
                updateUI(preguntasDineroRapido[dineroRapidoIndex].pregunta, "");
            };
        }
    }
    if (currentScene === "dineroRapido") {
        if (faseDineroRapido === 1) return;

        if (e.key === "Backspace") {
            respuestaUsuario = respuestaUsuario.slice(0, -1);
        } else if (
            e.key.length === 1 &&
            /^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]$/.test(e.key)
        ) {
            respuestaUsuario += e.key;
        } else if (
            e.key === "Enter" &&
            respuestaActualIndex < preguntasDineroRapido.length
        ) {
            const normalizada = (str) =>
                str
                    .trim()
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "");

            const preguntaActual = preguntasDineroRapido[respuestaActualIndex];
            const match = preguntaActual.respuestas.find(
                (res) =>
                    normalizada(res.texto) === normalizada(respuestaUsuario)
            );

            const puntaje = match ? match.puntaje : 0;
            if (match) {
                sfxOk.play();
            } else {
                sfxX.currentTime = 0;
                sfxX.play();
                showX = true;
                xTimer = 60;
            }

            respuestasIngresadas[respuestaActualIndex] = respuestaUsuario;
            puntajesMostrados[respuestaActualIndex] = puntaje;
            dineroRapidoScore += puntaje;

            respuestaUsuario = "";
            respuestaActualIndex++;
        }
    }
});

loop();
