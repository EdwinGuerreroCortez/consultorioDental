// src/hooks/useApi.js
import { useState, useEffect, useMemo } from "react";
import axios from "axios";

// Pon aquí la URL de tu backend
// Para producción:
const BASE_URL = "https://backenddent.onrender.com/api";
// Si vas a probar en local, cambia por:
// const BASE_URL = "https://backenddent.onrender.com/api";

export const useApi = () => {
    const [csrfToken, setCsrfToken] = useState(null);
    const [loadingCsrf, setLoadingCsrf] = useState(true);

    // Instancia de axios reutilizable
    const axiosInstance = useMemo(
        () =>
            axios.create({
                baseURL: BASE_URL,
                withCredentials: true,
            }),
        []
    );

    useEffect(() => {
        const obtenerTokenCSRF = async () => {
            try {
                const resp = await fetch(`${BASE_URL}/get-csrf-token`, {
                    credentials: "include",
                });
                const data = await resp.json();
                setCsrfToken(data.csrfToken);
            } catch (error) {
                console.error("Error obteniendo el token CSRF:", error);
            } finally {
                setLoadingCsrf(false);
            }
        };

        obtenerTokenCSRF();
    }, []);

    return {
        axiosInstance,
        csrfToken,
        loadingCsrf,
    };
};
