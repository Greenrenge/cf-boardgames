/**
 * Analyze roles from locations.json
 * This helps understand the scope of role translations needed
 */

const fs = require('fs');
const path = require('path');

const locationsPath = path.join(__dirname, '../data/locations.json');
const locations = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));

// Collect all roles
const allRoles = new Set();
const rolesByLocation = {};

locations.forEach((loc) => {
  rolesByLocation[loc.id] = loc.roles;
  loc.roles.forEach((role) => allRoles.add(role));
});

// Statistics
console.log('=== Role Analysis ===\n');
console.log(`Total locations: ${locations.length}`);
console.log(
  `Total roles (with duplicates): ${locations.reduce((sum, loc) => sum + loc.roles.length, 0)}`
);
console.log(`Unique roles: ${allRoles.size}`);
console.log(
  `Average roles per location: ${(locations.reduce((sum, loc) => sum + loc.roles.length, 0) / locations.length).toFixed(1)}`
);

// Find most common roles
const roleFrequency = {};
locations.forEach((loc) => {
  loc.roles.forEach((role) => {
    roleFrequency[role] = (roleFrequency[role] || 0) + 1;
  });
});

const sortedByFrequency = Object.entries(roleFrequency).sort((a, b) => b[1] - a[1]);

console.log('\n=== Top 20 Most Common Roles ===');
sortedByFrequency.slice(0, 20).forEach(([role, count]) => {
  console.log(`${count}x - ${role}`);
});

console.log('\n=== All Unique Roles (Alphabetically) ===');
Array.from(allRoles)
  .sort()
  .forEach((role) => {
    console.log(`  - ${role}`);
  });

// Output for translation generation
const outputData = {
  uniqueRoles: Array.from(allRoles).sort(),
  rolesByLocation,
  statistics: {
    totalLocations: locations.length,
    totalRoles: locations.reduce((sum, loc) => sum + loc.roles.length, 0),
    uniqueRoles: allRoles.size,
  },
};

const outputPath = path.join(__dirname, 'roles-analysis.json');
fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
console.log(`\n✅ Analysis saved to: ${outputPath}`);
