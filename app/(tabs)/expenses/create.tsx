import { View, StyleSheet } from 'react-native';
import ExpenseForm from '@/components/ExpenseForm';

export default function CreateExpenseScreen() {
  return (
    <View style={styles.container}>
      <ExpenseForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});