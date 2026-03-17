import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function PaymentSuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>✓</Text>
      </View>
      
      <Text style={styles.title}>Payment Successful!</Text>
      
      <Text style={styles.message}>
        Your payment has been processed successfully. You will receive a confirmation email shortly.
      </Text>
      
      <View style={styles.actions}>
        <Button title="View My Payments" onPress={() => router.push('/(tabs)/profile')} />
        <Button title="Back to Home" onPress={() => router.replace('/(tabs)/home')} color="#666" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#4CAF50',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
});
