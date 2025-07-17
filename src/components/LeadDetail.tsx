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
}

const LeadDetail = ({ lead, onClose }: LeadDetailProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [quoteData, setQuoteData] = useState({
    amount: '',
    glassType: '',
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

  const glassTypes = [
    'OEM Windshield',
    'Aftermarket Windshield',
    'Side Window',
    'Rear Window',
    'Chip Repair',
    'Crack Repair'
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

      // This is a temporary solution to update the state. We will improve this later.
      window.location.reload();

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

  const generatePaymentLinks = () => {
    const baseUrl = `https://checkout.stripe.com/demo-payment-${lead.id}`;
    const fullAmount = parseFloat(quoteData.amount);
    const depositAmount = quoteData.paymentType === 'deposit' || quoteData.paymentType === 'both' 
      ? quoteData.depositAmount ? parseFloat(quoteData.depositAmount) 
      : (fullAmount * parseFloat(quoteData.depositPercentage) / 100)
      : 0;

    return {
      fullPayment: `${baseUrl}-full-${fullAmount}`,
      deposit: depositAmount > 0 ? `${baseUrl}-deposit-${depositAmount}` : null
    };
  };

  const sendQuote = async () => {
    if (!quoteData.amount || !quoteData.glassType || !quoteData.serviceDate || !quoteData.serviceTime) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const paymentLinks = generatePaymentLinks();
    const fullAmount = parseFloat(quoteData.amount);
    
    let paymentSection = '';
    
    if (quoteData.paymentType === 'full') {
      paymentSection = `💳 To secure your appointment, please pay the full amount ($${fullAmount}): ${paymentLinks.fullPayment}`;
    } else if (quoteData.paymentType === 'deposit') {
      const depositAmount = quoteData.depositAmount ? parseFloat(quoteData.depositAmount) 
        : (fullAmount * parseFloat(quoteData.depositPercentage) / 100);
      paymentSection = `💳 To secure your appointment, please pay the deposit ($${depositAmount.toFixed(2)}): ${paymentLinks.deposit}\nBalance of $${(fullAmount - depositAmount).toFixed(2)} due upon completion.`;
    } else if (quoteData.paymentType === 'both') {
      const depositAmount = quoteData.depositAmount ? parseFloat(quoteData.depositAmount) 
        : (fullAmount * parseFloat(quoteData.depositPercentage) / 100);
      paymentSection = `💳 Choose your payment option:\n\nOption 1 - Pay Full Amount ($${fullAmount}): ${paymentLinks.fullPayment}\n\nOption 2 - Pay Deposit ($${depositAmount.toFixed(2)}): ${paymentLinks.deposit}\n(Balance of $${(fullAmount - depositAmount).toFixed(2)} due upon completion)`;
    }

    const quoteMessage = `Hi ${lead.firstName}! Here's your quote:\n\n🔧 Service: ${quoteData.glassType}\n💰 Total Price: $${quoteData.amount}\n📅 Scheduled: ${quoteData.serviceDate} at ${quoteData.serviceTime}\n${quoteData.notes ? `📝 Notes: ${quoteData.notes}` : ''}\n\n${paymentSection}\n\nQuestions? Just reply to this message!`;

    try {
      const response = await fetch(`/api/leads/${lead.id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: quoteMessage }),
        });

      if (!response.ok) {
        throw new Error('Failed to send quote');
      }

      // This is a temporary solution to update the state. We will improve this later.
      window.location.reload();

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
      amount: '',
      glassType: '',
      serviceDate: '',
      serviceTime: '',
      notes: '',
      paymentType: 'full',
      depositAmount: '',
      depositPercentage: '50'
    });
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

  return (
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
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Amount ($)</Label>
                <Input
                  value={quoteData.amount}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="150"
                  type="number"
                />
              </div>
              <div>
                <Label className="text-xs">Glass Type</Label>
                <Select value={quoteData.glassType} onValueChange={(value) => setQuoteData(prev => ({ ...prev, glassType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {glassTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Service Date</Label>
                <Input
                  type="date"
                  value={quoteData.serviceDate}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, serviceDate: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs">Service Time</Label>
                <Select value={quoteData.serviceTime} onValueChange={(value) => setQuoteData(prev => ({ ...prev, serviceTime: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
                    placeholder={quoteData.amount ? `${(parseFloat(quoteData.amount) * parseFloat(quoteData.depositPercentage) / 100).toFixed(2)}` : '75'}
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

            <div className="flex gap-2">
              <Button onClick={sendQuote} size="sm" className="flex-1">
                Send Quote with Payment Options
              </Button>
              <Button onClick={() => setShowQuoteForm(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        )}

        <Separator />

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
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-800">{message.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Send Message */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Send Message as Bizzy</Label>
          <div className="flex space-x-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              rows={2}
              className="flex-1"
            />
            <Button onClick={sendMessage} size="sm" className="self-end">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadDetail;