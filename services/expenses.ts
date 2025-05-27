import { api } from './api';

export interface Expense {
  id: string;
  name: string;
  amount: string;
  description?: string;
  createdAt?: string;
  userId: string;
  category?: string;
}

function categorizeExpense(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes('food') || desc.includes('restaurant') || desc.includes('dining')) {
    return 'Food & Dining';
  }
  if (desc.includes('transport') || desc.includes('gas') || desc.includes('uber') || desc.includes('taxi')) {
    return 'Transportation';
  }
  if (desc.includes('shopping') || desc.includes('store') || desc.includes('retail')) {
    return 'Shopping';
  }
  if (desc.includes('entertainment') || desc.includes('movie') || desc.includes('netflix')) {
    return 'Entertainment';
  }
  if (desc.includes('Utilities') || desc.includes('electric') || desc.includes('water') || desc.includes('gas')) {
    return 'Utilities';
  }
  if (desc.includes('Healthcare') || desc.includes('medical') || desc.includes('doctor')) {
    return 'Healthcare';
  }
  return 'Other';
}

export function formatExpenseForUI(expense: Expense) {
  return {
    id: expense.id,
    title: expense.name,
    amount: parseFloat(expense.amount),
    category: categorizeExpense(expense.description || expense.name),
    date: expense.createdAt,
    description: expense.description,
  };
}

export async function getExpenses(): Promise<Expense[]> {
  const response = await api.get('/expenses');
  return response.data;
}

export async function getUserExpenses(userId: string): Promise<Expense[]> {
  const response = await api.get(`/users/${userId}/expenses`);
  return response.data;
}

export async function getExpense(id: string): Promise<Expense> {
  const response = await api.get(`/expenses/${id}`);
  return response.data;
}

export async function createExpense(expense: Omit<Expense, 'id'>, userId: string): Promise<Expense> {
  const response = await api.post(`/users/${userId}/expenses`, expense);
  return response.data;
}

export async function updateExpense(id: string, expense: Partial<Expense>): Promise<Expense> {
  const response = await api.put(`/expenses/${id}`, expense);
  return response.data;
}

export async function deleteExpense(id: string, userId: string): Promise<void> {
  await api.delete(`/users/${userId}/expenses/${id}`);
}