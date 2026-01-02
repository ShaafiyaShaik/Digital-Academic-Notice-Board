function generateOrgCode(orgName) {
  const prefix = (orgName || 'ORG').replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'ORG';
  const suffix = Math.floor(100 + Math.random() * 900); // 3 digits
  return `${prefix}${suffix}`;
}

module.exports = generateOrgCode;
