// 🍿 SERVICIO PARA MANEJAR CATEGORÍAS Y COMBOS DE DULCERÍA
// Funciones para leer datos desde Firebase Firestore

import { 
  collection, 
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';

// 📋 INTERFACES
export interface SnackCategory {
  id: string;
  name: string;
  order: number;
  active: boolean;
}

export interface SnackCombo {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  available: boolean;
  order: number;
}

// 📖 OBTENER TODAS LAS CATEGORÍAS DE DULCERÍA
export const getSnackCategories = async (): Promise<SnackCategory[]> => {
  try {
    // Consulta simple sin índice compuesto - ordenamos en JavaScript
    const querySnapshot = await getDocs(collection(db, 'snackCategories'));
    const categories: SnackCategory[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Solo agregar categorías activas
      if (data.active === true) {
        categories.push({
          id: data.id,
          name: data.name,
          order: data.order,
          active: data.active
        });
      }
    });
    
    // Ordenar por el campo 'order' en JavaScript
    categories.sort((a, b) => a.order - b.order);
    
    return categories;
    
  } catch (error) {
    console.error('❌ Error obteniendo categorías de dulcería:', error);
    return [];
  }
};

// 🍿 OBTENER COMBOS POR CATEGORÍA
export const getSnackCombosByCategory = async (categoryId: string): Promise<SnackCombo[]> => {
  try {
    // Consulta simple sin índice compuesto
    const querySnapshot = await getDocs(collection(db, 'snackCombos'));
    const combos: SnackCombo[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Filtrar por categoría y disponibilidad
      if (data.categoryId === categoryId && data.available === true) {
        combos.push({
          id: doc.id,
          categoryId: data.categoryId,
          name: data.name,
          description: data.description,
          price: data.price,
          imageUrl: data.imageUrl,
          available: data.available,
          order: data.order
        });
      }
    });
    
    // Ordenar por el campo 'order' en JavaScript
    combos.sort((a, b) => a.order - b.order);
    
    return combos;
    
  } catch (error) {
    console.error(`❌ Error obteniendo combos para ${categoryId}:`, error);
    return [];
  }
};

//  OBTENER TODOS LOS COMBOS
export const getAllSnackCombos = async (): Promise<SnackCombo[]> => {
  try {
    // Consulta simple sin índice compuesto
    const querySnapshot = await getDocs(collection(db, 'snackCombos'));
    const combos: SnackCombo[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Solo agregar combos disponibles
      if (data.available === true) {
        combos.push({
          id: doc.id,
          categoryId: data.categoryId,
          name: data.name,
          description: data.description,
          price: data.price,
          imageUrl: data.imageUrl,
          available: data.available,
          order: data.order
        });
      }
    });
    
    // Ordenar primero por categoryId, luego por order
    combos.sort((a, b) => {
      if (a.categoryId !== b.categoryId) {
        return a.categoryId.localeCompare(b.categoryId);
      }
      return a.order - b.order;
    });
    
    return combos;
    
  } catch (error) {
    console.error('❌ Error obteniendo todos los combos:', error);
    return [];
  }
};