/* eslint-disable no-undef */
// src/utils/gamificacion.js

// Calcula los puntos totales que gana el paciente
function calcularPuntos({ citasAsistidas, tratamientosCompletados, pagosPuntuales }) {
    const PUNTOS_CITA = 10;
    const PUNTOS_TRATAMIENTO = 50;
    const PUNTOS_PAGO_PUNTUAL = 5;

    return (
        (citasAsistidas * PUNTOS_CITA) +
        (tratamientosCompletados * PUNTOS_TRATAMIENTO) +
        (pagosPuntuales * PUNTOS_PAGO_PUNTUAL)
    );
}

// Evalúa qué logros desbloquea el paciente
function evaluarLogrosFront({ citasConsecutivas, tratamientosCompletados }) {
    const logros = [];

    if (citasConsecutivas >= 5) {
        logros.push("Paciente puntual");
    }

    if (tratamientosCompletados >= 1) {
        logros.push("Tratamiento completado");
    }

    return logros;
}

// Calcula el nivel del paciente según sus puntos acumulados
function calcularNivel(puntosTotales) {
    if (puntosTotales >= 200) return "Oro";
    if (puntosTotales >= 100) return "Plata";
    return "Bronce";
}

module.exports = {
    calcularPuntos,
    evaluarLogrosFront,
    calcularNivel,
};
