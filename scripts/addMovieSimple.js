/**
 * 🎬 SCRIPT SIMPLE PARA AGREGAR PELÍCULAS
 * 
 * Este script permite agregar películas de manera sencilla a Firebase.
 * 
 * INSTRUCCIONES:
 * 1. Modifica el objeto 'nuevaPelicula' con los datos de la película
 * 2. Cambia 'categoria' a 'movies' (En Cartelera) o 'moviesEstreno' (Próximos Estrenos)
 * 3. Ejecuta: node scripts/addMovieSimple.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, addDoc, collection, Timestamp, getDocs } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBnlF70cqIZgilnKfX3bE-spCRGzqg9eSE",
  authDomain: "cineplanet-21e8c.firebaseapp.com",
  projectId: "cineplanet-21e8c",
  storageBucket: "cineplanet-21e8c.firebasestorage.app",
  messagingSenderId: "967927294358",
  appId: "1:967927294358:web:c928e7e88d3bc44de955b7"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🎬 DATOS DE LA NUEVA PELÍCULA
// Modifica estos datos con la información de la película que quieres agregar
const nuevaPelicula = {
  title: "RE: LA TORTUGA ROJA",
  description: "Historia muda sobre un náufrago en una isla tropical desierta, poblada de tortugas, cangrejos y aves. La película cuenta las grandes etapas de la vida de un ser humano. Debut en el largometraje del animador Michael Dudok de Wit (ganador del Oscar por su cortometraje 'Father and Daughter'). Una coproducción de varias productoras francesas y el Studio Ghibli.",
  genre: ["Animación", "Drama", "Familia"],
  duration: 80, // duración en minutos
  releaseDate: "2025-02-10", // formato YYYY-MM-DD
  posterUrl: "https://mx.web.img3.acsta.net/r_1280_720/img/8b/76/8b763807084bf9e30a1a7a4d33a1ff69.jpg",
  director: "Director Desconocido",
  cast: ["Reparto Principal"],
  rating: "+14", // +14, +16, +18, etc.
  language: "DOBLADA", // DOBLADA, SUBTITULADA, etc.
  subtitle: "Subtítulos en español",
  trailerUrl: "https://youtube.com/watch?v=example",
  schedules: [
    {
      cinemaId: "cineplanet-san-miguel",
      showtimes: ["14:40", "15:20", "20:00"]
    },
    {
      cinemaId: "cineplanet-centro-civico", 
      showtimes: ["14:40", "15:20", "20:00"]
    },
    {
      cinemaId: "cineplanet-alcazar",
      showtimes: ["14:40", "15:20", "20:00"]
    }
  ]
};

// 📍 CATEGORÍA DESTINO
// Cambia a 'movies' para "En Cartelera" o 'moviesEstreno' para "Próximos Estrenos"
const categoria = 'moviesEstreno';

// 🚀 FUNCIÓN PARA AGREGAR PELÍCULA
const addMovie = async (movieData, category = 'movies') => {
  try {
    console.log(`🎬 Agregando película: ${movieData.title} a ${category}`);
    
    // Verificar si ya existe
    const snapshot = await getDocs(collection(db, category));
    const exists = snapshot.docs.some(doc => doc.data().title === movieData.title);
    
    if (exists) {
      console.log(`⚠️ La película "${movieData.title}" ya existe en ${category}`);
      return null;
    }
    
    // Preparar documento
    const movieDoc = {
      ...movieData,
      releaseDate: Timestamp.fromDate(new Date(movieData.releaseDate)),
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
      isNowPlaying: category === 'movies',
      isComingSoon: category === 'moviesEstreno',
      isBTSWeek: false
    };
    
    // Agregar a Firebase
    const docRef = await addDoc(collection(db, category), movieDoc);
    console.log(`✅ Película agregada exitosamente con ID: ${docRef.id}`);
    return docRef.id;
    
  } catch (error) {
    console.error('❌ Error agregando película:', error);
    throw error;
  }
};

// EJECUTAR
const main = async () => {
  try {
    console.log('🎬 === AGREGANDO NUEVA PELÍCULA ===');
    console.log(`📍 Categoría: ${categoria === 'movies' ? 'En Cartelera' : 'Próximos Estrenos'}`);
    
    const movieId = await addMovie(nuevaPelicula, categoria);
    
    if (movieId) {
      console.log('✅ ¡Película agregada exitosamente!');
      console.log(`📍 ID: ${movieId}`);
      console.log(`🎭 Sección: ${categoria === 'movies' ? 'En Cartelera' : 'Próximos Estrenos'}`);
    } else {
      console.log('ℹ️ La película ya existe en la base de datos');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

main();