/* eslint-disable no-undef */
import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Recompensas from "../pages/pacientes/Recompensas";
import { verificarAutenticacion } from "../utils/auth";

// --- Mock de autenticación (ajusta el id a un usuario válido de tu backend) ---
jest.mock("../utils/auth", () => ({
    verificarAutenticacion: jest.fn().mockResolvedValue({ id: 1 }),
}));

beforeEach(() => {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ csrfToken: "TEST_TOKEN" }),
        })
    );
});

test("consulta el backend real y muestra resultados de los GET", async () => {
    render(<Recompensas />);

    // Esperar encabezado principal
    await screen.findByText(/Recompensas del Paciente/i);

    // Esperar a que el saldo se renderice
    const saldoEl = await screen.findByText(/pts disponibles/i);
    console.log("✅ Saldo encontrado en pantalla:", saldoEl.textContent);

    // Esperar recompensas
    const recompensas = await screen.findAllByText(/puntos/i);
    console.log(`✅ Se encontraron ${recompensas.length} recompensas.`);

    // Capturar los nombres visibles en pantalla
    const nombres = Array.from(document.querySelectorAll("h6"))
        .map((el) => el.textContent.trim())
        .filter((t) => t.length > 0);
    console.log("🎁 Recompensas visibles:", nombres);

    // Capturar texto completo para revisar en consola (opcional)
    const fullText = document.body.textContent;
    console.log("\n--- TEXTO COMPLETO DEL DOM ---\n", fullText.slice(0, 800), "\n...");

    // Confirmar que sí hay recompensas visibles
    expect(recompensas.length).toBeGreaterThan(0);
}, 25000); // 25 segundos por si Render tarda en responder
