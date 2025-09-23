import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedInput } from '@/components/ThemedInput';
import { ThemedButton } from '@/components/ThemedButton';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';
import { loginWithDNI, getAuthErrorMessage } from '../../src/services/authService';
import { AuthError } from 'firebase/auth';

export default function LoginScreen() {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const linkColor = useThemeColor({}, 'link');
  const darkBlue = '#0D47A1'; // Azul más oscuro para el título

  const handleLogin = async () => {
    if (!dni.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu DNI y contraseña');
      return;
    }

    // Validar formato de DNI (8 dígitos)
    if (dni.trim().length !== 8 || !/^\d+$/.test(dni.trim())) {
      Alert.alert('Error', 'El DNI debe tener exactamente 8 dígitos');
      return;
    }

    setLoading(true);

    try {
      await loginWithDNI(dni.trim(), password);
      router.replace('../movies');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = getAuthErrorMessage(error as AuthError);
      Alert.alert('Error de inicio de sesión', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProgram = () => {
    // Navegar a registro
    router.push('./register' as any);
  };

  const handleForgotPassword = () => {
    // Aquí iría la navegación a recuperar contraseña
    console.log('Navigate to forgot password');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con flecha de regreso */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('../movies')}>
            <IconSymbol name="chevron.left" size={24} color={primaryColor} />
          </TouchableOpacity>
          <ThemedText type="title" style={[styles.headerTitle, { color: primaryColor }]}>
            Inicia Sesión
          </ThemedText>
        </View>

        {/* Formulario de Login */}
        <ThemedView style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <ThemedInput
              placeholder="N° de Socio Cineplanet"
              value={dni}
              onChangeText={setDni}
              keyboardType="numeric"
              maxLength={8}
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedInput
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              isPassword={true}
              style={styles.input}
            />
            <TouchableOpacity onPress={handleForgotPassword} style={styles.helpIcon}>
              <IconSymbol name="questionmark.circle" size={18} color={primaryColor} />
            </TouchableOpacity>
          </View>

          {/* Link de olvido de contraseña */}
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
            <ThemedText style={[styles.forgotPasswordText, { color: linkColor }]}>
              ¿Olvidaste tu contraseña?
            </ThemedText>
          </TouchableOpacity>

          {/* Botón de Ingresar */}
          <ThemedButton
            title={loading ? "Ingresando..." : "Ingresar"}
            variant="primary"
            onPress={handleLogin}
            disabled={loading}
            style={styles.loginButton}
          />
        </ThemedView>

        {/* Sección de registro */}
        <View style={styles.registerSection}>
          <ThemedText type="title" style={[styles.registerTitle, { color: darkBlue }]}>
            ¿No Eres Socio Cineplanet?
          </ThemedText>
          
          <ThemedText style={styles.registerDescription}>
            Uniéndote a nuestro programa Socio Cineplanet podrás acumular puntos en cada visita que realices y gozar de grandes beneficios.{' '}
            <TouchableOpacity onPress={handleJoinProgram}>
              <ThemedText style={[styles.linkText, { color: linkColor }]}>
                Conoce mas sobre el programa
              </ThemedText>
            </TouchableOpacity>
          </ThemedText>

          <ThemedButton
            title="Únete"
            variant="secondary"
            icon="person.badge.plus"
            onPress={handleJoinProgram}
            style={styles.joinButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 30,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  formContainer: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  helpIcon: {
    position: 'absolute',
    right: 0,
    top: 12,
    padding: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  passwordLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  input: {
    fontSize: 15,
    paddingRight: 30,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-start',
    marginBottom: 30,
    marginTop: 6,
  },
  forgotPasswordText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  loginButton: {
    marginTop: 10,
    alignSelf: 'center',
    minWidth: 200,
    paddingHorizontal: 40,
  },
  registerSection: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  registerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  registerDescription: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  joinButton: {
    minWidth: 160,
    paddingHorizontal: 40,
  },
});
