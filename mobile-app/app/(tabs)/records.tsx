import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ClimbingRecord } from '@/types';
import { climbingRecordsService } from '@/services/climbing-records.service';

export default function RecordsScreen() {
  const [records, setRecords] = useState<ClimbingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const data = await climbingRecordsService.getAll();
      setRecords(data);
    } catch (err) {
      console.error('Failed to load records:', err);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Climbs</Text>
      
      {records.length === 0 ? (
        <Text style={styles.emptyText}>No climbs recorded yet</Text>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Link href={`/records/${item.id}`} asChild>
              <View style={styles.recordItem}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordGrade}>{item.grade}</Text>
                  <Text style={styles.recordDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.recordName}>{item.route_name}</Text>
                <Text style={styles.recordGym}>{item.gym}</Text>
                <View style={styles.recordMeta}>
                  <Text style={styles.recordType}>{item.type}</Text>
                  {item.attempts && (
                    <Text style={styles.recordAttempts}>Attempts: {item.attempts}</Text>
                  )}
                  {item.first_try && <Text style={styles.recordFirstTry}>First Try!</Text>}
                </View>
              </View>
            </Link>
          )}
        />
      )}
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
  emptyText: {
    color: '#999',
    textAlign: 'center',
    padding: 40,
  },
  recordItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordGrade: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  recordDate: {
    fontSize: 12,
    color: '#999',
  },
  recordName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  recordGym: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recordMeta: {
    flexDirection: 'row',
    gap: 10,
  },
  recordType: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    padding: 4,
    borderRadius: 4,
  },
  recordAttempts: {
    fontSize: 12,
    color: '#666',
  },
  recordFirstTry: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
