import zxcvbn from "zxcvbn";

/**
 * Valida la fortaleza de una contraseña utilizando zxcvbn.
 * @param {string} password - La contraseña a evaluar.
 * @returns {Object} Un objeto con el puntaje, nivel textual y mensajes de sugerencias.
 */
export const evaluatePasswordStrength = (password) => {
  const strength = zxcvbn(password);
  const levels = ["Muy Débil", "Débil", "Regular", "Fuerte", "Muy Fuerte"];

  return {
    score: strength.score, // Puntaje entre 0 y 4
    level: levels[strength.score], // Nivel textual
    suggestions: strength.feedback.suggestions.join(" ") || "Contraseña segura.",
  };
};

/**
 * Valida si una contraseña cumple con los requisitos mínimos.
 * @param {string} password - La contraseña a validar.
 * @returns {string} Un mensaje de error si la contraseña no es válida o vacío si es válida.
 */
export const validatePassword = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  if (!password.trim()) {
    return "La contraseña no puede estar vacía.";
  } else if (!regex.test(password)) {
    return "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, un número y un carácter especial.";
  }
  return ""; // Vacío si la contraseña es válida
};

/**
 * Valida el nombre.
 * @param {string} name - El nombre a validar.
 * @returns {string} Mensaje de error o vacío si es válido.
 */
export const validateName = (name) => {
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,50}$/; // Solo letras y espacios, entre 2 y 50 caracteres
  if (!name.trim()) {
    return "El nombre no puede estar vacío.";
  } else if (!regex.test(name)) {
    return "El nombre solo debe contener letras, sin caracteres especiales.";
  }
  return "";
};

/**
 * Valida un número telefónico.
 * @param {string} phone - El número a validar.
 * @returns {string} Mensaje de error o vacío si es válido.
 */
export const validatePhoneNumber = (phone) => {
  const regex = /^[0-9]{10}$/; // Exactamente 10 dígitos
  if (!phone.trim()) {
    return "El teléfono no puede estar vacío.";
  } else if (!regex.test(phone)) {
    return "El teléfono debe tener exactamente 10 dígitos y solo números.";
  }
  return "";
};

/**
 * Valida la edad mínima de un usuario.
 * @param {string} age - La edad a validar.
 * @returns {string} Mensaje de error o vacío si es válida.
 */
export const validateAge = (age) => {
  const numericAge = parseInt(age, 10);
  if (!numericAge || numericAge < 18) {
    return "Debes ser mayor de 18 años.";
  }
  return "";
};

/**
 * Valida un correo electrónico.
 * @param {string} email - El correo electrónico a validar.
 * @returns {string} Mensaje de error o vacío si es válido.
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Formato estándar de correo
  if (!email.trim()) {
    return "El correo no puede estar vacío.";
  } else if (!regex.test(email)) {
    return "Ingresa un correo válido.";
  }
  return "";
};
