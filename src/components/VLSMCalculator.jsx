import { useState, useEffect } from 'react';
import { calculateVLSM } from '../utils/ipCalculator';
import { 
  FiGlobe, 
  FiHash, 
  FiList, 
  FiPlus, 
  FiTrash2, 
  FiChevronDown, 
  FiChevronUp,
  FiCpu,
  FiClipboard,
  FiRadio,
  FiArrowUp,
  FiArrowDown,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ResultsCard from './ResultsCard';
import '../styles/VLSMCalculator.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const validateIP = (ip) => {
  const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

const validateHosts = (hosts) => {
  return hosts > 0 && hosts <= 16777214; // Max hosts for /8 network
};

const validateNetworkCapacity = (ip, cidr, requirements) => {
  // Calculate total available addresses in the base network
  const totalAvailable = Math.pow(2, 32 - cidr);
  
  // Calculate total required addresses (hosts + network/broadcast for each subnet)
  const totalRequired = requirements.reduce((sum, req) => {
    // Find the smallest subnet that can accommodate the hosts
    const subnetSize = Math.pow(2, Math.ceil(Math.log2(req.hosts + 2)));
    return sum + subnetSize;
  }, 0);

  // Also check if any single requirement exceeds the base network size
  const maxSingleRequirement = Math.max(...requirements.map(req => req.hosts));
  const maxPossibleHosts = totalAvailable - 2; // For the base network
  
  return {
    fits: totalRequired <= totalAvailable,
    totalAvailable,
    totalRequired,
    anyTooLarge: maxSingleRequirement > maxPossibleHosts
  };
};

export default function VLSMCalculator() {
  const [ip, setIp] = useState('192.168.1.0');
  const [cidr, setCidr] = useState(24);
  const [networkCount, setNetworkCount] = useState(1);
  const [requirements, setRequirements] = useState([{ name: 'Network A', hosts: 10 }]);
  const [results, setResults] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc');

  const getAlphabetName = (index) => {
    return `Network ${String.fromCharCode(65 + index)}`;
  };

  useEffect(() => {
    const newRequirements = [];
    for (let i = 0; i < networkCount; i++) {
      newRequirements.push(requirements[i] || { 
        name: getAlphabetName(i), 
        hosts: 10 
      });
    }
    setRequirements(newRequirements);
  }, [networkCount]);

  const handleRequirementChange = (index, field, value) => {
    const newRequirements = [...requirements];
    newRequirements[index][field] = field === 'hosts' ? parseInt(value) || 0 : value;
    setRequirements(newRequirements);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const calculateWildcard = (subnetMask) => {
    return subnetMask.split('.').map(octet => 255 - parseInt(octet)).join('.');
  };

  const handleCalculate = () => {
    try {
      // Validate base IP
      if (!validateIP(ip)) {
        toast.error('Invalid IP address format', { icon: <FiAlertCircle /> });
        return;
      }

      // Validate network requirements
      for (const req of requirements) {
        if (!validateHosts(req.hosts)) {
          toast.error(`Invalid host count for ${req.name} (must be 1-16,777,214)`, { 
            icon: <FiAlertCircle /> 
          });
          return;
        }
      }

      // Validate network capacity
      const capacityCheck = validateNetworkCapacity(ip, cidr, requirements);
      
      if (capacityCheck.anyTooLarge) {
        toast.error(
          `One or more networks require more hosts than the base network can provide (max ${capacityCheck.totalAvailable - 2})`, 
          { icon: <FiAlertCircle /> }
        );
        return;
      }

      if (!capacityCheck.fits) {
        toast.error(
          `Total required addresses (${capacityCheck.totalRequired}) exceed available (${capacityCheck.totalAvailable}) in base network`, 
          { icon: <FiAlertCircle /> }
        );
        return;
      }

      // Sort requirements before calculation
      const sortedRequirements = [...requirements].sort((a, b) => {
        return sortOrder === 'desc' ? b.hosts - a.hosts : a.hosts - b.hosts;
      });

      const subnetMask = cidrToSubnetMask(cidr);
      const calculated = calculateVLSM(ip, subnetMask, sortedRequirements);
      
      // Add wildcard to results
      const resultsWithWildcard = calculated.map(network => ({
        ...network,
        wildcard: calculateWildcard(network.subnetMask)
      }));
      
      setResults(resultsWithWildcard);
      toast.success('VLSM calculation successful!', { icon: <FiCheckCircle /> });
    } catch (err) {
      console.error('VLSM Calculation Error:', err);
      toast.error(`Calculation failed: ${err.message}`, { icon: <FiAlertCircle /> });
    }
  };

  // Sort requirements for display
  const sortedRequirements = [...requirements].sort((a, b) => {
    return sortOrder === 'desc' ? b.hosts - a.hosts : a.hosts - b.hosts;
  });

  return (
    <motion.div 
      className="vlsm-calculator-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <div className="vlsm-calculator-header" onClick={() => setExpanded(!expanded)}>
        <div className="vlsm-header-title">
          <FiCpu className="vlsm-header-icon" />
          <h2>VLSM Calculator</h2>
        </div>
        {expanded ? <FiChevronUp /> : <FiChevronDown />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="vlsm-calculator-content"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={containerVariants}
          >
            <motion.div className="vlsm-input-grid" variants={containerVariants}>
              <motion.div className="vlsm-input-group" variants={itemVariants}>
                <label>
                  <FiGlobe className="vlsm-input-icon" />
                  Base IP Address
                </label>
                <input
                  type="text"
                  value={ip}
                  onChange={(e) => setIp(e.target.value.trim())}
                  placeholder="192.168.1.0"
                  className={!validateIP(ip) && ip ? 'vlsm-input-error' : ''}
                />
                {!validateIP(ip) && ip && (
                  <span className="vlsm-input-error-message">
                    <FiInfo /> Invalid IP format
                  </span>
                )}
              </motion.div>

              <motion.div className="vlsm-input-group" variants={itemVariants}>
                <label>
                  <FiHash className="vlsm-input-icon" />
                  CIDR Notation
                </label>
                <div className="vlsm-range-input">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={cidr}
                    onChange={(e) => setCidr(parseInt(e.target.value))}
                  />
                  <span className="vlsm-range-value">/{cidr}</span>
                </div>
              </motion.div>

              <motion.div className="vlsm-input-group" variants={itemVariants}>
                <label>
                  <FiList className="vlsm-input-icon" />
                  Number of Networks
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={networkCount}
                  onChange={(e) => setNetworkCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                />
              </motion.div>
            </motion.div>

            <motion.div className="vlsm-network-requirements" variants={itemVariants}>
              <div className="vlsm-requirements-header">
                <h3>
                  <FiClipboard className="vlsm-section-icon" />
                  Network Requirements
                </h3>
                <button 
                  className="vlsm-sort-btn"
                  onClick={toggleSortOrder}
                  aria-label={`Sort ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
                >
                  {sortOrder === 'desc' ? <FiArrowDown /> : <FiArrowUp />}
                  {sortOrder === 'desc' ? 'Descending' : 'Ascending'}
                </button>
              </div>
              {sortedRequirements.map((req, index) => (
                <motion.div 
                  key={index} 
                  className="vlsm-network-input"
                  variants={itemVariants}
                >
                  <div className="vlsm-input-column">
                    <label>Network Name</label>
                    <input
                      type="text"
                      value={req.name}
                      onChange={(e) => {
                        const originalIndex = requirements.findIndex(r => r.name === req.name);
                        handleRequirementChange(originalIndex, 'name', e.target.value.trim());
                      }}
                      className="vlsm-network-name"
                    />
                  </div>
                  <div className="vlsm-input-column">
                    <label>Hosts Required</label>
                    <input
                      type="number"
                      value={req.hosts}
                      onChange={(e) => {
                        const originalIndex = requirements.findIndex(r => r.name === req.name);
                        handleRequirementChange(originalIndex, 'hosts', e.target.value);
                      }}
                      min="1"
                      className={`vlsm-network-hosts ${
                        !validateHosts(req.hosts) ? 'vlsm-input-error' : ''
                      }`}
                    />
                    {!validateHosts(req.hosts) && (
                      <span className="vlsm-input-error-message">
                        <FiInfo /> Invalid host count
                      </span>
                    )}
                  </div>
                  {requirements.length > 1 && (
                    <button 
                      className="vlsm-remove-btn"
                      onClick={() => {
                        const originalIndex = requirements.findIndex(r => r.name === req.name);
                        setNetworkCount(networkCount - 1);
                        toast.info(`Removed ${req.name}`, { icon: <FiInfo /> });
                      }}
                      aria-label="Remove network"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants}>
              <button className="vlsm-calculate-btn" onClick={handleCalculate}>
                Calculate VLSM
                <FiPlus className="vlsm-btn-icon" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {results && (
        <motion.div 
          className="vlsm-results-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3>
            <FiRadio className="vlsm-section-icon" />
            VLSM Results
          </h3>
          <div className="vlsm-results-grid">
            {results.map((result, index) => (
              <ResultsCard 
                key={index} 
                data={{ ...result, wildCardMask: result.wildcard }} 
                index={index} 
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function cidrToSubnetMask(cidr) {
  if (cidr < 0 || cidr > 32) {
    throw new Error('CIDR must be between 0 and 32');
  }
  
  const maskBinary = '1'.repeat(cidr).padEnd(32, '0');
  return binaryToIP(maskBinary);
}

function binaryToIP(binary) {
  if (binary.length !== 32 || !/^[01]+$/.test(binary)) {
    throw new Error('Invalid binary string for IP conversion');
  }
  
  return [
    parseInt(binary.substring(0, 8), 2),
    parseInt(binary.substring(8, 16), 2),
    parseInt(binary.substring(16, 24), 2),
    parseInt(binary.substring(24, 32), 2)
  ].join('.');
}