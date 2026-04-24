// Mock data for the parking permit system

export interface Vehicle {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  residentId: string;
}

export interface Permit {
  id: string;
  vehicleId: string;
  type: 'Residential' | 'Guest' | 'Employee';
  status: 'Incomplete' | 'Pending' | 'Active' | 'Expired' | 'Under Review';
  startDate: string;
  endDate: string;
  residentId: string;
  residentName: string;
  licensePlate: string;
  submittedAt: string;
  documentUrl?: string;
  paymentStatus: 'Unpaid' | 'Paid' | 'Processing';
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: 'Resident' | 'Admin' | 'Officer';
  name: string;
}

export interface Citation {
  id: string;
  citationNumber: string;
  licensePlate: string;
  residentId: string;
  residentName: string;
  violationType: string;
  location: string;
  notes: string;
  fine: number;
  status: 'Unpaid' | 'Paid' | 'Disputed' | 'Refunded';
  issuedBy: string;
  issuedAt: string;
  paidAt?: string;
  claim?: {
    reason: string;
    submittedAt: string;
    status: 'Pending' | 'Approved' | 'Rejected';
  };
}

// Mock users for authentication
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'resident@example.com',
    password: 'password123',
    role: 'Resident',
    name: 'John Resident'
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'Admin',
    name: 'Sarah Admin'
  },
  {
    id: '3',
    email: 'officer@example.com',
    password: 'officer123',
    role: 'Officer',
    name: 'Mike Officer'
  }
];

// Mock vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    licensePlate: 'ABC1234',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    residentId: '1'
  },
  {
    id: 'v2',
    licensePlate: 'XYZ5678',
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    residentId: '1'
  }
];

// Mock permits
export const mockPermits: Permit[] = [
  {
    id: 'p1',
    vehicleId: 'v1',
    type: 'Residential',
    status: 'Active',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    residentId: '1',
    residentName: 'John Resident',
    licensePlate: 'ABC1234',
    submittedAt: '2026-01-01T10:00:00Z',
    documentUrl: 'mock-document.pdf',
    paymentStatus: 'Paid'
  },
  {
    id: 'p2',
    vehicleId: 'v2',
    type: 'Guest',
    status: 'Pending',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    residentId: '1',
    residentName: 'John Resident',
    licensePlate: 'XYZ5678',
    submittedAt: '2026-03-28T08:30:00Z',
    documentUrl: 'mock-document-2.pdf',
    paymentStatus: 'Processing'
  },
  {
    id: 'p3',
    vehicleId: 'v3',
    type: 'Residential',
    status: 'Under Review',
    startDate: '2026-03-15',
    endDate: '2027-03-15',
    residentId: '4',
    residentName: 'Jane Smith',
    licensePlate: 'DEF9012',
    submittedAt: '2026-03-27T14:20:00Z',
    documentUrl: 'mock-document-3.pdf',
    paymentStatus: 'Paid'
  }
];

// Mock citations
export const mockCitations: Citation[] = [
  {
    id: 'c1',
    citationNumber: 'CT-2026-1001',
    licensePlate: 'ABC1234',
    residentId: '1',
    residentName: 'John Resident',
    violationType: 'wrong-zone',
    location: 'Main Street Parking Lot A',
    notes: 'Vehicle parked in visitor zone with residential permit',
    fine: 75,
    status: 'Unpaid',
    issuedBy: 'Mike Officer',
    issuedAt: '2026-04-15T09:30:00Z'
  },
  {
    id: 'c2',
    citationNumber: 'CT-2026-1002',
    licensePlate: 'XYZ5678',
    residentId: '1',
    residentName: 'John Resident',
    violationType: 'overtime',
    location: 'Elm Street - Zone B',
    notes: 'Exceeded 2-hour time limit',
    fine: 35,
    status: 'Paid',
    issuedBy: 'Mike Officer',
    issuedAt: '2026-03-20T14:20:00Z',
    paidAt: '2026-03-22T10:15:00Z'
  },
  {
    id: 'c3',
    citationNumber: 'CT-2026-1003',
    licensePlate: 'LMN4567',
    residentId: '4',
    residentName: 'Jane Smith',
    violationType: 'no-permit',
    location: 'Oak Avenue Residential Area',
    notes: 'No valid permit displayed',
    fine: 50,
    status: 'Disputed',
    issuedBy: 'Mike Officer',
    issuedAt: '2026-04-10T16:45:00Z',
    claim: {
      reason: 'I had a valid permit displayed on my dashboard. The officer may have missed it.',
      submittedAt: '2026-04-12T09:00:00Z',
      status: 'Pending'
    }
  },
  {
    id: 'c4',
    citationNumber: 'CT-2026-1004',
    licensePlate: 'PQR8901',
    residentId: '5',
    residentName: 'Bob Johnson',
    violationType: 'fire-lane',
    location: 'Main Street - Fire Lane',
    notes: 'Parked in designated fire lane',
    fine: 150,
    status: 'Refunded',
    issuedBy: 'Mike Officer',
    issuedAt: '2026-02-28T11:00:00Z',
    paidAt: '2026-03-01T14:30:00Z',
    claim: {
      reason: 'Emergency situation - had to rush someone to hospital',
      submittedAt: '2026-03-02T08:00:00Z',
      status: 'Approved'
    }
  },
  {
    id: 'c5',
    citationNumber: 'CT-2026-1005',
    licensePlate: 'STU2345',
    residentId: '6',
    residentName: 'Alice Williams',
    violationType: 'expired-permit',
    location: 'Pine Street Lot C',
    notes: 'Permit expired 5 days ago',
    fine: 50,
    status: 'Paid',
    issuedBy: 'Mike Officer',
    issuedAt: '2026-04-18T13:15:00Z',
    paidAt: '2026-04-19T16:00:00Z'
  },
  {
    id: 'c6',
    citationNumber: 'CT-2026-1006',
    licensePlate: 'VWX6789',
    residentId: '7',
    residentName: 'Charlie Brown',
    violationType: 'wrong-zone',
    location: 'Main Street Parking Lot A',
    notes: 'Employee permit in residential zone',
    fine: 75,
    status: 'Unpaid',
    issuedBy: 'Mike Officer',
    issuedAt: '2026-04-20T10:00:00Z'
  },
  {
    id: 'c7',
    citationNumber: 'CT-2026-1007',
    licensePlate: 'YZA3456',
    residentId: '8',
    residentName: 'Diana Prince',
    violationType: 'no-permit',
    location: 'Elm Street - Zone B',
    notes: 'No permit found in system',
    fine: 50,
    status: 'Paid',
    issuedBy: 'Mike Officer',
    issuedAt: '2026-04-05T08:45:00Z',
    paidAt: '2026-04-06T12:00:00Z'
  },
  {
    id: 'c8',
    citationNumber: 'CT-2026-1008',
    licensePlate: 'BCD7890',
    residentId: '9',
    residentName: 'Ethan Hunt',
    violationType: 'handicap',
    location: 'Oak Avenue Residential Area',
    notes: 'Parked in handicap spot without proper placard',
    fine: 250,
    status: 'Unpaid',
    issuedBy: 'Mike Officer',
    issuedAt: '2026-04-21T15:30:00Z'
  }
];
