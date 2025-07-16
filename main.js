import { gameState } from "./core/state.js";
import { assets } from "./core/assets.js";
import {
    drawXMarks,
    playSound,
    normalizeString,
    gradualVolumeFade,
} from "./core/utils.js";
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

const respuestaEl = document.getElementById("respuesta");
const puntajeEl = document.getElementById("puntajeGlobal");

let respuestaUsuario = "";
let preguntaActual = 0;
let currentTodoIndex = 0;
let dineroRapidoIndex = 0;
let dineroRapidoTimer = 20;
let dineroRapidoScore = 0;
let dineroRapidoRonda = 1;
let dineroRapidoInterval = null;
let faseDineroRapido = 0;
let respuestasIngresadas = Array(8).fill("");
let puntajesMostrados = Array(8).fill(null);
let respuestaActualIndex = 0;
const videoTodoONada = document.getElementById("videoTodoONada");
const videoDineroRapido = document.getElementById("videoDineroRapido");

let lastSpaceTime = 0;
let fondoTodoONada = null;

function updateUI(respuesta = "") {
    respuestaEl.textContent = respuesta;
    puntajeEl.textContent = `Equipo A: ${gameState.scoreA} — Equipo B: ${gameState.scoreB}`;
}

function drawSplash() {
    if (splash.complete) {
        ctx.drawImage(assets.splash, 0, 0, canvas.width, canvas.height);
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

    if (gameState.currentScene === "dineroRapido" && faseDineroRapido === 1) {
        ctx.drawImage(assets.countdown, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.drawImage(assets.background, 0, 0, canvas.width, canvas.height);
    }
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
    ctx.fillText(pregunta.pregunta, canvas.width / 2, 50);

    if (gameState.showX) {
        drawXMarks(ctx, assets.xSprite, gameState.xMultiple);
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

        if (gameState.respuestasMostradas[i]) {
            let alpha = 1;
            let scale = 1;

            if (gameState.animaciones[i]) {
                alpha = gameState.animaciones[i].alpha;
                scale = gameState.animaciones[i].scale;
                gameState.animaciones[i].alpha = Math.min(1, alpha + 0.05);
                gameState.animaciones[i].scale = Math.min(1, scale + 0.05);
                if (alpha >= 1 && scale >= 1) {
                    gameState.animaciones[i] = null;
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

    if (gameState.showX) {
        drawXMarks(ctx, assets.xSprite, gameState.xMultiple);
    }
}

function mostrarPreguntaGeneral() {
    updateUI();
    gameState.respuestasMostradas = Array(8).fill(false);
    gameState.animaciones = Array(8).fill(null);
    gameState.lastAnswer = null;
    gameState.lastAnswerIndex = null;
    gameState.sePermitioResponder = true;
}

function avanzarEscenaSiCorresponde() {
    const todasRespondidas = gameState.respuestasMostradas.every((v) => v);
    if (todasRespondidas && preguntaActual === preguntas.length - 1) {
        gameState.currentScene = "videoTodoONada";
        videoTodoONada.style.display = "block";
        videoTodoONada.play();
        updateUI();

        videoTodoONada.onended = () => {
            videoTodoONada.style.display = "none";
            gameState.currentScene = "todoonada";
        };
    }
}

function startGame() {
    gameState.currentScene = "game";
    splashVideo.remove();
    playSound(music);
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
            updateUI();
        }
    }, 1000);
}
function drawDineroRapido() {
    drawBackground();
    ctx.fillStyle = "white";
    ctx.font = "40px sans-serif";
    ctx.textAlign = "center";
    if (faseDineroRapido === 0) {
        // Esperando que el usuario esté listo
        ctx.font = "60px sans-serif";
        ctx.fillText(
            "Presiona ENTER para comenzar",
            canvas.width / 2,
            canvas.height / 2
        );
        return;
    }

    if (faseDineroRapido === 1) {
        // Solo mostrar temporizador
        ctx.font = "100px sans-serif";
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
                50
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
    if (gameState.currentScene === "splash") drawSplash();
    else if (gameState.currentScene === "game") drawGame();
    else if (gameState.currentScene === "todoonada") drawTodoONada();
    else if (gameState.currentScene === "dineroRapido") drawDineroRapido();
    else if (gameState.currentScene === "resultadoFinal") drawResultadoFinal();
    if (gameState.showX && gameState.xTimer > 0) {
        gameState.xTimer--;
        if (gameState.xTimer <= 0) {
            gameState.showX = false;
        }
    }
    requestAnimationFrame(loop);
}

document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    if (gameState.currentScene === "splash") {
        return startGame();
    }

    if (gameState.currentScene === "dineroRapido") {
        handleDineroRapidoInput(e);
    }

    if (key === " ") {
        handleSpacePress();
        return;
    }

    if (
        isNumberKey(key) &&
        gameState.currentScene === "game" &&
        gameState.sePermitioResponder
    ) {
        handleGameAnswerKey(parseInt(key) - 1);
        return;
    }

    if (key === "1" && gameState.currentScene === "todoonada") {
        handleTodoONadaAnswer();
        return;
    }

    if ((key === "a" || key === "b") && gameState.lastAnswerIndex !== null) {
        assignScore(key);
        return;
    }

    if (key === "n") {
        handleNextKey();
        return;
    }

    if (key === "p" && gameState.currentScene === "game") {
        if (preguntaActual > 0) {
            preguntaActual--;
            mostrarPreguntaGeneral();
        }
        return;
    }
});

// === Sub-funciones ===

function isNumberKey(key) {
    return /^[1-8]$/.test(key);
}

function handleSpacePress() {
    playSound(sfxX);
    const now = Date.now();
    if (now - lastSpaceTime < 500) gameState.xCount++;
    else gameState.xCount = 1;
    lastSpaceTime = now;
    gameState.xMultiple = Math.min(3, gameState.xCount);
    gameState.showX = true;
    gameState.xTimer = 60;
}

function handleGameAnswerKey(index) {
    if (!gameState.respuestasMostradas[index]) {
        gameState.respuestasMostradas[index] = true;
        gameState.animaciones[index] = { alpha: 0, scale: 0.8 };
        playSound(sfxOk);
        gameState.lastAnswer = preguntas[preguntaActual].respuestas[index];
        gameState.lastAnswerIndex = index;
        gameState.sePermitioResponder = false;
    }
}

function handleTodoONadaAnswer() {
    const p = preguntasTodoONada[currentTodoIndex];
    respuestaEl.textContent = p.respuesta;
    gameState.lastAnswer = p;
    gameState.lastAnswerIndex = currentTodoIndex;
    playSound(sfxOk);
}

function assignScore(key) {
    let puntos = 0;
    if (gameState.currentScene === "game") {
        puntos =
            preguntas[preguntaActual].respuestas[gameState.lastAnswerIndex]
                .puntaje;
    } else if (gameState.currentScene === "todoonada") {
        puntos = preguntasTodoONada[gameState.lastAnswerIndex].puntaje;
    }

    if (key === "a") gameState.scoreA += puntos;
    if (key === "b") gameState.scoreB += puntos;

    gameState.lastAnswerIndex = null;
    gameState.sePermitioResponder = true;
    updateUI();

    if (gameState.currentScene === "game") {
        avanzarEscenaSiCorresponde();
    }
}

function handleNextKey() {
    if (gameState.currentScene === "game") {
        if (preguntaActual < preguntas.length - 1) {
            preguntaActual++;
            mostrarPreguntaGeneral();
        }
    } else if (gameState.currentScene === "todoonada") {
        currentTodoIndex++;
        if (currentTodoIndex < preguntasTodoONada.length) {
            updateUI();
        } else {
            gameState.currentScene = "videoDineroRapido";
            videoDineroRapido.style.display = "block";
            videoDineroRapido.play();

            videoDineroRapido.onended = () => {
                videoDineroRapido.style.display = "none";
                gameState.currentScene = "dineroRapido";
                dineroRapidoIndex = 0;
                dineroRapidoTimer = 20;
                faseDineroRapido = 0; // Espera que el usuario presione ENTER
                respuestaUsuario = "";
                respuestaActualIndex = 0;

                if (dineroRapidoRonda === 1) {
                    respuestasIngresadas = Array(8).fill("");
                    puntajesMostrados = Array(8).fill(null);
                }
            };
        }
    }
}
function drawResultadoFinal() {
    drawBackground();
    ctx.fillStyle = "white";
    ctx.font = "64px sans-serif";
    ctx.textAlign = "center";

    const mensaje =
        dineroRapidoScore >= 200
            ? "¡Ganaron el Dinero Rápido!"
            : "No alcanzaron los 200 puntos";

    ctx.fillText(mensaje, canvas.width / 2, canvas.height / 2);
    ctx.fillText(
        `Puntaje: ${dineroRapidoScore}`,
        canvas.width / 2,
        canvas.height / 2 + 80
    );
}

function handleDineroRapidoInput(e) {
    if (faseDineroRapido === 0 && e.key === "Enter") {
        faseDineroRapido = 1;
        startDineroRapidoTimer();
        return;
    }
    if (faseDineroRapido === 1) return;

    if (e.key === "Backspace") {
        respuestaUsuario = respuestaUsuario.slice(0, -1);
    } else if (e.key.length === 1 && /^[a-zA-ZñÑáéíóúÁÉÍÓÚ ]$/.test(e.key)) {
        respuestaUsuario += e.key;
    } else if (
        e.key === "Enter" &&
        respuestaActualIndex < preguntasDineroRapido.length
    ) {
        const pregunta = preguntasDineroRapido[respuestaActualIndex];
        const match = pregunta.respuestas.find(
            (res) =>
                normalizeString(res.texto) === normalizeString(respuestaUsuario)
        );

        const puntaje = match ? match.puntaje : 0;
        match
            ? playSound(sfxOk)
            : (playSound(sfxX),
              (gameState.showX = true),
              (gameState.xTimer = 60));
        if (
            respuestasIngresadas.some(
                (r) => normalizeString(r) === normalizeString(respuestaUsuario)
            )
        ) {
            playSound(sfxX);
            gameState.showX = true;
            gameState.xTimer = 60;
            return; // no avanzar
        }
        respuestasIngresadas[respuestaActualIndex] = respuestaUsuario;
        puntajesMostrados[respuestaActualIndex] = puntaje;
        dineroRapidoScore += puntaje;

        respuestaUsuario = "";
        respuestaActualIndex++;
        if (respuestaActualIndex >= preguntasDineroRapido.length) {
            if (dineroRapidoRonda === 1) {
                // Pasa a segunda ronda
                dineroRapidoRonda = 2;
                respuestaActualIndex = 0;
                faseDineroRapido = 0;
            } else {
                // Fin del dinero rápido, mostrar resultado final
                gameState.currentScene = "resultadoFinal";
            }
        }
    }
}

loop();
