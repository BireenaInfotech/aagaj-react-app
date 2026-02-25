import React, { useState } from 'react';
import './gallery.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  const galleryItems = [
    { id: 1,  src: '/community.jpg',  alt: 'Community Gathering',       caption: 'Community Unity',             filter: 'swarojgaar' },
    { id: 2,  src: '/health.jpg',     alt: 'Health Kit Distribution',   caption: 'Health Kit Distribution',     filter: 'swasthya'   },
    { id: 3,  src: '/h.jpg',          alt: 'Healthcare Professionals',  caption: 'Medical Support Team',        filter: 'swasthya'   },
    { id: 4,  src: '/mitra.jpeg',     alt: 'Mahila Mitra Team',         caption: 'Mahila Mitra Team',           filter: 'swasthya'   },
    { id: 5,  src: '/pic1.jpeg',      alt: 'Foundation Rally',          caption: 'Foundation Rally Event',      filter: 'swarojgaar' },
    { id: 6,  src: '/pic2.jpg',       alt: 'Block Coordinators',        caption: 'Block Coordinators Team',     filter: 'silayi'     },
    { id: 7,  src: '/pic3.jpg',       alt: 'Block Coordinators',        caption: 'Block Coordinators Team',     filter: 'silayi'     },
    { id: 8,  src: '/pic4.jpg',       alt: 'Block Coordinators',        caption: 'Block Coordinators Team',     filter: 'silayi'     },
    { id: 9,  src: '/pic5.jpg',       alt: 'Block Coordinators',        caption: 'Block Coordinators Team',     filter: 'silayi'     },
    { id: 10, src: '/pic6.jpeg',      alt: 'Livelihood Discussion',     caption: 'Livelihood Discussion',       filter: 'swarojgaar' },
    { id: 11, src: '/pic7.jpeg',      alt: 'Livelihood Discussion',     caption: 'Livelihood Discussion',       filter: 'swarojgaar' },
    { id: 12, src: '/pic8.jpeg',      alt: 'Livelihood Discussion',     caption: 'Livelihood Discussion',       filter: 'swarojgaar' },
    { id: 13, src: '/pic9.jpeg',      alt: 'Livelihood Discussion',     caption: 'Livelihood Discussion',       filter: 'swarojgaar' },
    { id: 14, src: '/pic10.jpeg',     alt: 'Livelihood Discussion',     caption: 'Livelihood Discussion',       filter: 'swarojgaar' },
    { id: 15, src: '/pic11.png',      alt: 'Livelihood Discussion',     caption: 'Livelihood Discussion',       filter: 'swarojgaar' },
    { id: 16, src: '/district.jpg',   alt: 'District Team',             caption: 'District Level Drive',        filter: 'silayi'     },
    { id: 17, src: '/panch.jpeg',     alt: 'Panchayat Meeting',         caption: 'Panchayat Awareness Camp',    filter: 'swasthya'   },
    { id: 18, src: '/l.jpg',          alt: 'Livelihood Discussion',     caption: 'Livelihood Discussion',       filter: 'swasthya'   }
  ];

  const filters = [
    { value: 'all',        label: 'ALL' },
    { value: 'silayi',     label: 'MAHILA SILAYI PRASHIKSHAN YOJANA' },
    { value: 'swarojgaar', label: 'MAHILA SWAROJGAAR YOJANA' },
    { value: 'swasthya',   label: 'MAHILA SWASTHYA SURAKSHA YOJANA' }
  ];

  const filteredItems = activeFilter === 'all'
    ? galleryItems
    : galleryItems.filter(item => item.filter === activeFilter);

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
      <header className="gl-page-header">
        <div className="gl-container">
          <h1 className="gl-page-title">Our Gallery</h1>
          <nav aria-label="breadcrumb">
            <ol className="gl-breadcrumb">
              <li className="gl-breadcrumb-item"><a href="/">Home</a></li>
              <li className="gl-breadcrumb-item gl-bc-active" aria-current="page">Gallery</li>
            </ol>
          </nav>
          <p className="gl-lead">Capturing moments of empowerment, training, and community transformation across Bihar.</p>
        </div>
      </header>

      {/* Filter + Gallery Section */}
      <section className="gl-filter-section">
        <div className="gl-container">

          {/* Filter Buttons */}
          <div className="gl-filter-wrap">
            {filters.map(filter => (
              <button
                key={filter.value}
                className={`filter-btn ${activeFilter === filter.value ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="gl-grid">
            {filteredItems.map(item => (
              <div key={item.id} className="gl-grid-item filter-item">
                <div
                  className="gallery-item"
                  onClick={() => setSelectedImage(item.src)}
                >
                  <img src={item.src} alt={item.alt} />
                  <div className="gallery-overlay">
                    <i className="fa-solid fa-magnifying-glass-plus zoom-icon"></i>
                    <span className="caption">{item.caption}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <Footer />

      {/* Image Modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content-custom" onClick={e => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setSelectedImage(null)}
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="modal-img-container">
              <img src={selectedImage} alt="Full view" className="modal-img" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;
