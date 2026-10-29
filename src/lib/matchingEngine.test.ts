import { matchPropertiesForRequirement } from './matchingEngine';
import { Requirement, Property } from '../types';

export function runTests(): { total: number; passed: number; failed: number } {
  let passed = 0;
  let failed = 0;

  const sampleProperties: Property[] = [
    {
      id: 'p-test-1',
      reference: 'UPG-OF-0104',
      title: 'Commercial Office Lekki',
      propertyType: 'Office',
      location: 'Lekki Phase 1',
      area: 'Admiralty',
      city: 'Lagos',
      priceAmount: 30000000,
      priceDisplay: '₦30m / year',
      currency: 'NGN',
      paymentFrequency: 'per annum',
      sizeSqm: 380,
      specifications: 'Open floor plan, VRV air conditioning, backup generator',
      amenities: ['24/7 Power', 'Backup Generator', 'Parking'],
      availability: 'Available',
      source: 'Direct',
      images: [],
    },
    {
      id: 'p-test-2',
      reference: 'UPG-WH-0021',
      title: 'Warehouse Apapa',
      propertyType: 'Warehouse',
      location: 'Apapa',
      area: 'Port',
      city: 'Lagos',
      priceAmount: 45000000,
      priceDisplay: '₦45m / year',
      currency: 'NGN',
      paymentFrequency: 'per annum',
      sizeSqm: 1200,
      specifications: 'Clear height 9.5m',
      amenities: ['Truck turning radius'],
      availability: 'Available',
      source: 'Direct',
      images: [],
    },
  ];

  const officeReq: Requirement = {
    id: 'req-test-1',
    contactId: 'c-test-1',
    clientName: 'Test Client',
    transactionType: 'Commercial leasing',
    propertyType: 'Office',
    preferredLocations: ['Lekki Phase 1'],
    excludedLocations: ['Apapa'],
    budgetMin: 25000000,
    budgetMax: 35000000,
    budgetDisplay: '₦25m–₦35m / year',
    currency: 'NGN',
    rentPeriod: 'per annum',
    minSizeSqm: 300,
    essentialFeatures: ['24/7 Power'],
    timing: 'Within 30 days',
    decisionAuthority: 'Sole decision maker',
    fundingReadiness: 'Proof of funds ready',
    status: 'Active',
    createdAt: '2026-10-28',
  };

  // Test 1: Office requirement matches UPG-OF-0104 and filters out Warehouse
  const results = matchPropertiesForRequirement(officeReq, sampleProperties);
  if (results.length === 1 && results[0].property.reference === 'UPG-OF-0104') {
    passed++;
  } else {
    console.error('Test 1 failed: Expected 1 match for UPG-OF-0104');
    failed++;
  }

  // Test 2: Match score contains high score (>80%)
  if (results.length > 0 && results[0].score >= 80) {
    passed++;
  } else {
    console.error('Test 2 failed: Expected score >= 80, got', results[0]?.score);
    failed++;
  }

  // Test 3: Excluded locations check
  const warehouseReqWithExcluded: Requirement = {
    ...officeReq,
    propertyType: 'Warehouse',
    excludedLocations: ['Apapa'],
  };
  const excludedResults = matchPropertiesForRequirement(warehouseReqWithExcluded, sampleProperties);
  if (excludedResults.length === 0) {
    passed++;
  } else {
    console.error('Test 3 failed: Expected 0 matches due to Apapa excluded');
    failed++;
  }

  return { total: passed + failed, passed, failed };
}
