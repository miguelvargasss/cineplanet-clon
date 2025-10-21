/**
 * 💳 SERVICIO DE PAGOS
 * Maneja toda la lógica de pagos, tarjetas guardadas y procesamiento
 */

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc,
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/src/config/firebase';

// 💳 TIPOS DE DATOS
export interface PaymentCard {
  id: string;
  userId: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'diners';
  cardNumber: string; // Últimos 4 dígitos para la versión simple
  cardHolder: string; // Nombre del titular
  expiryDate: string; // Formato "MM/YYYY"
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz extendida para la versión completa con más detalles
export interface PaymentCardFull extends PaymentCard {
  userDni: string;
  cardLastFour: string; // Últimos 4 dígitos
  cardholderName: string;
  expiryMonth: string; // "12"
  expiryYear: string; // "2027"
}

export interface PaymentMethod {
  type: 'credit-card' | 'app-agora' | 'yape';
  label: string;
  icon: string;
}

export interface CreditCardData {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  documentType: 'DNI' | 'CE' | 'Pasaporte';
  documentNumber: string;
  saveForFuture: boolean;
}

export interface AppAgoraData {
  phoneNumber: string;
  documentType: 'DNI' | 'CE' | 'Pasaporte';
  documentNumber: string;
}

export interface YapeData {
  phoneNumber: string;
  documentType: 'DNI' | 'CE' | 'Pasaporte';
  documentNumber: string;
  approvalCode: string;
}

// 🎨 MÉTODOS DE PAGO DISPONIBLES
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    type: 'credit-card',
    label: 'Tarjeta de Crédito o Débito',
    icon: '💳'
  },
  {
    type: 'app-agora',
    label: 'App Agora',
    icon: '📱'
  },
  {
    type: 'yape',
    label: 'Yape',
    icon: '💜'
  }
];

/**
 * 🔍 OBTENER TARJETAS DEL USUARIO
 */
export const getUserPaymentCards = async (userId: string): Promise<PaymentCard[]> => {
  try {
    const cardsRef = collection(db, 'paymentCards');
    // Consulta simple sin orderBy para evitar necesitar índice compuesto
    const q = query(
      cardsRef, 
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const cards: PaymentCard[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      cards.push({
        id: doc.id,
        userId: data.userId,
        cardType: data.cardType,
        cardNumber: data.cardNumber,
        cardHolder: data.cardHolder,
        expiryDate: data.expiryDate,
        isDefault: data.isDefault,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      });
    });
    
    // Ordenar en JavaScript: primero las default, luego por fecha de creación
    cards.sort((a, b) => {
      // Primero por isDefault (true primero)
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      // Luego por fecha de creación (más recientes primero)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    
    return cards;
  } catch (error) {
    console.error('❌ Error obteniendo tarjetas del usuario:', error);
    return [];
  }
};

/**
 * ➕ AGREGAR NUEVA TARJETA (Versión simplificada)
 */
export const addPaymentCard = async (
  cardData: Omit<PaymentCard, 'id'>
): Promise<boolean> => {
  try {
    const newCard = {
      userId: cardData.userId,
      cardType: cardData.cardType,
      cardNumber: cardData.cardNumber,
      cardHolder: cardData.cardHolder,
      expiryDate: cardData.expiryDate,
      isDefault: cardData.isDefault,
      createdAt: Timestamp.fromDate(cardData.createdAt),
      updatedAt: Timestamp.fromDate(cardData.updatedAt)
    };
    
    await addDoc(collection(db, 'paymentCards'), newCard);
    return true;
  } catch (error) {
    console.error('❌ Error agregando tarjeta:', error);
    return false;
  }
};

/**
 * ➕ AGREGAR NUEVA TARJETA CON VALIDACIÓN (Versión completa)
 */
export const addPaymentCardFull = async (
  userId: string, 
  userDni: string,
  cardData: CreditCardData
): Promise<string | null> => {
  try {
    // Detectar tipo de tarjeta por el primer dígito
    const cardType = detectCardType(cardData.cardNumber);
    
    // Enmascarar número de tarjeta
    const maskedNumber = maskCardNumber(cardData.cardNumber);
    const lastFour = cardData.cardNumber.slice(-4);
    
    // Verificar si es la primera tarjeta del usuario
    const existingCards = await getUserPaymentCards(userId);
    const isFirstCard = existingCards.length === 0;
    
    const newCard = {
      userId,
      userDni,
      cardType,
      cardNumber: maskedNumber,
      cardLastFour: lastFour,
      cardholderName: cardData.cardholderName.toUpperCase(),
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      isDefault: isFirstCard, // La primera tarjeta es por defecto
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    const docRef = await addDoc(collection(db, 'paymentCards'), newCard);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error agregando tarjeta:', error);
    return null;
  }
};

/**
 * 🗑️ ELIMINAR TARJETA
 */
export const deletePaymentCard = async (cardId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'paymentCards', cardId));
    return true;
  } catch (error) {
    console.error('❌ Error eliminando tarjeta:', error);
    return false;
  }
};

/**
 * ⭐ ESTABLECER TARJETA POR DEFECTO
 */
export const setDefaultCard = async (userId: string, cardId: string): Promise<boolean> => {
  try {
    // Quitar "default" de todas las tarjetas del usuario
    const cards = await getUserPaymentCards(userId);
    
    for (const card of cards) {
      if (card.id === cardId) {
        // Establecer como default
        await updateDoc(doc(db, 'paymentCards', card.id), {
          isDefault: true,
          updatedAt: Timestamp.fromDate(new Date())
        });
      } else if (card.isDefault) {
        // Quitar default de las demás
        await updateDoc(doc(db, 'paymentCards', card.id), {
          isDefault: false,
          updatedAt: Timestamp.fromDate(new Date())
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error estableciendo tarjeta por defecto:', error);
    return false;
  }
};

/**
 * 🔍 DETECTAR TIPO DE TARJETA AUTOMÁTICAMENTE
 * - Visa: Inicia con 4 (16 dígitos)
 * - Amex: Inicia con 3 (15 dígitos)
 * - Mastercard: Inicia con 5 (16 dígitos)
 * - Diners Club: Inicia con 6 (16 dígitos)
 */
export function detectCardType(cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'diners' | null {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (!cleanNumber) return null;
  
  const firstDigit = cleanNumber[0];
  
  if (firstDigit === '4') return 'visa';
  if (firstDigit === '3') return 'amex';
  if (firstDigit === '5') return 'mastercard';
  if (firstDigit === '6') return 'diners';
  
  return null; // Tipo de tarjeta no soportado
}

/**
 * 🎭 ENMASCARAR NÚMERO DE TARJETA
 */
function maskCardNumber(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  const first4 = cleanNumber.slice(0, 4);
  const last4 = cleanNumber.slice(-4);
  return `${first4}********${last4}`;
}

/**
 * ✅ VALIDAR NÚMERO DE TARJETA (Algoritmo de Luhn + Longitud por Tipo)
 * - Visa: 16 dígitos máximo
 * - Amex: 15 dígitos máximo
 * - Mastercard: 16 dígitos máximo
 * - Diners Club: 16 dígitos máximo
 */
export const validateCardNumber = (cardNumber: string): { valid: boolean; error?: string } => {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (!/^\d+$/.test(cleanNumber)) {
    return { valid: false, error: 'El número de tarjeta debe contener solo dígitos' };
  }
  
  // Detectar tipo de tarjeta
  const cardType = detectCardType(cleanNumber);
  
  if (!cardType) {
    return { valid: false, error: 'Tipo de tarjeta no soportado' };
  }
  
  // Validar longitud según tipo de tarjeta
  const expectedLength = cardType === 'amex' ? 15 : 16;
  
  if (cleanNumber.length !== expectedLength) {
    return { 
      valid: false, 
      error: `${cardType === 'amex' ? 'American Express' : cardType === 'visa' ? 'Visa' : cardType === 'mastercard' ? 'Mastercard' : 'Diners Club'} debe tener ${expectedLength} dígitos` 
    };
  }
  
  // Algoritmo de Luhn
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  if (sum % 10 !== 0) {
    return { valid: false, error: 'Número de tarjeta inválido' };
  }
  
  return { valid: true };
};

/**
 * ✅ VALIDAR CVV
 */
export const validateCVV = (cvv: string, cardType: string): boolean => {
  if (cardType === 'amex') {
    return /^\d{4}$/.test(cvv);
  }
  return /^\d{3}$/.test(cvv);
};

/**
 * ✅ VALIDAR FECHA DE EXPIRACIÓN
 * - No acepta tarjetas vencidas
 * - El mes actual es válido
 * - Meses futuros son válidos
 */
export const validateExpiry = (month: string, year: string): { valid: boolean; error?: string } => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() retorna 0-11
  
  const expMonth = parseInt(month);
  const expYear = parseInt(year);
  
  // Validar formato de mes
  if (isNaN(expMonth) || expMonth < 1 || expMonth > 12) {
    return { valid: false, error: 'Mes inválido (01-12)' };
  }
  
  // Validar formato de año
  if (isNaN(expYear)) {
    return { valid: false, error: 'Año inválido' };
  }
  
  // Tarjeta vencida (año pasado)
  if (expYear < currentYear) {
    return { valid: false, error: 'Card Expired' };
  }
  
  // Mismo año pero mes anterior (tarjeta vencida)
  if (expYear === currentYear && expMonth < currentMonth) {
    return { valid: false, error: 'Card Expired' };
  }
  
  // Mes actual o futuro = válido
  return { valid: true };
};

/**
 * 💰 PROCESAR PAGO
 */
export const processPayment = async (
  userId: string,
  paymentMethod: 'credit-card' | 'app-agora' | 'yape',
  amount: number,
  paymentData: CreditCardData | AppAgoraData | YapeData
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  try {
    // Simulación de procesamiento de pago
    // En producción, aquí se integraría con un gateway de pagos real
    
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generar ID de transacción
    const transactionId = `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Si es tarjeta de crédito y el usuario quiere guardarla
    if (paymentMethod === 'credit-card' && (paymentData as CreditCardData).saveForFuture) {
      const cardData = paymentData as CreditCardData;
      // Obtener DNI del usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userDni = userDoc.data()?.documentNumber || '';
      
      await addPaymentCardFull(userId, userDni, cardData);
    }
    
    return {
      success: true,
      transactionId
    };
  } catch (error) {
    console.error('❌ Error procesando pago:', error);
    return {
      success: false,
      error: 'Error al procesar el pago. Por favor, intente nuevamente.'
    };
  }
};

/**
 * 🎨 OBTENER ICONO DE TARJETA
 */
export const getCardIcon = (cardType: string): string => {
  const icons: Record<string, string> = {
    visa: '💳',
    mastercard: '💳',
    amex: '💳',
    diners: '💳'
  };
  return icons[cardType] || '💳';
};

/**
 * 🎨 OBTENER COLOR DE TARJETA
 */
export const getCardColor = (cardType: string): string => {
  const colors: Record<string, string> = {
    visa: '#1A1F71',
    mastercard: '#EB001B',
    amex: '#006FCF',
    diners: '#0079BE'
  };
  return colors[cardType] || '#333333';
};
