import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ClimbingRecord } from '@/types';
import { climbingRecordsService } from '@/services/climbing-records.service';

export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [record, setRecord] = useState<ClimbingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecord();
  }, [id]);

  const loadRecord = async () => {
    try {
      const data = await climbingRecordsService.getById(id as string);
      setRecord(data);
    } catch (err) {
      console.error('Failed to load record:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Record not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Climb Details</Text>
      
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.grade}>{record.grade}</Text>
          <Text style={styles.date}>
            {new Date(record.created_at).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        
        <Text style={styles.routeName}>{record.route_name}</Text>
        <Text style={styles.gym}>{record.gym}</Text>
        
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Type</Text>
            <Text style={styles.metaValue}>{record.type}</Text>
          </View>
          
          {record.attempts && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Attempts</Text>
              <Text style={styles.metaValue}>{record.attempts}</Text>
            </View>
          )}
          
          {record.first_try && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Status</Text>
              <Text style={[styles.metaValue, styles.firstTry]}>First Try!</Text>
            </View>
          )}
        </View>
        
        {record.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{record.notes}</Text>
          </View>
        )}
      </View>
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
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  grade: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  date: {
    fontSize: 14,
    color: '#999',
  },
  routeName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  gym: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  meta: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 15,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  firstTry: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  notes: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});
