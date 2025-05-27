import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { getUserExpenses, formatExpenseForUI } from '@/services/expenses';
import { useAuth } from '@/contexts/AuthContext';
import { useFocusEffect } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

// Chart colors for categories
const categoryColors: { [key: string]: string } = {
  'Food & Dining': '#3498db',
  Transportation: '#e74c3c',
  Shopping: '#2ecc71',
  Entertainment: '#9b59b6',
  Utilities: '#f1c40f',
  Healthcare: '#e67e22',
  Other: '#95a5a6',
};

export default function StatsScreen() {
  const { user, isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState<{
    id: string;
    title: string;
    amount: number;
    category: string;
    date?: string;
    description?: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && user?.id) {
        loadExpenses();
      } else {
        setLoading(false);
        setError('User not authenticated');
      }
    }, [user, isAuthenticated])
  );

  const loadExpenses = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const rawExpenses = await getUserExpenses(user.id);
      const formattedExpenses = rawExpenses.map(formatExpenseForUI);
      setExpenses(formattedExpenses);
    } catch (err) {
      setError('Failed to load expenses');
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate monthly spending data
  const generateMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyTotals: { [key: string]: number } = {};

    // Initialize months with 0
    months.forEach((month) => {
      monthlyTotals[month] = 0;
    });

    // Calculate totals for each month
    expenses.forEach((expense) => {
      if (expense.date) {
        const date = new Date(expense.date);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        if (monthlyTotals.hasOwnProperty(monthName)) {
          monthlyTotals[monthName] += expense.amount;
        }
      }
    });

    return {
      labels: months,
      datasets: [
        {
          data: months.map((month) => monthlyTotals[month]),
        },
      ],
    };
  };

  // Generate category breakdown data
  const generateCategoryData = () => {
    const categoryTotals: { [key: string]: number } = {};
    let totalAmount = 0;

    // Calculate totals for each category
    expenses.forEach((expense) => {
      const category = expense.category;
      categoryTotals[category] =
        (categoryTotals[category] || 0) + expense.amount;
      totalAmount += expense.amount;
    });

    // Convert to pie chart format
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        name: category,
        population: Math.round((amount / totalAmount) * 100) || 0,
        color: categoryColors[category] || '#95a5a6',
        legendFontColor: '#2c3e50',
      }))
      .filter((item) => item.population > 0);
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalSpent = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const currentMonth = new Date().getMonth();
    const currentMonthExpenses = expenses.filter((expense) => {
      if (!expense.date) return false;
      return new Date(expense.date).getMonth() === currentMonth;
    });
    const currentMonthTotal = currentMonthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Calculate previous month for comparison
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthExpenses = expenses.filter((expense) => {
      if (!expense.date) return false;
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === prevMonth &&
        (currentMonth !== 0 ||
          expenseDate.getFullYear() === new Date().getFullYear() - 1)
      );
    });
    const prevMonthTotal = prevMonthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    const monthlyChange =
      prevMonthTotal > 0
        ? ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100
        : 0;

    const daysInMonth = new Date(
      new Date().getFullYear(),
      currentMonth + 1,
      0
    ).getDate();
    const avgDaily = currentMonthTotal / daysInMonth;

    return {
      totalSpent,
      currentMonthTotal,
      monthlyChange,
      avgDaily,
    };
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Please log in to view statistics</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const lineData = generateMonthlyData();
  const pieData = generateCategoryData();
  const stats = calculateStats();

  return (
    <ScrollView style={styles.container}>
      {/* Monthly Spending Trend */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly Spending Trend</Text>
        {lineData.datasets[0].data.some((value) => value > 0) ? (
          <LineChart
            data={lineData}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              No spending data available for chart
            </Text>
          </View>
        )}
      </View>

      {/* Expense Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expense Categories</Text>
        {pieData.length > 0 ? (
          <PieChart
            data={pieData}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              No expense categories to display
            </Text>
          </View>
        )}
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Spent</Text>
          <Text style={styles.statValue}>${stats.totalSpent.toFixed(2)}</Text>
          <Text
            style={[
              styles.statChange,
              { color: stats.monthlyChange >= 0 ? '#e74c3c' : '#10b981' },
            ]}
          >
            {stats.monthlyChange >= 0 ? '+' : ''}
            {stats.monthlyChange.toFixed(1)}% from last month
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Avg. Daily</Text>
          <Text style={styles.statValue}>${stats.avgDaily.toFixed(2)}</Text>
          <Text style={styles.statSubtext}>Current month average</Text>
        </View>
      </View>

      {/* Current Month Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.monthlyBreakdown}>
          <Text style={styles.monthlyAmount}>
            ${stats.currentMonthTotal.toFixed(2)}
          </Text>
          <Text style={styles.monthlyLabel}>Total spent this month</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  section: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
  },
  noDataText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 14,
  },
  statSubtext: {
    fontSize: 12,
    color: '#94a3b8',
  },
  monthlyBreakdown: {
    alignItems: 'center',
    padding: 20,
  },
  monthlyAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
  },
  monthlyLabel: {
    fontSize: 16,
    color: '#64748b',
  },
});
