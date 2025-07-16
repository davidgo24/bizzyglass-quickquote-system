
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, DollarSign, Calendar, Phone, Mail, Clock, Zap } from 'lucide-react';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  urgency: string;
  createdAt: string;
}

interface QuickActionsProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

const QuickActions = ({ leads, onSelectLead }: QuickActionsProps) => {
  const urgentLeads = leads.filter(l => 
    (l.urgency === 'emergency' || l.urgency === 'urgent') && 
    l.status === 'NEW'
  ).slice(0, 3);

  const overdueQuotes = leads.filter(l => {
    if (l.status !== 'QUOTED') return false;
    const createdAt = new Date(l.createdAt);
    const hoursSince = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursSince > 24;
  }).slice(0, 3);

  const recentPayments = leads.filter(l => l.status === 'PAID').slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Urgent Leads */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm font-medium">
            <Zap className="h-4 w-4 mr-2 text-red-500" />
            Urgent Attention Needed
            {urgentLeads.length > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {urgentLeads.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {urgentLeads.length === 0 ? (
            <p className="text-sm text-gray-500">All urgent leads handled! 🎉</p>
          ) : (
            urgentLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => onSelectLead(lead)}
              >
                <div>
                  <p className="font-medium text-sm">{lead.firstName} {lead.lastName}</p>
                  <p className="text-xs text-gray-600">{lead.phone}</p>
                </div>
                <Badge className="bg-red-100 text-red-700">
                  {lead.urgency}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Overdue Quotes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm font-medium">
            <Clock className="h-4 w-4 mr-2 text-orange-500" />
            Follow Up Required
            {overdueQuotes.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {overdueQuotes.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {overdueQuotes.length === 0 ? (
            <p className="text-sm text-gray-500">No overdue quotes</p>
          ) : (
            overdueQuotes.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => onSelectLead(lead)}
              >
                <div>
                  <p className="font-medium text-sm">{lead.firstName} {lead.lastName}</p>
                  <p className="text-xs text-gray-600">
                    Quoted {Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60))}h ago
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Follow Up
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm font-medium">
            <DollarSign className="h-4 w-4 mr-2 text-green-500" />
            Recent Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentPayments.length === 0 ? (
            <p className="text-sm text-gray-500">No recent payments</p>
          ) : (
            recentPayments.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                onClick={() => onSelectLead(lead)}
              >
                <div>
                  <p className="font-medium text-sm">{lead.firstName} {lead.lastName}</p>
                  <p className="text-xs text-gray-600">Payment received</p>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  Paid
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActions;
