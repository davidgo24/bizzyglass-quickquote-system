import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X, Upload, Phone, Mail, Car, Calendar, AlertCircle, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// These are your CORRECT and UPDATED lists
const glassOptions = [
  'Windshield',
  'Front Side Window (Driver)',
  'Front Side Window (Passenger)',
  'Rear Side Window (Driver)',
  'Rear Side Window (Passenger)',
  'Quarter Glass',
  'Vent Window',
  'Rear Window',
  'Sunroof',
  'Panoramic Roof',
  'Other'
];

const addonServices = [
  'Window Tinting',
  'ADAS Calibration',
  'Windshield Washer Fluid Top-off',
  'Rain Sensor Calibration',
  'OEM Glass Upgrade (Select if you would prefer OEM glass)'
];

interface LeadFormProps {
  onClose: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  confirmPhone: string;
  email: string;
  confirmEmail: string;
  make: string;
  model: string;
  year: string;
  vin: string; // Already here, good!
  bodyType: string;
  glassToReplace: string[];
  addonServices: string[];
  urgency: string;
  preferredDate: string;
  preferredTime: string;
  preferredDaysTimes: string[];
  photos: File[];
  additionalNotes: string;
}

const LeadForm = ({ onClose }: LeadFormProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    confirmPhone: '',
    email: '',
    confirmEmail: '',
    make: '',
    model: '',
    year: '',
    vin: '', // Initialized to empty string
    bodyType: '',
    glassToReplace: [],
    addonServices: [],
    urgency: '',
    preferredDate: '',
    preferredTime: '',
    preferredDaysTimes: [],
    photos: [],
    additionalNotes: ''
  });

  
  const carMakes = [
    'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge',
    'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jeep', 'Kia', 'Lexus',
    'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Ram', 'Subaru', 'Scion',
    'Tesla', 'Toyota', 'Volkswagen', 'Volvo', 'Other'
  ];

  const bodyTypes = [
    'Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Hatchback', 'Wagon', 'Van', 'Other'
  ];

  const urgencyLevels = [
    { value: 'today', label: 'Today', description: 'Need service today' },
    { value: 'tomorrow', label: 'Tomorrow', description: 'Need service by tomorrow' },
    { value: 'not-rush', label: 'Not in a rush', description: 'Flexible on timing' }
  ];

  const timeSlots = [
    'Morning (8AM - 12PM)',
    'Afternoon (12PM - 5PM)', 
    'Evening (5PM - 8PM)'
  ];

  const preferredDaysOptions = [
    'Monday Morning', 'Monday Afternoon', 'Monday Evening',
    'Tuesday Morning', 'Tuesday Afternoon', 'Tuesday Evening',
    'Wednesday Morning', 'Wednesday Afternoon', 'Wednesday Evening',
    'Thursday Morning', 'Thursday Afternoon', 'Thursday Evening',
    'Friday Morning', 'Friday Afternoon', 'Friday Evening',
    'Saturday Morning', 'Saturday Afternoon', 'Saturday Evening',
    'Sunday Morning', 'Sunday Afternoon', 'Sunday Evening'
  ];


  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'glassToReplace' | 'addonServices' | 'preferredDaysTimes', value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
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

  const validatePhoneNumber = (phone: string): boolean => {
    // Strips non-digits and checks for 10 digits
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const validateEmail = (email: string): boolean => {
    // Basic email regex for format validation
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.confirmPhone || !formData.email || !formData.confirmEmail) {
          return false;
        }

        const cleanedPhone = formData.phone.replace(/\D/g, '');
        const cleanedConfirmPhone = formData.confirmPhone.replace(/\D/g, '');

        if (cleanedPhone.length !== 10) {
          return false;
        }

        if (cleanedPhone !== cleanedConfirmPhone) {
          return false;
        }

        if (!formData.email.includes('@') || !formData.email.includes('.')) {
          return false;
        }

        if (formData.email !== formData.confirmEmail) {
          return false;
        }
        return true;
      case 2:
        if (!formData.make || !formData.model || !formData.year || !formData.bodyType) {
          return false;
        }
        // VIN is optional, so no validation needed here for it to pass
        return true;
      case 3:
        if (formData.glassToReplace.length === 0 || !formData.urgency) {
          return false;
        }
        return true;
      case 4:
        if (formData.preferredDaysTimes.length === 0) {
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      // Determine which toast message to show based on the failed validation
      switch (step) {
        case 1:
          if (!formData.firstName || !formData.lastName || !formData.phone || !formData.confirmPhone || !formData.email || !formData.confirmEmail) {
            toast({
              title: "Please fill in all required fields",
              description: "All contact fields are required.",
              variant: "destructive"
            });
          } else {
            const cleanedPhone = formData.phone.replace(/\D/g, '');
            const cleanedConfirmPhone = formData.confirmPhone.replace(/\D/g, '');
            if (cleanedPhone.length !== 10) {
              toast({
                title: "Invalid Phone Number",
                description: "Please enter a 10-digit phone number (e.g., 5551234567).",
                variant: "destructive"
              });
            } else if (cleanedPhone !== cleanedConfirmPhone) {
              toast({
                title: "Phone Numbers Do Not Match",
                description: "Please ensure both phone number fields match.",
                variant: "destructive"
              });
            } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
              toast({
                title: "Invalid Email Address",
                description: "Please enter a valid email address (e.g., example@domain.com).",
                variant: "destructive"
              });
            } else if (formData.email !== formData.confirmEmail) {
              toast({
                title: "Email Addresses Do Not Match",
                description: "Please ensure both email address fields match.",
                variant: "destructive"
              });
            }
          }
          break;
        case 2:
          toast({
            title: "Please fill in all required fields",
            variant: "destructive"
          });
          break;
        case 3:
          toast({
            title: "Please select glass to replace and urgency level",
            variant: "destructive"
          });
          break;
        case 4:
          toast({
            title: "Please select at least one preferred day/time",
            variant: "destructive"
          });
          break;
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const cleanedPhone = formData.phone.replace(/\D/g, '');

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: cleanedPhone,
          email: formData.email,
          make: formData.make,
          model: formData.model,
          year: formData.year,
          vin: formData.vin, // <--- ADDED VIN HERE!
          bodyType: formData.bodyType,
          urgency: formData.urgency,
          damageDescription: `Glass to replace: ${formData.glassToReplace.join(', ')}${formData.addonServices.length ? `. Add-on services: ${formData.addonServices.join(', ')}` : ''}${formData.additionalNotes ? `. Additional notes: ${formData.additionalNotes}` : ''}`,
          glassToReplace: formData.glassToReplace,
          addonServices: formData.addonServices,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          preferredDaysTimes: formData.preferredDaysTimes,
          // Photos are not sent directly in this JSON payload,
          // they would require a separate multipart/form-data upload.
          // additionalNotes is already part of damageDescription for now,
          // but could be sent separately if backend schema allows.
          messages: [
            {
              id: Date.now().toString(),
              sender: 'client',
              message: `New lead created via web form. Preferred timing: ${formData.preferredDaysTimes.join(', ')}${formData.preferredDate ? `. Preferred date: ${formData.preferredDate}` : ''}`,
              timestamp: new Date().toISOString()
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit lead');
      }

      toast({
        title: "Thanks! We're reviewing your request.",
        description: "You'll receive a quote shortly via text."
      });

      onClose();
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: "Error submitting request",
        description: "Something went wrong. Please try again later.",
        variant: "destructive"
      });
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
              <Label htmlFor="phone">Phone Number * (10 digits)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="5551234567"
                  className="pl-10"
                  maxLength={10}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPhone">Confirm Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPhone"
                  value={formData.confirmPhone}
                  onChange={(e) => handleInputChange('confirmPhone', e.target.value)}
                  placeholder="5551234567"
                  className="pl-10"
                  maxLength={10}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address * (for Stripe invoice)</Label>
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
            <div>
              <Label htmlFor="confirmEmail">Confirm Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmEmail"
                  type="email"
                  value={formData.confirmEmail}
                  onChange={(e) => handleInputChange('confirmEmail', e.target.value)}
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
              <Label htmlFor="vin">VIN # - Please attempt to provide for quicker and accurate quotes! Thank you 😀</Label>
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
              <Label className="text-sm font-medium">Glass to Replace * (Select all that apply)</Label>
              <div className="grid grid-cols-1 gap-2 mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
                {glassOptions.map((glass) => (
                  <div key={glass} className="flex items-center space-x-2">
                    <Checkbox
                      id={glass}
                      checked={formData.glassToReplace.includes(glass)}
                      onCheckedChange={(checked) => handleArrayChange('glassToReplace', glass, checked as boolean)}
                    />
                    <Label htmlFor={glass} className="text-sm cursor-pointer">
                      {glass}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Add-on Services (Optional)</Label>
              <div className="grid grid-cols-1 gap-2 mt-2 border border-gray-200 rounded-md p-2">
                {addonServices.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={formData.addonServices.includes(service)}
                      onCheckedChange={(checked) => handleArrayChange('addonServices', service, checked as boolean)}
                    />
                    <Label htmlFor={service} className="text-sm cursor-pointer">
                      {service}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Urgency *</Label>
              <RadioGroup value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                {urgencyLevels.map((level) => (
                  <div key={level.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={level.value} id={level.value} />
                    <div>
                      <Label htmlFor={level.value} className="cursor-pointer font-medium">
                        {level.label}
                      </Label>
                      <p className="text-xs text-gray-600">{level.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferredDate">Preferred Date</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="preferredTime">Preferred Time</Label>
                <Select value={formData.preferredTime} onValueChange={(value) => handleInputChange('preferredTime', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
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
              <Label className="text-sm font-medium">Preferred Days/Times * (Select all that work)</Label>
              <div className="grid grid-cols-1 gap-2 mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
                {preferredDaysOptions.map((dayTime) => (
                  <div key={dayTime} className="flex items-center space-x-2">
                    <Checkbox
                      id={dayTime}
                      checked={formData.preferredDaysTimes.includes(dayTime)}
                      onCheckedChange={(checked) => handleArrayChange('preferredDaysTimes', dayTime, checked as boolean)}
                    />
                    <Label htmlFor={dayTime} className="text-sm cursor-pointer">
                      {dayTime}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
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

            <div>
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                placeholder="Any additional information, special requests, or specific damage details..."
                rows={4}
              />
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
            <p className="text-sm text-gray-600">Step {step} of 5</p>
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
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>

          {renderStep()}

          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Back
              </Button>
            )}
            {step < 5 ? (
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
              >
                Submit Request
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadForm;
