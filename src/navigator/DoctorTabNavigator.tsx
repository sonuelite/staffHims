
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  Users,
  Stethoscope,
  ClipboardList,
  UserRound,
} from 'lucide-react-native';
import QueueScreen from '../screens/doctor/queue/QueueScreen';
import ConsultScreen from '../screens/doctor/consult/ConsultScreen';
import RxLedgerScreen from '../screens/doctor/rxLedger/RxLedgerScreen';
import SelfServiceScreen from '../screens/doctor/selfService/SelfServiceScreen';

export type DoctorTabParamList = {
  Queue: undefined;
  Consult: undefined;
  RxLedger: undefined;
  SelfService: undefined;
};

const Tab = createBottomTabNavigator<DoctorTabParamList>();

export default function DoctorTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Queue"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1769AA',
        tabBarInactiveTintColor: '#8A94A6',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarStyle: {
        //   height: 65,
        //   paddingTop: 7,
        //   paddingBottom: 8,
        //   backgroundColor: '#FFFFFF',
        //   borderTopColor: '#E5E7EB',
        },
      }}>
      <Tab.Screen
        name="Queue"
        component={QueueScreen}
        options={{
          tabBarLabel: 'Queue',
          tabBarIcon: ({color, size}) => (
            <Users color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Consult"
        component={ConsultScreen}
        options={{
          tabBarLabel: 'Consult',
          tabBarIcon: ({color, size}) => (
            <Stethoscope color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="RxLedger"
        component={RxLedgerScreen}
        options={{
          tabBarLabel: 'Rx Ledger',
          tabBarIcon: ({color, size}) => (
            <ClipboardList color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="SelfService"
        component={SelfServiceScreen}
        options={{
          tabBarLabel: 'Self Service',
          tabBarIcon: ({color, size}) => (
            <UserRound color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
