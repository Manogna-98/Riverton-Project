import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Search, CheckCircle2, XCircle, AlertTriangle, Clock, Smartphone, Zap, FileText, BarChart3, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function OfficerVerification() {
  const { searchPlate, recentSearches, addRecentSearch, citations, addCitation } = useData();
  const [plateInput, setPlateInput] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showCitationDialog, setShowCitationDialog] = useState(false);

  // Citation form state
  const [citationForm, setCitationForm] = useState({
    violationType: '',
    location: '',
    notes: '',
    fine: 50
  });

  const handleSearch = (plate: string) => {
    if (!plate.trim()) {
      toast.error('Please enter a license plate');
      return;
    }

    const result = searchPlate(plate.trim());
    setSearchResult(result);
    setHasSearched(true);
    addRecentSearch(plate.trim().toUpperCase());
    
    if (result) {
      toast.success('Valid permit found', {
        description: 'This vehicle is authorized to park'
      });
    } else {
      toast.error('No valid permit found', {
        description: 'Consider issuing a citation'
      });
    }
  };

  const handleQuickSearch = (plate: string) => {
    setPlateInput(plate);
    handleSearch(plate);
  };

  const openCitationDialog = () => {
    setCitationForm({
      violationType: '',
      location: '',
      notes: '',
      fine: 50
    });
    setShowCitationDialog(true);
  };

  const handleCitationSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!citationForm.violationType || !citationForm.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    const citationNumber = `CT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCitation = {
      citationNumber,
      licensePlate: plateInput,
      residentId: '99',
      residentName: 'Unknown Resident',
      violationType: citationForm.violationType,
      location: citationForm.location,
      notes: citationForm.notes,
      fine: citationForm.fine,
      status: 'Unpaid' as const,
      issuedBy: 'Mike Officer',
      issuedAt: new Date().toISOString()
    };

    addCitation(newCitation);

    setShowCitationDialog(false);
    toast.success(`Citation #${citationNumber} issued successfully`, {
      description: `License plate: ${plateInput} - Fine: $${citationForm.fine}`
    });

    // Reset states
    setPlateInput('');
    setSearchResult(null);
    setHasSearched(false);
    setCitationForm({
      violationType: '',
      location: '',
      notes: '',
      fine: 50
    });
  };

  const violationTypes = [
    { value: 'no-permit', label: 'No Valid Permit', fine: 50 },
    { value: 'expired-permit', label: 'Expired Permit', fine: 50 },
    { value: 'wrong-zone', label: 'Wrong Parking Zone', fine: 75 },
    { value: 'fire-lane', label: 'Fire Lane Violation', fine: 150 },
    { value: 'handicap', label: 'Handicap Zone Violation', fine: 250 },
    { value: 'overtime', label: 'Overtime Parking', fine: 35 },
    { value: 'other', label: 'Other Violation', fine: 50 }
  ];

  // Calculate location analytics
  const locationStats = (citations || []).reduce((acc, citation) => {
    const existing = acc.find(item => item.location === citation.location);
    if (existing) {
      existing.count += 1;
      existing.totalFines += citation.fine;
    } else {
      acc.push({
        location: citation.location,
        count: 1,
        totalFines: citation.fine
      });
    }
    return acc;
  }, [] as Array<{ location: string; count: number; totalFines: number }>);

  locationStats.sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        <motion.div
          className="mb-6 md:mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Smartphone className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Officer Portal</h1>
          <p className="text-gray-600 text-sm md:text-base flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 text-green-600" />
            Real-time permit validation & citation analytics
          </p>
        </motion.div>

        <Tabs defaultValue="verification" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-white shadow-md">
            <TabsTrigger value="verification" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white py-3">
              <Search className="h-4 w-4 mr-2" />
              Verification
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white py-3">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verification" className="space-y-6">

        {/* Quick Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-2xl border-0 mb-6">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="h-5 w-5" />
                License Plate Lookup
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
                  <Input
                    placeholder="Enter plate number..."
                    value={plateInput}
                    onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(plateInput)}
                    className="pl-14 text-xl font-mono font-bold h-16 tracking-wider text-center sm:text-left"
                    autoFocus
                  />
                </div>
                <Button 
                  onClick={() => handleSearch(plateInput)}
                  size="lg"
                  className="h-16 px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg text-lg"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search Result */}
        <AnimatePresence mode="wait">
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="mb-6"
            >
              <Card className={`shadow-2xl border-4 ${searchResult ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50' : 'border-red-500 bg-gradient-to-br from-red-50 to-orange-50'}`}>
                <CardContent className="py-10 md:py-16">
                  <div className="text-center">
                    {searchResult ? (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.2 }}
                          className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-2xl"
                        >
                          <CheckCircle2 className="h-16 w-16 text-white" />
                        </motion.div>
                        <motion.h2 
                          className="text-3xl md:text-4xl font-bold text-green-900 mb-3"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          ✓ Valid Permit
                        </motion.h2>
                        <motion.p 
                          className="text-green-700 text-lg mb-8"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          This vehicle is authorized to park
                        </motion.p>
                        
                        <motion.div 
                          className="bg-white rounded-2xl p-6 md:p-8 space-y-5 text-left max-w-lg mx-auto shadow-xl"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <div className="flex justify-between items-center pb-4 border-b">
                            <span className="text-gray-600 text-sm">License Plate</span>
                            <span className="font-bold font-mono text-2xl text-green-700">{searchResult.licensePlate}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Permit Type</span>
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-base px-3 py-1">
                              {searchResult.type}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Status</span>
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-base px-3 py-1">
                              {searchResult.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Valid Until</span>
                            <span className="font-semibold text-lg">{new Date(searchResult.endDate || 0).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t">
                            <span className="text-gray-600">Resident</span>
                            <span className="font-semibold">{searchResult.residentName}</span>
                          </div>
                        </motion.div>
                      </>
                    ) : (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.2 }}
                          className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-red-500 to-orange-600 rounded-full mb-6 shadow-2xl"
                        >
                          <XCircle className="h-16 w-16 text-white" />
                        </motion.div>
                        <motion.h2 
                          className="text-3xl md:text-4xl font-bold text-red-900 mb-3"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          ✗ No Valid Permit
                        </motion.h2>
                        <motion.p 
                          className="text-red-700 text-lg mb-8"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          This vehicle is not authorized to park
                        </motion.p>
                        
                        <motion.div 
                          className="bg-white rounded-2xl p-6 md:p-8 max-w-lg mx-auto shadow-xl"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <div className="flex items-center justify-center gap-3 text-red-600 mb-6">
                            <AlertTriangle className="h-6 w-6" />
                            <span className="text-lg">No permit found for:</span>
                          </div>
                          <div className="font-mono font-bold text-3xl text-red-700 mb-6 bg-red-50 rounded-xl py-4">
                            {plateInput}
                          </div>
                          <Button 
                            onClick={openCitationDialog}
                            size="lg"
                            className="w-full h-14 text-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg"
                          >
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            Issue Citation
                          </Button>
                        </motion.div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-green-50 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Recent Searches
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recentSearches.map((plate, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-between h-14 text-lg hover:bg-green-50 hover:border-green-300"
                        onClick={() => handleQuickSearch(plate)}
                      >
                        <span className="font-mono font-bold">{plate}</span>
                        <Search className="h-5 w-5 text-green-600" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Help Tips */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5" />
                Quick Tips
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-sm text-blue-900 font-medium">Fast Search</p>
                    <p className="text-xs text-blue-700">Enter plate and press Enter for instant results</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-sm text-blue-900 font-medium">Color Coded</p>
                    <p className="text-xs text-blue-700">Green = Valid permit, Red = No permit</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-sm text-blue-900 font-medium">Recent Access</p>
                    <p className="text-xs text-blue-700">Quick re-check of last 5 plates searched</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <div>
                    <p className="text-sm text-blue-900 font-medium">Real-time Sync</p>
                    <p className="text-xs text-blue-700">Results update instantly with admin approvals</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Citation Analytics by Location
                  </CardTitle>
                  <CardDescription>High-violation areas and citation hotspots</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-6 grid gap-4 sm:grid-cols-3">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-4">
                        <p className="text-sm text-blue-700 mb-1">Total Citations</p>
                        <p className="text-3xl font-bold text-blue-900">{citations.length}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                      <CardContent className="p-4">
                        <p className="text-sm text-red-700 mb-1">Total Fines</p>
                        <p className="text-3xl font-bold text-red-900">${citations.reduce((sum, c) => sum + c.fine, 0)}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                      <CardContent className="p-4">
                        <p className="text-sm text-orange-700 mb-1">Hotspot</p>
                        <p className="text-lg font-bold text-orange-900">{locationStats[0]?.location?.split(' ')[0] || 'N/A'}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {locationStats.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-4">Citations by Location</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={locationStats.slice(0, 6)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="location"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h3 className="font-semibold">Location Breakdown</h3>
                    {locationStats.map((location, index) => (
                      <Card key={index} className="shadow-md border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold">{location.location}</p>
                                <p className="text-sm text-gray-600">{location.count} citation{location.count !== 1 ? 's' : ''}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-red-600">${location.totalFines}</p>
                              <p className="text-xs text-gray-500">Total fines</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Citation Dialog */}
      <Dialog open={showCitationDialog} onOpenChange={setShowCitationDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Issue Citation</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Fill in the details to issue a citation for the vehicle with license plate {plateInput}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCitationSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="violationType">Violation Type</Label>
                <Select
                  value={citationForm.violationType}
                  onValueChange={(value) => {
                    const selectedType = violationTypes.find(type => type.value === value);
                    setCitationForm(prev => ({
                      ...prev,
                      violationType: value,
                      fine: selectedType ? selectedType.fine : 50
                    }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select violation type" />
                  </SelectTrigger>
                  <SelectContent>
                    {violationTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={citationForm.location}
                  onChange={(e) => setCitationForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={citationForm.notes}
                  onChange={(e) => setCitationForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fine">Fine Amount</Label>
                <Input
                  id="fine"
                  type="number"
                  value={citationForm.fine}
                  onChange={(e) => setCitationForm(prev => ({ ...prev, fine: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="mr-2"
                onClick={() => setShowCitationDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Issue Citation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}