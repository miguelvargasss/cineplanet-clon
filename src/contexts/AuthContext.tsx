import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { UserProfile, getUserProfile } from '@/src/services/authService';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isAuthenticated: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('\n🔄 ═══════════════════════════════════════════════════');
      console.log('🎬 CINEPLANET - ESTADO DE AUTENTICACIÓN');
      console.log('═══════════════════════════════════════════════════');
      
      setUser(user);
      
      if (user) {
        console.log('👤 USUARIO DETECTADO:');
        console.log(`   🆔 UID: ${user.uid}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Nombre: ${user.displayName || 'No configurado'}`);
        
        try {
          console.log('📋 Cargando perfil completo...');
          // Cargar perfil del usuario desde Firestore
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          
          if (profile) {
            console.log('✅ Perfil cargado correctamente');
            console.log(`   🎟️  Número Cineplanet: ${profile.cineplanetNumber || 'No asignado'}`);
            console.log(`   📋 DNI: ${profile.documentNumber}`);
          }
        } catch (error) {
          console.log('⚠️  No se pudo cargar el perfil completo');
          console.error('   ', error);
          // No es crítico, el usuario puede usar la app sin perfil completo
          setUserProfile(null);
        }
      } else {
        console.log('👤 No hay usuario autenticado');
        setUserProfile(null);
      }
      
      setLoading(false);
      console.log('═══════════════════════════════════════════════════\n');
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};