// @refresh reset
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Permit, Vehicle, Citation } from '../utils/mockData';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';

interface DataContextType {
  permits: Permit[];
  vehicles: Vehicle[];
  citations: Citation[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  addPermit: (permit: Omit<Permit, 'id'>) => Promise<void>;
  addCitation: (citation: Omit<Citation, 'id'>) => Promise<void>;
  updatePermitStatus: (permitId: string, status: Permit['status']) => Promise<void>;
  updatePermitPayment: (permitId: string, paymentStatus: Permit['paymentStatus']) => Promise<void>;
  updateCitationStatus: (citationId: string, status: Citation['status']) => Promise<void>;
  payCitation: (citationId: string) => Promise<void>;
  disputeCitation: (citationId: string, reason: string) => Promise<void>;
  searchPlate: (plate: string) => Permit | undefined;
  recentSearches: string[];
  addRecentSearch: (plate: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [permits, setPermits] = useState<Permit[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { user } = useAuth();

  // Fetch initial data from Supabase
  useEffect(() => {
    // 1. Clear data immediately to avoid stale data when switching users
    setPermits([]);
    setVehicles([]);
    setCitations([]);
    setRecentSearches([]);

    if (!user) {
      return;
    }

    const fetchSupabaseData = async () => {
      // Helper function to paginate past the Supabase 1000 row limit
      const fetchAll = async (queryBuilder: () => any) => {
        let allData: any[] = [];
        let from = 0;
        const step = 1000;
        
        while (true) {
          const { data, error } = await queryBuilder().range(from, from + step - 1);
          if (error) return { data: null, error };
          
          if (data) {
            allData.push(...data);
            if (data.length < step) break;
            from += step;
          } else {
            break;
          }
        }
        return { data: allData, error: null };
      };

      const buildPermitsQuery = () => {
        let q = supabase.from('permits').select('*, profiles(full_name), vehicles(license_plate)');
        return user.role === 'Resident' ? q.eq('resident_id', user.id) : q;
      };

      const buildVehiclesQuery = () => {
        let q = supabase.from('vehicles').select('*');
        return user.role === 'Resident' ? q.eq('resident_id', user.id) : q;
      };

      const buildCitationsQuery = () => {
        let q = supabase.from('citations').select('*, resident_profile:profiles(full_name), claims(*)');
        return user.role === 'Resident' ? q.eq('resident_id', user.id) : q;
      };

      const [permitsRes, vehiclesRes, citationsRes] = await Promise.all([
        fetchAll(buildPermitsQuery),
        fetchAll(buildVehiclesQuery),
        fetchAll(buildCitationsQuery)
      ]);

      // Log any potential database errors to the console
      if (permitsRes.error) console.error('Permits fetch error:', permitsRes.error);
      if (vehiclesRes.error) console.error('Vehicles fetch error:', vehiclesRes.error);
      if (citationsRes.error) console.error('Citations fetch error:', citationsRes.error);

      if (permitsRes.data) {
        setPermits(permitsRes.data.map(p => ({
          id: p.id.toString(),
          vehicleId: p.vehicle_id?.toString() || '',
          type: p.type,
          status: p.status,
          paymentStatus: 'Paid', // Removed from new schema
          documentUrl: undefined, // Removed from new schema
          startDate: p.start_date,
          endDate: p.end_date,
          submittedAt: p.start_date, // Mapped to start date
          residentId: p.resident_id?.toString() || '',
          residentName: p.profiles?.full_name || 'Unknown',
          licensePlate: p.vehicles?.license_plate || 'Unknown'
        })));
      }
      
      if (vehiclesRes.data) {
        setVehicles(vehiclesRes.data.map(v => ({
          id: v.id.toString(),
          licensePlate: v.license_plate,
          make: v.make,
          model: v.model,
          year: new Date().getFullYear(), // Removed from new schema
          residentId: v.resident_id?.toString() || ''
        })));
      }
      
      if (citationsRes.data) {
        setCitations(citationsRes.data.map(c => {
          const claim = c.claims && c.claims.length > 0 ? {
            reason: c.claims[0].reason,
            status: c.claims[0].status,
            submittedAt: c.claims[0].submitted_at
          } : undefined;

          let status = c.is_paid ? 'Paid' : 'Unpaid';
          if (claim) {
            if (claim.status === 'Pending') status = 'Disputed';
            if (claim.status === 'Approved') status = 'Refunded';
          }

          return {
            id: c.id.toString(),
            citationNumber: c.citation_number,
            licensePlate: c.license_plate,
            residentId: c.resident_id?.toString() || '',
            residentName: c.resident_profile?.full_name || 'Unknown',
            violationType: c.violation_type,
            location: c.location || 'Unknown Location',
            fine: parseFloat(c.fine_amount),
            status: status as any,
            notes: '', // Removed from new schema
            issuedBy: 'System', // Removed from new schema
            issuedAt: c.issued_at,
            paidAt: c.is_paid ? c.issued_at : undefined,
            claim
          };
        }));
      }
    };
    fetchSupabaseData();
  }, [user]); // 3. Re-run this effect whenever the logged-in user changes

  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    const newId = crypto.randomUUID ? crypto.randomUUID() : `veh-${Date.now()}`;
    const tempVehicle = { ...vehicle, id: newId };
    setVehicles(prev => [...prev, tempVehicle]);

    const dbVehicle = {
      id: newId,
      resident_id: vehicle.residentId || null,
      license_plate: vehicle.licensePlate,
      make: vehicle.make,
      model: vehicle.model
    };

    const { data, error } = await supabase.from('vehicles').insert([dbVehicle]).select().single();
    if (data) {
      setVehicles(prev => prev.map(v => v.id === newId ? {
        id: data.id.toString(),
        licensePlate: data.license_plate,
        make: data.make,
        model: data.model,
        year: new Date().getFullYear(),
        residentId: data.resident_id?.toString() || ''
      } : v));
    }
    if (error) {
      console.error("Failed to insert vehicle to database:", error);
      setVehicles(prev => prev.filter(v => v.id !== newId));
      throw error;
    }
  };

  const addPermit = async (permit: Omit<Permit, 'id'>) => {
    const newId = crypto.randomUUID ? crypto.randomUUID() : `prm-${Date.now()}`;
    const tempPermit = { ...permit, id: newId };
    setPermits(prev => [...prev, tempPermit]);

    const dbPermit = {
      id: newId,
      resident_id: permit.residentId || null,
      vehicle_id: permit.vehicleId || null,
      type: permit.type,
      status: permit.status,
      start_date: permit.startDate,
      end_date: permit.endDate
    };

    const { data, error } = await supabase.from('permits').insert([dbPermit]).select('*, profiles(full_name), vehicles(license_plate)').single();
    if (data) {
      setPermits(prev => prev.map(p => p.id === newId ? {
        id: data.id.toString(),
        vehicleId: data.vehicle_id?.toString() || '',
        type: data.type,
        status: data.status,
        paymentStatus: p.paymentStatus, // Retain local 'Unpaid' state so the user can actually pay
        documentUrl: undefined,
        startDate: data.start_date,
        endDate: data.end_date,
        submittedAt: data.start_date,
        residentId: data.resident_id?.toString() || '',
        residentName: data.profiles?.full_name || permit.residentName,
        licensePlate: data.vehicles?.license_plate || permit.licensePlate
      } : p));
    }
    if (error) {
      console.error("Failed to insert permit to database:", error);
      setPermits(prev => prev.filter(p => p.id !== newId));
      throw error;
    }
  };

  const updatePermitStatus = async (permitId: string, status: Permit['status']) => {
    setPermits(prev => prev.map(p => p.id === permitId ? { ...p, status } : p));
    const { error } = await supabase.from('permits').update({ status }).eq('id', permitId);
    if (error) console.error("Failed to update permit status:", error);
  };

  const updatePermitPayment = async (permitId: string, paymentStatus: Permit['paymentStatus']) => {
    setPermits(prev => prev.map(p => p.id === permitId ? { ...p, paymentStatus } : p));
    // payment_status removed from schema, only updating local state
  };

  const searchPlate = (plate: string) => {
    return permits.find(
      p => p.licensePlate.toLowerCase() === plate.toLowerCase() && 
      p.status === 'Active'
    );
  };

  const addCitation = async (citation: Omit<Citation, 'id'>) => {
    const newId = crypto.randomUUID ? crypto.randomUUID() : `cit-${Date.now()}`;
    const tempCitation = { ...citation, id: newId };
    setCitations(prev => [...prev, tempCitation]);

    const dbCitation = {
      id: newId,
      citation_number: citation.citationNumber,
      license_plate: citation.licensePlate,
      resident_id: citation.residentId || null,
      violation_type: citation.violationType,
      location: citation.location,
      fine_amount: citation.fine,
      is_paid: citation.status === 'Paid'
    };

    const { data, error } = await supabase.from('citations').insert([dbCitation]).select('*, resident_profile:profiles(full_name)').single();
    if (data) {
      setCitations(prev => prev.map(c => c.id === newId ? {
        id: data.id.toString(),
        citationNumber: data.citation_number,
        licensePlate: data.license_plate,
        residentId: data.resident_id?.toString() || '',
        residentName: data.resident_profile?.full_name || citation.residentName,
        violationType: data.violation_type,
        location: data.location || citation.location,
        fine: parseFloat(data.fine_amount),
        status: data.is_paid ? 'Paid' : 'Unpaid',
        notes: citation.notes, // Kept locally for frontend state
        issuedBy: citation.issuedBy || 'System', // Retain the actual officer's name in local state
        issuedAt: data.issued_at,
        paidAt: data.is_paid ? data.issued_at : undefined,
        claim: undefined
      } : c));
    }
    if (error) {
      console.error("Failed to insert citation to database:", error);
      setCitations(prev => prev.filter(c => c.id !== newId));
      throw error;
    }
  };

  const updateCitationStatus = async (citationId: string, status: Citation['status']) => {
    setCitations(prev => prev.map(c => c.id === citationId ? { ...c, status } : c));
    
    const isPaid = status === 'Paid' || status === 'Refunded';
    const { error: citError } = await supabase.from('citations').update({ is_paid: isPaid }).eq('id', citationId);
    if (citError) console.error("Failed to update citation status:", citError);
    
    if (status === 'Refunded') {
       const { error: clmError } = await supabase.from('claims').update({ status: 'Approved' }).eq('citation_id', citationId);
       if (clmError) console.error("Failed to approve claim:", clmError);
    }
  };

  const payCitation = async (citationId: string) => {
    const paidAt = new Date().toISOString();
    setCitations(prev => prev.map(c =>
      c.id === citationId ? { ...c, status: 'Paid' as const, paidAt } : c
    ));
    const { error } = await supabase.from('citations').update({ is_paid: true }).eq('id', citationId);
    if (error) console.error("Failed to pay citation:", error);
  };

  const disputeCitation = async (citationId: string, reason: string) => {
    const claim = { reason, submittedAt: new Date().toISOString(), status: 'Pending' as const };
    setCitations(prev => prev.map(c =>
      c.id === citationId ? { ...c, status: 'Disputed' as const, claim } : c
    ));
    
    const citation = citations.find(c => c.id === citationId);
    if (citation) {
      const { error } = await supabase.from('claims').insert([{
        id: crypto.randomUUID ? crypto.randomUUID() : `clm-${Date.now()}`,
        citation_id: citationId,
        resident_id: citation.residentId || null,
        reason: reason,
        status: 'Pending'
      }]);
      if (error) {
        console.error("Failed to insert claim to database:", error);
        setCitations(prev => prev.map(c => 
          c.id === citationId ? { ...c, status: citation.status, claim: undefined } : c
        ));
      }
    }
  };

  const addRecentSearch = (plate: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(p => p !== plate);
      return [plate, ...filtered].slice(0, 5);
    });
  };

  return (
    <DataContext.Provider
      value={{
        permits,
        vehicles,
        citations,
        addVehicle,
        addPermit,
        addCitation,
        updatePermitStatus,
        updatePermitPayment,
        updateCitationStatus,
        payCitation,
        disputeCitation,
        searchPlate,
        recentSearches,
        addRecentSearch,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
