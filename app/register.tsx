import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { register } from '@/services/auth';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingIndicator from '@/components/LoadingIndicator';

interface ValidationErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateFields = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    // Username validation (email format)
    if (!username.trim()) {
      errors.username = 'Email is required';
      isValid = false;
    } else if (username.trim().length < 3) {
      errors.username = 'Email must be at least 3 characters long';
      isValid = false;
    } else if (username.trim().length > 50) {
      errors.username = 'Email must be less than 50 characters';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username.trim())) {
      errors.username = 'Please enter a valid email address';
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

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleRegister = async () => {
    // Clear previous messages
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});

    // Validate fields
    if (!validateFields()) {
      return;
    }

    try {
      setIsLoading(true);

      // Trim username and attempt registration
      const trimmedUsername = username.trim();
      await register({ username: trimmedUsername, password });

      // Success message
      setSuccessMessage(
        'Account created successfully! Redirecting to login...'
      );

      // Navigate to login after a short delay
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        // Handle specific error types
        if (err.message.includes('already exists')) {
          setError(
            'An account with this email already exists. Please use a different email or try logging in.'
          );
        } else if (
          err.message.includes('Network Error') ||
          err.message.includes('timeout')
        ) {
          setError(
            'Network error. Please check your internet connection and try again.'
          );
        } else if (
          err.message.includes('email address') ||
          err.message.includes('Password must be') ||
          err.message.includes('required')
        ) {
          setError(err.message);
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
    // Clear validation errors when user starts typing
    if (validationErrors.username) {
      setValidationErrors((prev) => ({ ...prev, username: undefined }));
    }
    if (error) setError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    // Clear validation errors when user starts typing
    if (validationErrors.password) {
      setValidationErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (error) setError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    // Clear validation errors when user starts typing
    if (validationErrors.confirmPassword) {
      setValidationErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
    if (error) setError(null);
    if (successMessage) setSuccessMessage(null);
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: 'https://images.pexels.com/photos/4386442/pexels-photo-4386442.jpeg',
          }}
          style={styles.headerImage}
        />
        <View style={styles.overlay} />
        <Text style={styles.title}>Join Finance Tracker</Text>
        <Text style={styles.subtitle}>Create your account to get started</Text>
      </View>

      <View style={styles.form}>
        {error && <ErrorMessage message={error} />}

        {successMessage && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[
              styles.input,
              validationErrors.username && styles.inputError,
            ]}
            value={username}
            onChangeText={handleUsernameChange}
            placeholder="Enter your email address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
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
              validationErrors.password && styles.inputError,
            ]}
            value={password}
            onChangeText={handlePasswordChange}
            placeholder="Create a password (min 6 characters)"
            secureTextEntry
            autoComplete="password-new"
            autoCorrect={false}
            maxLength={128}
          />
          {validationErrors.password && (
            <Text style={styles.errorText}>{validationErrors.password}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={[
              styles.input,
              validationErrors.confirmPassword && styles.inputError,
            ]}
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            placeholder="Confirm your password"
            secureTextEntry
            autoComplete="password-new"
            autoCorrect={false}
            maxLength={128}
          />
          {validationErrors.confirmPassword && (
            <Text style={styles.errorText}>
              {validationErrors.confirmPassword}
            </Text>
          )}
        </View>

        <Pressable
          style={[
            styles.button,
            (isLoading || !username.trim() || !password || !confirmPassword) &&
              styles.buttonDisabled,
          ]}
          onPress={handleRegister}
          disabled={
            isLoading || !username.trim() || !password || !confirmPassword
          }
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </Pressable>

        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Already have an account? </Text>
          <Pressable onPress={navigateToLogin}>
            <Text style={styles.link}>Sign In</Text>
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
  successContainer: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#15803d',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#16a34a',
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
