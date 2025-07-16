
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageSquare, CreditCard, CheckCircle, Clock, Star, Users, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeadForm from '@/components/LeadForm';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated (simple localStorage check for MVP)
    const authStatus = localStorage.getItem('bizzy_auth');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  const handleOwnerLogin = () => {
    navigate('/dashboard');
  };

  const features = [
    {
      icon: <Phone className="h-6 w-6 text-blue-600" />,
      title: "SMS Lead Capture",
      description: "Customers text to get started instantly"
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-blue-600" />,
      title: "Smart Communication",
      description: "Automated responses and easy chat management"
    },
    {
      icon: <CreditCard className="h-6 w-6 text-blue-600" />,
      title: "Instant Payments",
      description: "Secure payment links sent via SMS"
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
      title: "Lead Management",
      description: "Track every lead from inquiry to completion"
    }
  ];

  const stats = [
    { number: "95%", label: "Customer Satisfaction" },
    { number: "24/7", label: "Lead Capture" },
    { number: "2x", label: "Faster Quotes" },
    { number: "100%", label: "Mobile Optimized" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white rounded-lg p-2">
              <Shield className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-gray-900">BizzyGlass</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowForm(true)}
              className="hidden md:inline-flex"
            >
              Get Quote
            </Button>
            <Button onClick={handleOwnerLogin} variant="outline">
              Owner Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
              SMS-Powered Auto Glass Repair
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Mobile Auto Glass
              <span className="text-blue-600 block">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Professional windshield repair and replacement service that comes to you. 
              Get instant quotes via SMS and book your service in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Free Quote
              </Button>
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone className="h-5 w-5" />
                <span className="font-medium">Or text: (555) 123-GLASS</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose BizzyGlass?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've revolutionized auto glass repair with smart technology and exceptional service
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow duration-300 border-0 bg-gray-50">
                <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Three simple steps to get your windshield fixed
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-white/20 rounded-full p-6 w-fit mx-auto mb-6">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">1. Contact Us</h3>
              <p className="text-blue-100">
                Fill out our form or text us your vehicle details and damage info
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-full p-6 w-fit mx-auto mb-6">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">2. Get Quote</h3>
              <p className="text-blue-100">
                Receive an instant quote and schedule your convenient service time
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-full p-6 w-fit mx-auto mb-6">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">3. We Come to You</h3>
              <p className="text-blue-100">
                Our certified technician arrives at your location and completes the repair
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Fix Your Windshield?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust BizzyGlass for their auto glass needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl"
            >
              Get Your Free Quote
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg rounded-xl"
            >
              Call (555) 123-GLASS
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-blue-600 text-white rounded-lg p-2">
                <Shield className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold">BizzyGlass</span>
            </div>
            <div className="text-gray-400 text-center">
              <p>&copy; 2024 BizzyGlass. Professional mobile auto glass repair.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Lead Form Modal */}
      {showForm && <LeadForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default Index;
