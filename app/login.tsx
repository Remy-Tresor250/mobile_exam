import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import { login } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingIndicator from '@/components/LoadingIndicator';

interface ValidationErrors {
  username?: string;
  password?: string;
}

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login: setAuthUser } = useAuth();

  const validateFields = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    // Username validation
    if (!username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    } else if (username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters long';
      isValid = false;
    } else if (username.trim().length > 50) {
      errors.username = 'Username must be less than 50 characters';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username.trim())) {
      errors.username = 'Username must be a valid email address';
      isValid = false;
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
      isValid = false;
    } else if (password.length > 128) {
      errors.password = 'Password must be less than 128 characters';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleLogin = async () => {
    // Clear previous errors
    setError(null);
    setValidationErrors({});

    // Validate fields
    if (!validateFields()) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Trim username and attempt login
      const trimmedUsername = username.trim();
      const user = await login(trimmedUsername, password);
      
      // Update auth context with user data
      setAuthUser(user);
      
      // Success - navigate to home
      router.replace('/(tabs)/home');
    } catch (err) {
      if (err instanceof Error) {
        // Handle specific error types
        if (err.message.includes('User not found') || err.message.includes('Invalid username or password')) {
          setError('Invalid username or password. Please check your credentials.');
        } else if (err.message.includes('Network Error') || err.message.includes('timeout')) {
          setError('Network error. Please check your internet connection and try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    // Clear username validation error when user starts typing
    if (validationErrors.username) {
      setValidationErrors(prev => ({ ...prev, username: undefined }));
    }
    // Clear general error
    if (error) {
      setError(null);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    // Clear password validation error when user starts typing
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: undefined }));
    }
    // Clear general error
    if (error) {
      setError(null);
    }
  };

  const navigateToRegister = () => {
    router.push('/register');
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/4386442/pexels-photo-4386442.jpeg' }}
          style={styles.headerImage}
        />
        <View style={styles.overlay} />
        <Text style={styles.title}>Personal Finance Tracker</Text>
        <Text style={styles.subtitle}>Manage your expenses with ease</Text>
      </View>

      <View style={styles.form}>
        {error && <ErrorMessage message={error} />}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[
              styles.input,
              validationErrors.username && styles.inputError
            ]}
            value={username}
            onChangeText={handleUsernameChange}
            placeholder="Enter your username"
            autoCapitalize="none"
            autoComplete="username"
            autoCorrect={false}
            maxLength={50}
          />
          {validationErrors.username && (
            <Text style={styles.errorText}>{validationErrors.username}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[
              styles.input,
              validationErrors.password && styles.inputError
            ]}
            value={password}
            onChangeText={handlePasswordChange}
            placeholder="Enter your password"
            secureTextEntry
            autoComplete="password"
            autoCorrect={false}
            maxLength={128}
          />
          {validationErrors.password && (
            <Text style={styles.errorText}>{validationErrors.password}</Text>
          )}
        </View>

        <Pressable 
          style={[
            styles.button,
            (isLoading || !username.trim() || !password) && styles.buttonDisabled
          ]} 
          onPress={handleLogin}
          disabled={isLoading || !username.trim() || !password}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </Pressable>

        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Don't have an account? </Text>
          <Pressable onPress={navigateToRegister}>
            <Text style={styles.link}>Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    height: 240,
    justifyContent: 'flex-end',
    padding: 24,
    position: 'relative',
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    opacity: 0.9,
  },
  form: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  linkText: {
    color: '#64748b',
    fontSize: 14,
  },
  link: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
});