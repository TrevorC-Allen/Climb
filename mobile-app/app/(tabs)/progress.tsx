import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { progressService } from '@/services/progress.service';
import { ProgressStats, HistoryItem } from '@/types';

export default function ProgressScreen() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const [statsData, historyData] = await Promise.all([
        progressService.getStats(),
        progressService.getHistory(),
      ]);
      setStats(statsData);
      setHistory(historyData);
    } catch (err) {
      console.error('Failed to load progress:', err);
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
      <Text style={styles.title}>Progress</Text>
      
      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Overview</Text>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Climbs</Text>
            <Text style={styles.statValue}>{stats.total_climbs}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>First Try Rate</Text>
            <Text style={styles.statValue}>{stats.first_try_rate.toFixed(1)}%</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Avg Attempts</Text>
            <Text style={styles.statValue}>{stats.avg_attempts.toFixed(1)}</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>By Type</Text>
        {stats?.by_type && (
          <View style={styles.typeContainer}>
            {Object.entries(stats.by_type).map(([type, count]) => (
              <View key={type} style={styles.typeItem}>
                <Text style={styles.typeLabel}>{type}</Text>
                <Text style={styles.typeCount}>{count}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>No recent activity</Text>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.date}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <Text style={styles.historyDate}>{item.date}</Text>
                <Text style={styles.historyCount}>{item.count} climbs</Text>
              </View>
            )}
          />
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
  statsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeItem: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 6,
  },
  typeLabel: {
    fontSize: 12,
    color: '#007AFF',
  },
  typeCount: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyCount: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
});
