
import React from 'react';
import { Soldier, HazardLevel } from './types';

export const INITIAL_SOLDIERS: Soldier[] = [
  {
    id: 'ARMY-701',
    rank: 'Major',
    name: 'Vikram Singh',
    unit: '13 JAK Rifles',
    status: 'ACTIVE',
    location: { lat: 34.2268, lng: 77.5619, alt: 3500, accuracy: 3 },
    vitals: { heartRate: 82, temperature: 36.8, spO2: 98, hydration: 85 },
    environment: { externalTemp: -5, o2Level: 20.9, radiation: 0.12, toxicGas: 0 },
    power: { batteryLevel: 92, harvestingRate: 45, source: 'KINETIC' },
    lastUpdate: Date.now(),
  },
  {
    id: 'ARMY-842',
    rank: 'Subedar',
    name: 'Amit Kumar',
    unit: 'Para SF',
    status: 'ACTIVE',
    location: { lat: 34.2312, lng: 77.5688, alt: 3510, accuracy: 5 },
    vitals: { heartRate: 95, temperature: 37.2, spO2: 96, hydration: 78 },
    environment: { externalTemp: -4, o2Level: 20.9, radiation: 0.15, toxicGas: 5 },
    power: { batteryLevel: 78, harvestingRate: 30, source: 'THERMAL' },
    lastUpdate: Date.now(),
  },
  {
    id: 'ARMY-112',
    rank: 'Havildar',
    name: 'Rohan Mehra',
    unit: 'Madras Regt',
    status: 'RESTING',
    location: { lat: 34.2255, lng: 77.5592, alt: 3480, accuracy: 12 },
    vitals: { heartRate: 68, temperature: 36.5, spO2: 99, hydration: 90 },
    environment: { externalTemp: -6, o2Level: 21.0, radiation: 0.11, toxicGas: 0 },
    power: { batteryLevel: 45, harvestingRate: 0, source: 'NONE' },
    lastUpdate: Date.now(),
  },
  {
    id: 'NCC-990',
    rank: 'Cadet',
    name: 'Priya Sharma',
    unit: '1 DEL BN NCC',
    status: 'ACTIVE',
    location: { lat: 28.6139, lng: 77.2090, alt: 215, accuracy: 8 },
    vitals: { heartRate: 75, temperature: 37.0, spO2: 99, hydration: 95 },
    environment: { externalTemp: 28, o2Level: 21.0, radiation: 0.08, toxicGas: 2 },
    power: { batteryLevel: 98, harvestingRate: 15, source: 'SOLAR' },
    lastUpdate: Date.now(),
  },
];
