import { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { CheckCircle, XCircle, FileText, Search, Users, Car, Clock, Filter, TrendingUp, Activity, DollarSign, AlertCircle, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function AdminDashboard() {
  const { permits, updatePermitStatus, citations, updateCitationStatus } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPermit, setSelectedPermit] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'plate'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const handleApprove = (permitId: string) => {
    updatePermitStatus(permitId, 'Active');
    toast.success('Permit approved! Synced with enforcement system.', {
      description: 'Officers can now verify this permit in real-time'
    });
  };

  const handleReject = (permitId: string) => {
    updatePermitStatus(permitId, 'Expired');
    toast.error('Permit application rejected.');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: any) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // Filter and sort permits
  const filteredPermits = (permits || [])
    .filter(permit => {
      const residentName = permit.residentName || '';
      const licensePlate = permit.licensePlate || '';
      const matchesSearch = 
        residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        licensePlate.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || permit.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime();
      } else if (sortBy === 'name') {
        return (a.residentName || '').localeCompare(b.residentName || '');
      } else {
        return (a.licensePlate || '').localeCompare(b.licensePlate || '');
      }
    });

  const totalPages = Math.ceil(filteredPermits.length / itemsPerPage);
  const currentPermits = filteredPermits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const viewDocument = (permit: any) => {
    setSelectedPermit(permit.id);
  };

  // Calculate KPIs
  const activePermits = permits.filter(p => p.status === 'Active').length;
  const pendingApplications = permits.filter(p => p.status === 'Pending' || p.status === 'Under Review').length;
  const totalRevenue = permits.filter(p => p.paymentStatus === 'Paid').length * 75; // $75 per permit

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

  // Calculate citation analytics
  const totalFinesAllocated = citations.reduce((sum, c) => sum + c.fine, 0);
  const totalFinesPaid = citations.filter(c => c.status === 'Paid').reduce((sum, c) => sum + c.fine, 0);
  const totalClaims = citations.filter(c => c.claim).length;
  const totalRefunds = citations.filter(c => c.status === 'Refunded').reduce((sum, c) => sum + c.fine, 0);
  const unpaidFines = citations.filter(c => c.status === 'Unpaid').length;
  const disputedCitations = citations.filter(c => c.status === 'Disputed').length;

  const kpiData = [
    {
      title: 'Active Permits',
      value: activePermits,
      icon: Car,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      description: 'Currently valid permits',
      change: '+12%'
    },
    {
      title: 'Pending Review',
      value: pendingApplications,
      icon: Clock,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-50',
      description: 'Awaiting approval',
      change: '-5%'
    },
    {
      title: 'Total Residents',
      value: new Set(permits.map(p => p.residentId)).size,
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      description: 'Registered users',
      change: '+8%'
    },
    {
      title: 'Revenue (YTD)',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      description: 'Total collected',
      change: '+23%'
    }
  ];

  const citationStatusData = [
    { name: 'Paid', value: citations.filter(c => c.status === 'Paid').length, color: '#10b981' },
    { name: 'Unpaid', value: citations.filter(c => c.status === 'Unpaid').length, color: '#ef4444' },
    { name: 'Disputed', value: citations.filter(c => c.status === 'Disputed').length, color: '#f59e0b' },
    { name: 'Refunded', value: citations.filter(c => c.status === 'Refunded').length, color: '#3b82f6' }
  ];

  const handleApproveClaim = (citationId: string) => {
    updateCitationStatus(citationId, 'Refunded');
    toast.success('Claim approved and refund issued');
  };

  const handleRejectClaim = (citationId: string) => {
    const citation = citations.find(c => c.id === citationId);
    if (citation?.claim) {
      toast.info('Claim rejected - Citation remains active');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <motion.div 
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm md:text-base">Manage permits and monitor system activity</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="permits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-white shadow-md">
            <TabsTrigger value="permits" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white py-3">
              <FileText className="h-4 w-4 mr-2" />
              Permits
            </TabsTrigger>
            <TabsTrigger value="citations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white py-3">
              <Receipt className="h-4 w-4 mr-2" />
              Citations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="permits" className="space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-lg border-0 overflow-hidden hover:shadow-xl transition-shadow">
                <div className={`h-1 bg-gradient-to-r ${kpi.color}`} />
                <CardHeader className={`pb-3 ${kpi.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-700">{kpi.title}</CardTitle>
                    <div className={`w-10 h-10 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center shadow-md`}>
                      <kpi.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold mb-1">{kpi.value}</div>
                      <p className="text-xs text-gray-600">{kpi.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs font-medium text-green-700 border-green-300">
                      {kpi.change}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Application Queue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Application Queue
              </CardTitle>
              <CardDescription>Review and approve permit applications</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search by name or license plate..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10 h-11"
                  />
                </div>
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full md:w-48 h-11">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full md:w-48 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="plate">Sort by Plate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Applications Table - Desktop */}
              <div className="hidden md:block border rounded-xl overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold">Resident</TableHead>
                      <TableHead className="font-semibold">License Plate</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Submitted</TableHead>
                      <TableHead className="font-semibold">Document</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPermits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <Search className="h-12 w-12 text-gray-300" />
                            <p className="text-gray-500">No permits found matching your criteria</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentPermits.map((permit) => (
                        <TableRow key={permit.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{permit.residentName}</TableCell>
                          <TableCell className="font-mono font-semibold">{permit.licensePlate}</TableCell>
                          <TableCell>{permit.type}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(permit.status)} border`}>
                              {permit.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(permit.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {permit.documentUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => viewDocument(permit)}
                              >
                                <FileText className="h-4 w-4 text-blue-600" />
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {(permit.status === 'Pending' || permit.status === 'Under Review') && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(permit.id)}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReject(permit.id)}
                                    className="text-red-600 hover:text-red-700 border-red-200"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Applications Cards - Mobile */}
              <div className="md:hidden space-y-3">
                {currentPermits.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No permits found</p>
                  </div>
                ) : (
                  currentPermits.map((permit) => (
                    <Card key={permit.id} className="shadow-md border-l-4" style={{ borderLeftColor: permit.status === 'Active' ? '#22c55e' : '#eab308' }}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-lg">{permit.residentName}</p>
                            <p className="font-mono font-bold text-blue-600">{permit.licensePlate}</p>
                          </div>
                          <Badge className={`${getStatusColor(permit.status)} border`}>
                            {permit.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{permit.type}</span>
                          <span>{new Date(permit.submittedAt).toLocaleDateString()}</span>
                        </div>
                        {(permit.status === 'Pending' || permit.status === 'Under Review') && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(permit.id)}
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(permit.id)}
                              className="flex-1 text-red-600 border-red-200"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <p className="text-sm text-gray-500 text-center sm:text-left">
                    Showing {filteredPermits.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPermits.length)} of {filteredPermits.length} entries
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <div className="text-sm font-medium px-2">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4 sm:ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
          </TabsContent>

          <TabsContent value="citations" className="space-y-6">
            {/* Citation Analytics KPIs */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="shadow-lg border-0 overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-1 bg-gradient-to-r from-red-500 to-orange-600" />
                  <CardHeader className="pb-3 bg-red-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-700">Fines Allocated</CardTitle>
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-3xl font-bold mb-1">${totalFinesAllocated}</div>
                    <p className="text-xs text-gray-600">{citations.length} total citations</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="shadow-lg border-0 overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600" />
                  <CardHeader className="pb-3 bg-green-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-700">Fines Paid</CardTitle>
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-3xl font-bold mb-1">${totalFinesPaid}</div>
                    <p className="text-xs text-gray-600">{Math.round((totalFinesPaid / (totalFinesAllocated || 1)) * 100)}% collection rate</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="shadow-lg border-0 overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-1 bg-gradient-to-r from-yellow-500 to-orange-600" />
                  <CardHeader className="pb-3 bg-yellow-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-700">Claims Raised</CardTitle>
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-3xl font-bold mb-1">{totalClaims}</div>
                    <p className="text-xs text-gray-600">{disputedCitations} pending review</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="shadow-lg border-0 overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                  <CardHeader className="pb-3 bg-blue-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-700">Refunds Issued</CardTitle>
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-3xl font-bold mb-1">${totalRefunds}</div>
                    <p className="text-xs text-gray-600">{citations.filter(c => c.status === 'Refunded').length} refunded</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                    <CardTitle className="flex items-center gap-2">
                      Citation Status Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={citationStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {citationStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                    <CardTitle className="flex items-center gap-2">
                      Payment Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-gray-600">Total Citations</span>
                        <span className="text-2xl font-bold">{citations.length}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-gray-600">Unpaid Citations</span>
                        <span className="text-2xl font-bold text-red-600">{unpaidFines}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-gray-600">Collection Rate</span>
                        <span className="text-2xl font-bold text-green-600">
                          {Math.round((totalFinesPaid / (totalFinesAllocated || 1)) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Avg Fine Amount</span>
                        <span className="text-2xl font-bold">
                          ${Math.round(totalFinesAllocated / (citations.length || 1))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Disputed Citations Table */}
            {disputedCitations > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Disputed Citations Requiring Review
                    </CardTitle>
                    <CardDescription>Claims submitted by residents</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {citations.filter(c => c.claim && c.claim.status === 'Pending').map((citation) => (
                        <Card key={citation.id} className="border-l-4 border-l-yellow-500">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="font-bold">Citation #{citation.citationNumber}</p>
                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                    {citation.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>License Plate:</strong> {citation.licensePlate} • <strong>Fine:</strong> ${citation.fine}
                                </p>
                                <p className="text-sm text-gray-600 mb-2">
                                  <strong>Location:</strong> {citation.location}
                                </p>
                                {citation.claim && (
                                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                                    <p className="text-xs font-semibold text-yellow-900 mb-1">Dispute Reason:</p>
                                    <p className="text-xs text-gray-700">{citation.claim.reason}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Submitted: {new Date(citation.claim.submittedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveClaim(citation.id)}
                                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectClaim(citation.id)}
                                  className="text-red-600 border-red-200"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Document Review Modal */}
      <Dialog open={!!selectedPermit} onOpenChange={() => setSelectedPermit(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Residency Document Review
            </DialogTitle>
            <DialogDescription>
              Review uploaded residency proof document
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <p className="text-sm text-gray-700 mb-2 font-medium">
              Document: {permits.find(p => p.id === selectedPermit)?.documentUrl}
            </p>
            <p className="text-xs text-gray-500 bg-white rounded-lg p-3 inline-block">
              📄 In a production system, the PDF would be displayed here
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
