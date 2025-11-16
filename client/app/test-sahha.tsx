import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { testSahhaSDK } from '@/lib/sahha/testSahhaSDK';

export default function TestSahhaScreen() {
  const [results, setResults] = useState<{
    sdkAvailable: boolean;
    configurationWorking: boolean;
    permissionsWorking: boolean;
    errors: string[];
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const runTest = async () => {
    setIsTesting(true);
    const testResults = await testSahhaSDK();
    setResults(testResults);
    setIsTesting(false);
  };

  useEffect(() => {
    // Auto-run test on mount
    runTest();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sahha SDK Test</Text>
        <Text style={styles.subtitle}>Testing basic SDK functionality</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isTesting && styles.buttonDisabled]}
        onPress={runTest}
        disabled={isTesting}
      >
        <Text style={styles.buttonText}>
          {isTesting ? 'Testing...' : 'Run Test Again'}
        </Text>
      </TouchableOpacity>

      {results && (
        <View style={styles.results}>
          <Text style={styles.sectionTitle}>Test Results</Text>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>SDK Available:</Text>
            <Text style={[styles.resultValue, results.sdkAvailable && styles.success]}>
              {results.sdkAvailable ? '✅ Yes' : '❌ No'}
            </Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Configuration:</Text>
            <Text style={[styles.resultValue, results.configurationWorking && styles.success]}>
              {results.configurationWorking ? '✅ Working' : '❌ Failed'}
            </Text>
          </View>

          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Permissions:</Text>
            <Text
              style={[
                styles.resultValue,
                results.permissionsWorking ? styles.success : styles.warning,
              ]}
            >
              {results.permissionsWorking ? '✅ Granted' : '⚠️ Not Granted'}
            </Text>
          </View>

          {results.errors.length > 0 && (
            <View style={styles.errors}>
              <Text style={styles.errorTitle}>Errors:</Text>
              {results.errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>
                  {index + 1}. {error}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Summary</Text>
            {results.sdkAvailable && results.configurationWorking ? (
              <Text style={styles.summaryText}>
                ✅ SDK is working! The SDK is properly installed and configured.
                {'\n\n'}
                Next step: Test authentication once backend token endpoint is working.
              </Text>
            ) : (
              <Text style={styles.summaryText}>
                ❌ SDK has issues. Check the errors above and ensure:
                {'\n'}
                • Native build is completed (npx expo run:ios)
                {'\n'}
                • Running development build (not Expo Go)
                {'\n'}
                • Pods are installed (cd ios && pod install)
              </Text>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    margin: 20,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultLabel: {
    fontSize: 16,
    color: '#333',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  success: {
    color: '#34C759',
  },
  warning: {
    color: '#FF9500',
  },
  errors: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFF3F3',
    borderRadius: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 5,
  },
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
});

