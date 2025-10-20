// 💺 SERVICIO DE ASIENTOS
// Servicio simplificado para gestión de asientos en las salas de cine

interface Seat {
  id: string;
  row: string;
  number: number;
  isOccupied: boolean;
  isWheelchair: boolean;
  isSelected: boolean;
}

// Generar asientos para una función específica
const generateSeatsForShowtime = (cinemaId: string, showtimeId: string): Seat[] => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 12;
  const seats: Seat[] = [];

  rows.forEach((row) => {
    for (let number = 1; number <= seatsPerRow; number++) {
      const seatId = `${cinemaId}-${showtimeId}-${row}${number}`;
      
      seats.push({
        id: seatId,
        row,
        number,
        isOccupied: false, // Por ahora todos disponibles, después conectar con Firebase
        isWheelchair: row === 'A' && (number === 1 || number === 12), // Primera fila, extremos
        isSelected: false,
      });
    }
  });

  return seats;
};

// Obtener asientos para un cine y función específicos
export const getSeatsByCinemaAndShowtime = async (
  cinemaId: string,
  showtimeId: string
): Promise<Seat[]> => {
  try {
    // Por ahora generamos asientos dinámicamente
    // En el futuro, esto consultará Firebase para obtener el estado real de los asientos
    return generateSeatsForShowtime(cinemaId, showtimeId);
  } catch (error) {
    console.error('Error obteniendo asientos:', error);
    throw new Error('Error al cargar los asientos');
  }
};

// Reservar asientos
export const reserveSeats = async (
  seatIds: string[],
  showtimeId: string
): Promise<void> => {
  try {
    // En el futuro, esto actualizará Firebase marcando los asientos como ocupados
  } catch (error) {
    console.error('Error reservando asientos:', error);
    throw new Error('Error al reservar los asientos');
  }
};

// Liberar asientos
export const releaseSeats = async (
  seatIds: string[],
  showtimeId: string
): Promise<void> => {
  try {
    // En el futuro, esto actualizará Firebase marcando los asientos como disponibles
  } catch (error) {
    console.error('Error liberando asientos:', error);
    throw new Error('Error al liberar los asientos');
  }
};
