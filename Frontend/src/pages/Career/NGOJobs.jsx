import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './NGOJobs.css';

const NGOJobs = () => {
  const [filteredJobs, setFilteredJobs] = useState('all');

  const ngoJobs = [
    { id: 1, title: 'Panchayat Co-ordinator', fee: '999',   location: 'Kolkata / Village Operations', role: 'panchayat' },
    { id: 2, title: 'Block Co-ordinator',      fee: '1499',  location: 'Mumbai / Block Supervision',   role: 'block'     },
    { id: 3, title: 'District Co-ordinator',   fee: '2100',  location: 'Mumbai / District HQ',         role: 'district'  },
    { id: 4, title: 'Health Supervisor',       fee: '1499',  location: 'Bangalore / Field Work',       role: 'health'    },
    { id: 5, title: 'Mahila Mitra',            fee: '999',   location: 'Rural Areas',                  role: 'mitra'     },
    { id: 6, title: 'Skill Trainer',           fee: 'Contact', location: 'Vocational Centers',         role: 'trainer'   }
  ];

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
            value={filteredJobs}
            onChange={(e) => setFilteredJobs(e.target.value)}
          >
            <option value="all">All Locations</option>
            <option value="bihar">Bihar</option>
            <option value="up">Uttar Pradesh</option>
            <option value="jharkhand">Jharkhand</option>
          </select>
          <i className="fa-solid fa-caret-down jb-caret"></i>
        </div>

        {ngoJobs.map((job) => (
          <div className="job-row" key={job.id}>
            <div className="plus-icon">
              <i className="fa-solid fa-plus"></i>
            </div>
            <div className="job-details">
              <h3 className="job-title">
                {job.title} <span className="fee-badge">&#8377;{job.fee}</span>
              </h3>
              <p className="job-location">{job.location}</p>
            </div>
            <a href={`/apply?role=${job.role}`} className="btn-apply-yellow">
              Apply Now
            </a>
          </div>
        ))}
      </section>

      <Footer />
    </>
  );
};

export default NGOJobs;
