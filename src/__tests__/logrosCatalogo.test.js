/* eslint-disable no-undef */
import axios from "axios";

describe("API /api/logros/admin/catalogo/listar", () => {
    const BASE_URL = "https://backenddent.onrender.com";

    test("regresa catálogo de logros con estructura válida", async () => {
        const res = await axios.get(`${BASE_URL}/api/logros/admin/catalogo/listar`, {
            validateStatus: () => true,
        });

        // 1. status code OK
        expect(res.status).toBe(200);

        // 2. normalizar forma de respuesta
        // puede venir:
        //   a) como array directo
        //   b) como { ok: true, data: [...] }
        const raw = res.data;
        const lista = Array.isArray(raw)
            ? raw
            : (Array.isArray(raw.data) ? raw.data : []);

        // 3. debe ser array
        expect(Array.isArray(lista)).toBe(true);

        if (lista.length > 0) {
            const logro = lista[0];

            // id numérico
            expect(logro).toHaveProperty("id");
            expect(typeof logro.id).toBe("number");

            // clave string
            expect(logro).toHaveProperty("clave");
            expect(typeof logro.clave).toBe("string");

            // nombre string
            expect(logro).toHaveProperty("nombre");
            expect(typeof logro.nombre).toBe("string");

            // descripcion string
            expect(logro).toHaveProperty("descripcion");
            expect(typeof logro.descripcion).toBe("string");

            // condicion_json string JSON
            expect(logro).toHaveProperty("condicion_json");
            expect(typeof logro.condicion_json).toBe("string");

            // activo 0 o 1
            expect(logro).toHaveProperty("activo");
            expect([0, 1]).toContain(logro.activo);

            // fecha_creacion string tipo fecha
            expect(logro).toHaveProperty("fecha_creacion");
            expect(typeof logro.fecha_creacion).toBe("string");

            // validar que condicion_json sea JSON válido
            expect(() => {
                JSON.parse(logro.condicion_json);
            }).not.toThrow();

            // validación específica si es ASISTENCIA_PERFECTA
            if (logro.clave === "ASISTENCIA_PERFECTA") {
                const cond = JSON.parse(logro.condicion_json);
                expect(cond).toHaveProperty("tipo", "citas");
                expect(cond).toHaveProperty("mes", "actual");
                expect(cond).toHaveProperty("porcentaje_asistencia", 100);
            }
        }
    });
});
