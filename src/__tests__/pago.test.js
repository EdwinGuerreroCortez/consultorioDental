/* eslint-disable no-undef */
/* eslint-env jest */

// Función de negocio: calcula el total a pagar por un tratamiento dental
function calcularTotalPago(costoPorProcedimiento, cantidadProcedimientos, descuento = 0) {
    const subtotal = costoPorProcedimiento * cantidadProcedimientos;
    const total = subtotal - descuento;
    return total;
}

test('calcularTotalPago calcula el pago sin descuento', () => {
    // Ejemplo: limpieza dental $500, 2 servicios => 1000
    expect(calcularTotalPago(500, 2, 0)).toBe(1000);
});

test('calcularTotalPago aplica descuento correctamente', () => {
    // Ejemplo: tratamiento $800 x1 con $100 de descuento => 700
    expect(calcularTotalPago(800, 1, 100)).toBe(700);
});
