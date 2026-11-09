import CryptoJS from 'crypto-js';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackHeader from '../../../components/backHeader/BackHeader';
import { Input } from '../../../components/input/Input';
import { Mail, Phone, Lock } from 'lucide-react-native';
import {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Shadows,
  Spacing,
} from '../../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../../components/customButton/CustomButton';
import { ColorConstants } from '../../../constants/colorConstants';
import { Fontconstants } from '../../../constants/fontConstants';
import { scale } from '../../../utils/scale';
import Divider from '../../../components/divider/Divider';
import { staffLogin } from '../../../network/api';
import { useDispatch } from 'react-redux';
import { setLogin } from '../../../store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import {useSelector} from 'react-redux';
import type {RootState} from '../../../store/store';
import {saveStaffSession} from '../../../utils/authSession';
// import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const LoginScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'email' | 'mobile'>('email');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  const dispatch = useDispatch();

  const handleSendOtp = async () => {
    console.log('handleSendOtp', mobile);
  };
  useEffect(() => {
  if (user) {
    console.log('Redux Employee ID:', user.employee_id);
    console.log('Redux Staff Name:', user.first_name);
    console.log('Redux Role:', user.role_master_name);
  }
}, [user]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      // Encrypt credentials like Angular web application
      const encryptedEmail = CryptoJS.AES.encrypt(
        email.trim(),
        'email',
      ).toString();

      const encryptedPassword = CryptoJS.AES.encrypt(
        password,
        'password',
      ).toString();

      // console.log('Encrypted Credentials:', {
      //   encryptedEmail,
      //   encryptedPassword,
      // });
      // Call Login API
      const response = await staffLogin(encryptedEmail, encryptedPassword);

      //     console.log('Login successful res:', response);

      // // Check access
      // if (!response.hasAccess || !response.employee_id) {
      //   Alert.alert('Error', 'You do not have access');
      //   return;
      // }

      // Alert.alert('Success', 'Login successful');
      if (
        !response.hasAccess ||
        !response.employee_id ||
        !response.accessToken
      ) {
        Alert.alert('Error', 'Invalid login or access denied');
        return;
      }

      // const { accessToken, ...staffData } = response;

      // // 1. Save token securely
      // await Keychain.setGenericPassword('staff', accessToken, {
      //   service: 'staff_auth',
      // });

      // // 2. Save staff details locally
      // await AsyncStorage.setItem('staff_user', JSON.stringify(staffData));

      // // 3. Save login response in Redux
      // dispatch(
      //   setLogin({
      //     user: staffData,
      //     accessToken,
      //   }),
      // );

      const {accessToken, ...staffData} = response;

      await saveStaffSession(staffData, accessToken);

      dispatch(
        setLogin({
          user: staffData,
          accessToken,
        }),
      );

      console.log('Staff login data saved successfully');

      Alert.alert('Success', 'Login successful');

      // Next: save accessToken and navigate to dashboard
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Something went wrong. Please try again.';

      console.log('Login Error:', message);

      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      <BackHeader />

      <ScrollView
        // contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Image
            source={require('../../../assets/image/himsLogo.png')}
            style={styles.himsLogoStyle}
          />
        </View>

        <Text style={styles.title}>Sign In</Text>

        <Text style={styles.subtitle}>Access your healthcare account</Text>
        <View style={styles.modeSelector}>
          <TouchableOpacity
            onPress={() => {
              setMode('email');
              setShowOTP(false);
              setOtp('');
            }}
            style={[styles.modeBtn, mode === 'email' && styles.modeBtnActive]}
          >
            <Text
              style={[
                styles.modeText,
                mode === 'email' && styles.modeTextActive,
              ]}
            >
              Email
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setMode('mobile');
              setPassword('');
            }}
            style={[styles.modeBtn, mode === 'mobile' && styles.modeBtnActive]}
          >
            <Text
              style={[
                styles.modeText,
                mode === 'mobile' && styles.modeTextActive,
              ]}
            >
              Mobile + OTP
            </Text>
          </TouchableOpacity>
        </View>
        {mode === 'email' ? (
          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            icon={<Mail size={20} color={Colors.neutral[400]} />}
          />
        ) : (
          <>
            <Input
              label="Mobile Number"
              value={mobile}
              onChangeText={setMobile}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              icon={<Phone size={20} color={Colors.neutral[400]} />}
            />

            {showOTP && (
              <Input
                label="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                placeholder="1234"
                keyboardType="numeric"
              />
            )}
          </>
        )}
        {mode === 'email' && (
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            icon={<Lock size={20} color={Colors.neutral[400]} />}
          />
        )}
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {mode === 'mobile' && !showOTP && (
          <CustomButton
            disable={otpLoading}
            title={otpLoading ? 'Sending...' : 'Send OTP'}
            topHeight={22}
            bgColor={ColorConstants.BTNCOLOR}
            fontsize={14}
            fontfamily={Fontconstants.SEMIBOLD}
            bordRadius={scale(12)}
            onPress={handleSendOtp}
          />
        )}

        <View
          style={{
            height: mode === 'mobile' && !showOTP ? 0 : Spacing.md,
          }}
        />
        {/* {mode === 'email' && (
          <CustomButton
            disable={false}
            title="Sign In"
            topHeight={22}
            bgColor={ColorConstants.BTNCOLOR}
            fontsize={14}
            fontfamily={Fontconstants.SEMIBOLD}
            bordRadius={scale(12)}
            onPress={handleLogin}
          />
        )} */}
        {mode === 'email' && (
          <View style={styles.signInButtonContainer}>
            <CustomButton
              disable={loading}
              title={loading ? '' : 'Sign In'}
              topHeight={0}
              bgColor={ColorConstants.BTNCOLOR}
              fontsize={14}
              fontfamily={Fontconstants.SEMIBOLD}
              bordRadius={scale(12)}
              onPress={handleLogin}
            />

            {loading && (
              <View pointerEvents="none" style={styles.signInLoaderContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}
          </View>
        )}
        {showOTP && mode === 'mobile' && (
          <CustomButton
            disable={false}
            title="Verify & Login"
            topHeight={22}
            bgColor={ColorConstants.BLACK}
            fontsize={14}
            fontfamily={Fontconstants.SEMIBOLD}
            bordRadius={scale(12)}
            onPress={() => console.log('Verify & Login')}
          />
        )}
        <Divider txt="OR" topHeight={24} />

        <View style={styles.registerView}>
          <Text style={styles.dontAccountTxt}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.registerTxt}>Register</Text>
          </TouchableOpacity>
        </View>

        <CustomButton
          disable={false}
          title="Continue as Guest (Demo)"
          topHeight={14}
          bgColor={Colors.neutral[200]}
          txtColor={ColorConstants.BLACK}
          fontsize={14}
          fontfamily={Fontconstants.SEMIBOLD}
          bordRadius={scale(12)}
          onPress={() => console.log('Continue as Guest (Demo)')}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(24),
    backgroundColor: Colors.neutral[50],
  },
  himsLogoStyle: {
    width: scale(60),
    height: scale(60),
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },

  appName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },

  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },

  subtitle: {
    fontSize: FontSize.base,
    color: Colors.neutral[400],
    marginTop: Spacing.xs,
  },

  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.lg,
  },

  modeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[100],
    borderRadius: Radius.md,
    padding: 3,
    marginVertical: Spacing.md,
  },

  modeBtn: {
    flex: 1,
    paddingVertical: Spacing.md - 2,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },

  modeBtnActive: {
    backgroundColor: Colors.neutral[0],
    ...Shadows.sm,
  },

  modeText: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    fontWeight: FontWeight.medium,
  },

  modeTextActive: {
    color: Colors.primary[700],
    fontWeight: FontWeight.semibold,
  },

  forgotText: {
    fontSize: FontSize.sm,
    color: Colors.primary[600],
    fontWeight: FontWeight.semibold,
    textAlign: 'right',
    marginBottom: Spacing.lg,
  },
  registerView: {
    flexDirection: 'row',
    marginTop: scale(16),
    alignSelf: 'center',
  },
  dontAccountTxt: {
    fontSize: 14,
    fontFamily: Fontconstants.MEDIUM,
    color: ColorConstants.GRAY_Heading,
  },
  registerTxt: {
    fontSize: 14,
    fontFamily: Fontconstants.BOLD,
    color: ColorConstants.BTNCOLOR,
  },
  signInButtonContainer: {
    position: 'relative',
    marginTop: scale(22),
  },

  signInLoaderContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LoginScreen;
