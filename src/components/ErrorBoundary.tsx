import React from 'react';
import { ScrollView, Text, View } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Root-level safety net. Without this, any uncaught error thrown during render (a bad env var,
 * a native module missing on web, a third-party library incompatibility) takes down the whole
 * React tree and leaves a blank white screen with no way to diagnose it from the deployed app
 * itself. This renders a visible error instead, so "blank screen" becomes "readable stack trace".
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[lahja] Uncaught render error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#12151c' }}
        >
          <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 16 }}>⚠️</Text>
          <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 12 }}>
            Something went wrong
          </Text>
          <Text style={{ color: '#f5f6f8', fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
            {this.state.error.message}
          </Text>
          <View style={{ backgroundColor: '#1c2029', borderRadius: 12, padding: 12 }}>
            <Text style={{ color: '#9aa1ae', fontSize: 11, fontFamily: 'monospace' }}>{this.state.error.stack}</Text>
          </View>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}
