import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      
      {user && (
        <View style={styles.profileContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name?.[0] || user.email[0].toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{user.name || 'No name'}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <Text style={styles.level}>Level: {user.level}</Text>
            <Text style={styles.totalClimbs}>
              Total Climbs: {user.total_climbs}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <Button title="Edit Profile" onPress={() => Alert.alert('Edit Profile')} />
        <Button title="Settings" onPress={() => Alert.alert('Settings')} />
        <Button title="Help & Support" onPress={() => Alert.alert('Help')} />
        <Button title="Logout" onPress={logout} color="#FF3B30" />
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
  profileContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: '#007AFF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  infoContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  level: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  totalClimbs: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  actions: {
    gap: 10,
  },
});
