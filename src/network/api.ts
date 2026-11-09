import axios from 'axios';
const BASE_URL = 'https://hims-api.zynotechnologies.com';
// const BASE_URL = 'http://192.168.1.79:3000';

export const staffLogin = async (
  encryptedEmail: string,
  encryptedPassword: string,
) => {
  const response = await axios.post(
    // 'https://hims-api.zynotechnologies.com/api/auth/signin',
    `${BASE_URL}/api/auth/signin`,
    {
      encryptedEmail,
      encryptedPassword,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data;
};

// Doctor OPD Dashboard API
export const getDoctorOpdDashboard = async (
  accessToken: string,
  status: string = 'all',
) => {
  const response = await axios.get(
    `${BASE_URL}/api/v1/doctor/opd-dashboard`,
    {
      params: {
        status,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-entity-id': '1',
        Accept: 'application/json',
      },
    },
  );

  return response.data;
};


 // Get Single Patient Vitals API
export const getSingleVitals = async (
  accessToken: string,
  patientId: number,
  visitId: number,
) => {
  const response = await axios.get(
    `${BASE_URL}/api/v1/getsinglevitals`,
    {
      params: {
        patient_id: patientId,
        visit_id: visitId,
        page_url:
          '/master/opd-management/patients/consultation',
        page_name: 'consultation',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-entity-id': '1',
        Accept: 'application/json',
      },
    },
  );

  return response.data;
};

// export interface SaveClinicalNotesPayload {
//   created_by: number;
//   doctor_id: number;
//   dept_id: number;
//   department_id: number;
//   patient_id: number;
//   visit_id: number;

//   chief_complaint: string;
//   history_of_present_illness: string;
//   past_medical_surgical_history: string;
//   medication_history: string;
//   allergies: string;
//   personal_family_history: string;

//   pe_general_appearance: string;
//   pe_cardiovascular: string;
//   pe_respiratory: string;
//   pe_gastrointestinal: string;
//   pe_central_nervous: string;
//   pe_musculoskeletal_skin: string;

//   primary_diagnosis: string;
//   icd10_code: string;
//   secondary_differential_diagnoses: string;

//   management_goals: string;
//   dietary_lifestyle_advice: string;
//   follow_up_schedule: string;
//   specialty_referral: string;
// }

// Save Patient Clinical Notes API
// export const saveClinicalNotes = async (
//   accessToken: string,
//   payload: SaveClinicalNotesPayload,
// ) => {
//   const response = await axios.post(
//     `${BASE_URL}/api/v1/saveClinicalNotes`,
//     payload,
//     {
//       params: {
//         page_url:
//           '/master/opd-management/patients/consultation',
//         page_name: 'consultation',
//       },
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'x-entity-id': '1',
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//     },
//   );

//   return response.data;
// };

// Get Patient Clinical Notes API
export const getPatientClinicalNotes = async (
  accessToken: string,
  patientId: number,
  visitId: number,
) => {
  const response = await axios.get(
    `${BASE_URL}/api/v1/clinic-notes/patient/${patientId}`,
    {
      params: {
        visit_id: visitId,
        page_url:
          '/master/opd-management/patients/consultation',
        page_name: 'consultation',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-entity-id': '1',
        Accept: 'application/json',
      },
    },
  );

  return response.data;
};

// Get Medicine List API
export const getMedicineList = async (accessToken: string) => {
  const response = await axios.get(
    `${BASE_URL}/api/v1/medicine-list`,
    {
      params: {
        page_url: '/master/opd-management/patients/consultation',
        page_name: 'consultation',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-entity-id': '1',
        Accept: 'application/json',
      },
    },
  );

  return response.data;
};

// Get Dosage List API
export const getDosageList = async (accessToken: string) => {
  const response = await axios.get(
    `${BASE_URL}/api/v1/dosage-list`,
    {
      params: {
        page_url: '/master/opd-management/patients/consultation',
        page_name: 'consultation',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-entity-id': '1',
        Accept: 'application/json',
      },
    },
  );

  return response.data;
};

// Get Medicine Frequency List API
export const getMedicineFrequencyList = async (
  accessToken: string,
) => {
  const response = await axios.get(
    `${BASE_URL}/api/v1/medicine-frequency-list`,
    {
      params: {
        page_url: '/master/opd-management/patients/consultation',
        page_name: 'consultation',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-entity-id': '1',
        Accept: 'application/json',
      },
    },
  );

  return response.data;
};

// Get Medicine Duration List API
export const getMedicineDurationList = async (
  accessToken: string,
) => {
  const response = await axios.get(
    `${BASE_URL}/api/v1/medicine-duration-list`,
    {
      params: {
        page_url: '/master/opd-management/patients/consultation',
        page_name: 'consultation',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-entity-id': '1',
        Accept: 'application/json',
      },
    },
  );

  return response.data;
};
