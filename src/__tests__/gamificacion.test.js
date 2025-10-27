/* eslint-disable no-undef */
/* eslint-env jest */
const {
    calcularPuntos,
    evaluarLogrosFront,
    calcularNivel,
} = require("../utils/gamificacion.js");

describe("Gamificación del ConsultorioDental (front)", () => {
    test("calcularPuntos suma correctamente citas, tratamientos y pagos puntuales", () => {
        // 3 citas asistidas, 1 tratamiento completado, 2 pagos puntuales:
        // citas: 3 * 10 = 30
        // tratamientos: 1 * 50 = 50
        // pagos puntuales: 2 * 5 = 10
        // total = 90
        const total = calcularPuntos({
            citasAsistidas: 3,
            tratamientosCompletados: 1,
            pagosPuntuales: 2,
        });

        expect(total).toBe(90);
    });

    test('evaluarLogrosFront da "Paciente puntual" y "Tratamiento completado" si cumple condiciones', () => {
        const logros = evaluarLogrosFront({
            citasConsecutivas: 5,
            tratamientosCompletados: 1,
        });

        expect(logros).toContain("Paciente puntual");
        expect(logros).toContain("Tratamiento completado");
    });

    test("evaluarLogrosFront no asigna logros si no cumple condiciones", () => {
        const logros = evaluarLogrosFront({
            citasConsecutivas: 2, // <5
            tratamientosCompletados: 0, // ninguno
        });

        expect(logros).not.toContain("Paciente puntual");
        expect(logros).not.toContain("Tratamiento completado");
        expect(logros.length).toBe(0);
    });

    test("calcularNivel devuelve el nivel correcto según puntos acumulados", () => {
        expect(calcularNivel(40)).toBe("Bronce");   // <100
        expect(calcularNivel(150)).toBe("Plata");   // 100-199
        expect(calcularNivel(250)).toBe("Oro");     // >=200
    });
});
