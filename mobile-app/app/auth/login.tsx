import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('Login Failed', error || 'Please try again');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button title="Login" onPress={handleLogin} />
      
      <View style={styles.separator} />
      
      <Link href="/auth/register" asChild>
        <Button title="Don't have an account? Register" color="#666" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
});
