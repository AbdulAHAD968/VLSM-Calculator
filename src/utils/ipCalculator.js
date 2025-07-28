export function calculateSubnet(ip, subnetMask) {
  // Validate inputs
  if (!isValidIP(ip) || !isValidIP(subnetMask)) {
    return { error: "Invalid IP address or subnet mask" };
  }

  // Convert IP and subnet mask to binary
  const ipBinary = ip.split('.').map(octet => {
    return parseInt(octet, 10).toString(2).padStart(8, '0');
  }).join('');

  const maskBinary = subnetMask.split('.').map(octet => {
    return parseInt(octet, 10).toString(2).padStart(8, '0');
  }).join('');

  // Calculate network address
  const networkBinary = andBinary(ipBinary, maskBinary);
  const networkAddress = binaryToIP(networkBinary);

  // Calculate broadcast address
  const wildcardBinary = maskBinary.split('').map(bit => bit === '1' ? '0' : '1').join('');
  const broadcastBinary = orBinary(networkBinary, wildcardBinary);
  const broadcastAddress = binaryToIP(broadcastBinary);

  // Calculate usable host range
  const firstHost = incrementIP(networkAddress);
  const lastHost = decrementIP(broadcastAddress);

  // Calculate CIDR notation
  const cidr = maskBinary.split('').filter(bit => bit === '1').length;

  return {
    networkAddress,
    broadcastAddress,
    firstHost,
    lastHost,
    totalHosts: Math.pow(2, 32 - cidr) - 2,
    cidrNotation: `${ip}/${cidr}`,
    subnetMask
  };
}

export function calculateVLSM(ip, subnetMask, requirements) {
  // Sort requirements by host count (descending)
  const sortedReqs = [...requirements].sort((a, b) => b.hosts - a.hosts);
  
  let currentIP = ip;
  let results = [];
  
  for (const req of sortedReqs) {
    const cidr = 32 - Math.ceil(Math.log2(req.hosts + 2));
    const subnetInfo = calculateSubnet(currentIP, cidrToSubnetMask(cidr));
    
    results.push({
      name: req.name,
      requiredHosts: req.hosts,
      ...subnetInfo
    });
    
    // Move to next available IP
    currentIP = incrementIP(subnetInfo.broadcastAddress);
  }
  
  return results;
}

// Helper functions
function isValidIP(ip) {
  const octets = ip.split('.');
  if (octets.length !== 4) return false;
  
  return octets.every(octet => {
    const num = parseInt(octet, 10);
    return num >= 0 && num <= 255;
  });
}

function andBinary(bin1, bin2) {
  return bin1.split('').map((bit, i) => bit === '1' && bin2[i] === '1' ? '1' : '0').join('');
}

function orBinary(bin1, bin2) {
  return bin1.split('').map((bit, i) => bit === '1' || bin2[i] === '1' ? '1' : '0').join('');
}

function binaryToIP(binary) {
  return [
    parseInt(binary.substring(0, 8), 2),
    parseInt(binary.substring(8, 16), 2),
    parseInt(binary.substring(16, 24), 2),
    parseInt(binary.substring(24, 32), 2)
  ].join('.');
}

function cidrToSubnetMask(cidr) {
  const maskBinary = '1'.repeat(cidr).padEnd(32, '0');
  return binaryToIP(maskBinary);
}

function incrementIP(ip) {
  const octets = ip.split('.').map(Number);
  for (let i = 3; i >= 0; i--) {
    if (octets[i] < 255) {
      octets[i]++;
      break;
    } else {
      octets[i] = 0;
    }
  }
  return octets.join('.');
}

function decrementIP(ip) {
  const octets = ip.split('.').map(Number);
  for (let i = 3; i >= 0; i--) {
    if (octets[i] > 0) {
      octets[i]--;
      break;
    } else {
      octets[i] = 255;
    }
  }
  return octets.join('.');
}