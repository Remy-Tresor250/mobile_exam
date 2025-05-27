import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingIndicatorProps {
  size?: number | 'small' | 'large';
  color?: string;
}

export default function LoadingIndicator({ 
  size = 'large', 
  color = '#3498db' 
}: LoadingIndicatorProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});