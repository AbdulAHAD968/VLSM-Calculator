import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import SubnetCalculator from './components/SubnetCalculator';
import VLSMCalculator from './components/VLSMCalculator';
import './styles/main.css';
import './styles/header.css';

export default function App() {
  return (
    <Router>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/subnet" element={<SubnetCalculator />} />
          <Route path="/vlsm" element={<VLSMCalculator />} />
        </Routes>
      </main>
    </Router>
  );
}
