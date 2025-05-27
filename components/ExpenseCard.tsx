import { View, Text, StyleSheet, Pressable } from 'react-native';

interface ExpenseCardProps {
  expense: {
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    description?: string;
  };
  onPress?: () => void;
}

export default function ExpenseCard({ expense, onPress }: ExpenseCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Food & Dining': '#e74c3c',
      'Transportation': '#3498db',
      'Shopping': '#9b59b6',
      'Entertainment': '#f39c12',
      'Utilities': '#27ae60',
      'Healthcare': '#e67e22',
      'Other': '#95a5a6',
    };
    return colors[category] || colors['Other'];
  };

  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {expense.title}
          </Text>
          {expense.description && (
            <Text style={styles.description} numberOfLines={1}>
              {expense.description}
            </Text>
          )}
        </View>
        <Text style={styles.amount}>
          ${expense.amount.toFixed(2)}
        </Text>
      </View>
      <View style={styles.footer}>
        <View style={[
          styles.categoryBadge, 
          { backgroundColor: getCategoryColor(expense.category) + '20' }
        ]}>
          <Text style={[
            styles.category, 
            { color: getCategoryColor(expense.category) }
          ]}>
            {expense.category}
          </Text>
        </View>
        <Text style={styles.date}>
          {formatDate(expense.date)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    opacity: 0.8,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: '#95a5a6',
  },
});