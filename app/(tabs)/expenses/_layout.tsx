import { Stack } from 'expo-router';

export default function ExpensesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'My Expenses',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Expense Details',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'New Expense',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}