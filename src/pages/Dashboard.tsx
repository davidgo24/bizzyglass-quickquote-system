import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, MessageSquare, Users, Phone, Mail, Car, Calendar, AlertCircle, CheckCircle, XCircle, Plus, Settings, BarChart3, Clock, DollarSign, Menu, X } from 'lucide-react'; // Added Menu and X icons
import { useNavigate } from 'react-router-dom';
import LeadDetail from '@/components/LeadDetail';
import DashboardStats from '@/components/DashboardStats';
import LeadFilters from '@/components/LeadFilters';
import QuickActions from '@/components/QuickActions';
import { toast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  make: string;
  model: string;
  year: string;
  bodyType: string;
  urgency: string;
  damageDescription: string;
  status: string;
  createdAt: string;
  messages: Message[];
  glassToReplace: string[];
  addonServices: string[];
  preferredDate: string;
  preferredTime: string;
  preferredDaysTimes: string[];
  vin?: string; // Ensure VIN is here if it's part of the Lead interface
}

interface Message {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('inbox');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

  const statusOptions = [
    { value: 'NEW', label: 'New', color: 'bg-blue-100 text-blue-700' },
    { value: 'QUOTED', label: 'Quoted', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'PAID', label: 'Paid', color: 'bg-green-100 text-green-700' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-gray-100 text-gray-700' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-700' }
  ];

  const urgencyOptions = [
    { value: 'emergency', label: 'Emergency', color: 'bg-red-100 text-red-700' },
    { value: 'urgent', label: 'Urgent', color: 'bg-orange-100 text-orange-700' },
    { value: 'soon', label: 'Soon', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'flexible', label: 'Flexible', color: 'bg-green-100 text-green-700' }
  ];

  useEffect(() => {
    // Simple auth check
    const authStatus = localStorage.getItem('bizzy_auth');
    if (authStatus !== 'true') {
      // Show login prompt
      const password = prompt('Enter owner password:');
      if (password === 'admin123') {
        localStorage.setItem('bizzy_auth', 'true');
        setIsAuthenticated(true);
        toast({
          title: "Welcome back!",
          description: "Successfully logged into your dashboard."
        });
      } else {
        toast({
          title: "Access denied",
          description: "Invalid password. Redirecting to home page.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }
    } else {
      setIsAuthenticated(true);
    }

    const fetchLeads = async (retries = 5, delay = 1000) => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
      try {
        const response = await fetch(`${baseUrl}/api/leads`);
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        const data = await response.json();
        setLeads(data);
      } catch (error) {
        if (retries > 0) {
          console.warn(`Retrying fetchLeads... (${retries} retries left)`);
          await new Promise((r) => setTimeout(r, delay));
          return fetchLeads(retries - 1, delay * 1.5);
        }
        console.error("Error fetching leads:", error);
        toast({
          title: "Error fetching leads",
          description: "Could not load leads from the server.",
          variant: "destructive"
        });
      }
    };

    fetchLeads();
  }, [navigate]);

  useEffect(() => {
    let filtered = [...leads];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${lead.make} ${lead.model}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Filter by urgency
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter(lead => lead.urgency === urgencyFilter);
    }

    // Sort leads
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'urgency':
          const urgencyOrder = { emergency: 0, urgent: 1, soon: 2, flexible: 3 };
          return urgencyOrder[a.urgency as keyof typeof urgencyOrder] - urgencyOrder[b.urgency as keyof typeof urgencyOrder];
        case 'status':
          const statusOrder = { NEW: 0, QUOTED: 1, PAID: 2, COMPLETED: 3, CANCELLED: 4 };
          return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, urgencyFilter, sortBy]);

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(opt => opt.value === status);
    return (
      <Badge className={statusConfig?.color || 'bg-gray-100 text-gray-700'}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const urgencyConfig = urgencyOptions.find(opt => opt.value === urgency);
    return (
      <Badge className={urgencyConfig?.color || 'bg-gray-100 text-gray-700'}>
        {urgencyConfig?.label || urgency}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'QUOTED':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'PAID':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bizzy_auth');
    navigate('/');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLeads(prevLeads =>
      prevLeads.map(lead => (lead.id === updatedLead.id ? updatedLead : lead))
    );
    setSelectedLead(updatedLead); // Keep the selected lead updated as well
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Authenticating...</h1>
          <p className="text-gray-600">Please wait while we verify your credentials.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40 md:px-6 md:py-4"> {/* Adjusted padding for mobile */}
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2 md:space-x-3"> {/* Adjusted spacing for mobile */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg p-1.5 md:p-2"> {/* Adjusted padding for mobile */}
              <Shield className="h-5 w-5 md:h-6 md:w-6" /> {/* Adjusted icon size for mobile */}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 md:text-2xl">BizzyGlass Pro</h1> {/* Adjusted font size for mobile */}
              <p className="text-gray-600 text-xs md:text-sm">Advanced Lead Management Dashboard</p> {/* Adjusted font size for mobile */}
            </div>
          </div>

          {/* Desktop Navigation (hidden on small screens) */}
          <div className="hidden md:flex items-center space-x-3">
            <Badge variant="outline" className="text-green-600 border-green-600">
              Live
            </Badge>
            <Button variant="outline" onClick={() => navigate('/')}>
              <Car className="h-4 w-4 mr-2" />
              View Site
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button (visible on small screens) */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-64 h-full shadow-lg p-4 flex flex-col space-y-4 animate-slide-in-right">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Menu</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <Button variant="ghost" className="justify-start" onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}>
              <Car className="h-4 w-4 mr-2" />
              View Site
            </Button>
            <Button variant="ghost" className="justify-start" onClick={() => setIsMobileMenuOpen(false)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" className="justify-start" onClick={handleLogout}>
              Logout
            </Button>
            <div className="mt-auto text-center text-xs text-gray-500">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Live
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Add a simple keyframe animation for the slide-in effect */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }
      `}</style>

      <div className="p-4 md:p-6"> {/* Adjusted padding for mobile */}
        {/* Dashboard Stats */}
        <DashboardStats leads={leads} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:inline-flex">
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Lead Inbox
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Quick Actions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6"> {/* Adjusted gap for mobile */}
              {/* Enhanced Lead Inbox */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0"> {/* Adjusted for stacking on small screens */}
                      <span>Lead Inbox</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{filteredLeads.length} leads</Badge>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Lead
                        </Button>
                      </div>
                    </CardTitle>
                    
                    <LeadFilters
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      statusFilter={statusFilter}
                      setStatusFilter={setStatusFilter}
                      urgencyFilter={urgencyFilter}
                      setUrgencyFilter={setUrgencyFilter}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      filteredCount={filteredLeads.length}
                      totalCount={leads.length}
                    />
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                      {filteredLeads.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No leads found matching your filters.</p>
                        </div>
                      ) : (
                        filteredLeads.map((lead) => (
                          <div
                            key={lead.id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                              selectedLead?.id === lead.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                            onClick={() => setSelectedLead(lead)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent overflow */}
                                <div className="flex items-center space-x-1 sm:space-x-3 mb-2 flex-wrap"> {/* Added flex-wrap for badges */}
                                  {getStatusIcon(lead.status)}
                                  <span className="font-semibold text-gray-900 truncate"> {/* Added truncate */}
                                    {lead.firstName} {lead.lastName}
                                  </span>
                                  <Badge variant="outline" className="text-xs flex-shrink-0"> {/* Added flex-shrink-0 */}
                                    {lead.id}
                                  </Badge>
                                  {lead.urgency === 'emergency' && (
                                    <Badge className="bg-red-500 text-white animate-pulse flex-shrink-0"> {/* Added flex-shrink-0 */}
                                      URGENT
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center space-x-2 sm:space-x-4 text-sm text-gray-600 mb-2"> {/* Added flex-wrap for vehicle/phone */}
                                  <span className="flex items-center">
                                    <Car className="h-3 w-3 mr-1" />
                                    <span className="truncate"> {/* Truncate vehicle info */}
                                      {lead.year} {lead.make} {lead.model}
                                    </span>
                                  </span>
                                  <span className="flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {lead.phone}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 truncate"> {/* Added truncate */}
                                  {lead.damageDescription}
                                </p>
                              </div>
                              <div className="text-right space-y-1 ml-2 flex-shrink-0"> {/* Adjusted margin and flex-shrink-0 */}
                                {getStatusBadge(lead.status)}
                                {getUrgencyBadge(lead.urgency)}
                                <p className="text-xs text-gray-500">
                                  {new Date(lead.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Lead Detail Panel */}
              <div className="lg:col-span-1">
                {selectedLead ? (
                  <LeadDetail 
                    lead={selectedLead} 
                    onClose={() => setSelectedLead(null)}
                    onLeadUpdate={handleLeadUpdate}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <h3 className="font-semibold text-gray-900 mb-2">Select a Lead</h3>
                      <p className="text-gray-600 text-sm">
                        Choose a lead from the inbox to view details and send messages.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <QuickActions leads={leads} onSelectLead={handleSelectLead} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <h3 className="font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
                <p className="text-gray-600 text-sm">
                  Advanced analytics and reporting features will be available here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;