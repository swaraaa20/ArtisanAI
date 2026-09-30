
import { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';

import { supabase } from '../services/supabase';
import { router } from 'expo-router';

import { useLanguage } from '../context/LanguageContext';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] =
    useState<'artisan' | 'buyer'>('artisan');
  const [loading, setLoading] = useState(false);

  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  const handleSignup = async () => {
    if (
      !fullName ||
      !email ||
      !password ||
      !phone
    ) {
      Alert.alert(
        language === 'en'
          ? 'Missing details'
          : 'जानकारी अधूरी है',
        language === 'en'
          ? 'Please fill in all fields.'
          : 'कृपया सभी फ़ील्ड भरें।'
      );
      return;
    }

    const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  Alert.alert(
    language === 'en'
      ? 'Invalid email'
      : 'अमान्य ईमेल',
    language === 'en'
      ? 'Please enter a valid email address.'
      : 'कृपया एक मान्य ईमेल पता दर्ज करें।'
  );
  return;
}

    if (password.length < 6) {
      Alert.alert(
        language === 'en'
          ? 'Weak password'
          : 'कमज़ोर पासवर्ड',
        language === 'en'
          ? 'Password must be at least 6 characters.'
          : 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।'
      );
      return;
    }

    if (phone.length !== 10) {
      Alert.alert(
        language === 'en'
          ? 'Invalid phone number'
          : 'अमान्य फ़ोन नंबर',
        language === 'en'
          ? 'Please enter a valid 10-digit phone number.'
          : 'कृपया एक मान्य 10 अंकों का फ़ोन नंबर दर्ज करें।'
      );
      return;
    }

    try {
      setLoading(true);

      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        Alert.alert(
          language === 'en'
            ? 'Signup failed'
            : 'पंजीकरण विफल',
          error.message
        );
        return;
      }

      if (!data.user) {
        Alert.alert(
          language === 'en'
            ? 'Error'
            : 'त्रुटि',
          language === 'en'
            ? 'User account was not created.'
            : 'उपयोगकर्ता खाता नहीं बनाया गया।'
        );
        return;
      }

      const {
        error: profileError,
      } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          role: role,
          phone: phone,
        });

      if (profileError) {
        console.log(
          'PROFILE ERROR:',
          profileError
        );

        Alert.alert(
          language === 'en'
            ? 'Profile error'
            : 'प्रोफ़ाइल त्रुटि',
          JSON.stringify(
            profileError,
            null,
            2
          )
        );

        return;
      }

      Alert.alert(
        language === 'en'
          ? 'Account created!'
          : 'खाता बन गया!',
        language === 'en'
          ? 'Your account has been created successfully.'
          : 'आपका खाता सफलतापूर्वक बना दिया गया है।'
      );

      router.replace('/login');

    } catch (error) {
      console.log(
        'SIGNUP ERROR:',
        error
      );

      Alert.alert(
        language === 'en'
          ? 'Error'
          : 'त्रुटि',
        language === 'en'
          ? 'Something went wrong.'
          : 'कुछ गलत हो गया।'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Language Switch */}

      <View style={styles.languageSwitch}>

        <Pressable
          onPress={() => setLanguage('en')}
          style={[
            styles.languageButton,
            language === 'en' &&
              styles.selectedLanguage,
          ]}
        >
          <Text
            style={[
              styles.languageText,
              language === 'en' &&
                styles.selectedLanguageText,
            ]}
          >
            English
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setLanguage('hi')}
          style={[
            styles.languageButton,
            language === 'hi' &&
              styles.selectedLanguage,
          ]}
        >
          <Text
            style={[
              styles.languageText,
              language === 'hi' &&
                styles.selectedLanguageText,
            ]}
          >
            हिंदी
          </Text>
        </Pressable>

      </View>

      {/* Heading */}

      <Text style={styles.title}>
        {t.joinArtisanAI}
      </Text>

      <Text style={styles.subtitle}>
        {t.createAccount}
      </Text>

      {/* Full Name */}

      <TextInput
        placeholder={t.fullName}
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />

      {/* Phone */}

      <TextInput
        style={styles.input}
        placeholder={t.phoneNumber}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={10}
      />

      {/* Email */}

      <TextInput
        style={styles.input}
        placeholder={t.email}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password */}

      <TextInput
        style={styles.input}
        placeholder={t.password}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Role */}

      <Text style={styles.roleTitle}>
        {t.iAmA}
      </Text>

      <View style={styles.roleContainer}>

        <Pressable
          style={[
            styles.roleButton,
            role === 'artisan' &&
              styles.selectedRole,
          ]}
          onPress={() =>
            setRole('artisan')
          }
        >
          <Text
            style={[
              styles.roleText,
              role === 'artisan' &&
                styles.selectedRoleText,
            ]}
          >
            {t.artisan}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.roleButton,
            role === 'buyer' &&
              styles.selectedRole,
          ]}
          onPress={() =>
            setRole('buyer')
          }
        >
          <Text
            style={[
              styles.roleText,
              role === 'buyer' &&
                styles.selectedRoleText,
            ]}
          >
            {t.buyer}
          </Text>
        </Pressable>

      </View>

      {/* Sign Up */}

      <Pressable
        style={[
          styles.button,
          loading &&
            styles.disabledButton,
        ]}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading
            ? t.creatingAccount
            : t.signUp}
        </Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFF9F2',
  },

  languageSwitch: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#F4EEFF',
    borderRadius: 20,
    padding: 4,
    marginBottom: 25,
  },

  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 16,
  },

  selectedLanguage: {
    backgroundColor: '#7B4FA3',
  },

  languageText: {
    fontSize: 13,
    color: '#6B6372',
    fontWeight: '600',
  },

  selectedLanguageText: {
    color: '#FFFFFF',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#30283A',
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    marginBottom: 15,
    fontSize: 15,
    color: '#30283A',
  },

  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#7B4FA3',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },

  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#30283A',
  },

  roleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  roleButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    alignItems: 'center',
  },

  selectedRole: {
    backgroundColor: '#F4EEFF',
    borderColor: '#8B5CF6',
  },

  roleText: {
    fontSize: 15,
    color: '#555',
  },

  selectedRoleText: {
    color: '#6D28D9',
    fontWeight: '700',
  },
});

