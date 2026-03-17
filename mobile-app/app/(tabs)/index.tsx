import { View, Text, StyleSheet } from 'react-native';

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Index</Text>
      <Text style={styles.text}>Index page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});
