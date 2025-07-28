import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import './Home.css';

// lets import images
import img1 from './images/network.png';
import img2 from './images/subnet.png';
import img3 from './images/vlsm.png';
import img4 from './images/ui.png';

export default function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-text">
          <h1>Network Calculator</h1>
          <p className="subtitle">Advanced subnet and VLSM calculations made simple</p>
          <div className="cta-buttons">
            <Link to="/subnet" className="cta-btn primary">
              Subnet Calculator <FiArrowRight />
            </Link>
            <Link to="/vlsm" className="cta-btn secondary">
              VLSM Calculator <FiArrowRight />
            </Link>
          </div>
        </div>
        <div className="hero-image">
          {/* we have to reduce the image width and height as well */}
          <img src={img1} width="280" height="280" alt="Network Illustration" className="network-image" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <img src={img2} alt="Subnet Icon" />
            <h3>Subnet Calculations</h3>
            <p>Calculate network address, broadcast address, and host range from any IP address and subnet mask.</p>
          </div>
          <div className="feature-card">
            <img src={img3} alt="VLSM Icon" />
            <h3>VLSM Support</h3>
            <p>Efficiently allocate variable length subnets based on your network requirements.</p>
          </div>
          <div className="feature-card">
            <img src={img4} alt="UI Icon" />
            <h3>Modern Interface</h3>
            <p>Clean, intuitive design with dark mode support for comfortable use in any environment.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
