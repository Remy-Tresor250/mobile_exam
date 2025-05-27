import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, RefreshControl, Pressable } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ExpenseCard from '@/components/ExpenseCard';
import { getUserExpenses, formatExpenseForUI } from '@/services/expenses';
import { useAuth } from '@/contexts/AuthContext';

interface FormattedExpense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
}

export default function ExpensesScreen() {
  const { user, isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState<FormattedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadExpenses();
    }
  }, [isAuthenticated, user]);

  // Reload expenses when screen comes into focus (after creating new expense)
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && user) {
        loadExpenses();
      }
    }, [isAuthenticated, user])
  );

  const loadExpenses = async () => {
    if (!user) return;

    try {
      setError(null);
      const rawExpenses = await getUserExpenses(user.id);
      
      // Sort by date (newest first)
      const sortedExpenses = rawExpenses.sort((a, b) => 
        new Date(b?.createdAt ?? "").getTime() - new Date(a?.createdAt ?? "").getTime()
      );
      
      // Format expenses for UI
      const formattedExpenses = sortedExpenses.map(formatExpenseForUI);
      setExpenses(formattedExpenses);
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  const handleCreateExpense = () => {
    router.push('/expenses/create');
  };

  const renderExpenseItem = ({ item }: { item: FormattedExpense }) => (
    <Link href={`/expenses/${item.id}`} asChild>
      <ExpenseCard expense={item} />
    </Link>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#bdc3c7" />
      <Text style={styles.emptyTitle}>No expenses yet</Text>
      <Text style={styles.emptySubtitle}>
        Start tracking your expenses to see them here
      </Text>
      <Pressable style={styles.emptyButton} onPress={handleCreateExpense}>
        <Text style={styles.emptyButtonText}>Add Your First Expense</Text>
      </Pressable>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.errorTitle}>Oops!</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading expenses...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorTitle}>Please log in</Text>
        <Text style={styles.errorSubtitle}>
          You need to be logged in to view your expenses
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        {renderErrorState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Expenses</Text>
        <Pressable style={styles.addButton} onPress={handleCreateExpense}>
          <Ionicons name="add" size={24} color="#ffffff" />
        </Pressable>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderExpenseItem}
        contentContainerStyle={[
          styles.list,
          expenses.length === 0 && styles.emptyList
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#3498db',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#95a5a6',
  },
});