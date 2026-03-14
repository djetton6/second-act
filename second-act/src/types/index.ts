export interface ChicagoProperty {
  id: string;
  address: string;
  zip: string;
  neighborhood: string;
  propertyType: "vacant_lot" | "abandoned_building";
  status: string;
  latitude: number;
  longitude: number;
  lastInspection?: string;
  currentBid?: number;
  minBid: number;
  estimatedValue: number;
  sqft?: number;
  lotSize?: number;
  ward?: string;
  isBoardedUp?: boolean;
  isHazardous?: boolean;
  currentPhotos?: string[];
  rawData?: Record<string, string>;
}

export interface Bid {
  id: string;
  propertyId: string;
  bidderName: string;
  bidderEmail: string;
  bidderZip: string;
  amount: number;
  timestamp: string;
  isLocalResident: boolean;
  proposalType: "new_construction" | "renovation";
  message?: string;
}

export interface ConstructionQuote {
  contractor: string;
  type: "renovation" | "new_construction";
  estimatedCost: number;
  timeline: string;
  rating: number;
  phone: string;
  website: string;
  specialties: string[];
}

export interface Lender {
  name: string;
  type: "bank" | "credit_union" | "community_development";
  programs: string[];
  minLoan: number;
  maxLoan: number;
  interestRange: string;
  phone: string;
  website: string;
  logo?: string;
  chicagoFocused: boolean;
  description: string;
}

export interface PropertyTaxDelta {
  neighborhood: string;
  currentRate: number;
  projectedRate: number;
  delta: number;
  reinvestmentFund: string;
  annualAmount: number;
}

export interface NeighborhoodStats {
  name: string;
  zipCodes: string[];
  totalVacant: number;
  totalAbandoned: number;
  avgPropertyValue: number;
  taxRate: number;
  walkScore?: number;
  transitScore?: number;
}
