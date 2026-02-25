import React, { useState, useEffect } from 'react';
import './home.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userName, setUserName] = useState('Guest');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUserName(user);
    }
  }, []);

  const carouselImages = [
    {
      src: '/pic1.jpeg',
      title: 'Silai Yojana',
      description: 'Empowering women through skill development'
    },
    {
      src: '/pic2.jpg',
      title: 'Community Support',
      description: 'Building stronger communities'
    },
    {
      src: '/pic3.jpg',
      title: 'Health Services',
      description: 'Quality healthcare for all'
    },
    {
      src: '/pic4.jpg',
      title: 'Education Programs',
      description: 'Creating better futures through education'
    },
    {
      src: '/pic5.jpg',
      title: 'Social Welfare',
      description: 'Supporting underprivileged sections'
    }
  ];

  const programmes = [
    {
      title: 'Silayi Training',
      image: '/silai.jpeg',
      description: 'Providing vocational sewing training (Mahila Silayi Prasikshan Yojana) to help women achieve financial independence.',
      link: '/silai-yojana'
    },
    {
      title: 'Women Health',
      image: '/women.jpg',
      description: 'Improving hygiene and healthcare access through the Mahila Swasthya Suraksha Yojana.',
      link: '/women-health'
    },
    {
      title: 'Community Welfare',
      image: '/community.jpg',
      description: 'Har Graam Ward Pathshala Yojana focuses on education and food distribution for the underprivileged.',
      link: '/community-welfare' }];

  const priorities = [
    {
      title: 'Women Skill Development',
      image: '/s.jpg',
      subtitle: 'Silayi Prasikshan Yojana'
    },
    {
      title: 'Healthcare Support',
      image: '/h.jpg',
      subtitle: 'Healthy People. Better World.'
    },
    {
      title: 'Community Support & Welfare',
      image: '/community.jpg',
      subtitle: 'Welfare'
    },
    {
      title: 'Sustainable Livelihood',
      image: '/l.jpg',
      subtitle: 'Helpful information'
    }
  ];

  const workSteps = [
    {
      icon: 'fa-solid fa-check',
      title: 'Identify Community Needs',
      description: 'We engage with women at the village level to understand their requirements.',
      bgClass: 'bg-red-coral',
      highlight: false
    },
    {
      icon: 'fa-solid fa-thumbs-up',
      title: 'Select Your Programme',
      description: 'We help beneficiaries choose the right training or health support programme affected by poverty.',
      bgClass: 'bg-yellow-custom',
      highlight: false
    },
    {
      icon: 'fa-solid fa-star',
      title: 'Training & Field Support',
      description: 'Skill training, awareness sessions, and guidance are provided by our team.',
      bgClass: 'bg-dark-custom',
      highlight: true
    },
    {
      icon: 'fa-solid fa-hand-holding-heart',
      title: 'Certification & Empowerment',
      description: 'Successful trainees receive certificates and support for self-employment.',
      bgClass: 'bg-red-coral',
      highlight: false
    }
  ];

  const careers = [
    {
      title: 'Panchayat Co-ordinator',
      image: '/panch.jpeg',
      link: '/careers'
    },
    {
      title: 'Block Co-ordinator',
      image: '/mitra.jpeg',
      link: '/careers'
    },
    {
      title: 'District Co-ordinator',
      image: '/district.jpg',
      link: '/careers'
    },
    {
      title: 'Trainer',
      image: '/trainer.jpeg',
      link: '/careers'
    },
    {
      title: 'Mahila Mitra',
      image: '/mitra.jpeg',
      link: '/careers'
    },
    {
      title: 'Health Co-ordinator',
      image: '/health.jpg',
      link: '/careers'
    }
  ];

  const partners = [
    '/logo.jpg',
    '/logo1.jpeg',
    '/logo2.jpeg',
    '/logo3.jpeg',
    '/logo4.jpeg'
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <>
      {/* Social Sidebar */}
      <div className="social-sidebar">
        <a href="https://www.facebook.com/aagajfoundation.org" className="facebook" title="Facebook">
          <i className="fa-brands fa-facebook-f"></i>
        </a>
        <a href="https://www.instagram.com/aagajfoundation/" className="instagram" title="Instagram">
          <i className="fa-brands fa-instagram"></i>
        </a>
        <a href="#" className="twitter" title="Twitter">
          <i className="fa-brands fa-twitter"></i>
        </a>
        <a href="https://www.linkedin.com/company/aagaj-foundation/" className="linkedin" title="LinkedIn">
          <i className="fa-brands fa-linkedin-in"></i>
        </a>
        <a href="#" className="youtube" title="YouTube">
          <i className="fa-brands fa-youtube"></i>
        </a>
      </div>

      <Navbar userName={userName} />

      {/* Hero Section with Carousel */}
      <section className="hero-section">
        <div className="home-carousel">
          <div className="home-carousel-inner">
            {carouselImages.map((image, index) => (
              <div
                key={index}
                className={`home-carousel-item${index === currentSlide ? ' active' : ''}`}
              >
                <div className="hero-carousel-item">
                  <img src={image.src} alt={image.title} className="hero-img" />
                  <div className="hero-overlay"></div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="home-carousel-btn home-carousel-prev"
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button
            className="home-carousel-btn home-carousel-next"
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
          <div className="hero-text-overlay">
            <div className="home-container">
              <h2>Empowering Women, Uplifting Communities – Aagaj Foundation</h2>
              <p>Aagaj Foundation works to empower women, improve health awareness, and strengthen community development through sustainable programmes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section-padding about-section">
        <div className="home-container">
          <div className="home-row">
            <div className="home-col-lg-6">
              <h2 className="about-title">
                About Aagaj Foundation <span className="red-text"></span>
              </h2>
              <p className="about-desc">
                Aagaj Foundation is a community-driven organization dedicated to empowering women, improving health awareness, and strengthening rural development. Through our skill-training programmes, self-employment initiatives, and healthcare support services, we aim to create opportunities that uplift families and transform communities.
              </p>
              <ul className="check-list">
                <li>
                  <i className="fa-solid fa-check"></i> 
                  <span>Empowering Rural Bihar</span>
                </li>
                <li>
                  <i className="fa-solid fa-check"></i> 
                  <span>Driving Inclusive Growth</span>
                </li>
              </ul>
              <button className="btn-yellow-home">
                Know More
              </button>
            </div>
            <div className="home-col-lg-6">
              <img src="/pic3.jpg" alt="Aagaj Foundation Team" className="about-img" />
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="section-padding programs-section">
        <div className="home-container">
          <div className="section-title">
            <h2 className="blue-underline title-drop-bg">Our Programmes</h2>
            <p className="title-desc">Empowering Rural Bihar Driving Inclusive Growth</p>
          </div>
          <div className="programs-grid">
            {programmes.map((prog, index) => (
              <div key={index} className="program-item">
                <div className="home-card">
                  <img src={prog.image} alt={prog.title} className="home-card-img" />
                  <div className="home-card-body">
                    <h5 className="home-card-title">{prog.title}</h5>
                    <p className="home-card-text">{prog.description}</p>
                    <a href={prog.link} className="btn-link-custom">View More <i className="fa-solid fa-arrow-right"></i></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact/Stats Section */}
      <section className="section-padding impact-section">
        <div className="home-container">
          <div className="impact-row">
            <div className="impact-col-left">
              <img src="/meter.png" alt="Impact Meter" className="impact-meter" />
            </div>
            <div className="impact-col-right">
              <p className="impact-tagline">People Impacted by Aagaj Foundation</p>
              <h2 className="impact-title">
                We support <span className="red-text">women and rural communities</span> with training, healthcare for a better future.
              </h2>
              <p className="impact-desc">
                Aagaj Foundation works across villages and districts to uplift underprivileged women through various welfare schemes such as Mahila Silayi Prasikshan Yojana, Mahila Swarojgaar Yojana, Mahila Swasthya Suraksha Yojana, and Har Graam Ward Pathshala Yojana. Our efforts focus on providing skill training, self-employment support, healthcare benefits, and educational assistance to improve the quality of life in rural areas.
              </p>
              <div className="impact-bottom">
                <div className="impact-stat">
                  <div className="impact-number">200K</div>
                  <div className="impact-label">People Benefited</div>
                </div>
                <a href="#donate" className="btn-donate">
                  <i className="fa-solid fa-heart"></i> Donate Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Priorities Section */}
      <section className="section-padding priorities-section">
        <div className="home-container">
          <div className="section-title">
            <h2 className="priorities-heading title-drop-bg">Our Priorities</h2>
            <p className="title-desc">Our key focus areas for community development and support.</p>
          </div>
          <div className="priorities-grid">
            {priorities.map((priority, index) => (
              <div key={index} className="priority-item">
                <div className="priority-card">
                  <img src={priority.image} alt={priority.title} className="priority-img" />
                  <h5 className="priority-title">{priority.title}</h5>
                  <p className="priority-subtitle">{priority.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Split Section */}
      <div className="split-container">
        <div className="play-button">
          <div className="play-circle">
            <div className="play-icon"></div>
          </div>
        </div>

        <div className="left-panel">
          <div className="top-tagline">Empowering Women. Uplifting Communities</div>
          <h1 className="split-header">
            <span className="highlight-red">Aagaj Foundation</span> has transformed thousands of lives across rural Bihar
          </h1>
          <p className="description">
            For years, Aagaj Foundation has been working at the grassroots level to support women, families, and underprivileged communities through skill development, healthcare initiatives, education support, and sustainable livelihood programmes.
          </p>
          <div className="stats-container">
            <div className="stat-box">
              <span className="stat-number">18000+</span>
              <span className="stat-label">Trained through Silayi</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">25000+</span>
              <span className="stat-label">Swasthya Suraksha</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">12000+</span>
              <span className="stat-label">Community Welfare</span>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="image-tagline">When women rise, families rise</div>
          <div className="image-headline">
            Aagaj Foundation is bringing hope and opportunity to rural communities—one family at a time
          </div>
        </div>
      </div>

      {/* How We Work Section */}
      <section className="section-padding work-section">
        <div className="home-container">
          <div className="section-title">
            <h2 className="red-heading-underline">How We Work?</h2>
            <p className="title-desc">Our process is simple, transparent, and designed to empower every woman and community we serve.</p>
          </div>
          <div className="work-grid">
            {workSteps.map((step, index) => (
              <div key={index} className="work-item">
                <div className={`work-card${step.highlight ? ' work-card-highlight' : ''}`}>
                  <div className={`work-icon-box ${step.bgClass}`}>
                    <i className={step.icon}></i>
                  </div>
                  <div>
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Careers Section */}
      <section className="section-padding careers-section">
        <div className="home-container">
          <div className="section-title">
            <h2 className="careers-title">Careers</h2>
          </div>
          <div className="careers-grid">
            {careers.map((career, index) => (
              <div key={index} className="career-item">
                <div className="career-card">
                  <img src={career.image} alt={career.title} className="career-img" />
                  <h5 className="career-title">{career.title}</h5>
                  <a href={career.link} className="apply-link">APPLY NOW</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="section-padding partners-section">
        <div className="home-container">
          <div className="partners-header">
            <h3 className="partners-title">Grateful to collaborate with our partners</h3>
          </div>
          <div className="partners-grid">
            {partners.map((logo, index) => (
              <div key={index} className="partner-item">
                <img src={logo} alt={`Partner ${index + 1}`} className="partner-logo" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;
