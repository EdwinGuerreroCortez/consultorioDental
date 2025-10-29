/* eslint-disable no-undef */
import "@testing-library/jest-dom";

// 1. Polyfill de fetch (seguro)
if (!global.fetch) {
    global.fetch = (...args) =>
        Promise.reject(
            new Error(
                "fetch fue llamado en test pero no fue mockeado. Mockéalo en el propio test con global.fetch = jest.fn(...)"
            )
        );
}

// 2. Silenciar warnings ruidosos de MUI tipo "The following props are not supported: `ownerState`"
const originalError = console.error;

beforeAll(() => {
    console.error = (...args) => {
        const message = args
            .map((a) => (typeof a === "string" ? a : ""))
            .join(" ");

        // filtra exactamente el warning de MUI Snackbar / ClickAwayListener
        if (
            message.includes(
                "The following props are not supported: `ownerState`"
            )
        ) {
            return; // lo ignoramos
        }

        // cualquier otro error real sí lo mostramos
        originalError(...args);
    };
});
