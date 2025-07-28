import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="app-header" ref={headerRef}>
      <div className="header-container">
        <div className="app-brand">
          <Link to="/" className="app-name">NetCalc</Link>
        </div>

        <button className="hamburger" onClick={toggleMenu}>
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>

        <nav className={`app-nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/subnet" className="nav-link" onClick={() => setMenuOpen(false)}>Subnet</Link>
          <Link to="/vlsm" className="nav-link" onClick={() => setMenuOpen(false)}>VLSM</Link>
        </nav>
      </div>
    </header>
  );
}
