import React from 'react';
import './about.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const About = () => {
  const priorities = [
    { title: 'Women Skill Development', image: '/s.jpg', subtitle: 'Silayi Prasikshan Yojana' },
    { title: 'Healthcare Support', image: '/h.jpg', subtitle: 'Healthy People. Better World.' },
    { title: 'Community Support & Welfare', image: '/community.jpg', subtitle: 'Welfare' },
    { title: 'Sustainable Livelihood', image: '/l.jpg', subtitle: 'Helpful information' }
  ];

  return (
    <>
      {/* Social Sidebar */}
      <div className="social-sidebar">
        <a href="https://www.facebook.com/aagajfoundation.org" className="facebook" title="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
        <a href="https://www.instagram.com/aagajfoundation/" className="instagram" title="Instagram"><i className="fa-brands fa-instagram"></i></a>
        <a href="#" className="twitter" title="Twitter"><i className="fa-brands fa-twitter"></i></a>
        <a href="https://www.linkedin.com/company/aagaj-foundation/" className="linkedin" title="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
        <a href="#" className="youtube" title="YouTube"><i className="fa-brands fa-youtube"></i></a>
      </div>

      <Navbar />

      {/* Page Header */}
      <header className="ab-page-header">
        <div className="ab-container">
          <h1 className="ab-page-title">Who We Are</h1>
          <p className="ab-page-lead">Dedicated to the holistic development of rural Bihar</p>
        </div>
      </header>

      {/* About Section */}
      <section className="ab-section">
        <div className="ab-container">
          <div className="ab-two-col">
            <div className="ab-col-text">
              <h2 className="ab-section-heading">
                About <span className="ab-red">Aagaj Foundation</span>
              </h2>
              <p className="about-content-text">
                Founded in 2020, Aagaj Foundation is a registered, non-profit organisation committed to empowering communities across Bihar through sustainable development initiatives.
              </p>
              <p className="about-content-text">
                Headquartered in Surbhi Vihar, Bhupatipur, Patna (800020), with a district office in Akhtiyarpur, Muzaffarpur, the foundation works towards holistic social upliftment by focusing on women empowerment, education, health, and livelihood generation.
              </p>
              <ul className="ab-check-list">
                <li><i className="fa-solid fa-check ab-check-icon"></i><span>Empowering Rural Bihar</span></li>
                <li><i className="fa-solid fa-check ab-check-icon"></i><span>Driving Inclusive Growth</span></li>
              </ul>
              <div className="ab-btn-wrap">
                <a href="#" className="btn-yellow-custom">Give Them A Chance</a>
              </div>
            </div>
            <div className="ab-col-img">
              <img src="/pic4.jpg" alt="Aagaj Foundation Team" className="ab-img" />
            </div>
          </div>
        </div>
      </section>

      {/* Chairman Section */}
      <section className="ab-section ab-chairman-section">
        <div className="ab-container">
          <div className="ab-two-col">
            <div className="ab-col-img ab-col-narrow">
              <div className="chairman-img-wrapper">
                <img src="/chairman.jpg" alt="Chairman of Aagaj Foundation" />
              </div>
            </div>
            <div className="ab-col-text ab-col-wide">
              <h2 className="ab-section-heading">
                From the <span className="ab-red">Chairman's Desk</span>
              </h2>
              <p className="about-content-text">
                At Aagaj Foundation, we believe that true development begins when opportunities reach every corner of society—especially the rural and marginalised sections.
              </p>
              <p className="about-content-text">
                Our journey started with a simple yet powerful vision: to empower individuals through education, skill development, health awareness, and livelihood support. Over the years, we have seen how small efforts can create lasting transformations.
              </p>
              <blockquote className="ab-blockquote">
                "Our dedicated team and partners, including <strong>ABS Manufacturing Vastra Nirman Udyog</strong> and <strong>Budhinath Traders Private Limited</strong>, have been instrumental in turning our vision into reality. Together, we continue to work tirelessly to build communities that are self-reliant, confident, and capable of shaping their own future."
              </blockquote>
              <div className="ab-btn-wrap">
                <a href="#" className="btn-red-custom">Who We Are?</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Priorities Section */}
      <section className="ab-section">
        <div className="ab-container ab-text-center">
          <div className="ab-section-title">
            <h2 className="ab-priorities-heading">Our <span className="ab-highlight">Priorities</span></h2>
            <p className="ab-muted">Our key focus areas for community development and support.</p>
            <div className="ab-red-bar"></div>
          </div>
          <div className="ab-priorities-grid">
            {priorities.map((priority, index) => (
              <div key={index} className="ab-priority-item">
                <div className="ab-priority-img-wrap">
                  <img src={priority.image} alt={priority.title} className="ab-priority-img" />
                </div>
                <h5 className="ab-priority-title">{priority.title}</h5>
                <p className="ab-priority-sub">{priority.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="ab-section ab-mission-section">
        <div className="ab-container">
          <div className="ab-two-col">
            <div className="ab-col-text">
              <h2 className="ab-section-heading">
                Our <span className="ab-red">Mission</span>
              </h2>
              <p className="about-content-text">
                Our mission is to empower and uplift the underprivileged communities of Bihar by promoting education, health, and self-employment. We aim to create sustainable opportunities for women and youth through skill development, awareness programmes, and community participation.
              </p>
              <p className="about-content-text">
                Aagaj Foundation is committed to fostering equality, self-reliance, and social responsibility—ensuring that every individual has the tools and confidence to lead a dignified and independent life.
              </p>
              <ul className="ab-check-list">
                <li><i className="fa-solid fa-check ab-check-icon"></i><span>Empowering Rural Bihar</span></li>
                <li><i className="fa-solid fa-check ab-check-icon"></i><span>Driving Inclusive Growth</span></li>
              </ul>
            </div>
            <div className="ab-col-img">
              <img src="/pic4.jpg" alt="Aagaj Foundation Mission" className="ab-img" />
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve Section */}
      <section className="ab-section">
        <div className="ab-container">
          <div className="ab-two-col">
            <div className="ab-col-img">
              <img src="/serve.jpg" alt="Who We Serve" className="ab-img" />
            </div>
            <div className="ab-col-text">
              <h2 className="ab-section-heading">
                Who We <span className="ab-red">Serve</span>
              </h2>
              <p className="about-content-text">
                Aagaj Foundation works at the grassroots level to serve women, youth, and underprivileged communities across Bihar. Our initiatives focus on empowering those who are often left behind in the journey of development.
              </p>
              <h5 className="ab-serve-subtitle">We serve:</h5>
              <ul className="ab-serve-list">
                <li><i className="fa-solid fa-circle-notch ab-dot-icon"></i>Women seeking skill development, self-employment, and financial independence.</li>
                <li><i className="fa-solid fa-circle-notch ab-dot-icon"></i>Youth in need of education, career guidance, and vocational training.</li>
                <li><i className="fa-solid fa-circle-notch ab-dot-icon"></i>Children from rural and low-income families, ensuring access to quality education.</li>
                <li><i className="fa-solid fa-circle-notch ab-dot-icon"></i>Rural communities aiming to improve their overall quality of life through collective growth.</li>
              </ul>
              <div className="ab-serve-actions">
                <a href="#" className="btn-red-custom">Who We Are?</a>
                <a href="#" className="ab-donate-link"><i className="fa-solid fa-heart"></i> Donate For Nature</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="ab-quote-section">
        <div className="ab-quote-grid">
          <div className="ab-quote-left">
            <div className="ab-quote-inner">
              <i className="fa-solid fa-quote-left ab-quote-icon"></i>
              <h3 className="ab-quote-text">
                "Aagaj Foundation works to empower women, support rural families, and provide essential services in health, education, and livelihood."
              </h3>
            </div>
          </div>
          <div className="ab-quote-right">
            <div className="ab-quote-right-inner">
              <h2 className="ab-quote-right-title">Aagaj Foundation – Bringing Change to Rural India</h2>
              <p className="ab-quote-right-desc">
                Through our programmes in skill development, healthcare, and education, Aagaj Foundation is dedicated to uplifting women and improving living conditions in villages and underserved areas.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default About;
