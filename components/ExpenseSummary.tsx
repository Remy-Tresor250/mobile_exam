import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getUserExpenses, Expense } from '@/services/expenses';
import { useFocusEffect } from 'expo-router';

interface ExpenseSummaryProps {
  userId: string;
}

interface CategorySummary {
  name: string;
  amount: number;
  percentage: number;
}

export default function ExpenseSummary({ userId }: ExpenseSummaryProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadExpenses();
    }, [userId])
  );

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await getUserExpenses(userId);
      setExpenses(data);
    } catch (err) {
      setError('Failed to load expenses');
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter expenses for current month
    const monthlyExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense?.createdAt ?? "");
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });

    // Calculate total
    const total = monthlyExpenses.reduce((sum, expense) => {
      return sum + parseFloat(expense.amount);
    }, 0);

    // For demonstration, categorize based on description keywords
    // In a real app, you'd have a category field
    const categorizeExpense = (description: string): string => {
      const desc = description.toLowerCase();
      if (desc.includes('food') || desc.includes('restaurant') || desc.includes('dining')) {
        return 'Food & Dining';
      }
      if (desc.includes('transport') || desc.includes('gas') || desc.includes('uber')) {
        return 'Transportation';
      }
      if (desc.includes('shopping') || desc.includes('store')) {
        return 'Shopping';
      }
      // For this demo, we'll create categories based on company names
      // You can customize this logic based on your needs
      return 'Other';
    };

    // Group by category
    const categoryTotals: { [key: string]: number } = {};
    monthlyExpenses.forEach((expense) => {
      const category = categorizeExpense(expense.description || expense.name);
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
    });

    // Convert to array and calculate percentages
    const categories: CategorySummary[] = Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 2); // Show top 2 categories

    return { total, categories };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.label}>Loading expenses...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Error</Text>
          <Text style={styles.amount}>{error}</Text>
        </View>
      </View>
    );
  }

  const { total, categories } = calculateSummary();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Total Expenses</Text>
        <Text style={styles.amount}>${total.toFixed(2)}</Text>
        <Text style={styles.period}>This Month</Text>
      </View>

      <View style={styles.statsContainer}>
        {categories.map((category, index) => (
          <View key={category.name} style={styles.statCard}>
            <Text style={styles.statLabel}>{category.name}</Text>
            <Text style={styles.statAmount}>${category.amount.toFixed(2)}</Text>
            <Text style={styles.percentage}>{category.percentage}%</Text>
          </View>
        ))}
        
        {categories.length === 0 && (
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>No expenses</Text>
            <Text style={styles.statAmount}>$0.00</Text>
            <Text style={styles.percentage}>0%</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#3498db',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  period: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 8,
  },
  statAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  percentage: {
    fontSize: 14,
    color: '#27ae60',
  },
});