import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './CareerPage.css';

const CareerPage = ({ jobType = 'ngo' }) => {
  const navigate = useNavigate();
  const [filterLocation, setFilterLocation] = useState('all');

  // NGO Jobs Data
  const ngoJobs = [
    {
      id: 1,
      title: 'Panchayat Co-ordinator',
      location: 'Kolkata / Village Operations',
      fee: '₹999',
      role: 'panchayat'
    },
    {
      id: 2,
      title: 'Block Co-ordinator',
      location: 'Mumbai / Block Supervision',
      fee: '₹1499',
      role: 'block'
    },
    {
      id: 3,
      title: 'District Co-ordinator',
      location: 'Mumbai / District HQ',
      fee: '₹2100',
      role: 'district'
    },
    {
      id: 4,
      title: 'Health Supervisor',
      location: 'Bangalore / Field Work',
      fee: '₹1499',
      role: 'health'
    },
    {
      id: 5,
      title: 'Mahila Mitra',
      location: 'Rural Areas',
      fee: '₹999',
      role: 'mitra'
    },
    {
      id: 6,
      title: 'Skill Trainer',
      location: 'Vocational Centers',
      fee: 'Contact',
      role: 'trainer'
    }
  ];

  // Normal Jobs Data
  const normalJobs = [
    {
      id: 1,
      title: 'Project Manager',
      location: 'Delhi / Corporate Office',
      fee: '₹3500',
      role: 'pm'
    },
    {
      id: 2,
      title: 'Finance Officer',
      location: 'Patna / Finance Department',
      fee: '₹2500',
      role: 'finance'
    },
    {
      id: 3,
      title: 'HR Executive',
      location: 'Mumbai / HR Department',
      fee: '₹2000',
      role: 'hr'
    },
    {
      id: 4,
      title: 'Data Analyst',
      location: 'Bangalore / IT Department',
      fee: '₹3000',
      role: 'analyst'
    },
    {
      id: 5,
      title: 'Content Writer',
      location: 'Remote / Marketing',
      fee: '₹1500',
      role: 'writer'
    },
    {
      id: 6,
      title: 'Field Officer',
      location: 'Various Locations',
      fee: '₹2000',
      role: 'field'
    }
  ];

  const jobs = jobType === 'ngo' ? ngoJobs : normalJobs;
  const pageTitle = jobType === 'ngo' ? 'NGO Jobs' : 'General Jobs';

  // ✅ FIX: Pass category parameter based on job type
  const handleApply = (jobRole) => {
    if (jobType === 'general') {
      // For normal/general jobs, add category parameter
      navigate(`/apply?role=general-job&category=general`);
      console.log('🔗 Navigating to apply form with: role=general-job, category=general');
    } else {
      // For NGO jobs, just pass the role
      navigate(`/apply?role=${jobRole}`);
      console.log(`🔗 Navigating to apply form with: role=${jobRole}, category=NGO`);
    }
  };

  return (
    <>
      <Navbar />
      
      <section className="intro-section">
        <h1 className="intro-title">Join The Aagaj Team</h1>
        <div className="yellow-separator"></div>
        <p className="intro-text">
          Do you believe in every child's right to a happier childhood? <br />
          Then come join us to embark on a rewarding journey to create lasting impact for India's children.
        </p>
      </section>

      <div className="career-heading-section">
        <h2>Build Your Career At Aagaj</h2>
      </div>

      <section className="job-list-container">
        <div className="filter-section">
          <span className="filter-label">Filter By Location</span>
          <select 
            className="location-dropdown"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          >
            <option value="all">All Locations</option>
            <option value="bihar">Bihar</option>
            <option value="up">Uttar Pradesh</option>
            <option value="jharkhand">Jharkhand</option>
          </select>
          <i className="fa-solid fa-caret-down ms-2 text-danger"></i>
        </div>

        {jobs.map((job) => (
          <div key={job.id} className="job-row">
            <div className="plus-icon">
              <i className="fa-solid fa-plus"></i>
            </div>
            <div className="job-details">
              <h3 className="job-title">
                {job.title}
                <span className="fee-badge">{job.fee}</span>
              </h3>
              <p className="job-location">{job.location}</p>
            </div>
            <button 
              className="btn-apply-yellow"
              onClick={() => handleApply(job.role)}
            >
              Apply Now
            </button>
          </div>
        ))}
      </section>

      <Footer />
    </>
  );
};

export default CareerPage;
