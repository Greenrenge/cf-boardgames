#!/usr/bin/env node

/**
 * Generate Location Translation Files
 *
 * This script reads data/locations.json and generates translation files
 * in locales/{locale}/locations.json for all supported languages.
 */

const fs = require('fs');
const path = require('path');

// Read the locations data
const locationsPath = path.join(__dirname, '../data/locations.json');
const locations = JSON.parse(fs.readFileSync(locationsPath, 'utf-8'));

console.log(`Found ${locations.length} locations to translate`);

// English translations (base translations)
const englishTranslations = {
  'loc-local-market': 'Local Market',
  'loc-hospital': 'Hospital',
  'loc-school': 'School',
  'loc-bank': 'Bank',
  'loc-restaurant': 'Restaurant',
  'loc-public-park': 'Public Park',
  'loc-sports-stadium': 'Sports Stadium',
  'loc-beach': 'Beach',
  'loc-movie-theater': 'Movie Theater',
  'loc-shopping-mall': 'Shopping Mall',
  'loc-train-station': 'Train Station',
  'loc-airport': 'Airport',
  'loc-police-station': 'Police Station',
  'loc-fire-station': 'Fire Station',
  'loc-library': 'Library',
  'loc-university': 'University',
  'loc-temple': 'Temple',
  'loc-mosque': 'Mosque',
  'loc-church': 'Church',
  'loc-office': 'Office',
  'loc-hotel': 'Hotel',
  'loc-coffee-shop': 'Coffee Shop',
  'loc-convenience-store': 'Convenience Store',
  'loc-gas-station': 'Gas Station',
  'loc-car-wash': 'Car Wash',
  'loc-gym': 'Gym',
  'loc-spa': 'Spa',
  'loc-barber-shop': 'Barber Shop',
  'loc-beauty-salon': 'Beauty Salon',
  'loc-veterinary-clinic': 'Veterinary Clinic',
  'loc-pet-shop': 'Pet Shop',
  'loc-bookstore': 'Bookstore',
  'loc-toy-store': 'Toy Store',
  'loc-music-store': 'Music Store',
  'loc-electronics-store': 'Electronics Store',
  'loc-furniture-store': 'Furniture Store',
  'loc-supermarket': 'Supermarket',
  'loc-bakery': 'Bakery',
  'loc-flower-shop': 'Flower Shop',
  'loc-pharmacy': 'Pharmacy',
  'loc-laundromat': 'Laundromat',
  'loc-post-office': 'Post Office',
  'loc-city-hall': 'City Hall',
  'loc-courthouse': 'Courthouse',
  'loc-prison': 'Prison',
  'loc-military-base': 'Military Base',
  'loc-submarine': 'Submarine',
  'loc-airplane': 'Airplane',
  'loc-cruise-ship': 'Cruise Ship',
  'loc-pirate-ship': 'Pirate Ship',
  'loc-space-station': 'Space Station',
  'loc-casino': 'Casino',
  'loc-theater': 'Theater',
  'loc-circus': 'Circus',
  'loc-amusement-park': 'Amusement Park',
  'loc-zoo': 'Zoo',
  'loc-aquarium': 'Aquarium',
  'loc-museum': 'Museum',
  'loc-art-gallery': 'Art Gallery',
  'loc-night-club': 'Night Club',
  'loc-bar': 'Bar',
  'loc-karaoke': 'Karaoke',
  'loc-bowling-alley': 'Bowling Alley',
  'loc-ice-skating-rink': 'Ice Skating Rink',
  'loc-ski-resort': 'Ski Resort',
  'loc-golf-course': 'Golf Course',
  'loc-tennis-court': 'Tennis Court',
  'loc-swimming-pool': 'Swimming Pool',
  'loc-construction-site': 'Construction Site',
  'loc-factory': 'Factory',
  'loc-warehouse': 'Warehouse',
  'loc-farm': 'Farm',
  'loc-vineyard': 'Vineyard',
  'loc-forest': 'Forest',
  'loc-mountain': 'Mountain',
  'loc-desert': 'Desert',
  'loc-island': 'Island',
  'loc-cave': 'Cave',
  'loc-volcano': 'Volcano',
  'loc-haunted-house': 'Haunted House',
  'loc-wizard-school': 'Wizard School',
  'loc-dragon-lair': 'Dragon Lair',
};

// Thai translations (from existing data)
const thaiTranslations = {};
locations.forEach((loc) => {
  thaiTranslations[loc.id] = loc.nameTh;
});

// Write English translations
const enPath = path.join(__dirname, '../locales/en/locations.json');
fs.writeFileSync(enPath, JSON.stringify(englishTranslations, null, 2), 'utf-8');
console.log(`✓ Created ${enPath}`);

// Write Thai translations
const thPath = path.join(__dirname, '../locales/th/locations.json');
fs.writeFileSync(thPath, JSON.stringify(thaiTranslations, null, 2), 'utf-8');
console.log(`✓ Created ${thPath}`);

console.log('\n✅ Location translation files generated successfully!');
console.log('\nNext steps:');
console.log(
  '1. Manually translate the English locations to Chinese, Hindi, Spanish, French, and Arabic'
);
console.log('2. Create locales/zh/locations.json, locales/hi/locations.json, etc.');
console.log('3. Use the same location IDs as keys');
