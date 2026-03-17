import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { ClimbingRecord } from '@/types';
import { climbingRecordsService } from '@/services/climbing-records.service';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [recentRecords, setRecentRecords] = useState<ClimbingRecord[]>([]);

  useEffect(() => {
    loadRecentRecords();
  }, []);

  const loadRecentRecords = async () => {
    try {
      const records = await climbingRecordsService.getAll(5);
      setRecentRecords(records);
    } catch (err) {
      console.error('Failed to load records:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {user?.name || 'Climber'}!</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Quick Stats</Text>
        <Text style={styles.statsText}>Total Climbs: {user?.total_climbs || 0}</Text>
        <Text style={styles.statsText}>Level: {user?.level || 1}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Climbs</Text>
        {recentRecords.length === 0 ? (
          <Text style={styles.emptyText}>No climbs recorded yet</Text>
        ) : (
          <FlatList
            data={recentRecords}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Link href={`/records/${item.id}`} asChild>
                <TouchableOpacity style={styles.recordItem}>
                  <Text style={styles.recordGrade}>{item.grade}</Text>
                  <Text style={styles.recordName}>{item.route_name}</Text>
                  <Text style={styles.recordGym}>{item.gym}</Text>
                </TouchableOpacity>
              </Link>
            )}
          />
        )}
      </View>

      <View style={styles.fabContainer}>
        <Link href="/records/add" asChild>
          <TouchableOpacity style={styles.fab}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#666',
  },
  statsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recordItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  recordGrade: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  recordName: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  recordGym: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fab: {
    width: 56,
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  fabText: {
    fontSize: 24,
    color: '#fff',
  },
});
