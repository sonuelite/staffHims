
import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Clock3,
  Users,
  AlertTriangle,
  LockKeyhole,
  Circle,
} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type QueueStatus = 'Waiting' | 'In Consult' | 'Completed';
type FilterStatus = 'All' | QueueStatus;

interface QueuePatient {
  id: number;
  token: string;
  name: string;
  department: string;
  gender: string;
  age: number;
  uhid: string;
  status: QueueStatus;
  prescription: string;
  allergy?: string;
  hasAlert?: boolean;
}

const patients: QueuePatient[] = [
  {
    id: 1,
    token: '01',
    name: 'sonu2 yadav2',
    department: 'Neurology',
    gender: 'Male',
    age: 12,
    uhid: 'UHID-2026-00011',
    status: 'Waiting',
    prescription: 'Pediatric Migraine with Aura; Rule out...',
    allergy: 'Penicillins & Beta-Lactams',
    hasAlert: true,
  },
  {
    id: 2,
    token: '02',
    name: 'Nishant Ranjan',
    department: 'General Medicine',
    gender: 'Male',
    age: 34,
    uhid: 'UHID-2026-00023',
    status: 'Waiting',
    prescription: 'Community-Acquired Lower Respiratory...',
    allergy: 'NSAIDs (Ibuprofen / Diclofenac)',
    hasAlert: true,
  },
  {
    id: 3,
    token: '03',
    name: 'Rahul Sharma',
    department: 'Orthopedics',
    gender: 'Male',
    age: 42,
    uhid: 'UHID-2026-00031',
    status: 'In Consult',
    prescription: 'Right Inguinal Hernia; Secondary...',
    allergy: 'Penicillins & Beta-Lactams',
  },
  {
    id: 4,
    token: '04',
    name: 'Eleanor Vance',
    department: 'Diabetology / Podiatry',
    gender: 'Female',
    age: 67,
    uhid: 'UHID-2026-00048',
    status: 'Waiting',
    prescription: 'Type 2 Diabetes Mellitus',
    hasAlert: true,
  },
  {
    id: 5,
    token: '05',
    name: 'Priya Verma',
    department: 'Cardiology',
    gender: 'Female',
    age: 29,
    uhid: 'UHID-2026-00052',
    status: 'Completed',
    prescription: 'Routine Cardiac Follow-up',
  },
];

const filters: FilterStatus[] = [
  'All',
  'Waiting',
  'In Consult',
  'Completed',
];

export default function QueueScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] =
    useState<FilterStatus>('All');

  const counts = useMemo(
    () => ({
      All: patients.length,
      Waiting: patients.filter(p => p.status === 'Waiting').length,
      'In Consult': patients.filter(p => p.status === 'In Consult').length,
      Completed: patients.filter(p => p.status === 'Completed').length,
    }),
    [],
  );

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return patients.filter(patient => {
      const matchesFilter =
        activeFilter === 'All' ||
        patient.status === activeFilter;

      const matchesSearch =
        patient.name.toLowerCase().includes(query) ||
        patient.uhid.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [search, activeFilter]);

  const renderPatient = (patient: QueuePatient) => (
    <TouchableOpacity
      key={patient.id}
      style={styles.patientCard}
      activeOpacity={0.85}
      onPress={() => {
        // Navigate to patient encounter details here
      }}>
      <View style={styles.patientMain}>
        <View style={styles.tokenBox}>
          <Text style={styles.tokenText}>{patient.token}</Text>
        </View>

        <View style={styles.patientInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.patientName} numberOfLines={1}>
              {patient.name}
            </Text>
            {patient.hasAlert && (
              <View style={styles.alertDot} />
            )}
          </View>

          <Text style={styles.patientDetails} numberOfLines={1}>
            {patient.department} · {patient.gender}, {patient.age}y
          </Text>

          <Text style={styles.uhid}>{patient.uhid}</Text>
        </View>

        <View style={styles.patientActions}>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>
              {patient.status}
            </Text>
          </View>

          <View style={styles.openRow}>
            <Text style={styles.openText}>Open</Text>
            <ChevronRight size={15} color="#B8DAFF" />
          </View>
        </View>
      </View>

      <View style={styles.prescriptionRow}>
        <Text
          style={styles.prescriptionText}
          numberOfLines={1}>
          <Text style={styles.rxLabel}>Rx: </Text>
          {patient.prescription}
        </Text>

        {patient.allergy && (
          <View style={styles.allergyBadge}>
            <AlertTriangle size={14} color="#D97706" />
            <Text
              style={styles.allergyText}
              numberOfLines={1}>
              {patient.allergy}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />



      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom, 16) + 20},
        ]}
        showsVerticalScrollIndicator={false}>

        {/* Dashboard banner */}
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

        {/* Stats */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}>
          <View style={styles.statCard}>
            <Clock3 size={17} color="#2563EB" />
            <Text style={styles.statText}>
              Avg Wait: <Text style={styles.statValue}>12m</Text>
            </Text>
          </View>

          <View style={styles.statCard}>
            <Users size={17} color="#455B79" />
            <Text style={styles.statText}>
              Total: <Text style={styles.statValue}>{patients.length}</Text>
            </Text>
          </View>

          <View style={[styles.statCard, styles.warningStat]}>
            <AlertTriangle size={17} color="#D97706" />
            <Text style={styles.warningStatText}>
              Allergies: {patients.filter(p => p.allergy).length}
            </Text>
          </View>
        </ScrollView>

        {/* Search */}
        <View style={styles.searchBox}>
          <Search size={21} color="#8DA1BE" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or UHID"
            placeholderTextColor="#91A3BF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.activeFilter,
              ]}>
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.activeFilterText,
                ]}>
                {filter} ({counts[filter]})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
        {filteredPatients.length > 0 ? (
          filteredPatients.map(renderPatient)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No patients found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    minHeight: 90,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5EAF1',
  },
  brand: {
    fontSize: 21,
    fontWeight: '900',
    color: '#06477F',
  },
  brandLight: {
    fontSize: 17,
    fontWeight: '600',
    color: '#405F86',
  },
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  hospitalName: {
    fontSize: 12,
    color: '#5273A1',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doctorProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E8F1',
    borderRadius: 25,
    padding: 4,
    paddingRight: 10,
    gap: 7,
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
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#F0F4F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
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
  searchBox: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 15,
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderColor: '#DEE6F0',
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: '#172B49',
    fontSize: 15,
    paddingVertical: 0,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 15,
  },
  filterButton: {
    backgroundColor: '#EFF3F8',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  activeFilter: {
    backgroundColor: '#153E6C',
  },
  filterText: {
    color: '#4B5D78',
    fontWeight: '700',
    fontSize: 12,
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
