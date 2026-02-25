import React from 'react';
import AdminDataPage from './AdminDataPage';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const NormalJobsData = () => {
  return (
    <AdminDataPage
      title="Normal Jobs / General Jobs Management"
      apiEndpoint={`${apiUrl}/admin/get-all-applicants`}
      jobCategory="general"
    />
  );
};

export default NormalJobsData;

