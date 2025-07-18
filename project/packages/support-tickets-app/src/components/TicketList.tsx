import React from 'react';
import { Calendar, User, AlertCircle } from 'lucide-react';

interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TicketListProps {
  tickets: Ticket[];
}

const TicketList: React.FC<TicketListProps> = ({ tickets }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'badge';
    switch (status) {
      case 'open':
        return `${baseClasses} badge-open`;
      case 'in-progress':
        return `${baseClasses} badge-in-progress`;
      case 'resolved':
        return `${baseClasses} badge-resolved`;
      case 'closed':
        return `${baseClasses} badge-closed`;
      default:
        return baseClasses;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const baseClasses = 'badge';
    switch (priority) {
      case 'low':
        return `${baseClasses} badge-low`;
      case 'medium':
        return `${baseClasses} badge-medium`;
      case 'high':
        return `${baseClasses} badge-high`;
      case 'urgent':
        return `${baseClasses} badge-urgent`;
      default:
        return baseClasses;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
        <p className="text-gray-600">Create your first support ticket to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div key={ticket._id} className="card hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getPriorityIcon(ticket.priority)}
                <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
              </div>
              <p className="text-gray-600 mb-3">{ticket.description}</p>
            </div>
            <div className="flex gap-2 ml-4">
              <span className={getStatusBadge(ticket.status)}>
                {ticket.status}
              </span>
              <span className={getPriorityBadge(ticket.priority)}>
                {ticket.priority}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{ticket.createdBy.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Created {formatDate(ticket.createdAt)}</span>
              </div>
            </div>
            {ticket.updatedAt !== ticket.createdAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Updated {formatDate(ticket.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketList;