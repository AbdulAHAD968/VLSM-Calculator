import { motion } from 'framer-motion';
import {
  FiMapPin,
  FiRadio,
  FiServer,
  FiCpu,
  FiHash,
  FiAward,
} from 'react-icons/fi';
import '../styles/ResultsCard.css';

export default function ResultsCard({ data, index }) {
  return (
    <motion.div
      className="result-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <h4 className="result-title">{data.name}</h4>

      <div className="result-detail">
        <div className="result-icon-text">
          <FiMapPin className="icon" />
          <span>Network Address</span>
        </div>
        <span className="result-value">{data.networkAddress}</span>
      </div>

      <div className="result-detail">
        <div className="result-icon-text">
          <FiRadio className="icon" />
          <span>Broadcast Address</span>
        </div>
        <span className="result-value">{data.broadcastAddress}</span>
      </div>

      <div className="result-detail">
        <div className="result-icon-text">
          <FiServer className="icon" />
          <span>Usable Host Range</span>
        </div>
        <span className="result-value">
          {data.firstHost} - {data.lastHost}
        </span>
      </div>

      <div className="result-detail">
        <div className="result-icon-text">
          <FiCpu className="icon" />
          <span>Total Hosts</span>
        </div>
        <span className="result-value">{data.totalHosts}</span>
      </div>

      <div className="result-detail">
        <div className="result-icon-text">
          <FiHash className="icon" />
          <span>Subnet Mask</span>
        </div>
        <span className="result-value">{data.subnetMask}</span>
      </div>

      {/* Wild Card Mask */}
      <div className="result-detail">
        <div className="result-icon-text">
          <FiAward className="icon" />
          <span>Wild Card Mask</span>
        </div>
        <span className="result-value">{data.wildCardMask || '0.0.0.0'}</span>
      </div>
    </motion.div>
  );
}