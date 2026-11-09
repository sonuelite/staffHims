import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import type { RootState } from '../store/store';

import LoginScreen from '../screens/auth/signIn/LoginScreen';
import DoctorTabNavigator from './DoctorTabNavigator';
import ConsultScreen from '../screens/doctor/consult/ConsultScreen';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen
              name="DoctorDashboard"
              component={DoctorTabNavigator}
            />
            {/* <Stack.Screen name="ConsultScreen" component={ConsultScreen} /> */}
          </>
        ) : (
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;
