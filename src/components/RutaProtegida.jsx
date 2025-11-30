import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { verificarAutenticacion } from '../utils/auth';
//importa el loader 
import Loader from './Loader';

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

    if (cargando) return <Loader />;

    if (!usuario) {
        return <Navigate to="/login" />;
    }

    if (!tiposPermitidos.includes(usuario.tipo)) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default RutaProtegida;
