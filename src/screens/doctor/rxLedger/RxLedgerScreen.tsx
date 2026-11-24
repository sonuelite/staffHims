
import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {
  Pill,
  Search,
  Zap,
  AlertTriangle,
  Droplets,
} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import DoctorHeader from '../../../components/doctorHeader/DoctorHeader';

type OrderType = 'regular' | 'stat' | 'high-alert' | 'iv';

type Prescription = {
  id: number;
  patientName: string;
  uhid: string;
  location: string;
  medicine: string;
  dosage: string;
  route: string;
  frequency: string;
  indication: string;
  prescribedBy: string;
  time: string;
  type: OrderType;
};

const prescriptions: Prescription[] = [
  {
    id: 1,
    patientName: 'sonu2 yadav2',
    uhid: 'UHID-2026-00011',
    location: 'OPD Chamber 4B · Token 01',
    medicine: 'Paracetamol Pediatric Oral Suspension',
    dosage: '250 mg',
    route: 'PO',
    frequency: 'PRN',
    indication: 'Acute headache episode',
    prescribedBy: 'Dr. Sarah Chen',
    time: '09:20 AM Today',
    type: 'regular',
  },
  {
    id: 2,
    patientName: 'Rajiv Sharma',
    uhid: 'UHID-2026-00035',
    location: 'Room 4B · Bed 12',
    medicine: 'Lisinopril Tablets',
    dosage: '20 mg',
    route: 'PO',
    frequency: 'QD',
    indication: 'Hypertension',
    prescribedBy: 'Dr. Sarah Chen',
    time: '08:45 AM Today',
    type: 'regular',
  },
  {
    id: 3,
    patientName: 'Rajiv Sharma',
    uhid: 'UHID-2026-00035',
    location: 'Room 4B · Bed 12',
    medicine: 'Metoprolol Succinate ER',
    dosage: '50 mg',
    route: 'PO',
    frequency: 'BID',
    indication: 'Hypertension',
    prescribedBy: 'Dr. Sarah Chen',
    time: '08:30 AM Today',
    type: 'regular',
  },
  {
    id: 4,
    patientName: 'Anjali Verma',
    uhid: 'UHID-2026-00042',
    location: 'Emergency · Bed 03',
    medicine: 'Ceftriaxone Injection',
    dosage: '1 g',
    route: 'IV',
    frequency: 'STAT',
    indication: 'Suspected bacterial infection',
    prescribedBy: 'Dr. Sarah Chen',
    time: '09:40 AM Today',
    type: 'stat',
  },
  {
    id: 5,
    patientName: 'Amit Kumar',
    uhid: 'UHID-2026-00051',
    location: 'ICU · Bed 02',
    medicine: 'Insulin Regular',
    dosage: '5 units',
    route: 'SC',
    frequency: 'As directed',
    indication: 'Hyperglycemia',
    prescribedBy: 'Dr. Sarah Chen',
    time: '10:00 AM Today',
    type: 'high-alert',
  },
  {
    id: 6,
    patientName: 'Neha Singh',
    uhid: 'UHID-2026-00062',
    location: 'Ward 2 · Bed 08',
    medicine: 'Normal Saline 0.9%',
    dosage: '500 mL',
    route: 'IV',
    frequency: 'As directed',
    indication: 'Fluid replacement',
    prescribedBy: 'Dr. Sarah Chen',
    time: '10:15 AM Today',
    type: 'iv',
  },
];

type FilterType = 'all' | OrderType;

const RxLedgerScreen = () => {
   const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filters = [
    {
      key: 'all' as FilterType,
      label: 'All Orders',
      count: prescriptions.length,
    },
    {
      key: 'stat' as FilterType,
      label: 'STAT Orders',
      count: prescriptions.filter(item => item.type === 'stat').length,
    },
    {
      key: 'high-alert' as FilterType,
      label: 'High-Alert',
      count: prescriptions.filter(item => item.type === 'high-alert')
        .length,
    },
    {
      key: 'iv' as FilterType,
      label: 'IV Fluids',
      count: prescriptions.filter(item => item.type === 'iv').length,
    },
  ];

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return prescriptions.filter(item => {
      const matchesFilter =
        activeFilter === 'all' || item.type === activeFilter;

      const matchesSearch =
        !query ||
        item.patientName.toLowerCase().includes(query) ||
        item.uhid.toLowerCase().includes(query) ||
        item.medicine.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [search, activeFilter]);

  const handleModify = (item: Prescription) => {
    // Navigate to your prescription editing screen here.
    console.log('Modify prescription:', item.id);
  };

  const renderPrescription = ({item}: {item: Prescription}) => (
    <View style={styles.orderCard}>
      <View style={styles.cardHeader}>
        <View style={styles.patientDetails}>
          <Text style={styles.patientName}>
            {item.patientName}
            <Text style={styles.uhid}> ({item.uhid})</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.modifyButton}
          onPress={() => handleModify(item)}>
          <Text style={styles.modifyText}>Modify</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.location}>{item.location}</Text>

      <Text style={styles.medicineName}>{item.medicine}</Text>

      <View style={styles.medicineInfo}>
        <Text style={styles.dosage}>{item.dosage}</Text>
        <Text style={styles.infoText}> · Route: {item.route}</Text>
        <Text style={styles.infoText}> · Freq: {item.frequency}</Text>
      </View>

      <Text style={styles.indication}>
        Indication: {item.indication}
      </Text>

      <Text style={styles.prescribedText}>
        Prescribed by {item.prescribedBy} · {item.time}
      </Text>
    </View>
  );


return (
  <View style={styles.container}>
    <StatusBar
      translucent
      backgroundColor="transparent"
      barStyle="dark-content"
    />

    {/* Existing reusable doctor header */}
    <DoctorHeader />

    <View style={styles.mainContainer}>
      {/* Fixed heading, search and filters */}
      <View style={styles.topSection}>
        <View style={styles.titleRow}>
          <Pill
            size={21}
            color="#009C91"
            strokeWidth={2}
          />

          <Text style={styles.title}>
            Active CPOE Orders Summary
          </Text>
        </View>

        <Text style={styles.subtitle}>
          All active clinician prescriptions, STAT orders,
          and IV infusions across OPD
        </Text>

        <View style={styles.searchContainer}>
          <Search size={18} color="#8BA0BD" />

          <TextInput
            style={styles.searchInput}
            placeholder="Filter orders by drug, patient name, or MRN..."
            placeholderTextColor="#8BA0BD"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}>
          {filters.map(filter => {
            const selected = activeFilter === filter.key;

            return (
              <TouchableOpacity
                key={filter.key}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(filter.key)}
                style={[
                  styles.filterButton,
                  selected && styles.activeFilter,
                ]}>
                {filter.key === 'stat' && (
                  <Zap size={15} color="#D69A00" />
                )}

                {filter.key === 'high-alert' && (
                  <AlertTriangle
                    size={15}
                    color="#D97706"
                  />
                )}

                {filter.key === 'iv' && (
                  <Droplets
                    size={15}
                    color="#2563EB"
                  />
                )}

                <Text
                  style={[
                    styles.filterText,
                    selected && styles.activeFilterText,
                  ]}>
                  {filter.label} ({filter.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Only prescription cards will scroll */}
      <FlatList
        data={filteredOrders}
        renderItem={renderPrescription}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Pill size={35} color="#94A3B8" />

            <Text style={styles.emptyTitle}>
              No orders found
            </Text>

            <Text style={styles.emptySubtitle}>
              Try another search or filter.
            </Text>
          </View>
        }
      />
    </View>
  </View>
);

};

export default RxLedgerScreen;

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
topSection: {
  paddingBottom: 12,
},
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
title: {
  fontSize: 17,
  fontWeight: '700',
  color: '#0F172A',
  flex: 1,
},
subtitle: {
  fontSize: 12,
  color: '#617795',
  lineHeight: 18,
  marginTop: 8,
  marginBottom: 16,
},
searchContainer: {
  height: 43,
  borderWidth: 1,
  borderColor: '#CBD7E6',
  borderRadius: 16,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 14,
  marginBottom: 16,
  gap: 10,
},
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
filtersContainer: {
  backgroundColor: '#F1F5F9',
  borderRadius: 13,
  maxHeight: 48,
},
filtersContent: {
  alignItems: 'center',
  paddingHorizontal: 6,
  paddingVertical: 5,
  gap: 5,
},
filterButton: {
  paddingHorizontal: 12,
  height: 36,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 10,
  gap: 5,
},
activeFilter: {
  backgroundColor: '#FFFFFF',
  elevation: 1,
},
  filterText: {
    fontSize: 12,
    color: '#25446D',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#0F172A',
    fontWeight: '700',
  },
listContent: {
  paddingTop: 8,
  paddingBottom: 20,
},
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#DCE5EF',
    padding: 16,
    marginBottom: 13,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  patientDetails: {
    flex: 1,
    paddingTop: 5,
  },
  patientName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#008B80',
  },
  uhid: {
    fontSize: 11.5,
    color: '#647996',
    fontWeight: '600',
  },
  modifyButton: {
    paddingHorizontal: 13,
    height: 34,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#DEE6F0',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modifyText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#17243C',
  },
  location: {
    fontSize: 11.5,
    color: '#647996',
    marginTop: 4,
    marginBottom: 11,
  },
  medicineName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 7,
  },
  medicineInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 10,
  },
  dosage: {
    fontSize: 12,
    fontWeight: '700',
    color: '#008B80',
  },
  infoText: {
    fontSize: 12,
    color: '#405675',
  },
  indication: {
    fontSize: 12,
    color: '#405675',
    marginBottom: 10,
  },
  prescribedText: {
    fontSize: 10.5,
    color: '#8BA0BD',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 90,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
