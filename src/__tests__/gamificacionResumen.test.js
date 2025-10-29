/* eslint-disable no-undef */
import axios from "axios";

describe("API /api/gamificacion/resumen", () => {
    const BASE_URL = "https://backenddent.onrender.com";

    test("regresa resumen general con métricas correctas", async () => {
        const res = await axios.get(`${BASE_URL}/api/gamificacion/resumen`, {
            validateStatus: () => true,
        });

        // 1. Debe responder 200
        expect(res.status).toBe(200);

        // 2. Estructura base
        const body = res.data;
        expect(typeof body).toBe("object");
        expect(body).not.toBeNull();

        // body.ok === true
        expect(body).toHaveProperty("ok", true);

        // body.data debe existir y ser objeto
        expect(body).toHaveProperty("data");
        expect(typeof body.data).toBe("object");
        expect(body.data).not.toBeNull();

        const data = body.data;

        // 3. Validar métricas globales
        expect(data).toHaveProperty("total_logros_desbloqueados");
        expect(typeof data.total_logros_desbloqueados).toBe("number");

        expect(data).toHaveProperty("total_puntos_otorgados");
        // puede venir como string "120", validamos que sea convertible a número
        expect(!isNaN(Number(data.total_puntos_otorgados))).toBe(true);

        expect(data).toHaveProperty("total_recompensas_canjeadas");
        expect(typeof data.total_recompensas_canjeadas).toBe("number");

        // 4. Validar top_pacientes
        expect(data).toHaveProperty("top_pacientes");
        expect(Array.isArray(data.top_pacientes)).toBe(true);

        if (data.top_pacientes.length > 0) {
            const paciente = data.top_pacientes[0];

            expect(paciente).toHaveProperty("usuario_id");
            expect(typeof paciente.usuario_id === "number").toBe(true);

            expect(paciente).toHaveProperty("nombre");
            expect(typeof paciente.nombre).toBe("string");

            expect(paciente).toHaveProperty("apellido_paterno");
            expect(typeof paciente.apellido_paterno).toBe("string");

            expect(paciente).toHaveProperty("puntos_ganados");
            // igual que arriba: "60" o 60 los aceptamos
            expect(!isNaN(Number(paciente.puntos_ganados))).toBe(true);
        }
    });
});
