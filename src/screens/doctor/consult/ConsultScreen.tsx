import axios from 'axios';
import React, { useEffect, useState } from 'react';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState, AppDispatch } from '../../../store/store';
import type { DoctorTabParamList } from '../../../navigator/DoctorTabNavigator';
import { setSelectedPatient } from '../../../store/consultSlice';

import {
  getDoctorOpdDashboard,
  getSingleVitals,
  getPatientClinicalNotes,
  getMedicineList,
  getDosageList,
  getMedicineFrequencyList,
  getMedicineDurationList,
  getMedicineRouteList,
  getLaboratoryTestList,
  getRadiologyTestList,
  createConsultationOrder,
  type CreateConsultationOrderPayload,
  markConsultationComplete,
  type MarkConsultationCompletePayload,
} from '../../../network/api';
import {
  savePrescription,
  type SavePrescriptionPayload,
} from '../../../network/api';
import type { QueuePatient } from '../queue/QueueScreen';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  PenTool,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Ruler,
  Scale,
  Thermometer,
  Activity,
  Heart,
  Radio,
  Trash2,
  FlaskConical,
  Radiation,
} from 'lucide-react-native';
// import SignatureCanvas, {
//   SignatureViewRef,
// } from 'react-native-signature-canvas';
import DoctorHeader from '../../../components/doctorHeader/DoctorHeader';
import SignatureModal from '../../../components/signatureModal/SignatureModal';


type ConsultationTab = 'Vitals' | 'Clinical Notes' | 'Prescription' | 'Orders';

const tabs: ConsultationTab[] = [
  'Vitals',
  'Clinical Notes',
  'Prescription',
  'Orders',
];

interface InvestigationTest {
  id: string;
  name: string;
  price: number;
}

const laboratoryTests: InvestigationTest[] = [
  {
    id: 'lab-1',
    name: 'Blood Grouping & Cross-Matching',
    price: 500,
  },
  {
    id: 'lab-2',
    name: 'Serum Lactate',
    price: 900,
  },
  {
    id: 'lab-3',
    name: 'Blood Culture',
    price: 1800,
  },
  {
    id: 'lab-4',
    name: 'Complete Blood Count (CBC)',
    price: 450,
  },
  {
    id: 'lab-5',
    name: 'Renal Function Test (KFT/eGFR)',
    price: 750,
  },
];

// const radiologyTests: InvestigationTest[] = [
//   {
//     id: 'rad-1',
//     name: 'Portable X-Ray Chest & Pelvis',
//     price: 1200,
//   },
//   {
//     id: 'rad-2',
//     name: 'Bedside FAST Ultrasound Scan',
//     price: 2500,
//   },
// ];

interface PatientVitals {
  id: number;
  patient_id: number;
  visit_id: number;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  temperature: number | null;
  temperature_unit: string | null;
  spo2: number | null;
  respiratoryRate: number | null;
  height: number | null;
  weight: number | null;
  bmi: number | null;
  bmi_percent: number | null;
  o2_therapy: string | null;
  map: number | null;
  vitals_updated_at: string | null;
}

interface SingleVitalsResponse {
  message: string;
  data: PatientVitals | null;
}

interface ClinicalNotes {
  id: number;
  patient_id: number;
  visit_id: number;

  chief_complaint: string | null;
  history_of_present_illness: string | null;
  past_medical_surgical_history: string | null;
  medication_history: string | null;
  allergies: string | null;
  personal_family_history: string | null;

  pe_general_appearance: string | null;
  pe_cardiovascular: string | null;
  pe_respiratory: string | null;
  pe_gastrointestinal: string | null;
  pe_central_nervous: string | null;
  pe_musculoskeletal_skin: string | null;

  primary_diagnosis: string | null;
  icd10_code: string | null;
  secondary_differential_diagnoses: string | null;

  management_goals: string | null;
  dietary_lifestyle_advice: string | null;
  follow_up_schedule: string | null;
  specialty_referral: string | null;

  createdAt: string;
}

interface ClinicalNotesResponse {
  code: number;
  message: string;
  is_previous: boolean;
  data: ClinicalNotes[];
}

// interface MedicineItem {
//   id: number;
//   medicine_name: string;
// }
interface MedicineItem {
  id: number;
  item_name: string;
  item_code: string;
  generic_name: string;
  brand_name: string;
  strength: string;
  default_dose: string;
  frequency: number | null;
  duration: number | null;
  instructions: string;
  status: string;
  is_deleted: boolean;
  is_lasa: boolean;
  is_high_alert: boolean;
  lasa_warning: string | null;
  tall_man_name?: string | null;
  lasa_confused_with?: string | null;
}

// interface DosageItem {
//   id: number;
//   name: string;
// }

interface DosageItem {
  dosage_form_id: number;
  dosage_form_name: string;
  dosage_form_code: string;
  description: string | null;
  is_liquid: boolean;
  status: string;
  is_deleted: boolean;
}

interface FrequencyItem {
  frequency_id: number;
  frequency_name: string;
  frequency_code?: string;
  status?: string;
  is_deleted?: boolean;
}

interface DurationItem {
  duration_id: number;
  entity_id: number;
  duration_code: string;
  duration_value: number;
  duration_unit: string;
  display_text: string;
  status: string;
  is_deleted: boolean;
}

interface MedicineRouteItem {
  route_id: number;
  entity_id: number;
  route_code: string;
  route_name: string;
  description: string | null;
  is_invasive: boolean;
  status: string;
  is_deleted: boolean;
}

export default function ConsultScreen() {
  const navigation =
    useNavigation<BottomTabNavigationProp<DoctorTabParamList>>();

  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();

const selectedPatient = useSelector(
  (state: RootState) => state.consult.selectedPatient,
);

const patient =
  selectedPatient?.consultation_status?.trim().toLowerCase() ===
  'completed'
    ? null
    : selectedPatient;

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const doctor = useSelector((state: RootState) => state.auth.user);

  const doctorName = doctor
    ? [doctor.title, doctor.first_name, doctor.last_name]
        .filter(Boolean)
        .join(' ')
    : '';
  const [activeTab, setActiveTab] = useState<ConsultationTab>('Vitals');
  const [showAllergyDetails, setShowAllergyDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [vitalsData, setVitalsData] = useState<PatientVitals | null>(null);
  const [vitalsLoading, setVitalsLoading] = useState(false);
  const [vitalsError, setVitalsError] = useState<string | null>(null);

  const [clinicalNotesData, setClinicalNotesData] =
    useState<ClinicalNotes | null>(null);

  const [isPreviousNotes, setIsPreviousNotes] = useState(false);

  const [clinicalNotesLoading, setClinicalNotesLoading] = useState(false);

  const [clinicalNotesError, setClinicalNotesError] = useState<string | null>(
    null,
  );

const [showSignatureModal, setShowSignatureModal] =
  useState(false);

const [signature, setSignature] = useState('');


useEffect(() => {
  setSignature('');
  setShowSignatureModal(false);
}, [patient?.patient_id, patient?.visit_id, doctor?.employee_id]);

const handleSaveSignature = (signatureData: string) => {
  setSignature(signatureData);
  setShowSignatureModal(false);

  Alert.alert(
    'Success',
    'Signature captured successfully.',
  );
};

  type Medicine = {
    id: number;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    total: string;
  };

  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [total, setTotal] = useState('');

  const [showMedicineList, setShowMedicineList] = useState(false);
  const [showDosageList, setShowDosageList] = useState(false);
  const [showFrequencyList, setShowFrequencyList] = useState(false);

  const [activeMedicines, setActiveMedicines] = useState<Medicine[]>([]);

  const [frequencyOptions, setFrequencyOptions] = useState<FrequencyItem[]>([]);

  const [frequencyLoading, setFrequencyLoading] = useState(false);

  const [frequencyError, setFrequencyError] = useState<string | null>(null);

  const [selectedFrequencyId, setSelectedFrequencyId] = useState<number | null>(
    null,
  );

  // const medicineOptions = [
  //   'Amoxicillin + Clavulanate (Augmentin)',
  //   'Paracetamol',
  //   'Azithromycin',
  //   'Pantoprazole',
  //   'Cetirizine',
  // ];
  const [medicineOptions, setMedicineOptions] = useState<MedicineItem[]>([]);
  const [medicineLoading, setMedicineLoading] = useState(false);
  const [medicineError, setMedicineError] = useState<string | null>(null);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [selectedMedicineId, setSelectedMedicineId] = useState<number | null>(
    null,
  );

  const [dosageOptions, setDosageOptions] = useState<DosageItem[]>([]);
  const [dosageLoading, setDosageLoading] = useState(false);
  const [dosageError, setDosageError] = useState<string | null>(null);

  const [selectedDosageId, setSelectedDosageId] = useState<number | null>(null);
  const [durationOptions, setDurationOptions] = useState<DurationItem[]>([]);
  const [durationLoading, setDurationLoading] = useState(false);
  const [durationError, setDurationError] = useState<string | null>(null);
  const [showDurationList, setShowDurationList] = useState(false);
  const [selectedDurationId, setSelectedDurationId] = useState<number | null>(
    null,
  );

  const [routeOptions, setRouteOptions] = useState<MedicineRouteItem[]>([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [selectedRouteName, setSelectedRouteName] = useState('');

  const [prescriptionSaving, setPrescriptionSaving] = useState(false);

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const [labTests, setLabTests] = useState<InvestigationTest[]>([]);
  const [labLoading, setLabLoading] = useState(false);
  const [labError, setLabError] = useState<string | null>(null);

  const [radiologyTests, setRadiologyTests] = useState<InvestigationTest[]>([]);
  const [radiologyLoading, setRadiologyLoading] = useState(false);
  const [radiologyError, setRadiologyError] = useState<string | null>(null);

  const [savingOrder, setSavingOrder] = useState(false);
  const [completingConsultation, setCompletingConsultation] = useState(false);

  const toggleOrder = (id: string) => {
    setSelectedOrders(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  };

  const selectedOrderCount = selectedOrders.length;

  // const handleDispatchOrders = () => {
  //   if (!patient) {
  //     Alert.alert('No Patient', 'Please select a patient first.');
  //     return;
  //   }

  //   if (selectedOrders.length === 0) {
  //     Alert.alert(
  //       'No Tests Selected',
  //       'Please select at least one laboratory or radiology test.',
  //     );
  //     return;
  //   }

  //   Alert.alert(
  //     'Orders Selected',
  //     `${selectedOrders.length} investigation(s) selected for ${patient.patient_name}.`,
  //   );
  // };
  // const [additionalNotes, setAdditionalNotes] = useState('');

  // const filteredMedicines = medicineOptions.filter(item =>
  //   item.medicine_name?.toLowerCase().includes(medicineSearch.toLowerCase()),
  // );

  const handleDispatchOrders = async () => {
    // if (savingOrder) return;
    if (savingOrder || completingConsultation) return;

    if (!patient || !doctor || !accessToken) {
      Alert.alert('Error', 'Patient or doctor session is unavailable.');
      return;
    }

    if (selectedOrders.length === 0) {
      Alert.alert('No Tests Selected', 'Please select at least one test.');
      return;
    }

    const departmentId = Number(patient.department_id);

    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      Alert.alert('Error', 'Valid department ID is required.');
      return;
    }

    const selectedLabs = labTests.filter(test =>
      selectedOrders.includes(test.id),
    );

    const selectedRadiology = radiologyTests.filter(test =>
      selectedOrders.includes(test.id),
    );

    if (
      selectedLabs.length + selectedRadiology.length !==
      selectedOrders.length
    ) {
      Alert.alert(
        'Invalid Selection',
        'Some selected tests are unavailable. Please select them again.',
      );
      return;
    }

    const laboratoryOrders = selectedLabs.map(test => ({
      test_id: Number(test.id.replace('lab-', '')),
      priority: 'Routine',
    }));

    const radiologyOrders = selectedRadiology.map(test => ({
      test_id: Number(test.id.replace('rad-', '')),
      priority: 'Routine',
    }));

    const totalAmount = [...selectedLabs, ...selectedRadiology].reduce(
      (sum, test) => sum + test.price,
      0,
    );

    if (
      [...laboratoryOrders, ...radiologyOrders].some(
        test => !Number.isSafeInteger(test.test_id) || test.test_id <= 0,
      ) ||
      !Number.isFinite(totalAmount) ||
      totalAmount < 0
    ) {
      Alert.alert('Error', 'Invalid test ID or amount.');
      return;
    }

    const payload: CreateConsultationOrderPayload = {
      patient_id: patient.patient_id,
      doctor_id: doctor.employee_id,
      department_id: departmentId,
      visit_id: patient.visit_id,
      created_by: doctor.employee_id,
      total_amount: totalAmount,
      discount_percent: 0,
      paid_amount: 0,
      laboratory_tests: laboratoryOrders,
      radiology_tests: radiologyOrders,
    };

    try {
      setSavingOrder(true);

      console.log(
        'Create Consultation Order Payload:',
        JSON.stringify(payload, null, 2),
      );

      const response = await createConsultationOrder(accessToken, payload);

      console.log(
        'Create Consultation Order Response:',
        JSON.stringify(response, null, 2),
      );

      if (response?.success === false) {
        throw new Error(
          response.message || 'Failed to create consultation order.',
        );
      }

      Alert.alert(
        'Success',
        response?.message || 'Consultation order created successfully.',
      );

      setSelectedOrders([]);
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
        ? error.message
        : 'Failed to create consultation order.';

      console.log(
        'Create Consultation Order Error:',
        axios.isAxiosError(error) ? error.response?.data : message,
      );

      Alert.alert('Error', message);
    } finally {
      setSavingOrder(false);
    }
  };

  const filteredMedicines = medicineOptions.filter(item => {
    const search = medicineSearch.trim().toLowerCase();

    return (
      item.status === 'ACTIVE' &&
      !item.is_deleted &&
      (item.item_name?.toLowerCase().includes(search) ||
        item.generic_name?.toLowerCase().includes(search) ||
        item.brand_name?.toLowerCase().includes(search) ||
        item.item_code?.toLowerCase().includes(search))
    );
  });

  // const dosageOptions = ['250 mg', '500 mg', '625 mg', '1 g'];

  // const frequencyOptions = [
  //   'Once daily (OD)',
  //   'Twice daily (BD)',
  //   'Three times daily (TDS)',
  //   'Four times daily (QID)',
  //   'As needed (SOS)',
  // ];

  const vitals = [
    {
      id: 'height',
      label: 'Height',
      value: vitalsData?.height?.toString() ?? '--',
      unit: 'cm',
      range: '100–220',
      color: '#307CFF',
      Icon: Ruler,
    },
    {
      id: 'weight',
      label: 'Weight',
      value: vitalsData?.weight?.toString() ?? '--',
      unit: 'kg',
      range: '30–200',
      color: '#00A574',
      Icon: Scale,
    },
    {
      id: 'temperature',
      label: 'Temperature',
      value: vitalsData?.temperature?.toString() ?? '--',
      unit: vitalsData?.temperature_unit ?? '°F',
      range: '97–99°F',
      color: '#FF6500',
      Icon: Thermometer,
    },
    {
      id: 'bp',
      label: 'Blood Pressure',
      value:
        vitalsData?.systolic != null && vitalsData?.diastolic != null
          ? `${vitalsData.systolic}/${vitalsData.diastolic}`
          : '--',
      unit: 'mmHg',
      range: '90/60–120/80',
      color: '#FF2160',
      Icon: Activity,
    },
    {
      id: 'pulse',
      label: 'Pulse Rate',
      value: vitalsData?.pulse?.toString() ?? '--',
      unit: 'bpm',
      range: '60–100',
      color: '#625BFF',
      Icon: Heart,
    },
    {
      id: 'spo2',
      label: 'SpO2',
      value: vitalsData?.spo2?.toString() ?? '--',
      unit: '%',
      range: vitalsData?.o2_therapy ?? '--',
      color: '#00BDAE',
      Icon: Radio,
    },
  ];

  useEffect(() => {
    if (patient || !accessToken) {
      return;
    }

    let active = true;

    const fetchFirstPatient = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        const response: { data: QueuePatient[] } = await getDoctorOpdDashboard(
          accessToken,
          'all',
        );

        if (!active) {
          return;
        }

        // const firstPatient = response.data?.[0];
        const firstPatient = response.data?.find(
          item =>
            item.consultation_status?.trim().toLowerCase() !== 'completed',
        );

        if (firstPatient) {
          dispatch(setSelectedPatient(firstPatient));
        }
      } catch (error: unknown) {
        if (active) {
          setFetchError(
            error instanceof Error ? error.message : 'Unable to load patients',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchFirstPatient();

    return () => {
      active = false;
    };
  }, [patient, accessToken, dispatch]);

  useEffect(() => {
    if (!patient || !accessToken) {
      setVitalsData(null);
      setVitalsError(null);
      return;
    }

    let active = true;

    const fetchVitals = async () => {
      setVitalsData(null);
      setVitalsLoading(true);
      setVitalsError(null);

      try {
        const response: SingleVitalsResponse = await getSingleVitals(
          accessToken,
          patient.patient_id,
          patient.visit_id,
        );

        if (!active) return;

        // console.log(
        //   'Single Vitals API Response:',
        //   JSON.stringify(response, null, 2),
        // );

        setVitalsData(response.data ?? null);
      } catch (error: unknown) {
        if (!active) return;

        const message =
          error instanceof Error
            ? error.message
            : 'Failed to fetch patient vitals';

        setVitalsError(message);
        console.log('Single Vitals API Error:', message);
      } finally {
        if (active) {
          setVitalsLoading(false);
        }
      }
    };

    fetchVitals();

    return () => {
      active = false;
    };
  }, [accessToken, patient?.patient_id, patient?.visit_id]);

  useEffect(() => {
    if (!patient || !accessToken) {
      setClinicalNotesData(null);
      setClinicalNotesError(null);
      setClinicalNotesLoading(false);
      return;
    }

    let active = true;

    const fetchClinicalNotes = async () => {
      setClinicalNotesData(null);
      setClinicalNotesLoading(true);
      setClinicalNotesError(null);

      try {
        const response = await getPatientClinicalNotes(
          accessToken,
          patient.patient_id,
          patient.visit_id,
        );

        if (!active) return;

        // console.log(
        //   'Clinical Notes API Response:',
        //   JSON.stringify(response, null, 2),
        // );

        const result = response as ClinicalNotesResponse;

        if (result.code !== 200) {
          throw new Error(result.message || 'Failed to fetch clinical notes');
        }

        const notes = result.data ?? [];

        const latestNote =
          [...notes].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )[0] ?? null;

        setClinicalNotesData(latestNote);
        setIsPreviousNotes(result.is_previous);
      } catch (error: unknown) {
        if (!active) return;

        const message =
          error instanceof Error
            ? error.message
            : 'Failed to fetch clinical notes';

        setClinicalNotesError(message);

        console.log('Clinical Notes API Error:', message);
      } finally {
        if (active) {
          setClinicalNotesLoading(false);
        }
      }
    };

    fetchClinicalNotes();

    return () => {
      active = false;
    };
  }, [accessToken, patient?.patient_id, patient?.visit_id]);

  useEffect(() => {
    if (!accessToken) {
      setMedicineOptions([]);
      return;
    }

    let active = true;

    const fetchMedicines = async () => {
      try {
        setMedicineLoading(true);
        setMedicineError(null);

        const response = await getMedicineList(accessToken);

        console.log(
          'Medicine List API Response:',
          JSON.stringify(response, null, 2),
        );

        if (!active) return;

        setMedicineOptions(Array.isArray(response.data) ? response.data : []);
      } catch (error: unknown) {
        if (!active) return;

        const message =
          error instanceof Error ? error.message : 'Failed to fetch medicines';

        setMedicineError(message);
        setMedicineOptions([]);
      } finally {
        if (active) {
          setMedicineLoading(false);
        }
      }
    };

    fetchMedicines();

    return () => {
      active = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      setDosageOptions([]);
      return;
    }

    let active = true;

    const fetchDosages = async () => {
      try {
        setDosageLoading(true);
        setDosageError(null);

        const response = await getDosageList(accessToken);

        console.log(
          'Dosage List API Response:',
          JSON.stringify(response, null, 2),
        );

        if (!active) return;

        setDosageOptions(Array.isArray(response.data) ? response.data : []);
      } catch (error: unknown) {
        if (!active) return;

        const message =
          error instanceof Error
            ? error.message
            : 'Failed to fetch dosage list';

        setDosageError(message);
        setDosageOptions([]);
      } finally {
        if (active) {
          setDosageLoading(false);
        }
      }
    };

    fetchDosages();

    return () => {
      active = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      setFrequencyOptions([]);
      return;
    }

    let active = true;

    const fetchFrequencies = async () => {
      try {
        setFrequencyLoading(true);
        setFrequencyError(null);

        const response = await getMedicineFrequencyList(accessToken);

        console.log(
          'Medicine Frequency List API Response:',
          JSON.stringify(response, null, 2),
        );

        if (!active) return;

        setFrequencyOptions(Array.isArray(response.data) ? response.data : []);
      } catch (error: unknown) {
        if (!active) return;

        const message =
          error instanceof Error
            ? error.message
            : 'Failed to fetch frequency list';

        setFrequencyError(message);
        setFrequencyOptions([]);
      } finally {
        if (active) {
          setFrequencyLoading(false);
        }
      }
    };

    fetchFrequencies();

    return () => {
      active = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      setDurationOptions([]);
      return;
    }

    let active = true;

    const fetchDurations = async () => {
      try {
        setDurationLoading(true);
        setDurationError(null);

        const response = await getMedicineDurationList(accessToken);

        console.log(
          'Medicine Duration List API Response:',
          JSON.stringify(response, null, 2),
        );

        if (!active) return;

        setDurationOptions(Array.isArray(response.data) ? response.data : []);
      } catch (error: unknown) {
        if (!active) return;

        setDurationError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch duration list',
        );
        setDurationOptions([]);
      } finally {
        if (active) {
          setDurationLoading(false);
        }
      }
    };

    fetchDurations();

    return () => {
      active = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      setRouteOptions([]);
      return;
    }

    let active = true;

    const fetchRoutes = async () => {
      try {
        setRouteLoading(true);
        setRouteError(null);

        const response = await getMedicineRouteList(accessToken);

        if (!active) return;

        console.log(
          'Medicine Route List API Response:',
          JSON.stringify(response, null, 2),
        );

        setRouteOptions(Array.isArray(response.data) ? response.data : []);
      } catch (error: unknown) {
        if (!active) return;

        setRouteError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch medicine routes',
        );

        setRouteOptions([]);
      } finally {
        if (active) {
          setRouteLoading(false);
        }
      }
    };

    fetchRoutes();

    return () => {
      active = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      setLabTests([]);
      return;
    }

    let active = true;

    const fetchLaboratoryTests = async () => {
      try {
        setLabLoading(true);
        setLabError(null);

        const response = await getLaboratoryTestList(accessToken);

        console.log(
          'Laboratory Test List API Response:',
          JSON.stringify(response, null, 2),
        );

        if (!active) return;

        // Temporary mapping until the actual API response is confirmed.
        const tests = Array.isArray(response.data) ? response.data : [];

        setLabTests(
          tests
            .filter(
              (item: { id: number; status: string }) =>
                item.status === 'ACTIVE' && item.id != null,
            )
            .map(
              (item: {
                id: number;
                test_name: string;
                price: number | string;
              }) => ({
                id: `lab-${item.id}`,
                name: item.test_name.trim(),
                price: Number(item.price ?? 0),
              }),
            ),
        );
      } catch (error: unknown) {
        if (!active) return;

        const message = axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : error instanceof Error
          ? error.message
          : 'Failed to fetch laboratory tests';

        setLabError(message);
        setLabTests([]);

        console.log('Laboratory Test API Error:', message);
      } finally {
        if (active) {
          setLabLoading(false);
        }
      }
    };

    fetchLaboratoryTests();

    return () => {
      active = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      setRadiologyTests([]);
      setRadiologyError(null);
      return;
    }

    let active = true;

    const fetchRadiologyTests = async () => {
      try {
        setRadiologyLoading(true);
        setRadiologyError(null);

        const response = await getRadiologyTestList(accessToken);

        console.log(
          'Radiology Test List API Response:',
          JSON.stringify(response, null, 2),
        );

        if (!active) return;

        const tests = Array.isArray(response.data) ? response.data : [];

        setRadiologyTests(
          tests
            .filter(
              (item: { id: number; status: string }) =>
                item.id != null && item.status === 'ACTIVE',
            )
            .map(
              (item: {
                id: number;
                test_name: string;
                price: number | string;
              }) => ({
                id: `rad-${item.id}`,
                name: item.test_name?.trim() || 'Unnamed Radiology Test',
                price: Number(item.price ?? 0),
              }),
            ),
        );
      } catch (error: unknown) {
        if (!active) return;

        const message = axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : error instanceof Error
          ? error.message
          : 'Failed to fetch radiology tests';

        setRadiologyError(message);
        setRadiologyTests([]);

        console.log('Radiology Test API Error:', message);
      } finally {
        if (active) {
          setRadiologyLoading(false);
        }
      }
    };

    fetchRadiologyTests();

    return () => {
      active = false;
    };
  }, [accessToken]);

  const patientName = patient?.patient_name ?? 'Patient Name';
  const patientUhid = patient?.uhid ?? '--';
  const patientToken = patient?.token_no ?? '--';
  const patientGender = patient?.gender ?? '--';
  const patientAge = patient?.age ?? '--';
  const patientAllergies = patient?.allergies;

  // const handleCompleteConsultation = () => {
  //   if (completingConsultation) return;

  //   if (!patient || !doctor || !accessToken) {
  //     Alert.alert('Error', 'Patient or doctor session is unavailable.');
  //     return;
  //   }

  //   const departmentId = Number(patient.department_id);

  //   if (!Number.isSafeInteger(departmentId) || departmentId <= 0) {
  //     Alert.alert('Missing Department', 'A valid department ID is required.');
  //     return;
  //   }

  //   Alert.alert(
  //     'Complete Consultation',
  //     `Are you sure you want to complete the consultation for ${patient.patient_name}?`,
  //     [
  //       {
  //         text: 'Cancel',
  //         style: 'cancel',
  //       },
  //       {
  //         text: 'Complete',
  //         onPress: async () => {
  //           const payload: MarkConsultationCompletePayload = {
  //             patient_id: patient.patient_id,
  //             doctor_id: doctor.employee_id,
  //             department_id: departmentId,
  //             visit_id: patient.visit_id,
  //             status: 'Completed',
  //             updated_by: doctor.employee_id,
  //           };

  //           try {
  //             setCompletingConsultation(true);

  //             console.log(
  //               'Complete Consultation Payload:',
  //               JSON.stringify(payload, null, 2),
  //             );

  //             const response = await markConsultationComplete(
  //               accessToken,
  //               payload,
  //             );

  //             console.log(
  //               'Complete Consultation Response:',
  //               JSON.stringify(response, null, 2),
  //             );

  //             if (response?.success === false) {
  //               throw new Error(
  //                 response.message || 'Failed to complete consultation.',
  //               );
  //             }

  //             Alert.alert(
  //               'Success',
  //               response?.message || 'Consultation completed successfully.',
  //               [
  //                 {
  //                   text: 'OK',
  //                   onPress: () => {
  //                     dispatch(setSelectedPatient(null));
  //                     navigation.navigate('Queue');
  //                   },
  //                 },
  //               ],
  //             );
  //           } catch (error: unknown) {
  //             const message = axios.isAxiosError(error)
  //               ? error.response?.data?.message || error.message
  //               : error instanceof Error
  //               ? error.message
  //               : 'Failed to complete consultation.';

  //             console.log(
  //               'Complete Consultation Error:',
  //               axios.isAxiosError(error) ? error.response?.data : message,
  //             );

  //             Alert.alert('Error', message);
  //           } finally {
  //             setCompletingConsultation(false);
  //           }
  //         },
  //       },
  //     ],
  //   );
  // };

  const handleCompleteConsultation = () => {
  if (completingConsultation || savingOrder) return;

  if (!patient || !doctor || !accessToken) {
    Alert.alert(
      'Error',
      'Patient or doctor session is unavailable.',
    );
    return;
  }

  // Check if selected tests are pending dispatch
  if (selectedOrders.length > 0) {
    Alert.alert(
      'Pending Orders',
      'Please dispatch the selected laboratory or radiology tests before completing the consultation.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Go to Orders',
          onPress: () => setActiveTab('Orders'),
        },
      ],
    );
    return;
  }

  // Check if doctor has signed
  if (!signature.trim()) {
    Alert.alert(
      'Signature Required',
      'Please sign before completing the consultation.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Now',
          onPress: () => setShowSignatureModal(true),
        },
      ],
    );
    return;
  }

  // Validate department ID
  const departmentId = Number(patient.department_id);

  if (!Number.isSafeInteger(departmentId) || departmentId <= 0) {
    Alert.alert(
      'Missing Department',
      'A valid department ID is required.',
    );
    return;
  }

  // Confirm consultation completion
  Alert.alert(
    'Complete Consultation',
    `Are you sure you want to complete the consultation for ${patient.patient_name}?`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Complete',
        onPress: async () => {
          const payload: MarkConsultationCompletePayload = {
            patient_id: patient.patient_id,
            doctor_id: doctor.employee_id,
            department_id: departmentId,
            visit_id: patient.visit_id,
            status: 'Completed',
            updated_by: doctor.employee_id,
          };

          try {
            setCompletingConsultation(true);

            console.log(
              'Complete Consultation Payload:',
              JSON.stringify(payload, null, 2),
            );

            const response = await markConsultationComplete(
              accessToken,
              payload,
            );

            console.log(
              'Complete Consultation Response:',
              JSON.stringify(response, null, 2),
            );

            if (response?.success === false) {
              throw new Error(
                response.message ||
                  'Failed to complete consultation.',
              );
            }

            Alert.alert(
              'Success',
              response?.message ||
                'Consultation completed successfully.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    setSignature('');
                    setSelectedOrders([]);
                    dispatch(setSelectedPatient(null));
                    navigation.navigate('Queue');
                  },
                },
              ],
            );
          } catch (error: unknown) {
            const message = axios.isAxiosError(error)
              ? error.response?.data?.message || error.message
              : error instanceof Error
              ? error.message
              : 'Failed to complete consultation.';

            console.log(
              'Complete Consultation Error:',
              axios.isAxiosError(error)
                ? error.response?.data
                : message,
            );

            Alert.alert('Error', message);
          } finally {
            setCompletingConsultation(false);
          }
        },
      },
    ],
  );
};

  const renderVitals = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>BODY MEASUREMENTS</Text>
        {/* <Text style={styles.updatedText}>15M AGO</Text> */}
        <Text style={styles.updatedText}>
          {vitalsData?.vitals_updated_at
            ? new Date(vitalsData.vitals_updated_at).toLocaleString()
            : '--'}
        </Text>
      </View>

      <View style={styles.vitalsGrid}>
        {vitals.map(item => {
          const IconComponent = item.Icon;

          return (
            <View key={item.id} style={styles.vitalCard}>
              <View
                style={[styles.vitalIconBox, { backgroundColor: item.color }]}
              >
                <IconComponent size={23} color="#FFFFFF" strokeWidth={2} />
              </View>

              <View style={styles.vitalInfo}>
                <Text style={styles.vitalLabel}>{item.label}</Text>

                <View style={styles.vitalValueRow}>
                  <Text style={styles.vitalValue}>{item.value}</Text>
                  {!!item.unit && (
                    <Text style={styles.vitalUnit}>{item.unit}</Text>
                  )}
                </View>

                <Text style={styles.vitalRange}>{item.range}</Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.biomarkerContainer}>
        <Text style={styles.biomarkerTitle}>
          LAB BIOMARKERS (RENAL / ELECTROLYTES)
        </Text>

        <Text style={styles.placeholderText}>
          No lab biomarker data available
        </Text>
      </View>
    </View>
  );

  const clinicalFields = [
    {
      id: 'chiefComplaints',
      label: 'Chief Complaints',
      value: clinicalNotesData?.chief_complaint,
    },
    {
      id: 'historyOfPresentIllness',
      label: 'History of Present Illness',
      value: clinicalNotesData?.history_of_present_illness,
    },
    {
      id: 'medicalSurgicalMedicationHistory',
      label: 'Medical, surgical and medication history',
      value: [
        clinicalNotesData?.past_medical_surgical_history,
        clinicalNotesData?.medication_history,
      ]
        .filter(Boolean)
        .join('\n'),
    },
    {
      id: 'allergies',
      label: 'Allergies',
      value: clinicalNotesData?.allergies,
    },
    {
      id: 'personalFamilyHistory',
      label: 'Personal & Family History',
      value: clinicalNotesData?.personal_family_history,
    },
  ];

  const physicalExaminationFields = [
    {
      id: 'generalAppearance',
      label: 'General Appearance',
      value: clinicalNotesData?.pe_general_appearance,
    },
    {
      id: 'cardiovascular',
      label: 'Cardiovascular (CVS)',
      value: clinicalNotesData?.pe_cardiovascular,
    },
    {
      id: 'respiratory',
      label: 'Respiratory (RS)',
      value: clinicalNotesData?.pe_respiratory,
    },
    {
      id: 'gastrointestinal',
      label: 'Gastrointestinal (GI)',
      value: clinicalNotesData?.pe_gastrointestinal,
    },
    {
      id: 'centralNervous',
      label: 'Central Nervous (CNS)',
      value: clinicalNotesData?.pe_central_nervous,
    },
    {
      id: 'musculoskeletalSkin',
      label: 'Musculoskeletal & Skin',
      value: clinicalNotesData?.pe_musculoskeletal_skin,
    },
  ];

  const renderClinicalNotes = () => (
    <View style={styles.clinicalNotesContainer}>
      <View style={styles.clinicalNotesHeader}>
        <Text style={styles.clinicalNotesTitle}>Consultation Notes</Text>

        <Text style={styles.clinicalDoctorName}>{doctorName}</Text>
      </View>

      {/* Add previous visit information here */}
      {isPreviousNotes && clinicalNotesData && (
        <Text style={styles.previousNotesText}>
          Previous visit notes ·{' '}
          {new Date(clinicalNotesData.createdAt).toLocaleDateString()}
        </Text>
      )}
      {/* Clinical Notes */}
      {clinicalFields.map(field => (
        <View key={field.id} style={styles.clinicalField}>
          <Text style={styles.clinicalLabel}>{field.label}</Text>

          <View style={styles.clinicalValueBox}>
            <Text style={styles.clinicalValueText}>
              {field.value?.trim() || 'Not recorded'}
            </Text>
          </View>
        </View>
      ))}

      {/* Systemic Physical Examination */}
      <View style={styles.peSectionHeader}>
        <Text style={styles.peSectionTitle}>
          SYSTEMIC PHYSICAL EXAMINATION (PE)
        </Text>
      </View>

      <View style={styles.peGrid}>
        {physicalExaminationFields.map(field => (
          <View key={field.id} style={styles.peField}>
            <Text style={styles.peLabel}>{field.label}</Text>

            <View style={styles.clinicalValueBox}>
              <Text style={styles.clinicalValueText}>
                {field.value?.trim() || 'Not recorded'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.diagnosisSection}>
        <View style={styles.peSectionHeader}>
          <Text style={styles.peSectionTitle}>
            DIFFERENTIAL DIAGNOSIS & ICD-10 CODING
          </Text>
        </View>

        <View style={styles.clinicalValueBox}>
          <Text style={styles.clinicalValueText}>
            {[
              clinicalNotesData?.primary_diagnosis,
              clinicalNotesData?.icd10_code,
              clinicalNotesData?.secondary_differential_diagnoses,
            ]
              .filter(Boolean)
              .join('\n') || 'Not recorded'}
          </Text>
        </View>
      </View>
    </View>
  );

  const resetPrescription = () => {
    setMedicineName('');
    setDosage('');
    setFrequency('');
    setDuration('');
    setTotal('');
    setShowMedicineList(false);
    setShowDosageList(false);
    setShowFrequencyList(false);
    setSelectedMedicineId(null);
    setMedicineSearch('');
    setSelectedDosageId(null);

    setSelectedFrequencyId(null);
    setSelectedDurationId(null);
    setShowDurationList(false);

    setSelectedRouteId(null);
    setSelectedRouteName('');
  };

  //   const handleConfirmPrescription = () => {
  //     if (
  //       selectedMedicineId == null ||
  //       selectedDosageId == null ||
  //       selectedFrequencyId == null ||
  //       selectedDurationId == null ||
  //       !total.trim()
  //     ) {
  //       Alert.alert('Required Fields', 'Please fill all prescription fields.');
  //       return;
  //     }
  // if (selectedRouteId == null) {
  //   Alert.alert('Required Field', 'Please select a medicine route.');
  //   return;
  // }
  //     const newMedicine: Medicine = {
  //       id: Date.now(),
  //       name: medicineName,
  //       dosage,
  //       frequency,
  //       duration,
  //       total,
  //     };

  //     setActiveMedicines(prev => [...prev, newMedicine]);

  //     resetPrescription();

  //     Alert.alert(
  //       'Added to Preview',
  //       'Medicine added to the local prescription preview.',
  //     );
  //   };

  const handleConfirmPrescription = async () => {
    if (prescriptionSaving) return;

    if (!accessToken || !patient || !doctor) {
      Alert.alert('Error', 'Patient or doctor session is unavailable.');
      return;
    }

    if (
      selectedMedicineId == null ||
      selectedDosageId == null ||
      selectedFrequencyId == null ||
      selectedDurationId == null ||
      selectedRouteId == null ||
      !total.trim()
    ) {
      Alert.alert('Required Fields', 'Please fill all prescription fields.');
      return;
    }

    const quantity = Number(total.trim());

    if (!Number.isSafeInteger(quantity) || quantity <= 0) {
      Alert.alert('Invalid Quantity', 'Enter a valid positive quantity.');
      return;
    }

    const selectedMedicine = medicineOptions.find(
      item => item.id === selectedMedicineId,
    );

    if (!selectedMedicine) {
      Alert.alert('Error', 'Selected medicine not found.');
      return;
    }

    // Use the actual department ID associated with this visit.
    // Ensure your QueuePatient type and dashboard response provide it.
    const departmentId = patient.department_id;

    if (typeof departmentId !== 'number' || departmentId <= 0) {
      Alert.alert(
        'Missing Department',
        'A valid department ID is required to save the prescription.',
      );
      return;
    }

    const payload: SavePrescriptionPayload = {
      patient_id: patient.patient_id,
      doctor_id: doctor.employee_id,
      department_id: departmentId,
      visit_id: patient.visit_id,

      // Confirm with backend which authenticated user ID is required.
      created_by: doctor.employee_id,

      medicines: [
        {
          id: selectedMedicine.id,
          name: selectedMedicine.item_name,
          dosage: selectedDosageId,
          frequency: String(selectedFrequencyId),
          duration: String(selectedDurationId),
          route: selectedRouteId,
          instructions: selectedMedicine.instructions ?? '',
          is_lasa: selectedMedicine.is_lasa ?? false,
          is_high_alert: selectedMedicine.is_high_alert ?? false,
          tall_man_name: selectedMedicine.tall_man_name ?? '',
          lasa_confused_with: selectedMedicine.lasa_confused_with ?? '',
          lasa_warning: selectedMedicine.lasa_warning ?? '',
          total: quantity,
        },
      ],

      // additional_notes: additionalNotes.trim(),
      additional_notes: '',
    };

    try {
      setPrescriptionSaving(true);
      console.log(
        'Save Prescription Payload:',
        JSON.stringify(payload, null, 2),
      );
      const response = await savePrescription(accessToken, payload);
      console.log(
        'Save Prescription API Response:',
        JSON.stringify(response, null, 2),
      );

      if (!response?.prescription_id) {
        throw new Error(response?.message || 'Failed to save prescription.');
      }

      const newMedicine: Medicine = {
        id: Date.now(),
        name: medicineName,
        dosage,
        frequency,
        duration,
        total: String(quantity),
      };

      setActiveMedicines(prev => [...prev, newMedicine]);

      resetPrescription();
      // setAdditionalNotes('');

      Alert.alert(
        'Success',
        response.message || 'Prescription saved successfully.',
      );
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
        ? error.message
        : 'Failed to save prescription.';

      Alert.alert('Error', message);
    } finally {
      setPrescriptionSaving(false);
    }
  };

  const handleRemoveMedicine = (id: number) => {
    setActiveMedicines(prev => prev.filter(medicine => medicine.id !== id));
  };

  const activeFrequencyOptions = frequencyOptions.filter(
    item => (!item.status || item.status === 'ACTIVE') && !item.is_deleted,
  );

  const activeDosageOptions = dosageOptions.filter(
    item => item.status === 'ACTIVE' && !item.is_deleted,
  );

  const activeDurationOptions = durationOptions.filter(
    item => item.status === 'ACTIVE' && !item.is_deleted,
  );

  const renderPrescription = () => (
    <View style={styles.prescriptionContainer}>
      {/* Medicine Card */}
      <View style={styles.medicineCard}>
        <View style={styles.medicineCardHeader}>
          <Text style={styles.medicineCardTitle}>Medicine #1</Text>

          <TouchableOpacity onPress={resetPrescription}>
            <Trash2 size={19} color="#FF3B5C" />
          </TouchableOpacity>
        </View>

        <View style={styles.medicineDivider} />

        <Text style={styles.medicineDescription}>
          Select from Hospital Medicine Master (Pre-configured HAM & LASA rules)
        </Text>

        {/* Medicine Selection */}
        <Text style={styles.prescriptionLabel}>Medicine</Text>

        <TouchableOpacity
          style={styles.prescriptionDropdown}
          onPress={() => {
            setShowMedicineList(!showMedicineList);
            setShowDosageList(false);
            setShowFrequencyList(false);
            setShowDurationList(false);
          }}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.dropdownText,
              !medicineName && styles.placeholderDropdownText,
            ]}
          >
            {medicineName || 'Select Medicine'}
          </Text>

          <ChevronDown size={18} color="#243F65" />
        </TouchableOpacity>

        {/* {showMedicineList && (
        <View style={styles.dropdownOptions}>
          {medicineOptions.map(item => (
            <TouchableOpacity
              key={item}
              style={styles.dropdownOption}
              onPress={() => {
                setMedicineName(item);
                setShowMedicineList(false);
              }}
            >
              <Text style={styles.dropdownOptionText}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )} */}
        {showMedicineList && (
          <View style={styles.dropdownOptions}>
            <TextInput
              style={styles.medicineSearchInput}
              placeholder="Search medicine..."
              placeholderTextColor="#94A3B8"
              value={medicineSearch}
              onChangeText={setMedicineSearch}
            />

            {medicineLoading ? (
              <ActivityIndicator
                size="small"
                color="#104B80"
                style={{ marginVertical: 16 }}
              />
            ) : medicineError ? (
              <Text style={styles.dropdownMessage}>{medicineError}</Text>
            ) : filteredMedicines.length === 0 ? (
              <Text style={styles.dropdownMessage}>No medicines found</Text>
            ) : (
              <ScrollView
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 220 }}
                showsVerticalScrollIndicator={true}
              >
                {/* {filteredMedicines.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.dropdownOption}
            onPress={() => {
              setSelectedMedicineId(item.id);
              setMedicineName(item.medicine_name);
              setMedicineSearch('');
              setShowMedicineList(false);
            }}>
            <Text style={styles.dropdownOptionText}>
              {item.medicine_name}
            </Text>
          </TouchableOpacity>
        ))} */}
                {filteredMedicines.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setSelectedMedicineId(item.id);
                      setMedicineName(item.item_name);
                      // setDosage(item.default_dose || '');
                      setSelectedDosageId(null);
                      setDosage('');
                      setSelectedFrequencyId(null);
                      setFrequency('');
                      // setDuration(
                      //   item.duration != null ? String(item.duration) : '',
                      // );
                      setSelectedDurationId(null);
                      setDuration('');
                      setTotal('');
                      setMedicineSearch('');
                      setShowMedicineList(false);
                      setShowDurationList(false);

                      if (item.is_lasa || item.is_high_alert) {
                        Alert.alert(
                          'Medicine Safety Alert',
                          [
                            item.is_lasa ? 'LASA medicine' : '',
                            item.is_high_alert ? 'High-alert medicine' : '',
                            item.lasa_warning || '',
                          ]
                            .filter(Boolean)
                            .join('\n'),
                        );
                      }
                    }}
                  >
                    <Text style={styles.dropdownOptionText}>
                      {item.item_name}
                    </Text>

                    <Text style={styles.medicineSubtitle}>
                      {[item.brand_name, item.strength]
                        .filter(Boolean)
                        .join(' • ')}
                    </Text>

                    {(item.is_lasa || item.is_high_alert) && (
                      <Text style={styles.medicineWarning}>
                        {item.is_high_alert ? 'High Alert' : 'LASA'}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Dosage and Frequency */}
        <View style={styles.prescriptionRow}>
          <View style={styles.prescriptionHalf}>
            <Text style={styles.prescriptionLabel}>Dosage</Text>
            <TouchableOpacity
              style={styles.prescriptionDropdown}
              onPress={() => {
                setShowDosageList(!showDosageList);
                setShowMedicineList(false);
                setShowFrequencyList(false);
                setShowDurationList(false);
              }}
            >
              <Text style={styles.dropdownText} numberOfLines={1}>
                {dosage || 'Select'}
              </Text>
              <ChevronDown size={17} color="#243F65" />
            </TouchableOpacity>
            {showDosageList && (
              <View style={styles.dropdownOptions}>
                {dosageLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#104B80"
                    style={{ marginVertical: 15 }}
                  />
                ) : dosageError ? (
                  <Text style={styles.dropdownMessage}>{dosageError}</Text>
                ) : activeDosageOptions.length === 0 ? (
                  <Text style={styles.dropdownMessage}>
                    No dosage options available
                  </Text>
                ) : (
                  <ScrollView
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                    style={{ maxHeight: 200 }}
                  >
                    {activeDosageOptions.map(item => (
                      <TouchableOpacity
                        key={item.dosage_form_id}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setSelectedDosageId(item.dosage_form_id);
                          setDosage(item.dosage_form_name);
                          setShowDosageList(false);
                        }}
                      >
                        <Text style={styles.dropdownOptionText}>
                          {item.dosage_form_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </View>

          <View style={styles.prescriptionHalf}>
            <Text style={styles.prescriptionLabel}>Frequency</Text>
            <TouchableOpacity
              style={styles.prescriptionDropdown}
              onPress={() => {
                setShowFrequencyList(!showFrequencyList);
                setShowMedicineList(false);
                setShowDosageList(false);
                setShowDurationList(false);
              }}
            >
              <Text style={styles.dropdownText} numberOfLines={1}>
                {frequency || 'Select'}
              </Text>
              <ChevronDown size={17} color="#243F65" />
            </TouchableOpacity>
            {showFrequencyList && (
              <View style={styles.dropdownOptions}>
                {frequencyLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#104B80"
                    style={{ marginVertical: 15 }}
                  />
                ) : frequencyError ? (
                  <Text style={styles.dropdownMessage}>{frequencyError}</Text>
                ) : activeFrequencyOptions.length === 0 ? (
                  <Text style={styles.dropdownMessage}>
                    No frequency options available
                  </Text>
                ) : (
                  <ScrollView
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                    style={{ maxHeight: 200 }}
                  >
                    {activeFrequencyOptions.map(item => (
                      <TouchableOpacity
                        key={item.frequency_id}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setSelectedFrequencyId(item.frequency_id);
                          setFrequency(item.frequency_name);
                          setShowFrequencyList(false);
                        }}
                      >
                        <Text style={styles.dropdownOptionText}>
                          {item.frequency_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Duration and Total Quantity */}
        <View style={styles.prescriptionRow}>
          <View style={styles.prescriptionHalf}>
            <Text style={styles.prescriptionLabel}>Duration</Text>
            <TouchableOpacity
              style={styles.prescriptionDropdown}
              onPress={() => {
                setShowDurationList(!showDurationList);
                setShowMedicineList(false);
                setShowDosageList(false);
                setShowFrequencyList(false);
              }}
            >
              <Text style={styles.dropdownText} numberOfLines={1}>
                {duration || 'Select'}
              </Text>
              <ChevronDown size={17} color="#243F65" />
            </TouchableOpacity>
            {showDurationList && (
              <View style={styles.dropdownOptions}>
                {durationLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#104B80"
                    style={{ marginVertical: 15 }}
                  />
                ) : durationError ? (
                  <Text style={styles.dropdownMessage}>{durationError}</Text>
                ) : activeDurationOptions.length === 0 ? (
                  <Text style={styles.dropdownMessage}>
                    No duration options available
                  </Text>
                ) : (
                  <ScrollView
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                    style={{ maxHeight: 200 }}
                  >
                    {activeDurationOptions.map(item => (
                      <TouchableOpacity
                        key={item.duration_id}
                        style={styles.dropdownOption}
                        onPress={() => {
                          setSelectedDurationId(item.duration_id);
                          setDuration(item.display_text);
                          setShowDurationList(false);
                        }}
                      >
                        <Text style={styles.dropdownOptionText}>
                          {item.display_text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </View>
          <View style={styles.prescriptionHalf}>
            <Text style={styles.prescriptionLabel}>Total Quantity</Text>
            <TextInput
              style={styles.prescriptionInput}
              placeholder="Enter quantity"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              value={total}
              onChangeText={setTotal}
            />
          </View>
        </View>

        <View style={styles.routeSection}>
          <Text style={styles.prescriptionLabel}>Route</Text>

          {routeLoading ? (
            <ActivityIndicator size="small" color="#104B80" />
          ) : routeError ? (
            <Text style={{ color: '#DC2626' }}>{routeError}</Text>
          ) : (
            <View style={styles.routeOptionsContainer}>
              {routeOptions
                .filter(item => item.status === 'ACTIVE' && !item.is_deleted)
                .map(item => (
                  <TouchableOpacity
                    key={item.route_id}
                    style={[
                      styles.routeButton,
                      selectedRouteId === item.route_id &&
                        styles.routeButtonSelected,
                    ]}
                    onPress={() => {
                      setSelectedRouteId(item.route_id);
                      setSelectedRouteName(item.route_name);
                    }}
                  >
                    <Text
                      style={[
                        styles.routeButtonText,
                        selectedRouteId === item.route_id &&
                          styles.routeButtonTextSelected,
                      ]}
                    >
                      {item.route_name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmPrescriptionButton,
            prescriptionSaving && { opacity: 0.6 },
          ]}
          onPress={handleConfirmPrescription}
          disabled={prescriptionSaving}
        >
          {prescriptionSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <CheckCircle2 size={19} color="#FFFFFF" />
          )}

          <Text style={styles.confirmPrescriptionText}>
            {prescriptionSaving
              ? 'Saving Prescription...'
              : 'Confirm & Prescribe Medicine'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Current Active Medications */}
      <View style={styles.activeMedicinesSection}>
        <Text style={styles.activeMedicinesTitle}>
          CURRENT ACTIVE MEDICATIONS ({activeMedicines.length})
        </Text>

        {activeMedicines.length === 0 ? (
          <View style={styles.emptyMedicineCard}>
            <Text style={styles.emptyMedicineText}>
              No medications added yet
            </Text>
          </View>
        ) : (
          activeMedicines.map(medicine => (
            <View key={medicine.id} style={styles.activeMedicineCard}>
              <View style={styles.activeMedicineHeader}>
                <Text style={styles.activeMedicineName}>{medicine.name}</Text>

                <TouchableOpacity
                  onPress={() => handleRemoveMedicine(medicine.id)}
                >
                  <Trash2 size={17} color="#EF4444" />
                </TouchableOpacity>
              </View>

              <View style={styles.activeMedicineDetails}>
                <Text style={styles.activeMedicineInfo}>
                  Dosage: {medicine.dosage}
                </Text>

                <Text style={styles.activeMedicineInfo}>
                  Frequency: {medicine.frequency}
                </Text>

                <Text style={styles.activeMedicineInfo}>
                  Duration: {medicine.duration}
                </Text>

                <Text style={styles.activeMedicineInfo}>
                  Total: {medicine.total}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );

  const renderOrders = () => {
    const renderTestGroup = (
      title: string,
      tests: InvestigationTest[],
      type: 'lab' | 'radiology',
    ) => (
      <View style={styles.orderCard}>
        <View style={styles.orderCardHeader}>
          {type === 'lab' ? (
            <FlaskConical size={18} color="#008B83" />
          ) : (
            <Radiation size={18} color="#D6A000" />
          )}

          <Text style={styles.orderCardTitle}>{title}</Text>
        </View>

        <View style={styles.orderDivider} />

        {tests.map(test => {
          const isSelected = selectedOrders.includes(test.id);

          return (
            <TouchableOpacity
              key={test.id}
              style={styles.orderTestRow}
              activeOpacity={0.75}
              onPress={() => toggleOrder(test.id)}
            >
              <View
                style={[
                  styles.orderCheckbox,
                  isSelected && styles.orderCheckboxSelected,
                ]}
              >
                {isSelected && <Text style={styles.orderCheckmark}>✓</Text>}
              </View>

              <Text style={styles.orderTestName} numberOfLines={2}>
                {test.name}
              </Text>

              <Text style={styles.orderTestPrice}>₹{test.price}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );

    return (
      <View style={styles.ordersContainer}>
        <View style={styles.ordersHeader}>
          <View style={styles.ordersHeaderInfo}>
            <Text style={styles.ordersTitle}>Investigations Checklist</Text>
            <Text style={styles.ordersSubtitle}>
              Order labs and radiology imaging
            </Text>
          </View>

          {/* <TouchableOpacity
            style={[
              styles.dispatchOrdersButton,
              selectedOrderCount === 0 && { opacity: 0.6 },
            ]}
            activeOpacity={0.8}
            onPress={handleDispatchOrders}
          >
            <Text style={styles.dispatchOrdersText}>Dispatch Orders</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={[
              styles.dispatchOrdersButton,
              (selectedOrderCount === 0 || savingOrder) && {
                opacity: 0.6,
              },
            ]}
            activeOpacity={0.8}
            onPress={handleDispatchOrders}
            disabled={selectedOrderCount === 0 || savingOrder}
          >
            {savingOrder ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.dispatchOrdersText}>Dispatch Orders</Text>
            )}
          </TouchableOpacity>
        </View>

        {selectedOrderCount > 0 && (
          <View style={styles.selectedOrdersRow}>
            <Text style={styles.selectedOrdersText}>
              {selectedOrderCount} test(s) selected
            </Text>
          </View>
        )}

        {labLoading ? (
          <View style={styles.orderCard}>
            <ActivityIndicator size="small" color="#104B80" />
            <Text style={styles.placeholderText}>
              Loading laboratory tests...
            </Text>
          </View>
        ) : labError ? (
          <View style={styles.orderCard}>
            <Text style={styles.placeholderText}>{labError}</Text>
          </View>
        ) : labTests.length === 0 ? (
          <View style={styles.orderCard}>
            <Text style={styles.placeholderText}>
              No laboratory tests available
            </Text>
          </View>
        ) : (
          renderTestGroup('Laboratory Tests', labTests, 'lab')
        )}

        {/* {renderTestGroup('Radiology Tests', radiologyTests, 'radiology')} */}
        {radiologyLoading ? (
          <View style={styles.orderCard}>
            <ActivityIndicator size="small" color="#104B80" />
            <Text style={styles.placeholderText}>
              Loading radiology tests...
            </Text>
          </View>
        ) : radiologyError ? (
          <View style={styles.orderCard}>
            <Text style={styles.placeholderText}>{radiologyError}</Text>
          </View>
        ) : radiologyTests.length === 0 ? (
          <View style={styles.orderCard}>
            <Text style={styles.placeholderText}>
              No radiology tests available
            </Text>
          </View>
        ) : (
          renderTestGroup('Radiology Tests', radiologyTests, 'radiology')
        )}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      // case 'Vitals':
      //   return renderVitals();
      case 'Vitals':
        if (vitalsLoading) {
          return (
            <View style={styles.placeholder}>
              <ActivityIndicator size="large" color="#153E6C" />
              <Text style={styles.placeholderText}>
                Loading patient vitals...
              </Text>
            </View>
          );
        }

        if (vitalsError) {
          return (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>{vitalsError}</Text>
            </View>
          );
        }

        if (!vitalsData) {
          return (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>No vitals available</Text>
            </View>
          );
        }

        return renderVitals();

      // case 'Clinical Notes':
      //   return renderClinicalNotes();
      case 'Clinical Notes':
        if (clinicalNotesLoading) {
          return (
            <View style={styles.placeholder}>
              <ActivityIndicator size="large" color="#153E6C" />
              <Text style={styles.placeholderText}>
                Loading clinical notes...
              </Text>
            </View>
          );
        }

        if (clinicalNotesError) {
          return (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>{clinicalNotesError}</Text>
            </View>
          );
        }

        if (!clinicalNotesData) {
          return (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                No clinical notes available
              </Text>
            </View>
          );
        }

        return renderClinicalNotes();

      // case 'Prescription':
      //   return (
      //     <View style={styles.placeholder}>
      //       <Text style={styles.placeholderText}>Prescription</Text>
      //     </View>
      //   );
      case 'Prescription':
        return renderPrescription();

      // case 'Orders':
      //   return (
      //     <View style={styles.placeholder}>
      //       <Text style={styles.placeholderText}>Orders</Text>
      //     </View>
      //   );
      case 'Orders':
        return renderOrders();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Same header as QueueScreen */}
      <DoctorHeader />
<SignatureModal
  visible={showSignatureModal}
  doctorName={doctorName}
  onClose={() => setShowSignatureModal(false)}
  onSave={handleSaveSignature}
/>
      {/* Consultation actions */}
      <View style={styles.actionHeader}>
        <TouchableOpacity
          style={styles.backButton}
          // onPress={() => navigation.goBack()}
          onPress={() => navigation.navigate('Queue')}
        >
          <ArrowLeft size={19} color="#27446A" />
          <Text style={styles.backText}>Queue</Text>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          {/* <TouchableOpacity style={styles.signButton} onPress={() => {}}>
            <PenTool size={17} color="#1558FF" />
            <Text style={styles.signText}>Sign</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
  style={[
    styles.signButton,
    signature ? {borderColor: '#10A64B'} : {},
  ]}
  onPress={() => {
    if (!patient || !doctor || !accessToken) {
      Alert.alert('Error', 'Patient or doctor is unavailable.');
      return;
    }

    setShowSignatureModal(true);
  }}>
  {signature ? (
    <CheckCircle2 size={17} color="#10A64B" />
  ) : (
    <PenTool size={17} color="#1558FF" />
  )}

  <Text
    style={[
      styles.signText,
      signature ? {color: '#10A64B'} : {},
    ]}>
    {signature ? 'Signed' : 'Sign'}
  </Text>
</TouchableOpacity>

          {/* <TouchableOpacity style={styles.completeButton} onPress={() => {}}>
            <CheckCircle2 size={18} color="#FFFFFF" />
            <Text style={styles.completeText}>Complete</Text>
          </TouchableOpacity> */}

          {/* <TouchableOpacity
            style={[
              styles.completeButton,
              completingConsultation && { opacity: 0.6 },
            ]}
            onPress={handleCompleteConsultation}
            disabled={completingConsultation}
            activeOpacity={0.8}
          >
            {completingConsultation ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <CheckCircle2 size={18} color="#FFFFFF" />
            )}

            <Text style={styles.completeText}>
              {completingConsultation ? 'Completing...' : 'Complete'}
            </Text>
          </TouchableOpacity> */}
          <TouchableOpacity
  style={[
    styles.completeButton,
    (completingConsultation || savingOrder) && {
      opacity: 0.6,
    },
  ]}
  onPress={handleCompleteConsultation}
  disabled={completingConsultation || savingOrder}
  activeOpacity={0.8}>
  {completingConsultation ? (
    <ActivityIndicator
      size="small"
      color="#FFFFFF"
    />
  ) : (
    <CheckCircle2 size={18} color="#FFFFFF" />
  )}

  <Text style={styles.completeText}>
    {completingConsultation
      ? 'Completing...'
      : 'Complete'}
  </Text>
</TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Patient information */}
        <View style={styles.patientHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {patientName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patientName}</Text>

            <Text style={styles.patientDetails}>
              {patientUhid} · {patientGender}, {patientAge}y
            </Text>
          </View>

          <View style={styles.tokenBadge}>
            <Text style={styles.tokenText}>Token {patientToken}</Text>
          </View>
        </View>

        {/* Critical allergies */}
        {!!patientAllergies && (
          <View style={styles.allergyContainer}>
            <View style={styles.allergyIcon}>
              <AlertTriangle size={22} color="#E97800" />
            </View>

            <View style={styles.allergyInfo}>
              <Text style={styles.allergyTitle}>CRITICAL ALLERGIES (1):</Text>

              <Text style={styles.allergyName}>{patientAllergies}</Text>

              {showAllergyDetails && (
                <Text style={styles.allergyDescription}>
                  Review allergy details before prescribing.
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => setShowAllergyDetails(prev => !prev)}
            >
              <Text style={styles.detailsText}>Details</Text>
              <ChevronDown size={16} color="#C40036" />
            </TouchableOpacity>
          </View>
        )}

        {/* Consultation tabs */}

        <View style={styles.tabsContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.8}
              style={[styles.tabButton, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  actionHeader: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F3F7',
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 10,
  },
  backText: {
    color: '#243F65',
    fontSize: 14,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  signButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#1558FF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  signText: {
    color: '#1558FF',
    fontSize: 14,
    fontWeight: '700',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10A64B',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },

  completeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8FAFD',
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#006298',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D5E8FA',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },
  patientInfo: {
    flex: 1,
    minWidth: 0,
  },
  patientName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#101B35',
  },
  patientDetails: {
    fontSize: 11,
    color: '#52617C',
    marginTop: 4,
  },
  tokenBadge: {
    backgroundColor: '#DCEBFF',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B8D5FF',
  },
  tokenText: {
    color: '#0040B8',
    fontSize: 12,
    fontWeight: '800',
  },
  allergyContainer: {
    marginHorizontal: 18,
    marginBottom: 18,
    padding: 14,
    backgroundColor: '#FFF9E8',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F5D982',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  allergyIcon: {
    backgroundColor: '#FFE6A0',
    padding: 7,
    borderRadius: 8,
  },
  allergyInfo: {
    flex: 1,
  },
  allergyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#BD0033',
    marginBottom: 7,
  },
  allergyName: {
    color: '#A95500',
    fontSize: 12,
  },
  allergyDescription: {
    color: '#C40036',
    fontSize: 11,
    marginTop: 7,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#FFC7D0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  detailsText: {
    color: '#C40036',
    fontSize: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 5,
    backgroundColor: '#FFFFFF',
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F3F7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#104B80',
  },
  tabText: {
    color: '#355173',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    color: '#637C9F',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  updatedText: {
    color: '#93A5C1',
    fontSize: 10,
    fontWeight: '700',
  },

  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },

  vitalCard: {
    width: '48.5%',
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE6F2',
    borderRadius: 18,
    elevation: 1,
  },

  vitalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  vitalInfo: {
    flex: 1,
    minWidth: 0,
  },

  vitalLabel: {
    color: '#526B8F',
    fontSize: 12,
    fontWeight: '500',
  },

  vitalValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },

  vitalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#07132D',
  },
  vitalUnit: {
    fontSize: 10,
    color: '#07132D',
  },
  vitalRange: {
    color: '#94A8C5',
    fontSize: 10,
    marginTop: 9,
  },
  biomarkerContainer: {
    marginTop: 18,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDE6F2',
    backgroundColor: '#F6F9FD',
  },
  biomarkerTitle: {
    color: '#183F70',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 14,
  },
  placeholder: {
    padding: 35,
    alignItems: 'center',
  },
  placeholderText: {
    color: '#64748B',
    fontSize: 15,
  },
  clinicalNotesContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
  },

  clinicalNotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
    gap: 8,
  },

  clinicalNotesTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#071A36',
  },

  clinicalDoctorName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8BA0C3',
    flexShrink: 1,
    textAlign: 'right',
  },

  clinicalField: {
    marginBottom: 18,
  },

  clinicalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#183F70',
    marginBottom: 8,
  },
  peSectionHeader: {
    marginTop: 8,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#EEF4FB',
    borderLeftWidth: 4,
    borderLeftColor: '#104B80',
    borderRadius: 8,
  },

  peSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#104B80',
    letterSpacing: 0.3,
  },
  peGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },

  peField: {
    width: '48%',
  },

  peLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#183F70',
    marginBottom: 8,
    minHeight: 32,
  },
  clinicalValueBox: {
    minHeight: 55,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
  },

  clinicalValueText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  diagnosisSection: {
    marginTop: 20,
  },
  previousNotesText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
    fontWeight: '500',
  },
  prescriptionContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 30,
    backgroundColor: '#F8FAFD',
  },

  medicineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },

  medicineCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  medicineCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#071A36',
  },

  medicineDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },

  medicineDescription: {
    fontSize: 13,
    color: '#183F70',
    lineHeight: 20,
    marginBottom: 18,
  },

  prescriptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#183F70',
    marginBottom: 7,
  },

  prescriptionDropdown: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#C7D6EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 6,
  },

  dropdownText: {
    fontSize: 12,
    color: '#071A36',
    flex: 1,
  },

  placeholderDropdownText: {
    color: '#94A3B8',
  },

  dropdownOptions: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE5F1',
    borderRadius: 10,
    marginTop: -8,
    marginBottom: 14,
    overflow: 'hidden',
  },

  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  dropdownOptionText: {
    fontSize: 12,
    color: '#183F70',
  },

  prescriptionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },

  prescriptionHalf: {
    flex: 1,
    minWidth: 0,
  },

  prescriptionInput: {
    height: 46,
    borderWidth: 1,
    borderColor: '#C7D6EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#071A36',
    marginBottom: 14,
  },

  confirmPrescriptionButton: {
    backgroundColor: '#1558FF',
    borderRadius: 12,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 12,
  },

  confirmPrescriptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  activeMedicinesSection: {
    marginTop: 24,
  },

  activeMedicinesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#183F70',
    letterSpacing: 0.4,
    marginBottom: 12,
  },

  activeMedicineCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE5F1',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  activeMedicineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },

  activeMedicineName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#071A36',
    flex: 1,
  },

  activeMedicineDetails: {
    gap: 6,
  },

  activeMedicineInfo: {
    fontSize: 12,
    color: '#52617C',
  },

  emptyMedicineCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },

  emptyMedicineText: {
    fontSize: 13,
    color: '#94A3B8',
  },

  medicineSearchInput: {
    height: 42,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#071A36',
    backgroundColor: '#FFFFFF',
  },

  dropdownMessage: {
    fontSize: 12,
    color: '#64748B',
    padding: 16,
    textAlign: 'center',
  },
  medicineSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },

  medicineWarning: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 4,
  },
  routeSection: {
    marginTop: 10,
    marginBottom: 16,
  },

  routeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },

  routeButton: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D6EB',
    backgroundColor: '#FFFFFF',
  },

  routeButtonSelected: {
    backgroundColor: '#104B80',
    borderColor: '#104B80',
  },

  routeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#243F65',
  },

  routeButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  ordersContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },

  ordersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },

  ordersHeaderInfo: {
    flex: 1,
  },

  ordersTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#071A36',
  },

  ordersSubtitle: {
    fontSize: 12,
    color: '#526B91',
    marginTop: 4,
  },

  dispatchOrdersButton: {
    backgroundColor: '#104B80',
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dispatchOrdersText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  selectedOrdersRow: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    marginBottom: 12,
  },

  selectedOrdersText: {
    color: '#104B80',
    fontSize: 12,
    fontWeight: '700',
  },

  orderCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE5F0',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 15,
  },

  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingBottom: 12,
  },

  orderCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#153F84',
  },

  orderDivider: {
    height: 1,
    backgroundColor: '#E8EDF5',
    marginBottom: 4,
  },

  orderTestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: 8,
    gap: 11,
  },

  orderCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#8B929C',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  orderCheckboxSelected: {
    backgroundColor: '#1680FF',
    borderColor: '#1680FF',
  },

  orderCheckmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 16,
  },

  orderTestName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#071A36',
  },

  orderTestPrice: {
    fontSize: 11,
    fontWeight: '500',
    color: '#344B70',
    textAlign: 'right',
  },
});
