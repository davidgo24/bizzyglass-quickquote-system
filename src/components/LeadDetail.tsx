import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X, Send, DollarSign, Calendar, Clock, Phone, Mail, Car, User, MessageSquare, CreditCard, CheckCircle, Percent } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { StripeLinkGenerator } from './stripelinkgenerator';

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

interface LeadDetailProps {
  lead: Lead;
  onClose: () => void;
  onLeadUpdate: (updatedLead: Lead) => void;
}

const LeadDetail = ({ lead, onClose, onLeadUpdate }: LeadDetailProps) => {
  const [newMessage, setNewMessage] = useState('');

  interface ServiceItem {
    id: string;
    name: string;
    price: string;
    glassType?: "OEM" | "Aftermarket" | "Customer-Supplied";
  }

  interface AddonItem {
    id: string;
    name: string;
    price: string;
  }

  interface AppointmentSlot {
    id: string;
    date: string;
    time: string;
  }

  const [selectedOemServices, setSelectedOemServices] = useState<ServiceItem[]>([]);
  const [selectedAftermarketServices, setSelectedAftermarketServices] = useState<ServiceItem[]>([]);
  const [customServices, setCustomServices] = useState<ServiceItem[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<AddonItem[]>([]);
  const [customAddons, setCustomAddons] = useState<AddonItem[]>([]);
  const [appointmentSlots, setAppointmentSlots] = useState<AppointmentSlot[]>([]);
  const [generatedQuoteMessage, setGeneratedQuoteMessage] = useState('');

  const [quoteData, setQuoteData] = useState({
    serviceDate: '',
    serviceTime: '',
    notes: '',
    paymentType: 'full',
    depositAmount: '',
    depositPercentage: '50'
  });
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const statusOptions = [
    { value: 'NEW', label: 'New', color: 'bg-blue-100 text-blue-700' },
    { value: 'QUOTED', label: 'Quoted', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'PAID', label: 'Paid', color: 'bg-green-100 text-green-700' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-gray-100 text-gray-700' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-700' }
  ];

  const oemGlassOptions = [
    { name: 'Windshield', defaultPrice: '350' },
    { name: 'Rear Glass', defaultPrice: '250' },
    { name: 'Side Window', defaultPrice: '180' },
  ];

  const aftermarketGlassOptions = [
    { name: 'Windshield', defaultPrice: '250' },
    { name: 'Rear Glass', defaultPrice: '180' },
    { name: 'Side Window', defaultPrice: '120' },
  ];

  const predefinedAddons = [
    { name: 'Mobile Calibration', defaultPrice: '60' },
    { name: 'Tint Matching', defaultPrice: '40' },
    { name: 'Glass Disposal', defaultPrice: '25' },
  ];

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const paymentTypes = [
    { value: 'full', label: 'Full Payment Required', description: 'Customer pays the full amount upfront' },
    { value: 'deposit', label: 'Deposit Only', description: 'Customer pays a deposit, balance due on completion' },
    { value: 'both', label: 'Both Options', description: 'Give customer choice between full payment or deposit' }
  ];

  const stripLinksFromMessage = (message: string) => {
    const words = message.split(' ');
    const cleanedWords = words.map(word => {
      if (word.startsWith('http://') || word.startsWith('https://')) {
        return '[Payment Link]';
      } else {
        return word;
      }
    });
    return cleanedWords.join(' ').trim();
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const cleanMessage = stripLinksFromMessage(newMessage);

    try {
      const response = await fetch(`/api/leads/${lead.id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: cleanMessage }),
        });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const updatedLead = await response.json();
      onLeadUpdate(updatedLead);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    }

    setNewMessage('');
  };

  const calculateTotalPrice = () => {
    const oemTotal = selectedOemServices.reduce((sum, service) => sum + parseFloat(service.price || '0'), 0);
    const aftermarketTotal = selectedAftermarketServices.reduce((sum, service) => sum + parseFloat(service.price || '0'), 0);
    const customServiceTotal = customServices.reduce((sum, service) => sum + parseFloat(service.price || '0'), 0);
    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + parseFloat(addon.price || '0'), 0);
    const customAddonsTotal = customAddons.reduce((sum, addon) => sum + parseFloat(addon.price || '0'), 0);

    return (oemTotal + aftermarketTotal + customServiceTotal + addonsTotal + customAddonsTotal).toFixed(2);
  };

  const generatePaymentLinks = (totalPrice: number) => {
    const baseUrl = `https://checkout.stripe.com/demo-payment-${lead.id}`;
    const fullAmount = totalPrice;
    const depositAmount = quoteData.paymentType === 'deposit' || quoteData.paymentType === 'both' 
      ? quoteData.depositAmount ? parseFloat(quoteData.depositAmount) 
      : (fullAmount * parseFloat(quoteData.depositPercentage) / 100)
      : 0;

    return {
      fullPayment: `${baseUrl}-full-${fullAmount}`,
      deposit: depositAmount > 0 ? `${baseUrl}-deposit-${depositAmount}` : null
    };
  };

  const handleGenerateQuote = () => {
    const total = calculateTotalPrice();
    const paymentLinks = generatePaymentLinks(parseFloat(total));

    let servicesList = '';
    if (selectedOemServices.length > 0) {
      servicesList += '\n## OEM Services\n';
      selectedOemServices.forEach(s => servicesList += `• ${s.name}: $${s.price}\n`);
    }
    if (selectedAftermarketServices.length > 0) {
      servicesList += '\n## Aftermarket Services\n';
      selectedAftermarketServices.forEach(s => servicesList += `• ${s.name}: $${s.price}\n`);
    }
    if (customServices.length > 0) {
      servicesList += '\n## Custom Services\n';
      customServices.forEach(s => servicesList += `• ${s.name} (${s.glassType || 'N/A'}): $${s.price}\n`);
    }

    let addonsList = '';
    if (selectedAddons.length > 0) {
      addonsList += '\n## Add-ons\n';
      selectedAddons.forEach(a => addonsList += `• ${a.name}: $${a.price}\n`);
    }
    if (customAddons.length > 0) {
      addonsList += '\n## Custom Add-ons\n';
      customAddons.forEach(a => addonsList += `• ${a.name}: $${a.price}\n`);
    }

    let appointmentList = '';
    if (appointmentSlots.length > 0) {
      appointmentList += '\n## Proposed Appointment Times\n';
      appointmentSlots.forEach(slot => appointmentList += `• ${slot.date} at ${slot.time}\n`);
      appointmentList += '\n⏳ These time slots are held for 20 minutes and may become unavailable.\n';
    }

    let paymentSection = '';
    if (quoteData.paymentType === 'full') {
      paymentSection = `💳 To secure your appointment, please pay the full amount ($${total}): ${paymentLinks.fullPayment}`;
    } else if (quoteData.paymentType === 'deposit') {
      const depositAmount = quoteData.depositAmount ? parseFloat(quoteData.depositAmount) 
        : (parseFloat(total) * parseFloat(quoteData.depositPercentage) / 100);
      paymentSection = `💳 To secure your appointment, please pay the deposit ($${depositAmount.toFixed(2)}): ${paymentLinks.deposit}\nBalance of $${(parseFloat(total) - depositAmount).toFixed(2)} due upon completion.`;
    } else if (quoteData.paymentType === 'both') {
      const depositAmount = quoteData.depositAmount ? parseFloat(quoteData.depositAmount) 
        : (parseFloat(total) * parseFloat(quoteData.depositPercentage) / 100);
      paymentSection = `💳 Choose your payment option:\n\nOption 1 - Pay Full Amount ($${total}): ${paymentLinks.fullPayment}\n\nOption 2 - Pay Deposit ($${depositAmount.toFixed(2)}): ${paymentLinks.deposit}\n(Balance of $${(parseFloat(total) - depositAmount).toFixed(2)} due upon completion)`;
    }


    const message = `Hi ${lead.firstName}! Here's your quote:\n${servicesList}${addonsList}${appointmentList}\n${paymentSection}\n\nQuestions? Just reply to this message!`;
    setGeneratedQuoteMessage(message);
  };

  const sendQuote = async () => {
    if (!generatedQuoteMessage.trim()) {
      toast({
        title: "Quote message is empty",
        description: "Please generate or type a quote message before sending.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/leads/${lead.id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: generatedQuoteMessage }),
        });

      if (!response.ok) {
        throw new Error('Failed to send quote');
      }

      const updatedLead = await response.json();
      onLeadUpdate(updatedLead);

    } catch (error) {
      console.error('Error sending quote:', error);
      toast({
        title: "Error sending quote",
        description: "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    }

    setShowQuoteForm(false);
    setQuoteData({
      serviceDate: '',
      serviceTime: '',
      notes: '',
      paymentType: 'full',
      depositAmount: '',
      depositPercentage: '50'
    });
    setGeneratedQuoteMessage('');
    setSelectedOemServices([]);
    setSelectedAftermarketServices([]);
    setCustomServices([]);
    setSelectedAddons([]);
    setCustomAddons([]);
    setAppointmentSlots([]);
  };

  const simulatePayment = () => {
    
    toast({
      title: "Payment Received!",
      description: "Customer has completed payment via Stripe"
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(opt => opt.value === status);
    return (
      <Badge className={statusConfig?.color || 'bg-gray-100 text-gray-700'}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const handleServiceChange = (
    serviceList: ServiceItem[],
    setServiceList: React.Dispatch<React.SetStateAction<ServiceItem[]>>,
    service: { name: string; defaultPrice: string; },
    checked: boolean,
    glassType?: "OEM" | "Aftermarket"
  ) => {
    if (checked) {
      setServiceList([...serviceList, { id: service.name, name: service.name, price: service.defaultPrice, glassType }]);
    } else {
      setServiceList(serviceList.filter(item => item.name !== service.name));
    }
  };

  const handleServicePriceChange = (
    serviceList: ServiceItem[],
    setServiceList: React.Dispatch<React.SetStateAction<ServiceItem[]>>,
    id: string,
    newPrice: string
  ) => {
    setServiceList(serviceList.map(service =>
      service.id === id ? { ...service, price: newPrice } : service
    ));
  };

  const addCustomService = () => {
    setCustomServices([...customServices, { id: `custom-${Date.now()}`, name: '', price: '', glassType: 'Customer-Supplied' }]);
  };

  const removeCustomService = (id: string) => {
    setCustomServices(customServices.filter(service => service.id !== id));
  };

  const handleCustomServiceChange = (id: string, field: keyof ServiceItem, value: string) => {
    setCustomServices(customServices.map(service =>
      service.id === id ? { ...service, [field]: value } : service
    ));
  };

  const handleAddonChange = (
    addonList: AddonItem[],
    setAddonList: React.Dispatch<React.SetStateAction<AddonItem[]>>,
    addon: { name: string; defaultPrice: string; },
    checked: boolean
  ) => {
    if (checked) {
      setAddonList([...addonList, { id: addon.name, name: addon.name, price: addon.defaultPrice }]);
    } else {
      setAddonList(addonList.filter(item => item.name !== addon.name));
    }
  };

  const handleAddonPriceChange = (
    addonList: AddonItem[],
    setAddonList: React.Dispatch<React.SetStateAction<AddonItem[]>>,
    id: string,
    newPrice: string
  ) => {
    setAddonList(addonList.map(addon =>
      addon.id === id ? { ...addon, price: newPrice } : addon
    ));
  };

  const addCustomAddon = () => {
    setCustomAddons([...customAddons, { id: `custom-addon-${Date.now()}`, name: '', price: '' }]);
  };

  const removeCustomAddon = (id: string) => {
    setCustomAddons(customAddons.filter(addon => addon.id !== id));
  };

  const handleCustomAddonChange = (id: string, field: keyof AddonItem, value: string) => {
    setCustomAddons(customAddons.map(addon =>
      addon.id === id ? { ...addon, [field]: value } : addon
    ));
  };

  const addAppointmentSlot = () => {
    setAppointmentSlots([...appointmentSlots, { id: `slot-${Date.now()}`, date: '', time: '' }]);
  };

  const removeAppointmentSlot = (id: string) => {
    setAppointmentSlots(appointmentSlots.filter(slot => slot.id !== id));
  };

  const handleAppointmentSlotChange = (id: string, field: keyof AppointmentSlot, value: string) => {
    setAppointmentSlots(appointmentSlots.map(slot =>
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  return(
    <Card className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Lead Details</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Lead Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {lead.firstName} {lead.lastName}
            </h3>
            {getStatusBadge(lead.status)}
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              {lead.phone}
            </div>
            <div className="flex items-center text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              {lead.email}
            </div>
            <div className="flex items-center text-gray-600">
              <Car className="h-4 w-4 mr-2" />
              {lead.year} {lead.make} {lead.model} ({lead.bodyType})
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              {new Date(lead.createdAt).toLocaleString()}
            </div>
          </div>
          


          <div>
            <Label className="text-xs font-medium text-gray-500">DAMAGE DESCRIPTION</Label>
            <p className="text-sm mt-1">{lead.damageDescription}</p>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-500">URGENCY</Label>
            <Badge variant="outline" className="mt-1">
              {lead.urgency}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick Actions</Label>
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowQuoteForm(!showQuoteForm)}
              className="justify-start"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Send Quote
            </Button>
            {lead.status === 'QUOTED' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={simulatePayment}
                className="justify-start"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Simulate Payment
              </Button>
            )}
            {lead.status === 'PAID' && (
              <Button 
                variant="outline" 
                size="sm"
                
                className="justify-start"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            )}
          </div>
        </div>

        {/* Quote Form */}
        {showQuoteForm && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Create Quote</h4>
            
            {/* OEM Glass Services */}
            <div>
              <Label className="text-sm font-medium">OEM Glass Services</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {oemGlassOptions.map((service) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedOemServices.some(s => s.name === service.name)}
                        onChange={(e) => handleServiceChange(selectedOemServices, setSelectedOemServices, service, e.target.checked, 'OEM')}
                        className="form-checkbox"
                      />
                      <Label htmlFor={service.name} className="text-sm cursor-pointer">
                        {service.name}
                      </Label>
                    </div>
                    <Input
                      type="number"
                      placeholder={service.defaultPrice}
                      value={selectedOemServices.find(s => s.name === service.name)?.price || ''}
                      onChange={(e) => handleServicePriceChange(selectedOemServices, setSelectedOemServices, service.name, e.target.value)}
                      className="w-24 text-right"
                      disabled={!selectedOemServices.some(s => s.name === service.name)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Aftermarket Glass Services */}
            <div>
              <Label className="text-sm font-medium">Aftermarket Glass Services</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {aftermarketGlassOptions.map((service) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedAftermarketServices.some(s => s.name === service.name)}
                        onChange={(e) => handleServiceChange(selectedAftermarketServices, setSelectedAftermarketServices, service, e.target.checked, 'Aftermarket')}
                        className="form-checkbox"
                      />
                      <Label htmlFor={service.name} className="text-sm cursor-pointer">
                        {service.name}
                      </Label>
                    </div>
                    <Input
                      type="number"
                      placeholder={service.defaultPrice}
                      value={selectedAftermarketServices.find(s => s.name === service.name)?.price || ''}
                      onChange={(e) => handleServicePriceChange(selectedAftermarketServices, setSelectedAftermarketServices, service.name, e.target.value)}
                      className="w-24 text-right"
                      disabled={!selectedAftermarketServices.some(s => s.name === service.name)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Services */}
            <div>
              <Label className="text-sm font-medium">Custom Services</Label>
              <div className="space-y-2 mt-2">
                {customServices.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Input
                      value={service.name}
                      onChange={(e) => handleCustomServiceChange(service.id, 'name', e.target.value)}
                      placeholder="Service Name"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={service.price}
                      onChange={(e) => handleCustomServiceChange(service.id, 'price', e.target.value)}
                      placeholder="Price"
                      className="w-24 text-right"
                    />
                    <Select value={service.glassType} onValueChange={(value) => handleCustomServiceChange(service.id, 'glassType', value)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OEM">OEM</SelectItem>
                        <SelectItem value="Aftermarket">Aftermarket</SelectItem>
                        <SelectItem value="Customer-Supplied">Customer-Supplied</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" onClick={() => removeCustomService(service.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addCustomService}>
                  + Add Custom Service
                </Button>
              </div>
            </div>

            {/* Predefined Add-ons */}
            <div>
              <Label className="text-sm font-medium">Add-ons</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {predefinedAddons.map((addon) => (
                  <div key={addon.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedAddons.some(a => a.name === addon.name)}
                        onChange={(e) => handleAddonChange(selectedAddons, setSelectedAddons, addon, e.target.checked)}
                        className="form-checkbox"
                      />
                      <Label htmlFor={addon.name} className="text-sm cursor-pointer">
                        {addon.name}
                      </Label>
                    </div>
                    <Input
                      type="number"
                      placeholder={addon.defaultPrice}
                      value={selectedAddons.find(a => a.name === addon.name)?.price || ''}
                      onChange={(e) => handleAddonPriceChange(selectedAddons, setSelectedAddons, addon.name, e.target.value)}
                      className="w-24 text-right"
                      disabled={!selectedAddons.some(a => a.name === addon.name)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Add-ons */}
            <div>
              <Label className="text-sm font-medium">Custom Add-ons</Label>
              <div className="space-y-2 mt-2">
                {customAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center space-x-2">
                    <Input
                      value={addon.name}
                      onChange={(e) => handleCustomAddonChange(addon.id, 'name', e.target.value)}
                      placeholder="Add-on Name"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={addon.price}
                      onChange={(e) => handleCustomAddonChange(addon.id, 'price', e.target.value)}
                      placeholder="Price"
                      className="w-24 text-right"
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeCustomAddon(addon.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addCustomAddon}>
                  + Add Custom Add-On
                </Button>
              </div>
            </div>

            {/* Appointment Times */}
            <div>
              <Label className="text-sm font-medium">Proposed Appointment Times</Label>
              <div className="space-y-2 mt-2">
                {appointmentSlots.map((slot) => (
                  <div key={slot.id} className="flex items-center space-x-2">
                    <Input
                      type="date"
                      value={slot.date}
                      onChange={(e) => handleAppointmentSlotChange(slot.id, 'date', e.target.value)}
                      className="flex-1"
                    />
                    <Select value={slot.time} onValueChange={(value) => handleAppointmentSlotChange(slot.id, 'time', value)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" onClick={() => removeAppointmentSlot(slot.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addAppointmentSlot}>
                  + Add Date/Time Slot
                </Button>
              </div>
            </div>

            {/* Total Price Display */}
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Total Estimated Price:</span>
              <span>${calculateTotalPrice()}</span>
            </div>

            {/* Payment Options */}
            <div>
              <Label className="text-xs font-medium mb-3 block">Payment Options</Label>
              <RadioGroup value={quoteData.paymentType} onValueChange={(value) => setQuoteData(prev => ({ ...prev, paymentType: value }))}>
                {paymentTypes.map((type) => (
                  <div key={type.value} className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-white/50">
                    <RadioGroupItem value={type.value} id={type.value} className="mt-0.5" />
                    <div className="flex-1">
                      <Label htmlFor={type.value} className="font-medium text-sm cursor-pointer">
                        {type.label}
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {(quoteData.paymentType === 'deposit' || quoteData.paymentType === 'both') && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Deposit Amount ($)</Label>
                  <Input
                    value={quoteData.depositAmount}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, depositAmount: e.target.value }))}
                    placeholder={calculateTotalPrice() ? `${(parseFloat(calculateTotalPrice()) * parseFloat(quoteData.depositPercentage) / 100).toFixed(2)}` : '75'}
                    type="number"
                  />
                </div>
                <div>
                  <Label className="text-xs">Or Percentage (%)</Label>
                  <Select value={quoteData.depositPercentage} onValueChange={(value) => setQuoteData(prev => ({ ...prev, depositPercentage: value, depositAmount: '' }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                      <SelectItem value="75">75%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs">Additional Notes</Label>
              <Textarea
                value={quoteData.notes}
                onChange={(e) => setQuoteData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special instructions..."
                rows={2}
              />
            </div>

            <Button onClick={handleGenerateQuote} className="w-full">
              Generate Quote ✨
            </Button>

            {generatedQuoteMessage && (
              <div>
                <Label className="text-sm font-medium">Quote Message Preview (Editable)</Label>
                <Textarea
                  value={generatedQuoteMessage}
                  onChange={(e) => setGeneratedQuoteMessage(e.target.value)}
                  rows={10}
                  className="mt-2"
                />

                {/* 🔗 Add this */}
                <div className="mt-4">
                  <StripeLinkGenerator />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={sendQuote} size="sm" className="flex-1">
                Send Quote with Payment Options
              </Button>
              <Button onClick={() => setShowQuoteForm(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div> /* This closing div was missing in your original code, related to showQuoteForm */
        )}


        {/* Messages */}
        <div>
          <Label className="text-sm font-medium">Conversation</Label>
          <div className="mt-2 space-y-3 max-h-40 overflow-y-auto">
            {lead.messages && lead.messages.map((message, index) => (
              <div key={index} className={`p-3 rounded-lg text-sm ${
                message.sender === 'owner' ? 'bg-blue-100 ml-4' : 'bg-gray-100 mr-4'
              }`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-xs">
                    {message.sender === 'owner' ? 'You (Bizzy)' : 'Customer'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} {/* FIX IS HERE */}
                  </span>
                </div>
                <p>{message.message}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center mt-4">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
              className="flex-1 mr-2"
            />
            <Button onClick={sendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadDetail;