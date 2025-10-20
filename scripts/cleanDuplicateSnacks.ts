// 🧹 SCRIPT PARA ELIMINAR DUPLICADOS DE DULCERÍA EN FIREBASE
// Este script eliminará todos los combos y categorías duplicados

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc,
  doc
} from 'firebase/firestore';

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

// 🧹 FUNCIÓN PARA ELIMINAR TODOS LOS DOCUMENTOS DE UNA COLECCIÓN
async function clearCollection(collectionName: string) {
  try {
    console.log(`\n🗑️  Eliminando todos los documentos de: ${collectionName}...`);
    
    const querySnapshot = await getDocs(collection(db, collectionName));
    const deletePromises: Promise<void>[] = [];
    
    querySnapshot.forEach((document) => {
      deletePromises.push(deleteDoc(doc(db, collectionName, document.id)));
    });
    
    await Promise.all(deletePromises);
    
    console.log(`✅ Se eliminaron ${querySnapshot.size} documentos de ${collectionName}`);
    
  } catch (error) {
    console.error(`❌ Error eliminando ${collectionName}:`, error);
  }
}

// 🚀 EJECUTAR LIMPIEZA
async function cleanDuplicates() {
  console.log('🧹 ════════════════════════════════════════════════');
  console.log('🧹 LIMPIEZA DE DUPLICADOS - DULCERÍA FIREBASE');
  console.log('🧹 ════════════════════════════════════════════════');
  
  // Eliminar todas las categorías
  await clearCollection('snackCategories');
  
  // Eliminar todos los combos
  await clearCollection('snackCombos');
  
  console.log('\n✨ ════════════════════════════════════════════════');
  console.log('✨ LIMPIEZA COMPLETADA!');
  console.log('✨ Ahora ejecuta: npx tsx scripts/addSnackData.ts');
  console.log('✨ ════════════════════════════════════════════════\n');
  
  process.exit(0);
}

// Ejecutar
cleanDuplicates();
