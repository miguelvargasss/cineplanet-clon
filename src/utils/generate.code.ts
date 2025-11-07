

// Crear utilidades para generar código de compra
export const generatePurchaseCode = (): string =>{
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < 7; i++){
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    return code;
};


// Crear utilidades para generar sala aleatoria
export const generateRandomSala = (): string => {
    const salaNumber = Math.floor(Math.random() * 8) +1; //Salas del 1 al 8
    return `Sala ${salaNumber}`;
}

export const getCurrentPeruDateTime = (): {date:string, time:string} => {
    const now = new Date();

    // Convertir a hora de Perú (UTC-5)
    const peruOffset = -5 * 60; // Perú está en UTC-5
    const localOffset = now.getTimezoneOffset(); 
    const peruTime = new Date(now.getTime() + (localOffset + peruOffset) * 60000);

    const day = String(peruTime.getDate()).padStart(2, '0');
    const month = String(peruTime.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
    const year = String(peruTime.getFullYear());
    const hours = String(peruTime.getHours()).padStart(2, '0');
    const minutes = String(peruTime.getMinutes()).padStart(2, '0');

    return {
        date: `${day}/${month}/${year}`,
        time: `${hours}:${minutes}`
    };
};