"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureMoviesExist = exports.seedSampleMovies = exports.addSingleMovie = exports.deleteMovie = exports.updateMovie = exports.addMovie = exports.addMovieToCategory = exports.getMoviesByCategory = exports.getAllMovies = exports.getMovieById = void 0;
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("../config/firebase");
// Obtener una película específica por ID
const getMovieById = async (movieId) => {
    try {
        // Buscar en todas las colecciones de películas
        const collections = ['movies', 'moviesEstreno', 'moviesBts'];
        for (const collectionName of collections) {
            try {
                const movieRef = (0, firestore_1.doc)(firebase_1.db, collectionName, movieId);
                const movieSnap = await (0, firestore_1.getDoc)(movieRef);
                if (movieSnap.exists()) {
                    const data = movieSnap.data();
                    return {
                        id: movieSnap.id,
                        ...data,
                        releaseDate: data.releaseDate.toDate(),
                        createdAt: data.createdAt.toDate(),
                        updatedAt: data.updatedAt.toDate(),
                    };
                }
            }
            catch (_a) {
                // Continuar buscando en la siguiente colección si hay error
                console.log(`Movie not found in ${collectionName}, trying next collection...`);
            }
        }
        return null;
    }
    catch (error) {
        console.error('Error getting movie by ID:', error);
        throw error;
    }
};
exports.getMovieById = getMovieById;
// Obtener todas las películas
const getAllMovies = async () => {
    try {
        const moviesRef = (0, firestore_1.collection)(firebase_1.db, 'movies');
        const q = (0, firestore_1.query)(moviesRef, (0, firestore_1.orderBy)('releaseDate', 'desc'));
        const querySnapshot = await (0, firestore_1.getDocs)(q);
        const movies = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            movies.push({
                id: doc.id,
                ...data,
                releaseDate: data.releaseDate.toDate(),
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt.toDate(),
            });
        });
        return movies;
    }
    catch (error) {
        console.error('Error getting movies:', error);
        throw error;
    }
};
exports.getAllMovies = getAllMovies;
// Obtener películas por categoría usando colecciones separadas
const getMoviesByCategory = async (category) => {
    try {
        let collectionName;
        // Mapear categoría a nombre de colección
        switch (category) {
            case 'nowPlaying':
                collectionName = 'movies';
                break;
            case 'comingSoon':
                collectionName = 'moviesEstreno';
                break;
            case 'btsWeek':
                collectionName = 'moviesBts';
                break;
            default:
                collectionName = 'movies';
        }
        const moviesRef = (0, firestore_1.collection)(firebase_1.db, collectionName);
        const q = (0, firestore_1.query)(moviesRef, (0, firestore_1.orderBy)('releaseDate', 'desc'));
        const querySnapshot = await (0, firestore_1.getDocs)(q);
        const movies = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            movies.push({
                id: doc.id,
                ...data,
                releaseDate: data.releaseDate.toDate(),
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt.toDate(),
            });
        });
        return movies;
    }
    catch (error) {
        console.error('Error getting movies by category:', error);
        // En caso de error, devolver array vacío 
        console.log('Returning empty array due to Firebase error');
        return [];
    }
};
exports.getMoviesByCategory = getMoviesByCategory;
// Agregar película a una colección específica
const addMovieToCategory = async (movieData, category) => {
    try {
        let collectionName;
        switch (category) {
            case 'nowPlaying':
                collectionName = 'movies';
                break;
            case 'comingSoon':
                collectionName = 'moviesEstreno';
                break;
            case 'btsWeek':
                collectionName = 'moviesBts';
                break;
            default:
                collectionName = 'movies';
        }
        const now = new Date();
        const movieDoc = {
            ...movieData,
            // Establecer campos booleanos según la categoría
            isNowPlaying: category === 'nowPlaying',
            isComingSoon: category === 'comingSoon',
            isBTSWeek: category === 'btsWeek',
            releaseDate: firestore_1.Timestamp.fromDate(movieData.releaseDate),
            createdAt: firestore_1.Timestamp.fromDate(now),
            updatedAt: firestore_1.Timestamp.fromDate(now),
        };
        // Agregar película a la colección específica
        const docRef = await (0, firestore_1.addDoc)((0, firestore_1.collection)(firebase_1.db, collectionName), movieDoc);
        console.log(`Movie added to ${collectionName} with ID: ${docRef.id}`);
        return docRef.id;
    }
    catch (error) {
        console.error('Error adding movie to category:', error);
        throw error;
    }
};
exports.addMovieToCategory = addMovieToCategory;
// Función legacy para compatibilidad (usa colección 'movies' por defecto)
const addMovie = async (movieData) => {
    return (0, exports.addMovieToCategory)(movieData, 'nowPlaying');
};
exports.addMovie = addMovie;
// Actualizar película
const updateMovie = async (movieId, movieData) => {
    try {
        const movieRef = (0, firestore_1.doc)(firebase_1.db, 'movies', movieId);
        const updateData = {
            ...movieData,
            updatedAt: firestore_1.Timestamp.fromDate(new Date()),
        };
        if (movieData.releaseDate) {
            updateData.releaseDate = firestore_1.Timestamp.fromDate(movieData.releaseDate);
        }
        await (0, firestore_1.updateDoc)(movieRef, updateData);
    }
    catch (error) {
        console.error('Error updating movie:', error);
        throw error;
    }
};
exports.updateMovie = updateMovie;
// Eliminar película
const deleteMovie = async (movieId) => {
    try {
        // Eliminar documento de Firestore
        const movieRef = (0, firestore_1.doc)(firebase_1.db, 'movies', movieId);
        await (0, firestore_1.deleteDoc)(movieRef);
    }
    catch (error) {
        console.error('Error deleting movie:', error);
        throw error;
    }
};
exports.deleteMovie = deleteMovie;
// Función para enviar una película específica a Firebase
const addSingleMovie = async (movieData, category) => {
    try {
        const movieId = await (0, exports.addMovieToCategory)(movieData, category);
        return movieId;
    }
    catch (error) {
        console.error(`Error agregando película "${movieData.title}":`, error);
        throw error;
    }
};
exports.addSingleMovie = addSingleMovie;
// Función helper para poblar base de datos con película específica por categoría
const seedSampleMovies = async (category = 'nowPlaying') => {
    try {
        // Solo agregar si específicamente se solicita
        console.log(`Agregando película de muestra a la categoría: ${category}`);
        const caminaOMuereMovie = {
            title: 'Camina o Muere',
            description: 'De la esperada adaptación de la primera novela escrita por el maestro del suspenso Stephen King, y bajo la dirección de Francis Lawrence —la mente detrás de las impactantes películas de Los Juegos del Hambre (En llamas, Sinsajo partes 1 y 2, y La balada de los pájaros cantores y serpientes)— llega THE LONG WALK, un thriller intenso, estremecedor y profundamente emocional. Una historia que no solo pondrá a prueba los límites de sus protagonistas, sino también los del espectador, con una pregunta inquietante: ¿Hasta dónde serías capaz de llegar?',
            genre: ['Acción', 'Thriller', 'Drama'],
            duration: 110, // 1h 50min
            releaseDate: new Date('2025-09-22'),
            posterUrl: 'https://tse4.mm.bing.net/th/id/OIP.XkIm4a4l96EnTrOy-cn5CgHaJQ?rs=1&pid=ImgDetMain&o=7&rm=3',
            director: 'Francis Lawrence',
            cast: ['Reparto por confirmar'],
            rating: '+14 DNI',
            language: 'Subtitulada',
            subtitle: 'Subtítulos en español',
        };
        await (0, exports.addSingleMovie)(caminaOMuereMovie, category);
    }
    catch (error) {
        console.error('Error agregando película "Camina o Muere":', error);
        throw error;
    }
};
exports.seedSampleMovies = seedSampleMovies;
// Función para verificar y agregar películas automáticamente
const ensureMoviesExist = async () => {
    try {
        // Verificar si hay películas en "En Cartelera"
        const moviesRef = (0, firestore_1.collection)(firebase_1.db, 'movies');
        const moviesSnapshot = await (0, firestore_1.getDocs)(moviesRef);
        // Verificar si hay películas en "Próximos Estrenos"
        const comingSoonRef = (0, firestore_1.collection)(firebase_1.db, 'moviesEstreno');
        const comingSoonSnapshot = await (0, firestore_1.getDocs)(comingSoonRef);
        // Si no hay películas en ninguna de las dos colecciones principales, agregar todas
        if (moviesSnapshot.empty && comingSoonSnapshot.empty) {
            console.log('No hay películas en ninguna colección, agregando películas de ejemplo...');
            const { addSampleMovies } = await Promise.resolve().then(() => __importStar(require('../../scripts/addSampleMovies')));
            await addSampleMovies();
        }
        else {
            console.log(`${moviesSnapshot.size} película(s) en "En Cartelera"`);
            console.log(`${comingSoonSnapshot.size} película(s) en "Próximos Estrenos"`);
            // Si falta Chainsaw Man en próximos estrenos, agregarla
            if (comingSoonSnapshot.empty) {
                console.log('Agregando películas de próximos estrenos...');
                const { addComingSoonMovies } = await Promise.resolve().then(() => __importStar(require('../../scripts/addSampleMovies')));
                await addComingSoonMovies();
            }
        }
    }
    catch (error) {
        console.error('Error verificando películas:', error);
        // No lanzar error para no afectar la carga de otras películas
    }
};
exports.ensureMoviesExist = ensureMoviesExist;
