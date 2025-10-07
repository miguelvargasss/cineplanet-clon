// 🎬 SCRIPT ESCALABLE PARA AGREGAR PELÍCULAS CON HORARIOS

import { addMovieToCategory, MovieInput } from '../src/services/moviesService';

// Interfaz extendida para incluir horarios por cine
interface MovieWithSchedules extends MovieInput {
  schedules?: {
    cinemaId: string;
    showtimes: string[]; // Array de horarios como "19:30", "21:45", etc.
  }[];
}

// 🎭 PELÍCULAS DE EJEMPLO - Agregar tantas como necesites
export const sampleMovies: MovieWithSchedules[] = [
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
  }
];

// 🎬 PRÓXIMOS ESTRENOS - Películas que se estrenarán próximamente
export const comingSoonMovies: MovieWithSchedules[] = [
  {
    title: "CHAINSAW MAN LA PELÍCULA: ARCO DE REZE",
    description: "Por primera vez, Chainsaw Man llega a la gran pantalla en una épica aventura cargada de acción que continúa la exitosa serie de anime. Denji trabajaba como Cazador de Demonios para los yakuza, intentando saldar la deuda que heredó de sus padres, hasta que fue traicionado y asesinado por ellos. Al borde de la muerte, su querido perro-demonio con motosierra, Pochita, hizo un pacto con él y le salvó la vida. Esto los fusionó, dando origen al imparable Chainsaw Man. Ahora, en medio de una guerra brutal entre demonios, cazadores y enemigos ocultos, una misteriosa chica llamada Reze entra en su vida, y Denji se enfrenta a la batalla más peligrosa hasta ahora, impulsado por el amor en un mundo donde la supervivencia no tiene reglas.",
    genre: ["Anime", "Acción", "Sobrenatural"],
    duration: 100, // 1h 40min
    releaseDate: new Date('2025-12-15'), // Próximo estreno
    posterUrl: "https://th.bing.com/th?id=OIF.ljSjxn43fgdbrS%2fG2f4xjg&cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
    director: "Ryu Nakayama",
    cast: ["Kikunosuke Toya", "Ai Fairouz", "Makima", "Power"],
    rating: "+14",
    language: "Japonés",
    subtitle: "Subtítulos en español",
    trailerUrl: "https://www.youtube.com/watch?v=chainsaw-man-trailer",
    schedules: [
      {
        cinemaId: "cineplanet-san-miguel",
        showtimes: ["18:40", "21:00"]
      },
      {
        cinemaId: "cineplanet-centro-civico",
        showtimes: ["18:40", "21:00"]
      },
      {
        cinemaId: "cineplanet-alcazar",
        showtimes: ["18:40", "21:00"]
      },
      {
        cinemaId: "cineplanet-primavera",
        showtimes: ["18:40", "21:00"]
      },
      {
        cinemaId: "cineplanet-brasil",
        showtimes: ["18:40", "21:00"]
      }
    ]
  }
];

// 🎯 FUNCIÓN PRINCIPAL: Agregar películas con horarios
export const addSampleMovies = async () => {
  console.log('🎬 Agregando películas con sistema escalable...');
  
  try {
    // 1. Agregar películas de En Cartelera
    console.log('📽️ === EN CARTELERA ===');
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

// 🔧 FUNCIONES DE UTILIDAD

// Agregar una sola película
export const addSingleMovie = async (movie: MovieWithSchedules, category: 'nowPlaying' | 'comingSoon' | 'btsWeek' = 'nowPlaying') => {
  console.log(`📽️ Agregando película individual: ${movie.title}`);
  
  try {
    const movieId = await addMovieToCategory(movie, category);
    console.log(`✅ ${movie.title} agregada a ${category} con ID: ${movieId}`);
    return movieId;
  } catch (error) {
    console.error(`❌ Error agregando ${movie.title}:`, error);
    throw error;
  }
};

// Función legacy para compatibilidad con addAvatarMovie
export const addAvatarWithSchedules = async () => {
  const avatarMovie = sampleMovies.find(movie => movie.title.includes('AVATAR'));
  if (avatarMovie) {
    return await addSingleMovie(avatarMovie);
  } else {
    throw new Error('Avatar no encontrado en las películas de ejemplo');
  }
};

// Función para agregar solo próximos estrenos
export const addComingSoonMovies = async () => {
  console.log('🔜 Agregando solo próximos estrenos...');
  
  try {
    for (const movie of comingSoonMovies) {
      console.log(`📽️ Agregando: ${movie.title}`);
      const movieId = await addSingleMovie(movie, 'comingSoon');
      console.log(`✅ ${movie.title} agregada a Próximos Estrenos con ID: ${movieId}`);
    }
    
    console.log(`🎉 ¡${comingSoonMovies.length} película(s) de próximos estrenos agregada(s)!`);
  } catch (error) {
    console.error('❌ Error agregando próximos estrenos:', error);
    throw error;
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  addSampleMovies();
}