// UTILIDADES PARA GENERACIÓN DE CÓDIGOS Y DATOS DE COMPRA

/**
 * Genera un código de compra aleatorio de 7 caracteres
 * Combina letras mayúsculas (A-Z) y números (0-9)
 * Ejemplo: "WLKXP5R", "A7K9M2N"
 */
export const generatePurchaseCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 7; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
};

/**
 * Genera un número de sala aleatorio entre 1 y 8
 * Formato: "Sala 1", "Sala 2", ..., "Sala 8"
 */
export const generateRandomSala = (): string => {
  const salaNumber = Math.floor(Math.random() * 8) + 1; // Entre 1 y 8
  return `Sala ${salaNumber}`;
};

/**
 * Obtiene la fecha y hora actual en zona horaria de Perú (UTC-5)
 * @returns Objeto con fecha en formato DD/MM/YYYY y hora en formato HH:MM
 */
export const getCurrentPeruDateTime = (): { date: string; time: string } => {
  const now = new Date();
  
  // Convertir a hora de Perú (UTC-5)
  const peruOffset = -5 * 60; // minutos
  const localOffset = now.getTimezoneOffset(); // minutos
  const peruTime = new Date(now.getTime() + (localOffset - peruOffset) * 60000);
  
  const day = String(peruTime.getDate()).padStart(2, '0');
  const month = String(peruTime.getMonth() + 1).padStart(2, '0');
  const year = peruTime.getFullYear();
  const hours = String(peruTime.getHours()).padStart(2, '0');
  const minutes = String(peruTime.getMinutes()).padStart(2, '0');
  
  return {
    date: `${day}/${month}/${year}`,
    time: `${hours}:${minutes}`
  };
};
