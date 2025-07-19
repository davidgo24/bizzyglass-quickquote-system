import { useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast'; // Assuming toast is available from your context

export function StripeLinkGenerator() {
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('Service Payment');
  const [link, setLink] = useState('');

  const handleGenerate = async () => {
    try {
      // FIX: Change the base URL to include the correct backend port (8000)
      const res = await axios.post('http://localhost:8000/create-stripe-link', {
        amount: parseInt(amount),
        label,
      });
      setLink(res.data.url);
      toast({
        title: "Stripe Link Generated!",
        description: "The payment link is ready.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error generating Stripe link:', error);
      toast({
        title: "Failed to generate Stripe link",
        description: "Please check your network and try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="border border-gray-200 bg-gray-50 rounded-lg p-4 space-y-3 mt-6">
      <h3 className="text-sm font-medium">🔗 Stripe Link Generator (Manual)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label>Amount (USD)</Label>
          <Input
            type="number"
            placeholder="e.g. 300"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <Label>Description</Label>
          <Input
            placeholder="e.g. Windshield + Tint"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleGenerate}>Generate Link</Button>
        </div>
      </div>

      {link && (
        <div className="text-sm text-green-700 break-all">
          <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
        </div>
      )}
    </div>
  );
}
