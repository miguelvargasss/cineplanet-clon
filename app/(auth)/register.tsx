import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/src/components/ui/ThemedText';
import { ThemedView } from '@/src/components/ui/ThemedView';
import { ThemedInput } from '@/src/components/forms/ThemedInput';
import { ThemedButton } from '@/src/components/ui/ThemedButton';
import { ThemedDropdown } from '@/src/components/forms/ThemedDropdown';
import { GenderSelector, type GenderOption } from '@/src/components/forms/GenderSelector';
import { DateSelector } from '@/src/components/forms/DateSelector';
import { ThemedCheckbox } from '@/src/components/forms/ThemedCheckbox';
import { CineplanetSelector } from '@/src/components/forms/CineplanetSelector';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useThemeColor } from '@/src/hooks/useThemeColor';
import { router } from 'expo-router';
import { registerUser, getAuthErrorMessage, UserRegistrationData } from '../../src/services/authService';
import { AuthError } from 'firebase/auth';
import geographicalData from '../../src/data/geographical-data.json';

// Extraer datos de configuración geográfica
const { documentTypes, departments, provinces, districts } = geographicalData;

export default function RegisterScreen() {
  // Estados del formulario
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [motherLastName, setMotherLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [department, setDepartment] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [gender, setGender] = useState<GenderOption>(null);
  const [birthDate, setBirthDate] = useState<Date>();
  const [selectedCineplanet, setSelectedCineplanet] = useState('');
  const [showCineplanetSelector, setShowCineplanetSelector] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

  // Colores del tema
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const linkColor = useThemeColor({}, 'link');

  const handleRegister = async () => {
    // Validar campos requeridos
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || 
        !password.trim() || !documentNumber.trim() || 
        !documentType || !department || 
        !gender || !birthDate || 
        !acceptTerms || !acceptPrivacy) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const userData: UserRegistrationData = {
        email: email.trim(),
        password: password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        documentType: documentType,
        documentNumber: documentNumber.trim(),
        phoneNumber: phone.trim(),
        birthDate: birthDate,
        gender: gender || 'other',
        department: department,
        acceptTerms: acceptTerms,
        acceptPromotions: acceptPrivacy,
        cineplanetNumber: selectedCineplanet || undefined,
      };

      await registerUser(userData);
      
      Alert.alert(
        'Registro exitoso',
        '¡Tu cuenta ha sido creada exitosamente!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('../movies'),
          },
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = getAuthErrorMessage(error as AuthError);
      Alert.alert('Error de registro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCineplanet = () => {
    setShowCineplanetSelector(true);
  };

  const handleCineplanetSelected = (cineplanet: string) => {
    setSelectedCineplanet(cineplanet);
  };

  const handleBackFromCineplanetSelector = () => {
    setShowCineplanetSelector(false);
  };

  // Si está en modo selector de Cineplanet, mostrar CineplanetSelector
  if (showCineplanetSelector) {
    return (
      <CineplanetSelector
        onBack={handleBackFromCineplanetSelector}
        onSelect={handleCineplanetSelected}
        selectedCineplanet={selectedCineplanet}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={primaryColor} />
          </TouchableOpacity>
          <ThemedText type="title" style={[styles.headerTitle, { color: primaryColor }]}>
            Socio Cineplanet
          </ThemedText>
        </View>

        {/* Título y subtítulo */}
        <View style={styles.titleSection}>
          <ThemedText type="title" style={[styles.title, { color: primaryColor }]}>
            Únete
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Completa tus datos y accede a nuestro{'\n'}Universo de Beneficios
          </ThemedText>
        </View>

        {/* Formulario */}
        <ThemedView style={styles.formContainer}>
          {/* Nombres */}
          <View style={styles.inputContainer}>
            <ThemedInput
              placeholder="Nombres"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          {/* Apellido Paterno */}
          <View style={styles.inputContainer}>
            <ThemedInput
              placeholder="Apellido Paterno"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* Apellido Materno */}
          <View style={styles.inputContainer}>
            <ThemedInput
              placeholder="Apellido Materno"
              value={motherLastName}
              onChangeText={setMotherLastName}
            />
          </View>

          {/* Correo Electrónico */}
          <View style={styles.inputContainer}>
            <ThemedInput
              placeholder="Correo Electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Número de Celular */}
          <View style={styles.inputContainer}>
            <ThemedInput
              placeholder="Número de Celular"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Contraseña */}
          <View style={styles.inputContainer}>
            <ThemedInput
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              isPassword={true}
            />
          </View>

          {/* Tipo de documento y número */}
          <View style={styles.documentRow}>
            <View style={styles.documentTypeContainer}>
              <ThemedDropdown
                options={documentTypes}
                selectedValue={documentType}
                onValueChange={setDocumentType}
                placeholder="DNI"
              />
            </View>
            <View style={styles.documentNumberContainer}>
              <ThemedInput
                placeholder="N° de DNI"
                value={documentNumber}
                onChangeText={setDocumentNumber}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.cvvContainer}>
              <ThemedInput
                placeholder="CV"
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>

          {/* Departamento */}
          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: primaryColor }]}>
              Departamento
            </ThemedText>
            <ThemedDropdown
              options={departments}
              selectedValue={department}
              onValueChange={setDepartment}
              placeholder="AMAZONAS"
            />
          </View>

          {/* Provincia */}
          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: primaryColor }]}>
              Provincia
            </ThemedText>
            <ThemedDropdown
              options={provinces}
              selectedValue={province}
              onValueChange={setProvince}
              placeholder="CHACHAPOYAS"
            />
          </View>

          {/* Distrito */}
          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: primaryColor }]}>
              Distrito
            </ThemedText>
            <ThemedDropdown
              options={districts}
              selectedValue={district}
              onValueChange={setDistrict}
              placeholder="CHILIQUIN"
            />
          </View>

          {/* Género */}
          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: primaryColor }]}>
              Género
            </ThemedText>
            <GenderSelector
              selectedGender={gender}
              onGenderChange={setGender}
            />
          </View>

          {/* Fecha de Nacimiento */}
          <View style={styles.inputContainer}>
            <ThemedText style={[styles.label, { color: primaryColor }]}>
              Fecha de Nacimiento
            </ThemedText>
            <DateSelector
              selectedDate={birthDate}
              onDateChange={setBirthDate}
              placeholder="DD-MM-AAAA"
            />
          </View>

          {/* Seleccionar Cineplanet favorito */}
          <View style={styles.inputContainer}>
            <ThemedButton
              title={selectedCineplanet || "Selecciona tu Cineplanet favorito"}
              variant="outline"
              onPress={handleSelectCineplanet}
            />
          </View>

          {/* Checkboxes de términos */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => setAcceptTerms(!acceptTerms)}
            >
              <ThemedCheckbox
                checked={acceptTerms}
                onPress={() => setAcceptTerms(!acceptTerms)}
              />
              <ThemedText style={styles.checkboxText}>
                He leído y acepto las finalidades de tratamiento adicionales.
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => setAcceptPrivacy(!acceptPrivacy)}
            >
              <ThemedCheckbox
                checked={acceptPrivacy}
                onPress={() => setAcceptPrivacy(!acceptPrivacy)}
              />
              <ThemedText style={styles.checkboxText}>
                Acepto los{' '}
                <ThemedText style={{ color: linkColor, textDecorationLine: 'underline' }}>
                  Términos y Condiciones
                </ThemedText>
                {' '}y la{' '}
                <ThemedText style={{ color: linkColor, textDecorationLine: 'underline' }}>
                  Política de Privacidad
                </ThemedText>
                .
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Botón de registro */}
          <ThemedButton
            title={loading ? "Registrando..." : "Unirme"}
            variant="secondary"
            onPress={handleRegister}
            disabled={loading}
            style={styles.registerButton}
          />
        </ThemedView>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 16,
  },
  formContainer: {
    gap: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  documentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  documentTypeContainer: {
    flex: 1,
  },
  documentNumberContainer: {
    flex: 2,
  },
  cvvContainer: {
    flex: 0.8,
  },
  checkboxContainer: {
    marginVertical: 20,
    gap: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  registerButton: {
    marginTop: 20,
    marginBottom: 40,
  },
});
