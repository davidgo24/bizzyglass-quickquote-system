
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, AlertCircle, Clock, CheckCircle, DollarSign, TrendingUp, Calendar, MessageSquare } from 'lucide-react';

interface Lead {
  id: string;
  status: string;
  createdAt: string;
  urgency: string;
}

interface DashboardStatsProps {
  leads: Lead[];
}

const DashboardStats = ({ leads }: DashboardStatsProps) => {
  const today = new Date();
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'NEW').length,
    quoted: leads.filter(l => l.status === 'QUOTED').length,
    paid: leads.filter(l => l.status === 'PAID').length,
    completed: leads.filter(l => l.status === 'COMPLETED').length,
    thisWeek: leads.filter(l => new Date(l.createdAt) >= thisWeek).length,
    urgent: leads.filter(l => l.urgency === 'emergency' || l.urgency === 'urgent').length,
    conversionRate: leads.length > 0 ? Math.round((leads.filter(l => l.status === 'PAID' || l.status === 'COMPLETED').length / leads.length) * 100) : 0
  };

  const statCards = [
    {
      title: 'Total Leads',
      value: stats.total,
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600',
      trend: `+${stats.thisWeek} this week`
    },
    {
      title: 'New Leads',
      value: stats.new,
      icon: <AlertCircle className="h-5 w-5" />,
      color: 'text-orange-600',
      trend: stats.urgent > 0 ? `${stats.urgent} urgent` : 'All handled'
    },
    {
      title: 'Pending Quotes',
      value: stats.quoted,
      icon: <Clock className="h-5 w-5" />,
      color: 'text-yellow-600',
      trend: 'Awaiting payment'
    },
    {
      title: 'Revenue Pipeline',
      value: `$${(stats.quoted * 150 + stats.paid * 150).toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-green-600',
      trend: `${stats.conversionRate}% conversion`
    },
    {
      title: 'Completed Jobs',
      value: stats.completed,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-emerald-600',
      trend: 'This month'
    },
    {
      title: 'Response Rate',
      value: '94%',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'text-purple-600',
      trend: 'Avg 12min response'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>
              </div>
              <div className={`${stat.color} bg-gray-50 rounded-lg p-3`}>
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
