import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserData {
  email: string;
  password?: string; // Solo para registro
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  phoneNumber: string;
  birthDate: Date;
  gender: string;
  department: string;
  acceptTerms?: boolean; // Solo para registro
  acceptPromotions: boolean;
  cineplanetNumber?: string;
  cinemaId?: string; // Cine asociado al usuario
  // Campos adicionales para el perfil guardado
  uid?: string;
  createdAt?: Date;
  lastLogin?: Date;
}

// Alias para mantener compatibilidad
export interface UserRegistrationData extends UserData {
  password: string;
  acceptTerms: boolean;
}

export interface UserProfile extends Omit<UserData, 'password' | 'acceptTerms'> {
  uid: string;
  createdAt: Date;
  lastLogin: Date;
}

// Función para buscar usuario por DNI y obtener su email
export const findEmailByDNI = async (dni: string): Promise<string | null> => {
  try {
    console.log('🔍 BUSCANDO USUARIO...');
    console.log(`   📋 DNI ingresado: ${dni}`);
    
    const usersRef = collection(db, 'users');
    
    // Buscar como string primero
    console.log('   🔎 Buscando en base de datos (formato texto)...');
    const q = query(usersRef, where('documentNumber', '==', dni));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      console.log(`   ✅ USUARIO ENCONTRADO!`);
      console.log(`   📧 Email asociado: ${userData.email}`);
      return userData.email;
    }
    
    // Si no se encuentra como string, probar como número
    console.log('   🔎 Buscando en base de datos (formato numérico)...');
    const dniNumber = parseInt(dni);
    const qNumber = query(usersRef, where('documentNumber', '==', dniNumber));
    const querySnapshotNumber = await getDocs(qNumber);
    
    if (!querySnapshotNumber.empty) {
      const userDoc = querySnapshotNumber.docs[0];
      const userData = userDoc.data();
      console.log(`   ✅ USUARIO ENCONTRADO!`);
      console.log(`   📧 Email asociado: ${userData.email}`);
      return userData.email;
    }
    
    console.log('   ❌ Usuario no encontrado en la base de datos');
    return null;
  } catch (error) {
    console.log('   ⚠️  ERROR AL BUSCAR USUARIO:');
    console.error('   ', error);
    return null;
  }
};

// Función para iniciar sesión con DNI y contraseña
export const loginWithDNI = async (dni: string, password: string) => {
  try {
    console.log('\n🚀 ═══════════════════════════════════════════════════');
    console.log('🎬 CINEPLANET - SISTEMA DE AUTENTICACIÓN');
    console.log('═══════════════════════════════════════════════════');
    
    // Validar DNI
    console.log('🔐 INICIANDO PROCESO DE LOGIN...');
    if (!dni || dni.length !== 8) {
      console.log('   ❌ VALIDACIÓN FALLIDA: DNI inválido');
      throw new Error('El DNI debe tener exactamente 8 dígitos');
    }
    
    console.log('   ✅ Formato de DNI válido');
    
    // Buscar el email asociado al DNI
    const email = await findEmailByDNI(dni);
    if (!email) {
      console.log('   ❌ ACCESO DENEGADO: DNI no registrado');
      throw new Error('DNI no registrado en el sistema');
    }
    
    // Iniciar sesión con el email encontrado
    console.log('🔓 VERIFICANDO CREDENCIALES...');
    console.log(`   📧 Email: ${email}`);
    console.log('   🔑 Validando contraseña...');
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    console.log('🎉 ¡LOGIN EXITOSO!');
    console.log(`   👤 Usuario: ${userCredential.user.displayName || 'Usuario'}`);
    console.log(`   🆔 UID: ${userCredential.user.uid}`);
    console.log('═══════════════════════════════════════════════════\n');
    
    return userCredential;
  } catch (error: any) {
    if (error.message === 'El DNI debe tener exactamente 8 dígitos' || 
        error.message === 'DNI no registrado en el sistema') {
      console.log('═══════════════════════════════════════════════════\n');
      throw error;
    }
    
    console.log('❌ LOGIN FALLIDO:');
    console.log(`   Error: ${getAuthErrorMessage(error)}`);
    console.log('═══════════════════════════════════════════════════\n');
    
    throw new Error(getAuthErrorMessage(error));
  }
};

// Registrar nuevo usuario
export const registerUser = async (userData: UserRegistrationData): Promise<User> => {
  try {
    console.log('\n🌟 ═══════════════════════════════════════════════════');
    console.log('🎬 CINEPLANET - REGISTRO DE USUARIO');
    console.log('═══════════════════════════════════════════════════');
    
    // Validar email con regex más específico
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(userData.email)) {
      console.log('   ❌ VALIDACIÓN FALLIDA: Email inválido');
      throw new Error('El formato del email no es válido');
    }

    console.log('📝 CREANDO CUENTA DE USUARIO...');
    console.log(`   📧 Email: ${userData.email}`);
    console.log(`   👤 Nombre: ${userData.firstName} ${userData.lastName}`);
    console.log(`   📋 DNI: ${userData.documentNumber}`);
    
    // Crear usuario en Firebase Auth
    console.log('🔐 Registrando en Firebase Auth...');
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    const user = userCredential.user;
    console.log(`   ✅ Usuario creado con UID: ${user.uid}`);

    // Actualizar perfil del usuario
    console.log('👤 Actualizando perfil de usuario...');
    await updateProfile(user, {
      displayName: `${userData.firstName} ${userData.lastName}`
    });
    console.log('   ✅ Perfil actualizado');

    // Guardar datos adicionales en Firestore
    console.log('💾 Guardando datos en Firestore...');
    const userProfile: UserProfile = {
      uid: user.uid,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      documentType: userData.documentType,
      documentNumber: userData.documentNumber,
      phoneNumber: userData.phoneNumber,
      birthDate: userData.birthDate,
      gender: userData.gender,
      department: userData.department,
      acceptPromotions: userData.acceptPromotions,
      cineplanetNumber: userData.cineplanetNumber,
      cinemaId: userData.cinemaId || 'cp-alcazar', // Cine por defecto
      createdAt: new Date(),
      lastLogin: new Date()
    };

    try {
      await setDoc(doc(db, 'users', user.uid), userProfile);
      console.log('   ✅ Datos guardados en Firestore');
      
      console.log('🎉 ¡REGISTRO COMPLETADO EXITOSAMENTE!');
      console.log(`   🎟️  Número Cineplanet: ${userData.cineplanetNumber}`);
      console.log(`   📅 Fecha de registro: ${new Date().toLocaleDateString()}`);
      console.log('═══════════════════════════════════════════════════\n');
      
    } catch (firestoreError) {
      console.log('   ⚠️  Advertencia: Error guardando en Firestore');
      console.error('   ', firestoreError);
      console.log('   ℹ️  El usuario fue creado pero algunos datos no se guardaron');
      // El usuario ya fue creado en Auth, así que no lanzamos el error
    }

    return user;
  } catch (error: any) {
    console.log('❌ REGISTRO FALLIDO:');
    console.error(`   Error: ${getAuthErrorMessage(error)}`);
    console.log('═══════════════════════════════════════════════════\n');
    throw new Error(getAuthErrorMessage(error));
  }
};

// Iniciar sesión con email (mantener para compatibilidad)
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    console.log('\n📧 ═══════════════════════════════════════════════════');
    console.log('🎬 CINEPLANET - LOGIN CON EMAIL');
    console.log('═══════════════════════════════════════════════════');
    console.log('🔐 INICIANDO SESIÓN...');
    console.log(`   📧 Email: ${email}`);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('✅ Login exitoso');
    console.log(`   👤 Usuario: ${user.displayName || 'Usuario'}`);

    // Actualizar última fecha de login
    console.log('📅 Actualizando última conexión...');
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        lastLogin: new Date()
      }, { merge: true });
      console.log('   ✅ Última conexión actualizada');
    } catch (firestoreError) {
      console.log('   ⚠️  Error actualizando última conexión');
      console.error('   ', firestoreError);
    }

    console.log('🎉 ¡BIENVENIDO A CINEPLANET!');
    console.log('═══════════════════════════════════════════════════\n');
    
    return user;
  } catch (error: any) {
    console.log('❌ LOGIN FALLIDO:');
    console.error(`   Error: ${getAuthErrorMessage(error)}`);
    console.log('═══════════════════════════════════════════════════\n');
    throw new Error(getAuthErrorMessage(error));
  }
};

// Cerrar sesión
export const logoutUser = async (): Promise<void> => {
  try {
    console.log('\n👋 ═══════════════════════════════════════════════════');
    console.log('🎬 CINEPLANET - CERRANDO SESIÓN');
    console.log('═══════════════════════════════════════════════════');
    console.log('🚪 Cerrando sesión...');
    
    await signOut(auth);
    
    console.log('✅ Sesión cerrada exitosamente');
    console.log('👋 ¡Hasta la próxima!');
    console.log('═══════════════════════════════════════════════════\n');
  } catch (error) {
    console.log('❌ ERROR AL CERRAR SESIÓN:');
    console.error('   ', error);
    console.log('═══════════════════════════════════════════════════\n');
    throw error;
  }
};

// Obtener perfil del usuario
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    console.log('📋 Cargando perfil de usuario...');
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log('   ✅ Perfil cargado exitosamente');
      return userDoc.data() as UserProfile;
    }
    
    console.log('   ⚠️  Perfil no encontrado');
    return null;
  } catch (error) {
    console.log('   ❌ Error cargando perfil:');
    console.error('   ', error);
    return null;
  }
};

// Función para obtener mensajes de error más amigables
export const getAuthErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    if (error.message.includes('El DNI debe tener exactamente 8 dígitos') || 
        error.message.includes('DNI no registrado en el sistema') ||
        error.message.includes('El formato del email no es válido')) {
      return error.message;
    }
  }

  const errorCode = error?.code || '';
  
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Este email ya está registrado. Intenta con otro email o inicia sesión.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'El formato del email no es válido.';
    case 'auth/user-not-found':
      return 'No existe una cuenta con este email.';
    case 'auth/wrong-password':
      return 'La contraseña es incorrecta.';
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido deshabilitada.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Intenta más tarde.';
    case 'auth/network-request-failed':
      return 'Error de conexión. Verifica tu internet.';
    case 'auth/invalid-credential':
      return 'DNI o contraseña incorrectos.';
    default:
      return error?.message || 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';
  }
};