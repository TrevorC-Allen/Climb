import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, Picker } from 'react-native';
import { useRouter } from 'expo-router';
import { paymentService } from '@/services/payment.service';

export default function PaymentScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('50');
  const [type, setType] = useState<'gym_ticket' | 'membership' | 'coaching'>('gym_ticket');
  const [description, setDescription] = useState('');

  const handlePayment = async () => {
    try {
      const payment = await paymentService.create(
        parseInt(amount),
        type,
        description || `${type} payment`
      );
      
      Alert.alert(
        'Payment Created',
        `Order ID: ${payment.order_id}\nAmount: ¥${payment.amount}\n\nPlease complete payment in WeChat`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/payment/success'),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to create payment');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Payment Type</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={type} onValueChange={setType}>
            <Picker.Item label="Gym Ticket" value="gym_ticket" />
            <Picker.Item label="Membership" value="membership" />
            <Picker.Item label="Coaching" value="coaching" />
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Amount (CNY)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter description"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Total</Text>
        <Text style={styles.summaryAmount}>¥{amount}</Text>
      </View>

      <Button title="Pay with WeChat" onPress={handlePayment} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  summary: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});
