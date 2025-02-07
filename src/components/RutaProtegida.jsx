import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { verificarAutenticacion } from '../utils/auth';

const RutaProtegida = ({ children, tiposPermitidos }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const verificar = async () => {
            const usuarioAutenticado = await verificarAutenticacion();
            setUsuario(usuarioAutenticado);
            setCargando(false);
        };
        verificar();
    }, []);

    if (cargando) return <div>Cargando...</div>;

    if (!usuario) {
        return <Navigate to="/login" />;
    }

    if (!tiposPermitidos.includes(usuario.tipo)) {
        return <Navigate to="/403" />;
    }

    return children;
};

export default RutaProtegida;
