import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView, Picker, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ClimbingType, ClimbingGrade, CreateRecordDto } from '@/types';
import { climbingRecordsService } from '@/services/climbing-records.service';

const GRADES: ClimbingGrade[] = [
  'VB', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10',
  '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11c', '5.11d',
  '5.12a', '5.12b', '5.12c', '5.12d', '5.13a', '5.13b', '5.13c', '5.13d',
  '5.14a', '5.14b', '5.14c', '5.14d', '5.15a', '5.15b', '5.15c', '5.15d',
];

const TYPES: ClimbingType[] = ['boulder', 'lead', 'top-rope'];

export default function AddRecordScreen() {
  const router = useRouter();
  const [routeName, setRouteName] = useState('');
  const [gym, setGym] = useState('');
  const [type, setType] = useState<ClimbingType>('boulder');
  const [grade, setGrade] = useState<ClimbingGrade>('V0');
  const [attempts, setAttempts] = useState('');
  const [firstTry, setFirstTry] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!routeName || !gym) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const dto: CreateRecordDto = {
        route_name: routeName,
        gym,
        type,
        grade,
        attempts: attempts ? parseInt(attempts) : undefined,
        first_try: firstTry,
        notes,
      };

      await climbingRecordsService.create(dto);
      Alert.alert('Success', 'Climb recorded!');
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to record climb');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Record Climb</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Route Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter route name"
          value={routeName}
          onChangeText={setRouteName}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Gym *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter gym name"
          value={gym}
          onChangeText={setGym}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={type} onValueChange={setType}>
            {TYPES.map((t) => (
              <Picker.Item key={t} label={t} value={t} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Grade</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={grade} onValueChange={setGrade}>
            {GRADES.map((g) => (
              <Picker.Item key={g} label={g} value={g} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Attempts</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter attempts (optional)"
          value={attempts}
          onChangeText={setAttempts}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <TouchableOpacity style={styles.checkbox} onPress={() => setFirstTry(!firstTry)}>
          <View style={[styles.checkboxBox, firstTry && styles.checkboxBoxChecked]}>
            {firstTry && <Text style={styles.checkboxCheck}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>First Try</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter notes (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </View>

      <Button title="Save Climb" onPress={handleSubmit} />
    </ScrollView>
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
  },
});
