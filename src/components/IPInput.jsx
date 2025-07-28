import { useState } from 'react';

export default function IPInput({ label, value, onChange }) {
  const [ip, setIp] = useState(value || '');

  const handleChange = (e) => {
    const newValue = e.target.value;
    setIp(newValue);
    onChange(newValue);
  };

  return (
    <div className="ip-input">
      <label>{label}</label>
      <input
        type="text"
        value={ip}
        onChange={handleChange}
        placeholder="e.g., 192.168.1.0"
      />
    </div>
  );
}