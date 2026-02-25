import React from 'react';
import AdminDataPage from './AdminDataPage';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const NGOJobsData = () => {
  return (
    <AdminDataPage
      title="NGO Jobs Management"
      apiEndpoint={`${apiUrl}/admin/get-all-applicants`}
      jobCategory="NGO"
    />
  );
};

export default NGOJobsData;

