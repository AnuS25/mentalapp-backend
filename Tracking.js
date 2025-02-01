import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook

const TrackingDataScreen = () => {
  const navigation = useNavigation(); // Get navigation using the hook

  const [trackingData, setTrackingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch tracking data
  const fetchTrackingData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        alert('User is not logged in!');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        'https://mentalapp-backend.onrender.com/api/tracking',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setTrackingData(response.data.trackingData);
      } else {
        alert('Failed to fetch tracking data');
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      setError('An error occurred while fetching tracking data.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tracking data when the component mounts
  useEffect(() => {
    fetchTrackingData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading your mental health progress...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Your Tracking Data</Text>
      {trackingData.length > 0 ? (
        <FlatList
          data={trackingData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Text style={styles.title}>Tracking Entry {index + 1}</Text>
              <Text style={styles.dataText}>To-Do List: {item.todoList.join(', ')}</Text>
              <Text style={styles.dataText}>
                Morning Routine: {item.morningRoutine ? 'Completed' : 'Not Completed'}
              </Text>
              <Text style={styles.dataText}>
                Water Intake: {item.waterIntake} glasses
              </Text>
              <Text style={styles.dataText}>
                Gratitude: {item.gratitude || 'Not Provided'}
              </Text>
              <Text style={styles.dataText}>Sleep Hours: {item.sleepHours} hours</Text>
              <Text style={styles.dataText}>Productivity: {item.productivity}</Text>
              <Text style={styles.dataText}>Mood: {item.mood || 'Not Provided'}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noDataText}>No tracking data found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f9', // Soft background color
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4A90E2', // Calming color
  },
  card: {
    marginBottom: 25,
    padding: 20,
    backgroundColor: '#ffffff', // White background for each card
    borderRadius: 15,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    color: '#4A90E2',
  },
  dataText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
  },
  noDataText: {
    fontSize: 18,
    color: '#888',
  },
  loadingText: {
    fontSize: 22,
    color: '#888',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 22,
    color: '#D8000C', // Red color for errors
    fontStyle: 'italic',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default TrackingDataScreen;
