import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Search, Wrench, User, Calendar, MessageCircle, Info } from 'lucide-react';

const statusFlow = [
  { key: 'NEW', label: 'Request Received' },
  { key: 'ASSIGNED', label: 'Technician Assigned' },
  { key: 'INSPECTION', label: 'Device Being Inspected' },
  { key: 'REPAIR', label: 'Repair' },
  { key: 'QUALITY_CHECK', label: 'Quality Check' },
  { key: 'COMPLETED', label: 'Completed' }
];

export default function TrackService({ initialTicketId }) {
  const { tickets } = useApp();
  const [searchId, setSearchId] = useState(initialTicketId || '');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialTicketId) {
      setSearchId(initialTicketId);
      performSearch(initialTicketId);
    }
  }, [initialTicketId, tickets]);

  const performSearch = (id) => {
    if (!id.trim()) return;
    const cleanId = id.trim().toUpperCase();
    const found = tickets.find(t => t.ticketId === cleanId || t._id === cleanId);
    
    if (found) {
      setSelectedTicket(found);
      setErrorMsg('');
    } else {
      setSelectedTicket(null);
      setErrorMsg(`No service records found matching ID "${cleanId}".`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(searchId);
  };

  // Map backend ticket status to our timeline index
  const getStatusIndex = (currentStatus) => {
    switch (currentStatus) {
      case 'NEW':
      case 'ADMIN_REVIEW':
        return 0;
      case 'ASSIGNED':
      case 'TECHNICIAN_ACCEPTED':
        return 1;
      case 'INSPECTION':
        return 2;
      case 'REPAIR':
      case 'WAITING_FOR_PART':
        return 3;
      case 'QUALITY_CHECK':
        return 4;
      case 'COMPLETED':
        return 5;
      default:
        return 0;
    }
  };

  const statusIdx = selectedTicket ? getStatusIndex(selectedTicket.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Search Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm max-w-xl mx-auto space-y-4">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-extrabold text-gray-900 font-display">TRACK SERVICE STATUS</h1>
          <p className="text-xs text-gray-400 font-medium">Enter your Service Ticket ID (e.g. SI-2026-00085) to check tracking.</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Enter Ticket ID (e.g. SI-2026-00125)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-6 rounded-xl text-xs transition cursor-pointer"
          >
            TRACK
          </button>
        </form>

        {errorMsg && (
          <p className="text-center text-xs text-red-500 font-bold">{errorMsg}</p>
        )}
      </div>

      {/* Ticket Details with Flow */}
      {selectedTicket && (
        <div className="space-y-6">
          
          {/* Flow Timeline Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8 overflow-x-auto">
            <h3 className="font-bold text-gray-900 font-display border-b border-gray-50 pb-2">Service Progression</h3>
            
            {/* Horizontal timeline */}
            <div className="min-w-[600px] flex items-center justify-between relative px-8 py-4">
              
              {/* Progress Line */}
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-gray-100 z-0">
                <div
                  className="h-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${(statusIdx / (statusFlow.length - 1)) * 100}%` }}
                ></div>
              </div>

              {/* Steps */}
              {statusFlow.map((step, idx) => {
                const isCompleted = idx < statusIdx;
                const isActive = idx === statusIdx;
                const isPending = idx > statusIdx;

                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10 w-24 text-center">
                    
                    {/* Circle Node */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isCompleted 
                        ? 'bg-emerald-600 text-white font-bold' 
                        : isActive 
                        ? 'bg-white border-4 border-emerald-600 text-emerald-700 font-black animate-connection-pulse scale-110' 
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                    }`}>
                      {isCompleted ? '✓' : idx + 1}
                    </div>

                    <span className={`text-[10px] font-bold mt-2 leading-tight ${
                      isActive ? 'text-emerald-800' : isCompleted ? 'text-emerald-600' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Ticket Information Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Spec Sheet */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 md:col-span-2">
              <h3 className="font-bold text-gray-900 font-display border-b border-gray-50 pb-2">Ticket Specifications</h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Ticket ID</p>
                  <p className="font-mono font-extrabold text-gray-800">{selectedTicket.ticketId}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Product Model</p>
                  <p className="font-semibold text-gray-800">{selectedTicket.productModel}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Registered Serial</p>
                  <p className="font-mono font-semibold text-gray-800">{selectedTicket.serialNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Issue Category</p>
                  <p className="font-semibold text-gray-800">{selectedTicket.category}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Created Date</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(selectedTicket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Estimated Completion</p>
                  <p className="font-semibold text-gray-800">
                    {selectedTicket.status === 'COMPLETED' ? 'Completed' : '1 to 2 Working Days'}
                  </p>
                </div>
                <div className="col-span-2 border-t border-gray-50 pt-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Problem details</p>
                  <p className="text-gray-600 mt-0.5 leading-relaxed">{selectedTicket.description}</p>
                </div>
              </div>
            </div>

            {/* Support / Tech Assigned Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 font-display border-b border-gray-50 pb-2">Assigned Service Team</h3>
              
              <div className="space-y-4">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 text-lg">
                    👷
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Field Technician</p>
                    <p className="text-xs font-bold text-gray-800">
                      {selectedTicket.assignedTechnicianName ? selectedTicket.assignedTechnicianName : 'Awaiting assignment...'}
                    </p>
                  </div>
                </div>

                {selectedTicket.repairNotes && (
                  <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl space-y-1">
                    <p className="text-[9px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                      <Info size={11} />
                      <span>Technician Notes</span>
                    </p>
                    <p className="text-xs text-emerald-950 font-medium italic">
                      "{selectedTicket.repairNotes}"
                    </p>
                    {selectedTicket.partsUsed && (
                      <p className="text-[10px] text-emerald-700 font-bold mt-1">
                        Parts Logged: {selectedTicket.partsUsed}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Activity Log history */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 font-display border-b border-gray-50 pb-2">Audit Status Timeline</h3>
            <div className="relative border-l border-gray-100 pl-4 ml-2 space-y-4">
              {selectedTicket.timeline && selectedTicket.timeline.map((event, idx) => (
                <div key={idx} className="relative flex justify-between gap-4 text-xs">
                  {/* Point */}
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white"></span>
                  <div>
                    <p className="font-bold text-gray-800">{event.status}</p>
                    <p className="text-gray-500 mt-0.5">{event.note}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
