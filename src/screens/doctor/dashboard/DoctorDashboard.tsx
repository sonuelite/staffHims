import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';
import type {RootState} from '../../../store/store';
import {logout} from '../../../store/authSlice';
import {clearStaffSession} from '../../../utils/authSession';

const DoctorDashboard = () => {
  const dispatch = useDispatch();

  const user = useSelector(
    (state: RootState) => state.auth.user,
  );

  const handleLogout = async () => {
    try {
      await clearStaffSession();

      dispatch(logout());
    } catch (error) {
      Alert.alert('Error', 'Unable to logout. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Welcome, {user?.title} {user?.first_name} {user?.last_name}
      </Text>

      <Text>Employee ID: {user?.employee_id}</Text>

      <Text>Employee Code: {user?.employee_code}</Text>

      <Text>Role: {user?.role_master_name}</Text>

      <Text>Email: {user?.employee_official_email}</Text>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#D32F2F',
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default DoctorDashboard;