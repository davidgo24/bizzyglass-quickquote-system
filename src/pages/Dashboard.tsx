import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, MessageSquare, Users, Phone, Mail, Car, Calendar, AlertCircle, CheckCircle, XCircle, Plus, Settings, BarChart3, Clock, DollarSign } from 'lucide-react';
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

    // Load leads from localStorage
    const storedLeads = JSON.parse(localStorage.getItem('bizzy_leads') || '[]');
    
    // Add enhanced demo leads if none exist
    if (storedLeads.length === 0) {
      const demoLeads = [
        {
          id: 'GLS-001',
          firstName: 'John',
          lastName: 'Smith',
          phone: '(555) 123-4567',
          email: 'john@example.com',
          make: 'Toyota',
          model: 'Camry',
          year: '2020',
          bodyType: 'Sedan',
          urgency: 'urgent',
          damageDescription: 'Large crack in windshield from road debris, spreading across driver view',
          status: 'NEW',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          messages: [
            {
              id: '1',
              sender: 'client',
              message: 'Hi, I need my windshield replaced ASAP. The crack is getting worse.',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: 'GLS-002',
          firstName: 'Sarah',
          lastName: 'Johnson',
          phone: '(555) 987-6543',
          email: 'sarah@example.com',
          make: 'Honda',
          model: 'CR-V',
          year: '2019',
          bodyType: 'SUV',
          urgency: 'soon',
          damageDescription: 'Small chip in windshield, passenger side. Want to fix before it spreads.',
          status: 'QUOTED',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          messages: [
            {
              id: '1',
              sender: 'client',
              message: 'Looking for a quote on windshield repair for a small chip',
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '2',
              sender: 'owner',
              message: 'Thanks for contacting us! I can repair that chip for $85. When would work best for you?',
              timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: 'GLS-003',
          firstName: 'Mike',
          lastName: 'Wilson',
          phone: '(555) 456-7890',
          email: 'mike@example.com',
          make: 'Ford',
          model: 'F-150',
          year: '2021',
          bodyType: 'Truck',
          urgency: 'emergency',
          damageDescription: 'Completely shattered windshield from accident. Cannot drive safely.',
          status: 'NEW',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          messages: [
            {
              id: '1',
              sender: 'client',
              message: 'EMERGENCY: My windshield is completely shattered. Need immediate replacement!',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: 'GLS-004',
          firstName: 'Emily',
          lastName: 'Davis',
          phone: '(555) 321-0987',
          email: 'emily@example.com',
          make: 'BMW',
          model: 'X3',
          year: '2018',
          bodyType: 'SUV',
          urgency: 'flexible',
          damageDescription: 'Side window replacement needed. Non-urgent.',
          status: 'PAID',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          messages: [
            {
              id: '1',
              sender: 'client',
              message: 'Need side window replaced when convenient',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '2',
              sender: 'owner',
              message: 'I can replace that for $180. How does Thursday afternoon work?',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '3',
              sender: 'client',
              message: 'Perfect! Payment sent.',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        }
      ];
      
      localStorage.setItem('bizzy_leads', JSON.stringify(demoLeads));
      setLeads(demoLeads);
    } else {
      setLeads(storedLeads);
    }
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

  const updateLeadStatus = (leadId: string, newStatus: string) => {
    const updatedLeads = leads.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    );
    setLeads(updatedLeads);
    localStorage.setItem('bizzy_leads', JSON.stringify(updatedLeads));
    
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
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
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg p-2">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BizzyGlass Pro</h1>
              <p className="text-gray-600">Advanced Lead Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
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
        </div>
      </header>

      <div className="p-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Enhanced Lead Inbox */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
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
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  {getStatusIcon(lead.status)}
                                  <span className="font-semibold text-gray-900">
                                    {lead.firstName} {lead.lastName}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {lead.id}
                                  </Badge>
                                  {lead.urgency === 'emergency' && (
                                    <Badge className="bg-red-500 text-white animate-pulse">
                                      URGENT
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                  <span className="flex items-center">
                                    <Car className="h-3 w-3 mr-1" />
                                    {lead.year} {lead.make} {lead.model}
                                  </span>
                                  <span className="flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {lead.phone}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 truncate">
                                  {lead.damageDescription}
                                </p>
                              </div>
                              <div className="text-right space-y-2 ml-4">
                                {getStatusBadge(lead.status)}
                                {getUrgencyBadge(lead.urgency)}
                                <p className="text-xs text-gray-500">
                                  {new Date(lead.createdAt).toLocaleDateString()}
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
                    onStatusChange={updateLeadStatus}
                    onClose={() => setSelectedLead(null)}
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
