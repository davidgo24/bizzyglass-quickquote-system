
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Phone, Mail, Car, Calendar, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LeadFormProps {
  onClose: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  make: string;
  model: string;
  year: string;
  vin: string;
  bodyType: string;
  urgency: string;
  damageDescription: string;
  additionalNotes: string;
  photos: File[];
}

const LeadForm = ({ onClose }: LeadFormProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    make: '',
    model: '',
    year: '',
    vin: '',
    bodyType: '',
    urgency: '',
    damageDescription: '',
    additionalNotes: '',
    photos: []
  });

  const carMakes = [
    'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge',
    'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jeep', 'Kia', 'Lexus',
    'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Ram', 'Subaru',
    'Tesla', 'Toyota', 'Volkswagen', 'Volvo', 'Other'
  ];

  const bodyTypes = [
    'Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Hatchback', 'Wagon', 'Van', 'Other'
  ];

  const urgencyLevels = [
    { value: 'emergency', label: 'Emergency (ASAP)', color: 'bg-red-100 text-red-700' },
    { value: 'urgent', label: 'Urgent (Today)', color: 'bg-orange-100 text-orange-700' },
    { value: 'soon', label: 'Soon (This Week)', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'flexible', label: 'Flexible (Next Week+)', color: 'bg-green-100 text-green-700' }
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...files] }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.firstName && formData.lastName && formData.phone && formData.email;
      case 2:
        return formData.make && formData.model && formData.year && formData.bodyType;
      case 3:
        return formData.damageDescription && formData.urgency;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = () => {
    if (validateStep(step)) {
      // Generate a simple lead ID for demonstration
      const leadId = `GLS-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // Store lead in localStorage for demonstration
      const leads = JSON.parse(localStorage.getItem('bizzy_leads') || '[]');
      const newLead = {
        id: leadId,
        ...formData,
        status: 'NEW',
        createdAt: new Date().toISOString(),
        messages: [
          {
            id: '1',
            sender: 'system',
            message: 'New lead created via web form',
            timestamp: new Date().toISOString()
          }
        ]
      };
      
      leads.push(newLead);
      localStorage.setItem('bizzy_leads', JSON.stringify(leads));
      
      toast({
        title: "Quote Request Submitted!",
        description: `Your reference number is ${leadId}. We'll contact you shortly via SMS.`
      });
      
      // Simulate SMS confirmation
      setTimeout(() => {
        toast({
          title: "SMS Sent",
          description: "Confirmation message sent to your phone number."
        });
      }, 2000);
      
      onClose();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Smith"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john@example.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="make">Vehicle Make *</Label>
                <Select value={formData.make} onValueChange={(value) => handleInputChange('make', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    {carMakes.map((make) => (
                      <SelectItem key={make} value={make}>
                        {make}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="model">Vehicle Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="Camry"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  placeholder="2020"
                />
              </div>
              <div>
                <Label htmlFor="bodyType">Body Type *</Label>
                <Select value={formData.bodyType} onValueChange={(value) => handleInputChange('bodyType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {bodyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="vin">VIN Number (Optional)</Label>
              <Input
                id="vin"
                value={formData.vin}
                onChange={(e) => handleInputChange('vin', e.target.value)}
                placeholder="1HGBH41JXMN109186"
                maxLength={17}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Urgency Level *</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {urgencyLevels.map((level) => (
                  <div
                    key={level.value}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.urgency === level.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleInputChange('urgency', level.value)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{level.label}</span>
                      <Badge className={level.color}>{level.value}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="damageDescription">Damage Description *</Label>
              <Textarea
                id="damageDescription"
                value={formData.damageDescription}
                onChange={(e) => handleInputChange('damageDescription', e.target.value)}
                placeholder="Describe the damage to your windshield..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                placeholder="Any additional information or special requests..."
                rows={3}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label>Upload Photos (Optional)</Label>
              <div className="mt-2">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Drag photos here or click to upload</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    Choose Files
                  </Button>
                </div>
                {formData.photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <div className="bg-gray-100 rounded-lg p-3 flex items-center">
                          <span className="text-sm truncate flex-1">{photo.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePhoto(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• You'll receive an SMS confirmation within minutes</li>
                <li>• Our team will review your request and send a quote</li>
                <li>• Schedule your convenient service time</li>
                <li>• We come to you for professional repair</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div>
            <CardTitle className="text-xl">Get Your Free Quote</CardTitle>
            <p className="text-sm text-gray-600">Step {step} of 4</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          {renderStep()}

          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Back
              </Button>
            )}
            {step < 4 ? (
              <Button 
                onClick={handleNext} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!validateStep(step)}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!validateStep(step)}
              >
                Submit Quote Request
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadForm;
