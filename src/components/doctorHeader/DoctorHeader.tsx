import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { ChevronDown, LockKeyhole } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

const DoctorHeader = () => {
  const insets = useSafeAreaInsets();

  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <View>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {/* Hospital */}
        <View style={styles.hospitalContainer}>
          <Text style={styles.brand}>
            ZYNO <Text style={styles.brandLight}>HIMS</Text>
          </Text>

          <TouchableOpacity style={styles.hospitalRow}>
            <Text style={styles.hospitalName} numberOfLines={1}>
              {user?.entityList?.[0]?.entity_name}
            </Text>
            <ChevronDown size={14} color="#8195B1" />
          </TouchableOpacity>
        </View>

        {/* Doctor */}
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.doctorProfile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.first_name?.charAt(0)}
                {user?.last_name?.charAt(0)}
              </Text>
            </View>

            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName} numberOfLines={1}>
                {user?.title} {user?.first_name} {user?.last_name}
              </Text>

              <Text style={styles.employeeId}>{user?.employee_code}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.lockButton}>
            <LockKeyhole size={19} color="#455B79" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DoctorHeader;

const styles = StyleSheet.create({
  header: {
    minHeight: 85,
    paddingHorizontal: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5EAF1',
  },
  hospitalContainer: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  brand: {
    fontSize: 19,
    fontWeight: '900',
    color: '#06477F',
  },
  brandLight: {
    fontSize: 16,
    fontWeight: '600',
    color: '#405F86',
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  hospitalName: {
    fontSize: 12,
    color: '#5273A1',
    flexShrink: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexShrink: 1,
  },
  doctorProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E8F1',
    borderRadius: 25,
    padding: 4,
    paddingRight: 8,
    gap: 6,
    maxWidth: 170,
    flexShrink: 1,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCEAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0756A3',
  },
  doctorInfo: {
    flexShrink: 1,
  },
  doctorName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#152B49',
  },
  employeeId: {
    fontSize: 10,
    color: '#0865E5',
  },
  lockButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F4F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
