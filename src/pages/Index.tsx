import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageSquare, CreditCard, CheckCircle, Clock, Star, Users, Shield, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeadForm from '@/components/LeadForm';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('bizzy_auth');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  const handleOwnerLogin = () => {
    navigate('/dashboard');
  };

  // Define the payment branding JSX once to reuse it
  const paymentBrandingBadges = (
    <div className="flex flex-wrap justify-center gap-2 mt-3">
      {/* Assuming these are full-color official SVGs now */}
      <img src="visa.svg" alt="Visa" className="h-6"/>
      <img src="apple.svg" alt="Apple Pay" className="h-6"/>
      <img src="mastercard.svg" alt="MasterCard" className="h-6"/> {/* This should be your full-color Mastercard SVG */}
      <img src="amex.svg" alt="American Express" className="h-6"/>
      <img src="stripe.svg" alt="Stripe" className="h-6"/>
    </div>
  );

  const features = [
    { 
      icon: <CreditCard className="h-6 w-6 text-orange-600" />, // Icon color adjusted
      title: "Secure Mobile Payments", 
      description: "Pay conveniently and securely right from your phone.",
      branding: (
        <div className="flex flex-col items-center gap-2 mt-3">
          {paymentBrandingBadges}
          <a 
            href="https://docs.stripe.com/security" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-orange-600 hover:text-orange-800 text-sm font-medium mt-2" // Link color adjusted
          >
            Learn more about making payments using Stripe
          </a>
        </div>
      ),
      order: 'order-1' 
    },
    { 
      icon: <Phone className="h-6 w-6 text-orange-600" />, // Icon color adjusted
      title: "Easy Text-to-Quote", 
      description: "Get your personalized auto glass quote instantly via SMS",
      branding: null,
      order: 'order-2' 
    },
    { 
      icon: <MessageSquare className="h-6 w-6 text-orange-600" />, // Icon color adjusted
      title: "Hassle-Free Updates", 
      description: "Stay informed with clear, automated communication about your service",
      branding: null,
      order: 'order-3' 
    },
    { 
      icon: <CheckCircle className="h-6 w-6 text-orange-600" />, // Icon color adjusted
      title: "Seamless Service", 
      description: "From quote to completion, track your repair effortlessly",
      branding: null,
      order: 'order-4' 
    }
  ];

  const stats = [
    { number: "24/7", label: "Availability" }, 
    { number: "2x", label: "Faster Service" }, 
    { 
      number: null, 
      label: "Secured Payment Checkout", 
      iconComponent: <ShieldCheck className="h-8 w-8 text-orange-700 mx-auto" />, // Icon color adjusted
      additionalContent: paymentBrandingBadges 
    } 
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white"> {/* NEW: Background gradient */}
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-red-700 to-orange-500 text-white rounded-lg p-2"> {/* NEW: Logo background */}
              <Shield className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-gray-900">BizzyGlass</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setShowForm(true)}
              className="hidden md:inline-flex bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white" // NEW: Button gradient
            >
              Get Quote
            </Button>
            <Button onClick={handleOwnerLogin} variant="ghost"> 
              Owner Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-orange-100 text-orange-700 hover:bg-orange-100"> {/* NEW: Badge color */}
              Your Windshield, Fixed Fast & Easy
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Mobile Auto Glass
              <span className="text-red-700 block">Repair Made Simple</span> {/* NEW: Heading accent color */}
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" // NEW: Button gradient
              >
                Get Your Free Quote
              </Button>
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone className="h-5 w-5" />
                <span className="font-medium">Or text us now: (626) 548-2282</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto justify-items-center">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  {stat.number ? (
                    <div className="text-3xl font-bold text-red-700">{stat.number}</div>
                  ) : (
                    stat.iconComponent 
                  )}
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                  {stat.additionalContent && (
                    <div className="mt-3">
                      {stat.additionalContent}
                    </div>
                  )}
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
              Why BizzyGlass is Your Best Choice
            </h2> 
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make auto glass repair incredibly easy, efficient, and convenient for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-300 border-0 bg-gray-50 ${feature.order} md:order-none`} 
              >
                <div className="bg-gradient-to-br from-orange-300 to-red-200 rounded-full p-3 w-fit mx-auto mb-4"> {/* NEW: Feature icon background */}
                  {React.cloneElement(feature.icon, { className: "h-6 w-6 text-red-800" })} {/* NEW: Feature icon color */}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4"> 
                  {feature.description}
                </p>
                {feature.branding && (
                  <div className="mt-auto"> 
                    {feature.branding}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-r from-red-700 to-orange-600 text-white"> {/* NEW: How It Works background */}
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-orange-200 max-w-2xl mx-auto"> {/* NEW: Text color */}
              Three simple steps to get your windshield fixed
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-white/30 rounded-full p-6 w-fit mx-auto mb-6">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">1. Get Your Quote</h3> 
              <p className="text-orange-200"> {/* NEW: Text color */}
                Fill out our quick form or text us your vehicle details for an instant quote
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/30 rounded-full p-6 w-fit mx-auto mb-6">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">2. Schedule Service</h3> 
              <p className="text-orange-200"> {/* NEW: Text color */}
                Choose a time and location that works best for you
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/30 rounded-full p-6 w-fit mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">3. We Fix It On-Site</h3> 
              <p className="text-orange-200"> {/* NEW: Text color */}
                Our certified technician comes to you and completes the repair
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready for a Flawless Windshield?
          </h2> 
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience the easiest way to get your auto glass repaired or replaced.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-8 py-4 text-lg rounded-xl" // NEW: Button gradient
            >
              Get Your Free Quote Now
            </Button> 
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-red-700 text-red-700 hover:bg-orange-50 px-8 py-4 text-lg rounded-xl" // NEW: Button border/text color
            >
              Call Us: (555) 123-GLASS
            </Button> 
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-gradient-to-br from-red-700 to-orange-500 text-white rounded-lg p-2"> {/* NEW: Logo background */}
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
