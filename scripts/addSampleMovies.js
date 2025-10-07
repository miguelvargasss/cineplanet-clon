// Importar las funciones del servicio de películas
const { addMovieToCategory } = require('../src/services/moviesService');

// 🎬 PELÍCULAS EN CARTELERA - Se mostrarán en la sección principal
const sampleMovies = [
  {
    title: "AVATAR: EL CAMINO DEL AGUA [2022]",
    description: "Jake Sully vive con su nueva familia formada en el planeta de Pandora. Cuando una familiar amenaza regresa para acabar lo que empezó anteriormente, Jake debe trabajar con Neytiri y el ejército de la raza Na'vi para proteger su planeta.",
    genre: ["Aventura", "Ciencia Ficción", "Acción"],
    duration: 192, // 3h 12min
    releaseDate: new Date('2022-12-16'),
    posterUrl: "https://lumiere-a.akamaihd.net/v1/images/b162385cffbbe656f1e654b80098ac57_3276x4096_380354b0.jpeg?region=0,0,3276,4096",
    director: "James Cameron",
    cast: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver", "Stephen Lang", "Kate Winslet"],
    rating: "+14",
    language: "Inglés",
    subtitle: "Subtítulos en español",
    trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0",
    schedules: [
      {
        cinemaId: "cineplanet-san-miguel",
        showtimes: ["19:30", "21:45", "22:10"]
      },
      {
        cinemaId: "cineplanet-centro-civico", 
        showtimes: ["19:30", "21:45", "22:10"]
      },
      {
        cinemaId: "cineplanet-alcazar",
        showtimes: ["19:30", "21:45", "22:10"]
      }
    ]
  },
  {
    title: "CRÓNICAS DE EXORCISMO: EL COMIENZO",
    description: "El padre Park es un médico convertido en sacerdote que fue excomulgado por realizar exorcismos para una iglesia que negaba la existencia de males sobrenaturales. Cuando su viejo amigo, un monje de un templo secreto y lleno de magia, lo llama para proteger a un niño ingenuo, pero poderoso, de su malvado maestro, el padre Park deberá enfrentarse a su pasado.",
    genre: ["Animación"],
    duration: 85, // 1h 25min
    releaseDate: new Date('2024-01-15'),
    posterUrl: "https://cinesunidosweb.blob.core.windows.net/poster/HO00005608.jpg",
    director: "No especificado",
    cast: [],
    rating: "+14",
    language: "DOBLADA",
    subtitle: "Subtítulos en español",
    trailerUrl: "https://www.youtube.com/watch?v=example",
    schedules: [
      {
        cinemaId: "cineplanet-san-miguel",
        showtimes: ["17:20", "20:30"]
      },
      {
        cinemaId: "cineplanet-centro-civico", 
        showtimes: ["17:20", "20:30"]
      },
      {
        cinemaId: "cineplanet-alcazar",
        showtimes: ["17:20", "20:30"]
      }
    ]
  }
];

// 🎬 PRÓXIMOS ESTRENOS - Películas que se estrenarán próximamente
const comingSoonMovies = [
  {
    title: "CHAINSAW MAN: REZE ARC",
    description: "Denji continúa su vida como Chainsaw Man, pero nuevos demonios y amenazas aparecen. La llegada de Reze, una misteriosa chica con poderes explosivos, cambiará todo lo que creía conocer sobre su mundo.",
    genre: ["Animación", "Acción", "Sobrenatural"],
    duration: 120,
    releaseDate: new Date('2024-03-15'),
    posterUrl: "https://i.imgur.com/chainsaw-reze.jpg",
    director: "Ryu Nakayama",
    cast: ["Kikunosuke Toya", "Ai Fairouz", "Makima Hayashi"],
    rating: "+16",
    language: "Japonés",
    subtitle: "Subtítulos en español",
    trailerUrl: "https://www.youtube.com/watch?v=chainsaw-reze",
    schedules: [
      {
        cinemaId: "cineplanet-san-miguel",
        showtimes: ["16:00", "19:00", "22:00"]
      },
      {
        cinemaId: "cineplanet-centro-civico", 
        showtimes: ["15:30", "18:30", "21:30"]
      },
      {
        cinemaId: "cineplanet-alcazar",
        showtimes: ["17:00", "20:00", "23:00"]
      }
    ]
  }
];

// 🚀 FUNCIÓN PRINCIPAL PARA AGREGAR TODAS LAS PELÍCULAS
const addSampleMovies = async () => {
  console.log('🎬 === INICIANDO CARGA DE PELÍCULAS SAMPLE ===');
  console.log(`📊 Total a procesar: ${sampleMovies.length + comingSoonMovies.length} películas`);
  console.log('📍 Películas en Cartelera:', sampleMovies.length);
  console.log('🔜 Próximos Estrenos:', comingSoonMovies.length);
  console.log('');

  try {
    // 1. Agregar películas en cartelera
    console.log('📍 === EN CARTELERA ===');
    for (const movie of sampleMovies) {
      console.log(`📽️ Agregando: ${movie.title}`);
      
      const movieId = await addMovieToCategory(movie, 'nowPlaying');
      console.log(`✅ ${movie.title} agregada con ID: ${movieId}`);
      
      if (movie.schedules && movie.schedules.length > 0) {
        console.log(`🕐 Horarios configurados para ${movie.schedules.length} cines:`);
        movie.schedules.forEach(schedule => {
          console.log(`  📍 ${schedule.cinemaId}: ${schedule.showtimes.join(', ')}`);
        });
      }
    }
    
    // 2. Agregar películas de Próximos Estrenos
    console.log('\n🔜 === PRÓXIMOS ESTRENOS ===');
    for (const movie of comingSoonMovies) {
      console.log(`📽️ Agregando: ${movie.title}`);
      
      const movieId = await addMovieToCategory(movie, 'comingSoon');
      console.log(`✅ ${movie.title} agregada con ID: ${movieId}`);
      
      if (movie.schedules && movie.schedules.length > 0) {
        console.log(`🕐 Horarios configurados para ${movie.schedules.length} cines:`);
        movie.schedules.forEach(schedule => {
          console.log(`  📍 ${schedule.cinemaId}: ${schedule.showtimes.join(', ')}`);
        });
      }
    }
    
    const totalMovies = sampleMovies.length + comingSoonMovies.length;
    console.log(`\n🎉 ¡${totalMovies} película(s) agregada(s) exitosamente!`);
    console.log('📍 En Cartelera:', sampleMovies.length);
    console.log('🔜 Próximos Estrenos:', comingSoonMovies.length);
    console.log('💡 Para agregar más películas, edita los arrays en este archivo');
    
  } catch (error) {
    console.error('❌ Error agregando películas:', error);
    throw error;
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  addSampleMovies();
}

module.exports = {
  addSampleMovies,
  sampleMovies,
  comingSoonMovies
};