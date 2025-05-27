import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getExpense, deleteExpense } from '@/services/expenses';
import { formatCurrency, formatDate } from '@/utils/validation';
import LoadingIndicator from '@/components/LoadingIndicator';
import ErrorMessage from '@/components/ErrorMessage';
import { Trash2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function ExpenseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {user} = useAuth();
  const [expense, setExpense] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExpense();
  }, [id]);

  const loadExpense = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getExpense(id);
      setExpense(data);
    } catch (err) {
      setError('Failed to load expense details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteExpense(id, user?.id ?? "");
      router.back();
    } catch (err) {
      setError('Failed to delete expense');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadExpense} />;
  }

  if (!expense) {
    return <ErrorMessage message="Expense not found" />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{expense.title}</Text>
          <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{expense?.category ?? "Other"}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{formatDate(expense.createdAt)}</Text>
          </View>

          {expense.description && (
            <View style={styles.description}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.descriptionText}>{expense.description}</Text>
            </View>
          )}
        </View>
      </View>

      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Trash2 color="#ffffff" size={20} />
        <Text style={styles.deleteButtonText}>Delete Expense</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3498db',
  },
  detailsContainer: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  label: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  description: {
    marginTop: 8,
  },
  descriptionText: {
    marginTop: 8,
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    gap: 8,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});