// Instrucciones para poblar Firebase con datos de ejemplo
// Ejecuta este código en la consola del navegador cuando tengas Firebase abierto

// Primero, ve a Firebase Console > Firestore Database > y ejecuta este código en la consola del navegador

const movies = [
  {
    title: "David Gilmour Live at the Circus Maximus, Rome",
    description: "Una potencia extraordinaria. Un maestro en su oficio. Concierto único en vivo desde el Circus Maximus en Roma.",
    genre: ["Música", "Concierto"],
    duration: 120,
    releaseDate: new Date('2025-09-17'),
    posterUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop",
    director: "David Gilmour",
    cast: ["David Gilmour"],
    rating: "PG",
    language: "Inglés",
    subtitle: "Subtítulos en español",
    isNowPlaying: true,
    isComingSoon: false,
    isBTSWeek: false,
    trailerUrl: "",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "El Apóstol de los Andes",
    description: "Monseñor Federico Kaiser Depel, MSC. Fundador de las Misioneras de Jesús, Verbo y Víctima.",
    genre: ["Drama", "Religioso"],
    duration: 105,
    releaseDate: new Date('2025-09-18'),
    posterUrl: "https://images.unsplash.com/photo-1489599162514-3c0b99b24e1f?w=400&h=600&fit=crop",
    director: "Director Religioso",
    cast: ["Actor Principal"],
    rating: "PG",
    language: "Español",
    isNowPlaying: true,
    isComingSoon: false,
    isBTSWeek: false,
    trailerUrl: "",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "El Gran Viaje De Tu Vida",
    description: "Revive tu pasado, cambia tu futuro. Exclusivamente en cines 18 de septiembre.",
    genre: ["Drama", "Fantasía"],
    duration: 115,
    releaseDate: new Date('2025-09-18'),
    posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
    director: "Director Drama",
    cast: ["Actriz Principal", "Actor Secundario"],
    rating: "PG-13",
    language: "Español",
    isNowPlaying: true,
    isComingSoon: false,
    isBTSWeek: false,
    trailerUrl: "",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Para agregar estas películas a Firebase, ejecuta esto en la consola del navegador:
// (Asegúrate de estar en Firebase Console con tu proyecto abierto)

console.log('Películas de ejemplo para Firebase:', movies);
console.log('Para agregar a Firebase, usa estas películas en tu aplicación o agrega manualmente en Firestore.');