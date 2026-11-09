import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import type {StaffUser} from '../store/authSlice';

const USER_KEY = 'staff_user';
const TOKEN_SERVICE = 'staff_auth';

export const saveStaffSession = async (
  user: StaffUser,
  accessToken: string,
) => {
  await Keychain.setGenericPassword('staff', accessToken, {
    service: TOKEN_SERVICE,
  });

  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getStaffSession = async () => {
  const [savedUser, credentials] = await Promise.all([
    AsyncStorage.getItem(USER_KEY),
    Keychain.getGenericPassword({
      service: TOKEN_SERVICE,
    }),
  ]);

  if (!savedUser || !credentials) {
    return null;
  }

  return {
    user: JSON.parse(savedUser) as StaffUser,
    accessToken: credentials.password,
  };
};

export const clearStaffSession = async () => {
  await AsyncStorage.removeItem(USER_KEY);

  await Keychain.resetGenericPassword({
    service: TOKEN_SERVICE,
  });
};