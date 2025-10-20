// 🍿 SCRIPT PARA POBLAR FIREBASE CON CATEGORÍAS Y COMBOS DE DULCERÍA
// Ejecutar con: npx tsx scripts/addSnackData.ts
// NOTA: Este script REEMPLAZA todos los datos existentes para evitar duplicados

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  setDoc,
  getDocs,
  deleteDoc
} from 'firebase/firestore';

// Configuración de Firebase (misma que en firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyBnlF70cqIZgilnKfX3bE-spCRGzqg9eSE",
  authDomain: "cineplanet-21e8c.firebaseapp.com",
  projectId: "cineplanet-21e8c",
  storageBucket: "cineplanet-21e8c.firebasestorage.app",
  messagingSenderId: "967927294358",
  appId: "1:967927294358:web:c928e7e88d3bc44de955b7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 📋 CATEGORÍAS DE DULCERÍA
const snackCategories = [
  {
    id: 'promos-dulceria',
    name: 'PROMOS DULCERIA',
    order: 1,
    active: true
  },
  {
    id: 'promos-pelicula',
    name: 'PROMOS DE PELÍCULA',
    order: 2,
    active: true
  },
  {
    id: 'combos-uno-dos',
    name: 'COMBOS PARA UNO & DOS',
    order: 3,
    active: true
  },
  {
    id: 'combos-compartir',
    name: 'COMBOS PARA COMPARTIR',
    order: 4,
    active: true
  },
  {
    id: 'canchitas',
    name: 'CANCHITAS',
    order: 5,
    active: true
  },
  {
    id: 'dulces',
    name: 'DULCES',
    order: 6,
    active: true
  },
  {
    id: 'complementos',
    name: 'COMPLEMENTOS',
    order: 7,
    active: true
  }
];

// 🍿 COMBOS DE EJEMPLO (basados en tu imagen)
const snackCombos = [
  // PROMOS DULCERIA
  {
    id: 'combo-2-salado',
    categoryId: 'promos-dulceria',
    name: 'COMBO 2 SALADO + 2 DUOMAX OL',
    description: '2 Canchita Gigante + 2 Duomax Original',
    price: 55.00,
    imageUrl: 'https://via.placeholder.com/150x100/FF6B6B/FFFFFF?text=COMBO+2+SALADO',
    available: true,
    order: 1
  },
  {
    id: 'combo-2-mix',
    categoryId: 'promos-dulceria',
    name: 'COMBO 2 MIX + 2 DUOMAX OL',
    description: '2 Canchita Gigante Mix + 2 Duomax Original',
    price: 58.00,
    imageUrl: 'https://via.placeholder.com/150x100/4ECDC4/FFFFFF?text=COMBO+2+MIX',
    available: true,
    order: 2
  },
  {
    id: 'combo-2-dulce',
    categoryId: 'promos-dulceria',
    name: 'COMBO 2 DULCE + 2 DUOMAX OL',
    description: '2 Canchita Gigante Dulce + 2 Duomax Original',
    price: 58.00,
    imageUrl: 'https://via.placeholder.com/150x100/45B7D1/FFFFFF?text=COMBO+2+DULCE',
    available: true,
    order: 3
  },
  {
    id: 'combo-1-dulce-mood',
    categoryId: 'promos-dulceria',
    name: 'COMBO 1 DULCE + B.MOOD 40 OL',
    description: '1 Canchita Gigante Dulce + Bebida Mood 40oz',
    price: 42.00,
    imageUrl: 'https://via.placeholder.com/150x100/96CEB4/FFFFFF?text=COMBO+1+DULCE',
    available: true,
    order: 4
  },

  // PROMOS DE PELÍCULA
  {
    id: 'promo-pelicula-1',
    categoryId: 'promos-pelicula',
    name: 'COMBO PELÍCULA ESPECIAL',
    description: 'Combo especial para la película en cartelera',
    price: 35.00,
    imageUrl: 'https://via.placeholder.com/150x100/FF6B6B/FFFFFF?text=PROMO+PELICULA',
    available: true,
    order: 1
  },

  // COMBOS PARA UNO & DOS
  {
    id: 'combo-personal',
    categoryId: 'combos-uno-dos',
    name: 'COMBO PERSONAL',
    description: '1 Canchita + 1 Gaseosa Personal',
    price: 18.00,
    imageUrl: 'https://via.placeholder.com/150x100/4ECDC4/FFFFFF?text=COMBO+PERSONAL',
    available: true,
    order: 1
  },
  {
    id: 'combo-duo',
    categoryId: 'combos-uno-dos',
    name: 'COMBO DÚO',
    description: '1 Canchita Grande + 2 Gaseosas',
    price: 32.00,
    imageUrl: 'https://via.placeholder.com/150x100/45B7D1/FFFFFF?text=COMBO+DUO',
    available: true,
    order: 2
  },

  // COMBOS PARA COMPARTIR
  {
    id: 'combo-familiar',
    categoryId: 'combos-compartir',
    name: 'COMBO FAMILIAR',
    description: '2 Canchitas Gigantes + 4 Gaseosas',
    price: 65.00,
    imageUrl: 'https://via.placeholder.com/150x100/96CEB4/FFFFFF?text=COMBO+FAMILIAR',
    available: true,
    order: 1
  },

  // CANCHITAS
  {
    id: 'canchita-gigante-salada',
    categoryId: 'canchitas',
    name: 'CANCHITA GIGANTE SALADA',
    description: 'Canchita gigante con sal',
    price: 15.00,
    imageUrl: 'https://via.placeholder.com/150x100/FF6B6B/FFFFFF?text=CANCHITA+SALADA',
    available: true,
    order: 1
  },
  {
    id: 'canchita-gigante-dulce',
    categoryId: 'canchitas',
    name: 'CANCHITA GIGANTE DULCE',
    description: 'Canchita gigante con caramelo',
    price: 15.00,
    imageUrl: 'https://via.placeholder.com/150x100/4ECDC4/FFFFFF?text=CANCHITA+DULCE',
    available: true,
    order: 2
  },

  // DULCES
  {
    id: 'chocolates-variados',
    categoryId: 'dulces',
    name: 'CHOCOLATES VARIADOS',
    description: 'Selección de chocolates premium',
    price: 12.00,
    imageUrl: 'https://via.placeholder.com/150x100/45B7D1/FFFFFF?text=CHOCOLATES',
    available: true,
    order: 1
  },
  {
    id: 'gomitas-mix',
    categoryId: 'dulces',
    name: 'GOMITAS MIX',
    description: 'Variedad de gomitas sabores',
    price: 8.00,
    imageUrl: 'https://via.placeholder.com/150x100/96CEB4/FFFFFF?text=GOMITAS',
    available: true,
    order: 2
  },

  // COMPLEMENTOS
  {
    id: 'gaseosa-personal',
    categoryId: 'complementos',
    name: 'GASEOSA PERSONAL',
    description: 'Gaseosa de 500ml',
    price: 8.00,
    imageUrl: 'https://via.placeholder.com/150x100/FF6B6B/FFFFFF?text=GASEOSA',
    available: true,
    order: 1
  },
  {
    id: 'agua-mineral',
    categoryId: 'complementos',
    name: 'AGUA MINERAL',
    description: 'Agua mineral 500ml',
    price: 5.00,
    imageUrl: 'https://via.placeholder.com/150x100/4ECDC4/FFFFFF?text=AGUA',
    available: true,
    order: 2
  }
];

// 🧹 FUNCIÓN PARA LIMPIAR UNA COLECCIÓN
async function clearCollection(collectionName: string) {
  const querySnapshot = await getDocs(collection(db, collectionName));
  const deletePromises: Promise<void>[] = [];
  
  querySnapshot.forEach((document) => {
    deletePromises.push(deleteDoc(doc(db, collectionName, document.id)));
  });
  
  await Promise.all(deletePromises);
  return querySnapshot.size;
}

async function addSnackData() {
  try {
    console.log('🍿 Agregando categorías de dulcería a Firebase...\n');

    // 0. Limpiar datos existentes para evitar duplicados
    console.log('🧹 Limpiando datos existentes...');
    const deletedCategories = await clearCollection('snackCategories');
    const deletedCombos = await clearCollection('snackCombos');
    console.log(`✅ Eliminadas ${deletedCategories} categorías y ${deletedCombos} combos anteriores\n`);

    // 1. Agregar categorías
    console.log('📋 Agregando categorías...');
    for (const category of snackCategories) {
      const docRef = doc(db, 'snackCategories', category.id);
      await setDoc(docRef, category);
      console.log(`✅ Categoría agregada: ${category.name} (ID: ${category.id})`);
    }

    console.log('\n🍿 Agregando combos...');
    // 2. Agregar combos
    for (const combo of snackCombos) {
      const docRef = await addDoc(collection(db, 'snackCombos'), combo);
      console.log(`✅ Combo agregado: ${combo.name} (ID: ${docRef.id}) -> Categoría: ${combo.categoryId}`);
    }

    console.log('\n🎉 ¡Datos agregados exitosamente!');
    console.log(`📊 Total categorías: ${snackCategories.length}`);
    console.log(`📊 Total combos: ${snackCombos.length}`);
    
    console.log('\n📋 Resumen por categoría:');
    snackCategories.forEach(category => {
      const combosCount = snackCombos.filter(combo => combo.categoryId === category.id).length;
      console.log(`  • ${category.name}: ${combosCount} combos`);
    });

  } catch (error) {
    console.error('❌ Error agregando datos:', error);
  }
}

addSnackData();