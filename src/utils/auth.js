export const verificarAutenticacion = async () => {
    try {
        const respuesta = await fetch('http://localhost:4000/api/usuarios/verificar-sesion', {
            method: 'GET',
            credentials: 'include',  // Incluye cookies
        });

        if (!respuesta.ok) {
            throw new Error('No autenticado');
        }

        const datos = await respuesta.json();
        return datos.usuario;  // Devuelve los datos del usuario autenticado
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        return null;
    }
};
