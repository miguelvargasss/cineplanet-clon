/**
 * 🏦 SCRIPT PARA CREAR COLECCIÓN DE TARJETAS DE PAGO
 * 
 * Este script crea la colección 'paymentCards' en Firebase
 * para almacenar las tarjetas guardadas por los usuarios
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc,
  doc,
  Timestamp 
} from 'firebase/firestore';

// 🔥 Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBfaIGW_tfVEtDt3e3LdjYC7A1y6YNE59g",
  authDomain: "cineplanetapp-2bf84.firebaseapp.com",
  projectId: "cineplanetapp-2bf84",
  storageBucket: "cineplanetapp-2bf84.firebasestorage.app",
  messagingSenderId: "148815958103",
  appId: "1:148815958103:web:a77e9fa5b35f3fb89c2dd7"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * 🗑️ LIMPIAR COLECCIÓN EXISTENTE
 */
async function clearPaymentCards() {
  try {
    console.log('\n🗑️  Limpiando tarjetas existentes...');
    const querySnapshot = await getDocs(collection(db, 'paymentCards'));
    
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    console.log(`✅ Se eliminaron ${querySnapshot.size} tarjetas`);
  } catch (error) {
    console.error('❌ Error eliminando tarjetas:', error);
  }
}



/**
 * 📊 MOSTRAR RESUMEN
 */
async function showSummary() {
  try {
    const cardsSnapshot = await getDocs(collection(db, 'paymentCards'));
    
    console.log('\n📊 ════════════════════════════════════════');
    console.log('📊 RESUMEN DE TARJETAS EN FIREBASE');
    console.log('📊 ════════════════════════════════════════');
    console.log(`💳 Total de tarjetas: ${cardsSnapshot.size}`);
    
    cardsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n  🆔 ID: ${doc.id}`);
      console.log(`  👤 Usuario DNI: ${data.userDni}`);
      console.log(`  💳 Tipo: ${data.cardType.toUpperCase()}`);
      console.log(`  🔢 Últimos 4 dígitos: ${data.cardLastFour}`);
      console.log(`  👨 Titular: ${data.cardholderName}`);
      console.log(`  📅 Vencimiento: ${data.expiryMonth}/${data.expiryYear}`);
      console.log(`  ⭐ Por defecto: ${data.isDefault ? 'Sí' : 'No'}`);
    });
    
    console.log('\n📊 ════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Error mostrando resumen:', error);
  }
}

/**
 * 🚀 EJECUTAR SCRIPT
 */
async function main() {
  console.log('\n🏦 ════════════════════════════════════════════════');
  console.log('🏦 CONFIGURACIÓN DE TARJETAS DE PAGO - FIREBASE');
  console.log('🏦 ════════════════════════════════════════════════');
  
  // Limpiar datos existentes
  await clearPaymentCards();
  
  // Agregar tarjetas de ejemplo
  
  // Mostrar resumen
  await showSummary();
  
  console.log('✨ ¡Script completado exitosamente!\n');
  process.exit(0);
}

// Ejecutar
main().catch(console.error);
