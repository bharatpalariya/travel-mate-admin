import { AlertCircle, Calendar, CheckCircle, Clock, Eye, Filter, MessageSquare, RefreshCw, Search, User, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ConfirmationModal from '../components/UI/ConfirmationModal';
import Modal from '../components/UI/Modal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface HelpRequest {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

const SupportTickets: React.FC = () => {
  const { admin } = useAuth();
  const [tickets, setTickets] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<HelpRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    ticketId: string;
    ticketSubject: string;
  }>({
    isOpen: false,
    ticketId: '',
    ticketSubject: ''
  });

  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });

  const fetchTickets = async () => {
    try {
      setError('');
      const { data, error: fetchError } = await supabase
        .from('help_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching tickets:', fetchError);
        setError('Failed to fetch support tickets');
        return;
      }

      setTickets(data || []);

      // Calculate stats
      const ticketData = data || [];
      const newStats = {
        total: ticketData.length,
        open: ticketData.filter(t => t.status === 'open').length,
        inProgress: ticketData.filter(t => t.status === 'in_progress').length,
        resolved: ticketData.filter(t => t.status === 'resolved').length,
        closed: ticketData.filter(t => t.status === 'closed').length
      };
      setStats(newStats);

    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to fetch support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      fetchTickets();
    }
  }, [admin]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchTickets();
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    setIsUpdating(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('help_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (updateError) {
        throw updateError;
      }

      setSuccess('Ticket status updated successfully');
      await fetchTickets();
      
      // Update selected ticket if it's open
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: newStatus as any } : null);
      }

    } catch (error) {
      console.error('Error updating ticket status:', error);
      setError('Failed to update ticket status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (ticket: HelpRequest) => {
    setDeleteModal({
      isOpen: true,
      ticketId: ticket.id,
      ticketSubject: ticket.subject
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const { error: deleteError } = await supabase
        .from('help_requests')
        .delete()
        .eq('id', deleteModal.ticketId);

      if (deleteError) {
        throw deleteError;
      }

      setSuccess('Ticket deleted successfully');
      await fetchTickets();
      setDeleteModal({ isOpen: false, ticketId: '', ticketSubject: '' });

      // Close detail modal if the deleted ticket was selected
      if (selectedTicket && selectedTicket.id === deleteModal.ticketId) {
        setIsDetailModalOpen(false);
        setSelectedTicket(null);
      }

    } catch (error) {
      console.error('Error deleting ticket:', error);
      setError('Failed to delete ticket');
    }
  };

  const openTicketDetail = (ticket: HelpRequest) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string, size: string = 'w-6 h-6') => {
    let bg = '', icon = null, iconColor = '';
    switch (status) {
      case 'open':
        bg = 'bg-red-100';
        iconColor = 'text-red-600';
        icon = <AlertCircle className={`${size} ${iconColor}`} />;
        break;
      case 'in_progress':
        bg = 'bg-yellow-100';
        iconColor = 'text-yellow-600';
        icon = <Clock className={`${size} ${iconColor}`} />;
        break;
      case 'resolved':
        bg = 'bg-green-100';
        iconColor = 'text-green-600';
        icon = <CheckCircle className={`${size} ${iconColor}`} />;
        break;
      case 'closed':
        bg = 'bg-gray-200';
        iconColor = 'text-gray-600';
        icon = <XCircle className={`${size} ${iconColor}`} />;
        break;
      default:
        bg = 'bg-gray-100';
        iconColor = 'text-gray-400';
        icon = <MessageSquare className={`${size} ${iconColor}`} />;
    }
    return (
      <span className={`inline-flex items-center justify-center rounded-full ${bg} shadow-sm border border-white ${size} p-1`}>
        {icon}
      </span>
    );
  };

  const getPriorityLevel = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 48) return { level: 'High', color: 'text-red-600' };
    if (hoursDiff > 24) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-green-600' };
  };

  const formatUserId = (userId: string) => {
    return `User ${userId.substring(0, 8)}...`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600">Manage customer support requests and help tickets</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-start space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Closed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets by subject, message, or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' ? 'No tickets match your filters.' : 'No support tickets found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => {
                  const priority = getPriorityLevel(ticket.created_at);
                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {ticket.subject}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {ticket.message.substring(0, 100)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatUserId(ticket.user_id)}
                            </div>
                            <div className="text-sm text-gray-500 font-mono">
                              {ticket.user_id.substring(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                          disabled={isUpdating}
                          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${getStatusColor(ticket.status)} disabled:opacity-50`}
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${priority.color}`}>
                          {priority.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(ticket.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(ticket.updated_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openTicketDetail(ticket)}
                            className="text-blue-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(ticket)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="Delete Ticket"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Ticket Details"
        size="lg"
      >
        {selectedTicket && (
          <div className="bg-white rounded-2xl shadow-lg p-0 overflow-hidden">
            {/* Header with status icon and badge */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center space-x-4">
                {getStatusIcon(selectedTicket.status, 'w-10 h-10')}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedTicket.subject}</h3>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span className="flex items-center"><User className="w-4 h-4 mr-1" />{formatUserId(selectedTicket.user_id)}</span>
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{new Date(selectedTicket.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${getStatusColor(selectedTicket.status)}`}>{selectedTicket.status.replace('_', ' ')}</span>
            </div>

            {/* Message Section */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Message</h4>
              <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>
            </div>

            {/* Status Update Section */}
            <div className="px-6 py-5 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Update Status</h4>
              <div className="flex flex-wrap gap-2">
                {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(selectedTicket.id, status)}
                    disabled={isUpdating || selectedTicket.status === status}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border ${selectedTicket.status === status ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {getStatusIcon(status, 'w-5 h-5')} <span className="ml-2">{status.replace('_', ' ').toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Details Section */}
            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-white">
              <div>
                <span className="font-medium text-gray-900">Ticket ID:</span>
                <p className="text-gray-600 font-mono break-all">{selectedTicket.id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">User ID:</span>
                <p className="text-gray-600 font-mono break-all">{selectedTicket.user_id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Created:</span>
                <p className="text-gray-600">{new Date(selectedTicket.created_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium text-gray-900">Last Updated:</span>
                <p className="text-gray-600">{new Date(selectedTicket.updated_at).toLocaleString()}</p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end items-center gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleDeleteClick(selectedTicket)}
                className="px-4 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Delete Ticket
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, ticketId: '', ticketSubject: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Support Ticket"
        message={`Are you sure you want to delete the ticket "${deleteModal.ticketSubject}"? This action cannot be undone and will permanently remove the ticket from the system.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default SupportTickets;