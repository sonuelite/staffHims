// import React, { useMemo, useState } from 'react';
// import React, {useEffect, useMemo, useState} from 'react';
import React, {useCallback, useMemo, useState} from 'react';
// import {useFocusEffect} from '@react-navigation/native';
import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
// import {NativeStackNavigationProp} from '@react-navigation/native-stack';
// import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import { DoctorTabParamList } from '../../../navigator/DoctorTabNavigator';
import { setSelectedPatient } from '../../../store/consultSlice';
import {RefreshControl} from 'react-native';
import {ActivityIndicator} from 'react-native';
import {getDoctorOpdDashboard} from '../../../network/api';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  ChevronRight,
  Clock3,
  Users,
  AlertTriangle,
  Circle,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import DoctorHeader from '../../../components/doctorHeader/DoctorHeader';
import SearchBar from '../../../components/searchBar/SearchBar';


type QueueStatus = 'Waiting' | 'In Consult' | 'Completed';
type FilterStatus = 'All' | QueueStatus;

// interface QueuePatient {
//   id: number;
//   token: string;
//   name: string;
//   department: string;
//   gender: string;
//   age: number;
//   uhid: string;
//   status: QueueStatus;
//   prescription: string;
//   allergy?: string;
//   hasAlert?: boolean;
// }

export interface QueuePatient {
  visit_id: number;
  token_no: string;
  patient_id: number;
  uhid: string;
  uuid: string;
  patient_name: string;
  gender: string;
  age: number;
  department_name: string;
  demographics_text: string;
  phone: string;
  consultation_status: string;
  wait_time_minutes: number;
  visit_date: string;
  created_at: string;
  previous_medicines: string | null;
  rx_diagnosis: string | null;
  rx_display: string | null;
  rx_number: string | null;
  allergies: string | null;
  has_allergy: boolean;
}

// type RootStackParamList = {
//   DoctorDashboard: undefined;
//   ConsultScreen: {
//     patient: QueuePatient;
//   };
//   LoginScreen: undefined;
// };

interface DoctorDashboardResponse {
  success: boolean;
  message: string;
  doctor_info: {
    employee_id: number;
    employee_code: string;
    doctor_name: string;
    department_name: string | null;
  };
  metrics: {
    avg_wait_time: string;
    total_today: number;
    allergies_count: number;
  };
  counts: {
    all: number;
    waiting: number;
    in_consult: number;
    completed: number;
  };
  total_showing: number;
  data: QueuePatient[];
}

// const patients: QueuePatient[] = [
//   {
//     id: 1,
//     token: '01',
//     name: 'sonu2 yadav2',
//     department: 'Neurology',
//     gender: 'Male',
//     age: 12,
//     uhid: 'UHID-2026-00011',
//     status: 'Waiting',
//     prescription: 'Pediatric Migraine with Aura; Rule out...',
//     allergy: 'Penicillins & Beta-Lactams',
//     hasAlert: true,
//   },
//   {
//     id: 2,
//     token: '02',
//     name: 'Nishant Ranjan',
//     department: 'General Medicine',
//     gender: 'Male',
//     age: 34,
//     uhid: 'UHID-2026-00023',
//     status: 'Waiting',
//     prescription: 'Community-Acquired Lower Respiratory...',
//     allergy: 'NSAIDs (Ibuprofen / Diclofenac)',
//     hasAlert: true,
//   },
//   {
//     id: 3,
//     token: '03',
//     name: 'Rahul Sharma',
//     department: 'Orthopedics',
//     gender: 'Male',
//     age: 42,
//     uhid: 'UHID-2026-00031',
//     status: 'In Consult',
//     prescription: 'Right Inguinal Hernia; Secondary...',
//     allergy: 'Penicillins & Beta-Lactams',
//   },
//   {
//     id: 4,
//     token: '04',
//     name: 'Eleanor Vance',
//     department: 'Diabetology / Podiatry',
//     gender: 'Female',
//     age: 67,
//     uhid: 'UHID-2026-00048',
//     status: 'Waiting',
//     prescription: 'Type 2 Diabetes Mellitus',
//     hasAlert: true,
//   },
//   {
//     id: 5,
//     token: '05',
//     name: 'Priya Verma',
//     department: 'Cardiology',
//     gender: 'Female',
//     age: 29,
//     uhid: 'UHID-2026-00052',
//     status: 'Completed',
//     prescription: 'Routine Cardiac Follow-up',
//   },
// ];

const filters: FilterStatus[] = ['All', 'Waiting', 'In Consult', 'Completed'];

export default function QueueScreen() {
  const insets = useSafeAreaInsets();
    const {user, accessToken} = useSelector(
  (state: RootState) => state.auth,
);

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('All');

  // const user = useSelector((state: RootState) => state.auth.user);


// const [dashboardData, setDashboardData] = useState<any>(null);
const [dashboardData, setDashboardData] =
  useState<DoctorDashboardResponse | null>(null);

const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [refreshing, setRefreshing] = useState(false);
// const navigation =
//   useNavigation<NativeStackNavigationProp>();
// const navigation =
//   useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const navigation =
  useNavigation<BottomTabNavigationProp<DoctorTabParamList>>();

const dispatch = useDispatch<AppDispatch>();

// console.log('dashboardData-->', dashboardData);

// useEffect(() => {
//   if (!accessToken) return;

//   let active = true;

//   const fetchDoctorDashboard = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await getDoctorOpdDashboard(
//         accessToken,
//         'all',
//       );

//       if (!active) return;

//       console.log(
//         'Doctor OPD Dashboard Response:',
//         JSON.stringify(response, null, 2),
//       );

//       setDashboardData(response);
//     } catch (error: any) {
//       if (!active) return;

//       const message =
//         error.response?.data?.message ||
//         error.message ||
//         'Failed to fetch dashboard';

//       console.log('Doctor Dashboard API Error:', message);
//       setError(message);
//     } finally {
//       if (active) {
//         setLoading(false);
//       }
//     }
//   };

//   fetchDoctorDashboard();

//   return () => {
//     active = false;
//   };
// }, [accessToken]);


const fetchDoctorDashboard = useCallback(
  async (isRefreshing = false) => {
    if (!accessToken) return;

    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response: DoctorDashboardResponse =
        await getDoctorOpdDashboard(accessToken, 'all');

      console.log(
        'Doctor OPD Dashboard Response:',
        JSON.stringify(response, null, 2),
      );

      setDashboardData(response);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch dashboard';

      console.log('Doctor Dashboard API Error:', message);
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  },
  [accessToken],
);

// Refresh automatically when QueueScreen gets focus
useFocusEffect(
  useCallback(() => {
    fetchDoctorDashboard();

    // No cleanup required for this basic version
  }, [fetchDoctorDashboard]),
);

// Refresh manually when user pulls down
const onRefresh = useCallback(() => {
  fetchDoctorDashboard(true);
}, [fetchDoctorDashboard]);


  console.log('User info:', user);
  console.log('Entity Name:', user?.entityList?.[0]?.entity_name);
  console.log('Access Token Available:', !!accessToken);

  // const counts = useMemo(
  //   () => ({
  //     All: patients.length,
  //     Waiting: patients.filter(p => p.status === 'Waiting').length,
  //     'In Consult': patients.filter(p => p.status === 'In Consult').length,
  //     Completed: patients.filter(p => p.status === 'Completed').length,
  //   }),
  //   [],
  // );

const patients = dashboardData?.data ?? [];

  const counts = {
  All: dashboardData?.counts.all ?? 0,
  Waiting: dashboardData?.counts.waiting ?? 0,
  'In Consult': dashboardData?.counts.in_consult ?? 0,
  Completed: dashboardData?.counts.completed ?? 0,
};

  // const filteredPatients = useMemo(() => {
  //   const query = search.trim().toLowerCase();

  //   return patients.filter(patient => {
  //     const matchesFilter =
  //       activeFilter === 'All' || patient.status === activeFilter;

  //     const matchesSearch =
  //       patient.name.toLowerCase().includes(query) ||
  //       patient.uhid.toLowerCase().includes(query);

  //     return matchesFilter && matchesSearch;
  //   });
  // }, [search, activeFilter]);

  const filteredPatients = useMemo(() => {
  const query = search.trim().toLowerCase();

  return patients.filter(patient => {
    const matchesFilter =
      activeFilter === 'All' ||
      patient.consultation_status.toLowerCase() ===
        activeFilter.toLowerCase();

    const matchesSearch =
      patient.patient_name.toLowerCase().includes(query) ||
      patient.uhid.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });
}, [dashboardData, search, activeFilter]);

  // const renderPatient = (patient: QueuePatient) => (
  //   <TouchableOpacity
  //     key={patient.id}
  //     style={styles.patientCard}
  //     activeOpacity={0.85}
  //     onPress={() => {
  //       // Navigate to patient encounter details here
  //     }}
  //   >
  //     <View style={styles.patientMain}>
  //       <View style={styles.tokenBox}>
  //         <Text style={styles.tokenText}>{patient.token}</Text>
  //       </View>

  //       <View style={styles.patientInfo}>
  //         <View style={styles.nameRow}>
  //           <Text style={styles.patientName} numberOfLines={1}>
  //             {patient.name}
  //           </Text>
  //           {patient.hasAlert && <View style={styles.alertDot} />}
  //         </View>

  //         <Text style={styles.patientDetails} numberOfLines={1}>
  //           {patient.department} · {patient.gender}, {patient.age}y
  //         </Text>

  //         <Text style={styles.uhid}>{patient.uhid}</Text>
  //       </View>

  //       <View style={styles.patientActions}>
  //         <View style={styles.statusPill}>
  //           <Text style={styles.statusText}>{patient.status}</Text>
  //         </View>

  //         <View style={styles.openRow}>
  //           <Text style={styles.openText}>Open</Text>
  //           <ChevronRight size={15} color="#B8DAFF" />
  //         </View>
  //       </View>
  //     </View>

  //     <View style={styles.prescriptionRow}>
  //       <Text style={styles.prescriptionText} numberOfLines={1}>
  //         <Text style={styles.rxLabel}>Rx: </Text>
  //         {patient.prescription}
  //       </Text>

  //       {patient.allergy && (
  //         <View style={styles.allergyBadge}>
  //           <AlertTriangle size={14} color="#D97706" />
  //           <Text style={styles.allergyText} numberOfLines={1}>
  //             {patient.allergy}
  //           </Text>
  //         </View>
  //       )}
  //     </View>
  //   </TouchableOpacity>
  // );

  
const renderPatient = (patient: QueuePatient) => (
  <TouchableOpacity
    key={patient.visit_id}
    style={styles.patientCard}
    activeOpacity={0.85}
    onPress={() => {
      // console.log('Visit ID:', patient.visit_id);
      // console.log('Patient ID:', patient.patient_id);
  //       navigation.navigate('ConsultScreen', {
  //   patient,
  // });
        dispatch(setSelectedPatient(patient));
      navigation.navigate('Consult');
    }}>

    <View style={styles.patientMain}>
      <View style={styles.tokenBox}>
        <Text style={styles.tokenText}>
          {patient.token_no}
        </Text>
      </View>

      <View style={styles.patientInfo}>
        <View style={styles.nameRow}>
          <Text
            style={styles.patientName}
            numberOfLines={1}>
            {patient.patient_name}
          </Text>

          {patient.has_allergy && (
            <View style={styles.alertDot} />
          )}
        </View>

        <Text
          style={styles.patientDetails}
          numberOfLines={1}>
          {patient.demographics_text ||
            `${patient.department_name} · ${patient.gender}, ${patient.age}y`}
        </Text>

        <Text style={styles.uhid}>
          {patient.uhid}
        </Text>
      </View>

      <View style={styles.patientActions}>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>
            {patient.consultation_status}
          </Text>
        </View>

        <View style={styles.openRow}>
          <Text style={styles.openText}>Open</Text>
          <ChevronRight
            size={15}
            color="#B8DAFF"
          />
        </View>
      </View>
    </View>

    <View style={styles.prescriptionRow}>
      <Text
        style={styles.prescriptionText}
        numberOfLines={1}>
        <Text style={styles.rxLabel}>Rx: </Text>
        {patient.rx_display || 'No prescription'}
      </Text>

      {patient.has_allergy && !!patient.allergies && (
        <View style={styles.allergyBadge}>
          <AlertTriangle
            size={14}
            color="#D97706"
          />

          <Text
            style={styles.allergyText}
            numberOfLines={1}>
            {patient.allergies}
          </Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

  return (
    <View style={styles.container}>
      <DoctorHeader />
      <View style={styles.mainContainer}>
        <View style={{ flex: 1 }}>
          <View style={styles.banner}>
            <View>
              <Text style={styles.bannerTitle}>OPD Dashboard</Text>
              <Text style={styles.bannerSubtitle}>
                Manage today's consultations
              </Text>
            </View>

            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>

          {/* Stats below banner */}
          {/* <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Clock3 size={15} color="#2563EB" />
              <Text style={styles.statText} numberOfLines={1}>
                Avg Wait: <Text style={styles.statValue}>12m</Text>
              </Text>
            </View>

            <View style={styles.statCard}>
              <Users size={15} color="#455B79" />
              <Text style={styles.statText} numberOfLines={1}>
                Total: <Text style={styles.statValue}>{patients.length}</Text>
              </Text>
            </View>

            <View style={[styles.statCard, styles.warningStat]}>
              <AlertTriangle size={15} color="#D97706" />
              <Text style={styles.warningStatText} numberOfLines={1}>
                Allergies: {patients.filter(p => p.allergy).length}
              </Text>
            </View>
          </View> */}
          
<View style={styles.statsRow}>
  <View style={styles.statCard}>
    <Clock3 size={15} color="#2563EB" />
    <Text style={styles.statText} numberOfLines={1}>
      Avg Wait:{' '}
      <Text style={styles.statValue}>
        {dashboardData?.metrics.avg_wait_time ?? '--'}
      </Text>
    </Text>
  </View>

  <View style={styles.statCard}>
    <Users size={15} color="#455B79" />
    <Text style={styles.statText} numberOfLines={1}>
      Total:{' '}
      <Text style={styles.statValue}>
        {dashboardData?.metrics.total_today ?? 0}
      </Text>
    </Text>
  </View>

  <View style={[styles.statCard, styles.warningStat]}>
    <AlertTriangle size={15} color="#D97706" />
    <Text
      style={styles.warningStatText}
      numberOfLines={1}>
      Allergies: {dashboardData?.metrics.allergies_count ?? 0}
    </Text>
  </View>
</View>


          {/* Search */}
          
            <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or UHID"
            />

          {/* Filters */}
          <View style={styles.filterRow}>
            {filters.map(filter => (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={[
                  styles.filterButton,
                  activeFilter === filter && styles.activeFilter,
                ]}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[
                    styles.filterText,
                    activeFilter === filter && styles.activeFilterText,
                  ]}
                >
                  {filter} ({counts[filter]})
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Encounter heading */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Active Encounters</Text>
              <Circle size={11} fill="#00C48C" color="#00C48C" />
            </View>
            <Text style={styles.showingText}>
              Showing {filteredPatients.length} of {patients.length}
            </Text>
          </View>
          {/* Patient cards */}
          {/* <ScrollView>
            {filteredPatients.length > 0 ? (
              filteredPatients.map(renderPatient)
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No patients found</Text>
              </View>
            )}
          </ScrollView> */}
          
<ScrollView
  style={{flex: 1}}
  contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}
  showsVerticalScrollIndicator={false}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={['#153E6C']}
      tintColor="#153E6C"
    />
  }>
  {loading && !dashboardData ? (
    <View style={styles.emptyContainer}>
      <ActivityIndicator size="large" color="#153E6C" />
      <Text style={styles.emptyText}>
        Loading patients...
      </Text>
    </View>
  ) : error && !dashboardData ? (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{error}</Text>
    </View>
  ) : filteredPatients.length > 0 ? (
    filteredPatients.map(renderPatient)
  ) : (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        No patients found
      </Text>
    </View>
  )}
</ScrollView>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  banner: {
    minHeight: 110,
    borderRadius: 21,
    backgroundColor: '#123F70',
    paddingHorizontal: 20,
    paddingVertical: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E0EDFF',
    marginTop: 5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#54789F',
    backgroundColor: '#285784',
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00D49B',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 9,
    paddingVertical: 15,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F2F6FB',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 7,
  },
  statText: {
    fontSize: 12,
    color: '#415573',
  },
  statValue: {
    color: '#162B48',
    fontWeight: '800',
  },
  warningStat: {
    backgroundColor: '#FFF7E8',
  },
  warningStatText: {
    color: '#A85B06',
    fontSize: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingBottom: 15,
    width: '100%',
  },
  filterButton: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#EFF3F8',
    paddingHorizontal: 2,
    paddingVertical: 10,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilter: {
    backgroundColor: '#153E6C',
  },
  filterText: {
    color: '#4B5D78',
    fontWeight: '700',
    fontSize: 10,
    textAlign: 'center',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#233047',
  },
  showingText: {
    fontSize: 12,
    color: '#7385A0',
    fontWeight: '600',
  },
  patientCard: {
    borderRadius: 19,
    overflow: 'hidden',
    backgroundColor: '#F8FAFD',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9EEF5',
  },
  patientMain: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: '#175183',
    borderLeftWidth: 5,
    borderLeftColor: '#F7B500',
    gap: 12,
  },
  tokenBox: {
    width: 48,
    height: 50,
    backgroundColor: '#0B3159',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  patientInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  alertDot: {
    width: 10,
    height: 10,
    backgroundColor: '#FF5275',
    borderRadius: 5,
  },
  patientDetails: {
    fontSize: 12,
    color: '#B9D2EE',
    fontWeight: '600',
  },
  uhid: {
    fontSize: 11,
    color: '#B9D2EE',
  },
  patientActions: {
    alignItems: 'flex-end',
    gap: 11,
  },
  statusPill: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF7E7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A46600',
  },
  openRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  openText: {
    color: '#B8DAFF',
    fontSize: 12,
    fontWeight: '700',
  },
  prescriptionRow: {
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prescriptionText: {
    flex: 1,
    color: '#42536D',
    fontSize: 12,
  },
  rxLabel: {
    fontWeight: '800',
    color: '#182E4D',
  },
  allergyBadge: {
    maxWidth: '52%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FFCBD1',
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 5,
  },
  allergyText: {
    flexShrink: 1,
    fontSize: 10,
    color: '#DF1743',
  },
  emptyContainer: {
    padding: 35,
    alignItems: 'center',
  },
  emptyText: {
    color: '#7D8DA4',
    fontSize: 14,
  },
});
