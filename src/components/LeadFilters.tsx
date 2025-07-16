
import { Search, Filter, SortDesc, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LeadFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  urgencyFilter: string;
  setUrgencyFilter: (urgency: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  filteredCount: number;
  totalCount: number;
}

const LeadFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  urgencyFilter,
  setUrgencyFilter,
  sortBy,
  setSortBy,
  filteredCount,
  totalCount
}: LeadFiltersProps) => {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'NEW', label: 'New', color: 'bg-blue-100 text-blue-700' },
    { value: 'QUOTED', label: 'Quoted', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'PAID', label: 'Paid', color: 'bg-green-100 text-green-700' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-gray-100 text-gray-700' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-700' }
  ];

  const urgencyOptions = [
    { value: 'all', label: 'All Urgency' },
    { value: 'emergency', label: 'Emergency', color: 'bg-red-100 text-red-700' },
    { value: 'urgent', label: 'Urgent', color: 'bg-orange-100 text-orange-700' },
    { value: 'soon', label: 'Soon', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'flexible', label: 'Flexible', color: 'bg-green-100 text-green-700' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'urgency', label: 'By Urgency' },
    { value: 'status', label: 'By Status' }
  ];

  const activeFilters = [
    statusFilter !== 'all' && statusOptions.find(s => s.value === statusFilter)?.label,
    urgencyFilter !== 'all' && urgencyOptions.find(u => u.value === urgencyFilter)?.label,
    searchTerm && `Search: "${searchTerm}"`
  ].filter(Boolean);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setUrgencyFilter('all');
    setSortBy('newest');
  };

  return (
    <div className="space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search leads by name, phone, or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SortDesc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {urgencyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFilters.length > 0 && (
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filters and Results Count */}
      <div className="flex flex-wrap items-center gap-2">
        {activeFilters.map((filter, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {filter}
          </Badge>
        ))}
        <span className="text-sm text-gray-500 ml-auto">
          {filteredCount} of {totalCount} leads
        </span>
      </div>
    </div>
  );
};

export default LeadFilters;
