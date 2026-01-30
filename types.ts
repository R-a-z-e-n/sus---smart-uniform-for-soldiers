
export enum HazardLevel {
  SAFE = 'SAFE',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

export interface Vitals {
  heartRate: number;
  temperature: number;
  spO2: number;
  hydration: number;
}

export interface Environment {
  externalTemp: number;
  o2Level: number;
  radiation: number;
  toxicGas: number;
}

export interface PowerStatus {
  batteryLevel: number;
  harvestingRate: number; // in mW
  source: 'KINETIC' | 'THERMAL' | 'SOLAR' | 'NONE';
}

export interface Soldier {
  id: string;
  rank: string;
  name: string;
  unit: string;
  status: 'ACTIVE' | 'RESTING' | 'DISTRESS' | 'OFFLINE';
  location: {
    lat: number;
    lng: number;
    alt: number;
    accuracy?: number; // GPS accuracy in meters
  };
  vitals: Vitals;
  environment: Environment;
  power: PowerStatus;
  lastUpdate: number;
}

export interface OperationalAlert {
  id: string;
  timestamp: number;
  soldierId: string;
  soldierName: string;
  type: 'HEALTH' | 'ENVIRONMENT' | 'GEODATA' | 'SYSTEM';
  severity: HazardLevel;
  message: string;
}
