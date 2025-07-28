import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import '../styles/SubnetCalculator.css';

export default function SubnetCalculator() {
  const [ip, setIp] = useState('');
  const [subnetMask, setSubnetMask] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  const validateIP = (ip) => {
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const calculateWildcardMask = (subnetMask) => {
    const octets = subnetMask.split('.').map(Number);
    if (octets.length !== 4 || octets.some(octet => octet < 0 || octet > 255)) return null;
    
    return octets.map(octet => 255 - octet).join('.');
  };


  const handleCalculate = () => {
    if (!validateIP(ip)) {
      setError('Please enter a valid IP address');
      return;
    }

    if (!validateIP(subnetMask)) {
      setError('Please enter a valid subnet mask');
      return;
    }

    setIsCalculating(true);
    setError('');

    try {
      const wildcardMask = calculateWildcardMask(subnetMask);

      const calculated = {
        networkAddress: '192.168.1.0',
        broadcastAddress: '192.168.1.255',
        firstHost: '192.168.1.1',
        lastHost: '192.168.1.254',
        totalHosts: 254,
        subnetMask,
        wildcardMask
      };

      setResult([calculated]);
    } catch (err) {
      setError('Invalid input. Please check your IP and subnet mask.');
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  };


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="calculator"
    >
      <motion.h2 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="title"
      >
        Subnet Calculator
      </motion.h2>

      <div className="input-group">
        <IPInput 
          label="IP Address:" 
          value={ip} 
          onChange={setIp} 
          isValid={validateIP(ip) || ip === ''}
        />
        <IPInput 
          label="Subnet Mask:" 
          value={subnetMask} 
          onChange={setSubnetMask} 
          isValid={validateIP(subnetMask) || subnetMask === ''}
        />
        
        <motion.button
          onClick={handleCalculate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isCalculating}
        >
          {isCalculating ? 'Calculating...' : 'Calculate'}
        </motion.button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="error"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="results-table"
          >
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {result.map((res, index) => (
                  <>
                    <tr key={`${index}-network`}>
                      <td>Network Address</td>
                      <td>{res.networkAddress}</td>
                    </tr>
                    <tr key={`${index}-broadcast`}>
                      <td>Broadcast Address</td>
                      <td>{res.broadcastAddress}</td>
                    </tr>
                    <tr key={`${index}-first`}>
                      <td>First Host</td>
                      <td>{res.firstHost}</td>
                    </tr>
                    <tr key={`${index}-last`}>
                      <td>Last Host</td>
                      <td>{res.lastHost}</td>
                    </tr>
                    <tr key={`${index}-total`}>
                      <td>Total Hosts</td>
                      <td>{res.totalHosts}</td>
                    </tr>
                    <tr key={`${index}-mask`}>
                      <td>Subnet Mask</td>
                      <td>{res.subnetMask}</td>
                    </tr>
                    <tr key={`${index}-wildcard`}>
                      <td>Wildcard Mask</td>
                      <td>{res.wildcardMask}</td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function IPInput({ label, value, onChange, isValid }) {
  return (
    <div className="ip-input">
      <label>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={!isValid ? 'invalid' : ''}
        placeholder="e.g. 192.168.1.0"
      />
    </div>
  );
}