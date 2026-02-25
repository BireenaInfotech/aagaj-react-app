import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './GeneralJobs.css';

const GeneralJobs = () => {
  const [filteredJobs, setFilteredJobs] = useState('all');

  const generalJobs = [
    { id: 1, title: 'General Job Opportunity', fee: '499', location: 'Various Locations', role: 'general-job', category: 'general' }
  ];

  return (
    <>
      <Navbar />

      <section className="intro-section">
        <h1 className="intro-title">Career Opportunities</h1>
        <div className="yellow-separator"></div>
        <p className="intro-text">
          Explore exciting career opportunities with Aagaj Foundation. <br />
          Join us to make a meaningful impact in communities across India.
        </p>
      </section>

      <div className="career-heading-section">
        <h2>Explore Available Positions</h2>
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

        {generalJobs.map((job) => (
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
            <a
              href={`/apply?role=${job.role}&category=${job.category}`}
              className="btn-apply-yellow"
            >
              Apply Now
            </a>
          </div>
        ))}
      </section>

      <Footer />
    </>
  );
};

export default GeneralJobs;
