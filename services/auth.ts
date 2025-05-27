import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

interface User {
  id: string;
  username: string;
  email: string;
  password: string
}

interface RegisterData {
  username: string;
  password: string;
}

const USER_STORAGE_KEY = '@finance_tracker_user';
const TOKEN_STORAGE_KEY = '@finance_tracker_token';

export async function login(username: string, password: string): Promise<User> {
  try {
    // Input validation
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    
    // Make API call
    const response = await api.get(
      `/users`
    );
    
    const users = response.data;

    if (!users || users.length === 0) {
      throw new Error('User not found');
    }

    const user = users.find((u: User) => u.username === username.trim() && u.password === password.trim());
    
    if (!user) {
      throw new Error('User not found');
    }

    // Store user data in AsyncStorage for persistence
    await storeUserData(user);

    return user;
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('Network Error')) {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Request timeout. Please try again.');
      } else if (error.message.includes('User not found')) {
        throw new Error('Invalid username or password');
      } else if (error.message.includes('Invalid user data')) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw error;
      }
    }
    
    throw new Error('Login failed. Please try again.');
  }
}

export async function logout(navigation: any): Promise<void> {
  try {
    await AsyncStorage.multiRemove([USER_STORAGE_KEY, TOKEN_STORAGE_KEY]);
    navigation.navigate("login");
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Failed to logout. Please try again.');
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function isLoggedIn(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user !== null;
  } catch (error) {
    console.error('Check login status error:', error);
    return false;
  }
}

async function storeUserData(user: User, token?: string): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    if (token) {
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  } catch (error) {
    console.error('Store user data error:', error);
    throw new Error('Failed to save user session');
  }
}

export async function getStoredToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Get stored token error:', error);
    return null;
  }
}

export async function validateUserSession(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
}

export async function register(userData: RegisterData): Promise<User> {
  try {
    // Input validation
    if (!userData.username || !userData.password) {
      throw new Error('Username and password are required');
    }

    // Validate username format (email)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.username.trim())) {
      throw new Error('Username must be a valid email address');
    }

    // Validate password length
    if (userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUsersResponse = await api.get('/users');
    const existingUsers = existingUsersResponse.data;
    
    const userExists = existingUsers.find((u: User) => u.username === userData.username.trim());
    if (userExists) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser = {
      username: userData.username.trim(),
      password: userData.password
    };

    // Make API call to register user
    const response = await api.post('/users', newUser);
    
    if (!response.data) {
      throw new Error('Registration failed. Please try again.');
    }

    const registeredUser = response.data;

    return registeredUser;
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('Network Error')) {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Request timeout. Please try again.');
      } else if (error.message.includes('already exists')) {
        throw new Error('An account with this email already exists');
      } else if (error.message.includes('email address') || 
                 error.message.includes('Password must be') ||
                 error.message.includes('required')) {
        throw error; // Re-throw validation errors as-is
      } else {
        throw error;
      }
    }
    
    throw new Error('Registration failed. Please try again.');
  }
}
