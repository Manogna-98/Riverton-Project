import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Upload, Car, FileText, CreditCard, CheckCircle2, Clock, XCircle, Plus, Sparkles, AlertTriangle, DollarSign, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function ResidentPortal() {
  const { user } = useAuth();
  const { permits, vehicles, citations, addVehicle, addPermit, updatePermitPayment, updatePermitStatus, payCitation, disputeCitation } = useData();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPermitForPayment, setSelectedPermitForPayment] = useState<string | null>(null);
  const [showFinePaymentDialog, setShowFinePaymentDialog] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<string | null>(null);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);
  const [isSubmittingPermit, setIsSubmittingPermit] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  // Vehicle form state
  const [vehicleForm, setVehicleForm] = useState({
    licensePlate: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
  });

  // Permit form state
  const [permitForm, setPermitForm] = useState({
    vehicleId: '',
    type: 'Residential' as 'Residential' | 'Guest' | 'Employee',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    zipCode: ''
  });

  // Check for session expiry and automatically log out
  useEffect(() => {
    const checkSession = () => {
      const loginTimestamp = localStorage.getItem('login_timestamp');
      if (loginTimestamp) {
        const currentTime = new Date().getTime();
        const timeElapsed = currentTime - parseInt(loginTimestamp, 10);
        
        const ONE_HOUR_IN_MS = 60 * 60 * 1000;
        
        if (timeElapsed > ONE_HOUR_IN_MS) {
          console.warn("Session expired. Automatically logging out.");
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    };

    checkSession();
    const interval = setInterval(checkSession, 60 * 1000); // Check every 1 minute
    return () => clearInterval(interval);
  }, []);

  const userVehicles = (vehicles || []).filter(v => v.residentId === user?.id);
  const userPermits = (permits || []).filter(p => p.residentId === user?.id);
  const userCitations = (citations || []).filter(c => c.residentId === user?.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      toast.success('Document uploaded: ' + e.target.files[0].name);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.licensePlate || !vehicleForm.make || !vehicleForm.model) {
      toast.error('Please fill in all fields');
      return;
    }

    if (isSubmittingVehicle) return;
    setIsSubmittingVehicle(true);

    try {
      await addVehicle({
        ...vehicleForm,
        residentId: user?.id || '',
      });

      toast.success('Vehicle enrolled successfully!');
      setVehicleForm({
        licensePlate: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to enroll vehicle');
    } finally {
      setIsSubmittingVehicle(false);
    }
  };

  const handleApplyPermit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permitForm.vehicleId) {
      toast.error('Please select a vehicle');
      return;
    }

    if (isSubmittingPermit) return;
    setIsSubmittingPermit(true);

    try {
      const vehicle = (vehicles || []).find(v => v.id === permitForm.vehicleId);
      if (!vehicle) return;

      const newPermit = {
        vehicleId: permitForm.vehicleId,
        type: permitForm.type,
        status: 'Pending' as const,
        startDate: permitForm.startDate,
        endDate: permitForm.endDate,
        residentId: user?.id || '',
        residentName: user?.name || '',
        licensePlate: vehicle.licensePlate,
        submittedAt: new Date().toISOString(),
        documentUrl: selectedFile ? selectedFile.name : undefined,
        paymentStatus: 'Unpaid' as const,
      };

      await addPermit(newPermit);

      toast.success('Permit application submitted!');
      setPermitForm({ 
        vehicleId: '', 
        type: 'Residential',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit permit application');
    } finally {
      setIsSubmittingPermit(false);
    }
  };

  const openPaymentDialog = (permitId: string) => {
    setSelectedPermitForPayment(permitId);
    setShowPaymentDialog(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate payment form
    if (!paymentForm.cardNumber || !paymentForm.cardName || !paymentForm.expiryDate || !paymentForm.cvv || !paymentForm.zipCode) {
      toast.error('Please fill in all payment details');
      return;
    }

    if (paymentForm.cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error('Please enter a valid 16-digit card number');
      return;
    }

    if (paymentForm.cvv.length !== 3) {
      toast.error('Please enter a valid 3-digit CVV');
      return;
    }

    if (!selectedPermitForPayment) return;

    if (isProcessingPayment) return;
    setIsProcessingPayment(true);

    // Simulate payment processing
    updatePermitPayment(selectedPermitForPayment, 'Processing');
    toast.loading('Processing payment...', { duration: 2000 });

    setTimeout(() => {
      setShowPaymentDialog(false);
      updatePermitPayment(selectedPermitForPayment, 'Paid');
      updatePermitStatus(selectedPermitForPayment, 'Pending');
      toast.success('Payment successful!', {
        description: 'Your permit is now pending approval.'
      });
      
      // Reset payment form
      setPaymentForm({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        zipCode: ''
      });
      setSelectedPermitForPayment(null);
      setIsProcessingPayment(false);
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setPaymentForm({ ...paymentForm, cardNumber: formatCardNumber(value) });
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    if (value.length <= 5) {
      setPaymentForm({ ...paymentForm, expiryDate: value });
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 3 && /^\d*$/.test(value)) {
      setPaymentForm({ ...paymentForm, cvv: value });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case 'Pending':
      case 'Under Review':
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case 'Expired':
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const permitTypeColors = {
    Residential: 'bg-blue-500',
    Guest: 'bg-purple-500',
    Employee: 'bg-green-500'
  };

  const openFinePaymentDialog = (citationId: string) => {
    setSelectedCitation(citationId);
    setShowFinePaymentDialog(true);
  };

  const openDisputeDialog = (citationId: string) => {
    setSelectedCitation(citationId);
    setShowDisputeDialog(true);
  };

  const handleFinePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentForm.cardNumber || !paymentForm.cardName || !paymentForm.expiryDate || !paymentForm.cvv || !paymentForm.zipCode) {
      toast.error('Please fill in all payment details');
      return;
    }

    if (!selectedCitation) return;

    if (isProcessingPayment) return;
    setIsProcessingPayment(true);

    toast.loading('Processing payment...', { duration: 2000 });

    setTimeout(() => {
      setShowFinePaymentDialog(false);
      payCitation(selectedCitation);
      toast.success('Fine paid successfully!');
      setPaymentForm({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        zipCode: ''
      });
      setSelectedCitation(null);
      setIsProcessingPayment(false);
    }, 2000);
  };

  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!disputeReason.trim()) {
      toast.error('Please provide a reason for the dispute');
      return;
    }

    if (!selectedCitation) return;

    if (isSubmittingDispute) return;
    setIsSubmittingDispute(true);

    try {
      await disputeCitation(selectedCitation, disputeReason);
      setShowDisputeDialog(false);
      toast.success('Dispute submitted successfully', {
        description: 'Your claim will be reviewed by an administrator'
      });
      setDisputeReason('');
      setSelectedCitation(null);
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const getCitationStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Unpaid':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Disputed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Refunded':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <motion.div 
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name ? user.name.split(' ')[0] : 'Resident'}!</h1>
              <p className="text-gray-600 text-sm md:text-base">Manage your vehicles and parking permits</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="permits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-white shadow-md">
            <TabsTrigger value="permits" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white py-3">
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Permits</span>
              <span className="sm:hidden">Permits</span>
            </TabsTrigger>
            <TabsTrigger value="fines" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white py-3">
              <Receipt className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Fines</span>
              <span className="sm:hidden">Fines</span>
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white py-3">
              <Car className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Vehicles</span>
              <span className="sm:hidden">Cars</span>
            </TabsTrigger>
            <TabsTrigger value="apply" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white py-3">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Apply</span>
              <span className="sm:hidden">New</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="permits" className="space-y-4">
            {userPermits.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="shadow-lg border-0">
                  <CardContent className="py-16 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No permits yet</h3>
                    <p className="text-gray-600 mb-4">Get started by applying for your first parking permit</p>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      Apply for Permit
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userPermits.map((permit, index) => (
                  <motion.div
                    key={permit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="shadow-lg border-0 overflow-hidden hover:shadow-xl transition-shadow">
                      <div className={`h-2 ${permitTypeColors[permit.type]}`} />
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl font-bold">{permit.licensePlate}</CardTitle>
                            <CardDescription className="text-base mt-1">{permit.type} Permit</CardDescription>
                          </div>
                          {getStatusIcon(permit.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Badge className={`${getStatusColor(permit.status)} border text-sm px-3 py-1`}>
                          {permit.status}
                        </Badge>

                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Valid Period</span>
                          </div>
                          <p className="font-medium text-sm">
                          {new Date(permit.startDate || 0).toLocaleDateString()} - {new Date(permit.endDate || 0).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Payment</span>
                          <Badge variant="outline" className="font-medium">{permit.paymentStatus}</Badge>
                        </div>

                        {permit.status === 'Pending' && permit.paymentStatus === 'Unpaid' && (
                          <Button 
                            onClick={() => openPaymentDialog(permit.id)} 
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay Now - $75
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="fines" className="space-y-4">
            {userCitations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="shadow-lg border-0">
                  <CardContent className="py-16 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No citations</h3>
                    <p className="text-gray-600">You have a clean parking record!</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid gap-4">
                {userCitations.map((citation, index) => (
                  <motion.div
                    key={citation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="shadow-lg border-0 overflow-hidden hover:shadow-xl transition-shadow">
                      <div className={`h-2 ${citation.status === 'Paid' ? 'bg-green-500' : citation.status === 'Disputed' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl font-bold">Citation #{citation.citationNumber}</CardTitle>
                            <CardDescription className="text-base mt-1">
                              {citation.licensePlate} • {citation.location}
                            </CardDescription>
                          </div>
                          <Badge className={`${getCitationStatusColor(citation.status)} border text-sm px-3 py-1`}>
                            {citation.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Violation</span>
                            <span className="font-medium text-right">
                              {citation.violationType === 'no-permit' && 'No Valid Permit'}
                              {citation.violationType === 'expired-permit' && 'Expired Permit'}
                              {citation.violationType === 'wrong-zone' && 'Wrong Parking Zone'}
                              {citation.violationType === 'fire-lane' && 'Fire Lane Violation'}
                              {citation.violationType === 'handicap' && 'Handicap Violation'}
                              {citation.violationType === 'overtime' && 'Overtime Parking'}
                              {citation.violationType === 'other' && 'Other Violation'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Issued</span>
                          <span className="font-medium">{new Date(citation.issuedAt || 0).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Officer</span>
                            <span className="font-medium">{citation.issuedBy}</span>
                          </div>
                        </div>

                        {citation.notes && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700"><strong>Notes:</strong> {citation.notes}</p>
                          </div>
                        )}

                        {citation.claim && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm font-semibold text-yellow-900 mb-1">Dispute Status: {citation.claim.status}</p>
                            <p className="text-xs text-yellow-700">{citation.claim.reason}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-lg font-bold text-red-600">Fine Amount</span>
                          <span className="text-2xl font-bold text-red-600">${citation.fine}</span>
                        </div>

                        {citation.status === 'Unpaid' && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => openFinePaymentDialog(citation.id)}
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay Fine
                            </Button>
                            <Button
                              onClick={() => openDisputeDialog(citation.id)}
                              variant="outline"
                              className="flex-1 border-yellow-300 hover:bg-yellow-50"
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Dispute
                            </Button>
                          </div>
                        )}

                        {citation.status === 'Paid' && citation.paidAt && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                            <p className="text-sm text-green-800">
                              <CheckCircle2 className="h-4 w-4 inline mr-1" />
                              Paid on {new Date(citation.paidAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        {citation.status === 'Refunded' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                            <p className="text-sm text-blue-800">
                              <DollarSign className="h-4 w-4 inline mr-1" />
                              Refund Processed
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Enroll New Vehicle
                  </CardTitle>
                  <CardDescription>Add a vehicle to your account</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleAddVehicle} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="licensePlate" className="font-medium">License Plate *</Label>
                        <Input
                          id="licensePlate"
                          placeholder="ABC1234"
                          value={vehicleForm.licensePlate}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, licensePlate: e.target.value.toUpperCase() })}
                          className="h-11 font-mono text-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="make" className="font-medium">Make *</Label>
                        <Input
                          id="make"
                          placeholder="Toyota"
                          value={vehicleForm.make}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model" className="font-medium">Model *</Label>
                        <Input
                          id="model"
                          placeholder="Camry"
                          value={vehicleForm.model}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year" className="font-medium">Year *</Label>
                        <Input
                          id="year"
                          type="number"
                          min="1900"
                          max={new Date().getFullYear() + 1}
                          value={vehicleForm.year}
                          onChange={(e) => setVehicleForm({ ...vehicleForm, year: parseInt(e.target.value) })}
                          className="h-11"
                        />
                      </div>
                    </div>
            <Button type="submit" disabled={isSubmittingVehicle} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-11 shadow-md">
                      <Car className="h-4 w-4 mr-2" />
              {isSubmittingVehicle ? 'Enrolling...' : 'Enroll Vehicle'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userVehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-gradient-to-br from-gray-50 to-blue-50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                          <Car className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-mono">{vehicle.licensePlate}</CardTitle>
                          <CardDescription className="text-sm">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="apply" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Apply for Parking Permit
                  </CardTitle>
                  <CardDescription>Submit a new permit application</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleApplyPermit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="vehicle" className="font-medium">Select Vehicle *</Label>
                      <Select value={permitForm.vehicleId} onValueChange={(value) => setPermitForm({ ...permitForm, vehicleId: value })}>
                        <SelectTrigger id="vehicle" className="h-12">
                          <SelectValue placeholder="Choose a vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {userVehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4" />
                                <span className="font-mono">{vehicle.licensePlate}</span>
                                <span className="text-gray-500">- {vehicle.make} {vehicle.model}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="permitType" className="font-medium">Permit Type *</Label>
                  <Select value={permitForm.type} onValueChange={(value: 'Residential' | 'Guest' | 'Employee') => setPermitForm({ ...permitForm, type: value })}>
                        <SelectTrigger id="permitType" className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Residential">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              Residential - $75/year
                            </div>
                          </SelectItem>
                          <SelectItem value="Guest">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-purple-500" />
                              Guest - $30/month
                            </div>
                          </SelectItem>
                          <SelectItem value="Employee">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                              Employee - $50/year
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="startDate" className="font-medium">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={permitForm.startDate}
                          onChange={(e) => setPermitForm({ ...permitForm, startDate: e.target.value })}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate" className="font-medium">End Date *</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={permitForm.endDate}
                          onChange={(e) => setPermitForm({ ...permitForm, endDate: e.target.value })}
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-medium">Upload Residency Proof (PDF) (Optional)</Label>
                      <div
                        className="border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Upload className="h-8 w-8 text-blue-600" />
                        </div>
                        <p className="text-base font-medium mb-1">
                          {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-gray-500">PDF files only (max 10MB)</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg" 
            disabled={!permitForm.vehicleId || isSubmittingPermit}
                    >
                      <FileText className="h-5 w-5 mr-2" />
            {isSubmittingPermit ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Fine Payment Dialog */}
      <Dialog open={showFinePaymentDialog} onOpenChange={setShowFinePaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Pay Fine</DialogTitle>
            <DialogDescription>
              Enter your payment information to pay the citation fine.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFinePayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fineCardNumber" className="font-medium">Card Number *</Label>
              <Input
                id="fineCardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentForm.cardNumber}
                onChange={handleCardNumberChange}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fineCardName" className="font-medium">Cardholder Name *</Label>
              <Input
                id="fineCardName"
                placeholder="John Doe"
                value={paymentForm.cardName}
                onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fineExpiryDate" className="font-medium">Expiry Date *</Label>
                <Input
                  id="fineExpiryDate"
                  placeholder="MM/YY"
                  value={paymentForm.expiryDate}
                  onChange={handleExpiryChange}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fineCvv" className="font-medium">CVV *</Label>
                <Input
                  id="fineCvv"
                  placeholder="123"
                  value={paymentForm.cvv}
                  onChange={handleCvvChange}
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fineZipCode" className="font-medium">Zip Code *</Label>
              <Input
                id="fineZipCode"
                placeholder="12345"
                value={paymentForm.zipCode}
                onChange={(e) => setPaymentForm({ ...paymentForm, zipCode: e.target.value })}
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              disabled={isProcessingPayment}
              className="w-full h-12 text-base bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              {isProcessingPayment ? 'Processing...' : `Pay $${selectedCitation && (citations || []).find(c => c.id === selectedCitation)?.fine}`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Dispute Citation</DialogTitle>
            <DialogDescription>
              Explain why you believe this citation should be reviewed or dismissed.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDispute} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="disputeReason" className="font-medium">Reason for Dispute *</Label>
              <Textarea
                id="disputeReason"
                placeholder="Please provide detailed information about why you are disputing this citation..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="min-h-32"
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Your dispute will be reviewed by an administrator. You will be notified of the decision.
              </p>
            </div>
            <Button
              type="submit"
              disabled={isSubmittingDispute}
              className="w-full h-12 text-base bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 shadow-lg"
            >
              <FileText className="h-5 w-5 mr-2" />
              {isSubmittingDispute ? 'Submitting...' : 'Submit Dispute'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Permit Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Enter your payment information to complete the permit application.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber" className="font-medium">Card Number *</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentForm.cardNumber}
                onChange={handleCardNumberChange}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardName" className="font-medium">Cardholder Name *</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={paymentForm.cardName}
                onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="font-medium">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={paymentForm.expiryDate}
                  onChange={handleExpiryChange}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv" className="font-medium">CVV *</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={paymentForm.cvv}
                  onChange={handleCvvChange}
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode" className="font-medium">Zip Code *</Label>
              <Input
                id="zipCode"
                placeholder="12345"
                value={paymentForm.zipCode}
                onChange={(e) => setPaymentForm({ ...paymentForm, zipCode: e.target.value })}
                className="h-11"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isProcessingPayment}
              className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg" 
            >
              <CreditCard className="h-5 w-5 mr-2" />
              {isProcessingPayment ? 'Processing...' : 'Pay Now - $75'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}