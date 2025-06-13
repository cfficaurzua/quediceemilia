// core/state.js
export const gameState = {
    currentScene: "splash",
    scoreA: 0,
    scoreB: 0,
    preguntaActual: 0,
    lastAnswerIndex: null,
    lastAnswer: null,
    sePermitioResponder: true,
    showX: false,
    xCount: 0,
    xTimer: 0,
    respuestasMostradas: Array(8).fill(false),
    animaciones: Array(8).fill(null),
    splashPlayed: false,
};
