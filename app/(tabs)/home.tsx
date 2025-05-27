import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import ExpenseSummary from '@/components/ExpenseSummary';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuth();
  


  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Please log in to view your expenses</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back, {user.username}!</Text>
        <Text style={styles.subtitle}>Track your expenses with ease</Text>
      </View>
      
      <ExpenseSummary userId={user.id} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#95a5a6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#95a5a6',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});