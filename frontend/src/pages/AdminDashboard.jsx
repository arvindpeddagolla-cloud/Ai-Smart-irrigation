import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Search, Shield, X, FileText, MapPin, Bell } from 'lucide-react';

export default function AdminDashboard() {
  const {
    tickets,
    techs,
    notifications,
    assignTechnician,
    updateTicketStatus,
    dismissNotification,
    refreshData,
    upgrades,
    updateUpgradeStatus
  } = useApp();

  const [activePanelTab, setActivePanelTab] = useState('REPAIRS'); // 'REPAIRS' or 'UPGRADES'
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  
  // Selected ticket for side-drawer details
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedTech, setSelectedTech] = useState('');

  // Auto-refresh data
  useEffect(() => {
    refreshData();
  }, [tickets, upgrades]);

  // Filtered tickets list
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (p) => {
    switch (p) {
      case 'CRITICAL': return 'bg-red-900/50 text-red-200 border-red-800';
      case 'HIGH': return 'bg-orange-950/50 text-orange-200 border-orange-800';
      case 'MEDIUM': return 'bg-yellow-950/50 text-yellow-200 border-yellow-800';
      default: return 'bg-emerald-950/50 text-emerald-200 border-emerald-800';
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'COMPLETED': return 'bg-green-950/40 text-green-300 border-green-800/30';
      case 'NEW': return 'bg-blue-950/40 text-blue-300 border-blue-800/30';
      case 'ASSIGNED': return 'bg-purple-950/40 text-purple-300 border-purple-800/30';
      case 'CANCELLED': return 'bg-slate-800/40 text-slate-400 border-slate-700/30';
      default: return 'bg-yellow-950/40 text-yellow-300 border-yellow-800/30';
    }
  };

  // Recommends technician by category matching
  const getRecommendedTechnician = (ticket) => {
    if (!ticket) return [];
    
    let targetSpecialty = 'HARDWARE';
    if (ticket.category.includes('Connectivity') || ticket.category.includes('Weather')) {
      targetSpecialty = 'SOFTWARE_IOT';
    } else if (ticket.category.includes('Upgrade') || ticket.category.includes('Other')) {
      targetSpecialty = 'FIELD';
    }

    return techs
      .map(t => ({
        ...t,
        isRecommended: t.specialty === targetSpecialty && t.status === 'ONLINE',
        reason: t.specialty === targetSpecialty 
          ? `🟢 Matches Specialty (${targetSpecialty})` 
          : `⚙️ Alternate Specialty (${t.specialty})`
      }))
      .sort((a, b) => {
        if (a.isRecommended && !b.isRecommended) return -1;
        if (!a.isRecommended && b.isRecommended) return 1;
        return a.activeJobs - b.activeJobs;
      });
  };

  const recommendedTechList = selectedTicket ? getRecommendedTechnician(selectedTicket) : [];

  const handleAssign = async () => {
    if (!selectedTicket || !selectedTech) return;
    const res = await assignTechnician(selectedTicket._id, selectedTech);
    if (res.success) {
      const updated = {
        ...selectedTicket,
        status: 'ASSIGNED',
        assignedTechnicianId: selectedTech,
        assignedTechnicianName: techs.find(t => t._id === selectedTech)?.name
      };
      setSelectedTicket(updated);
      setSelectedTech('');
    }
  };

  const handleStatusChange = async (e) => {
    const nextStatus = e.target.value;
    if (!selectedTicket || !nextStatus) return;
    const res = await updateTicketStatus(selectedTicket._id, nextStatus, {
      note: `Administrator updated ticket status to ${nextStatus}`
    });
    if (res.success) {
      setSelectedTicket({ ...selectedTicket, status: nextStatus });
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pb-16 font-body">
      
      {/* Alert Banner / Notifications Drawer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className="bg-amber-950/70 border border-amber-800/40 text-amber-200 px-5 py-4 rounded-2xl flex justify-between items-center flex-wrap gap-4 shadow-lg shadow-amber-900/5 backdrop-blur animate-[slideDown_0.25s_ease-out]"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-amber-500 animate-bounce shrink-0" />
                  <div className="text-xs">
                    <span className="font-extrabold uppercase text-[10px] tracking-wider text-amber-400">🔔 NEW SERVICE REQUEST FILED</span>
                    <p className="font-bold text-sm mt-0.5">{notif.ticketId} - {notif.category}</p>
                    <p className="text-slate-400 mt-0.5">Farmer: <span className="font-bold text-slate-300">{notif.farmerName}</span> | Model: <span className="font-mono text-slate-300">{notif.productModel}</span> | Priority: <span className="font-extrabold text-red-400">{notif.priority}</span></p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const t = tickets.find(ticket => ticket.ticketId === notif.ticketId);
                      if (t) setSelectedTicket(t);
                      dismissNotification(notif._id);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition cursor-pointer"
                  >
                    VIEW TICKET
                  </button>
                  <button
                    onClick={() => dismissNotification(notif._id)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Title */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-display text-white">ADMIN SYSTEM CONTROL</h1>
            <p className="text-slate-400 text-xs mt-1">IoT smart fleet operations and maintenance dashboards.</p>
          </div>
          <span className="text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-full">
            REAL-TIME FEED ACTIVE
          </span>
        </div>

        {/* Tab Selection Switcher */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActivePanelTab('REPAIRS')}
            className={`py-4 px-6 text-sm font-extrabold uppercase tracking-wider transition relative cursor-pointer ${
              activePanelTab === 'REPAIRS' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🛠️ Repair Requests ({tickets.length})
          </button>
          <button
            onClick={() => setActivePanelTab('UPGRADES')}
            className={`py-4 px-6 text-sm font-extrabold uppercase tracking-wider transition relative cursor-pointer ${
              activePanelTab === 'UPGRADES' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔄 Sells & Buys / Device Upgrades ({upgrades.length})
          </button>
        </div>

        {/* REPAIRS PANEL */}
        {activePanelTab === 'REPAIRS' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl animate-[fadeIn_0.2s_ease-out]">
            {/* Filters Bar */}
            <div className="p-6 border-b border-slate-800 flex flex-wrap justify-between items-center gap-4 bg-slate-900/60">
              <h3 className="font-bold text-white font-display">Active Service Registry</h3>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-500 w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="ID, Farmer, or Serial"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-100 max-w-[200px]"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">NEW</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="INSPECTION">INSPECTION</option>
                  <option value="REPAIR">REPAIR</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>

            {/* Table List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <th className="p-4 pl-6">Ticket ID</th>
                    <th className="p-4">Farmer</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Device (Serial)</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Technician</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map((t) => (
                      <tr key={t._id} className="hover:bg-slate-950/40 transition">
                        <td className="p-4 pl-6 font-mono font-bold text-white">{t.ticketId}</td>
                        <td className="p-4">
                          <p className="font-bold text-slate-200">{t.farmerName}</p>
                          <p className="text-[10px] text-slate-500">{t.farmerPhone}</p>
                        </td>
                        <td className="p-4 text-slate-300">{t.category}</td>
                        <td className="p-4">
                          <p className="text-slate-300">{t.productModel}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{t.serialNumber}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getPriorityColor(t.priority)}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getStatusColor(t.status)}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">
                          {t.assignedTechnicianName ? t.assignedTechnicianName : 'None Assigned'}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => setSelectedTicket(t)}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-1 px-3 border border-slate-700 rounded-lg text-[10px] transition cursor-pointer"
                          >
                            MANAGE
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-500 font-bold">
                        No active tickets matching search parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* UPGRADES (SELLS & BUYS) PANEL */}
        {activePanelTab === 'UPGRADES' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl animate-[fadeIn_0.2s_ease-out]">
            <div className="p-6 border-b border-slate-800 bg-slate-900/60">
              <h3 className="font-bold text-white font-display">Hardware Purchase & Upgrade Requests</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <th className="p-4 pl-6">Request ID</th>
                    <th className="p-4">Farmer Name</th>
                    <th className="p-4">Serial Number</th>
                    <th className="p-4">Current Hardware</th>
                    <th className="p-4">Requested Upgrade (Buy)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {upgrades.length > 0 ? (
                    upgrades.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-950/40 transition">
                        <td className="p-4 pl-6 font-mono font-bold text-white">
                          UP-{u._id.substring(u._id.length - 5).toUpperCase()}
                        </td>
                        <td className="p-4 font-bold text-slate-200">{u.farmerName}</td>
                        <td className="p-4 font-mono text-slate-400">{u.serialNumber}</td>
                        <td className="p-4 text-slate-300">{u.currentModel}</td>
                        <td className="p-4 text-emerald-400 font-extrabold">{u.requestedUpgrade}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                            u.status === 'COMPLETED' || u.status === 'APPROVED'
                              ? 'bg-green-950/40 text-green-300 border-green-800/30'
                              : u.status === 'PENDING'
                              ? 'bg-yellow-950/40 text-yellow-300 border-yellow-800/30'
                              : 'bg-red-950/40 text-red-300 border-red-800/30'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right space-x-2">
                          {u.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => updateUpgradeStatus(u._id, 'APPROVED')}
                                className="bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold py-1 px-2.5 rounded-lg text-[10px] transition cursor-pointer"
                              >
                                APPROVE
                              </button>
                              <button
                                onClick={() => updateUpgradeStatus(u._id, 'REJECTED')}
                                className="bg-red-900/60 hover:bg-red-850 text-white font-extrabold py-1 px-2.5 rounded-lg text-[10px] transition cursor-pointer"
                              >
                                REJECT
                              </button>
                            </>
                          )}
                          {u.status === 'APPROVED' && (
                            <button
                              onClick={() => updateUpgradeStatus(u._id, 'COMPLETED')}
                              className="bg-blue-700 hover:bg-blue-600 text-white font-extrabold py-1 px-2.5 rounded-lg text-[10px] transition cursor-pointer"
                            >
                              DISPATCH / SHIP
                            </button>
                          )}
                          {u.status === 'COMPLETED' && (
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Processed</span>
                          )}
                          {u.status === 'REJECTED' && (
                            <span className="text-[10px] text-red-400 font-bold uppercase">Rejected</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500 font-bold">
                        No active upgrade sells or buys recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Ticket Details Side Drawer / Dialog */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between text-slate-300">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold bg-slate-950 text-slate-400 px-2 py-1 rounded border border-slate-800 font-mono">
                    {selectedTicket.ticketId}
                  </span>
                  <h2 className="text-xl font-bold text-white font-display mt-2">{selectedTicket.category}</h2>
                </div>
                <button
                  onClick={() => { setSelectedTicket(null); setSelectedTech(''); }}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Farmer details & location */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/40 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Customer</span>
                  <p className="font-bold text-white mt-0.5">{selectedTicket.farmerName}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{selectedTicket.farmerPhone}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Warranty</span>
                  <p className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
                    <Shield size={12} />
                    <span>✓ ACTIVE</span>
                  </p>
                </div>
                <div className="col-span-2 border-t border-slate-800/40 pt-2 flex items-start gap-1.5">
                  <MapPin size={13} className="text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Farm Location</span>
                    <p className="font-semibold text-slate-300 mt-0.5">{selectedTicket.location}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Description Details</span>
                <p className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/40 leading-relaxed text-slate-300">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Current Technician status info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Current Status</span>
                  <div className="flex items-center gap-1.5 mt-1 select-none">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Assigned Technician</span>
                  <p className="font-bold text-white mt-1.5">
                    {selectedTicket.assignedTechnicianName ? selectedTicket.assignedTechnicianName : 'None Assigned'}
                  </p>
                </div>
              </div>

              {/* Actions Section */}
              <div className="border-t border-slate-800 pt-5 space-y-4">
                {/* Tech auto-recommender */}
                {selectedTicket.status === 'NEW' && (
                  <div className="space-y-3 bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl">
                    <div className="flex justify-between items-center border-b border-slate-800/40 pb-2">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <span>🤖 AI Dispatch Recommender</span>
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold">Recommended first</span>
                    </div>

                    <div className="space-y-2">
                      {recommendedTechList.map((tech) => (
                        <label
                          key={tech._id}
                          onClick={() => setSelectedTech(tech._id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition text-xs ${
                            selectedTech === tech._id
                              ? 'bg-emerald-950/40 border-emerald-600/40 text-white'
                              : 'bg-slate-950/20 border-slate-800/50 hover:bg-slate-950/50 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="assignTech"
                              checked={selectedTech === tech._id}
                              onChange={() => {}}
                              className="accent-emerald-500"
                            />
                            <div>
                              <p className="font-bold text-slate-200">{tech.name}</p>
                              <span className="text-[9px] text-slate-500 font-bold uppercase">{tech.specialty} Specialist</span>
                            </div>
                          </div>
                          
                          <div className="text-right text-[9px] font-bold">
                            <p className={tech.isRecommended ? 'text-emerald-400' : 'text-slate-500'}>
                              {tech.reason}
                            </p>
                            <p className="text-slate-400 mt-0.5">{tech.activeJobs} active jobs</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={handleAssign}
                      disabled={!selectedTech}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer active:scale-95 disabled:opacity-40"
                    >
                      CONFIRM ASSIGNMENT
                    </button>
                  </div>
                )}

                {/* Change Status Dropdown */}
                {selectedTicket.status !== 'NEW' && selectedTicket.status !== 'COMPLETED' && (
                  <div className="space-y-2 text-xs">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Change Ticket Status (Override)</span>
                    <select
                      value={selectedTicket.status}
                      onChange={handleStatusChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 font-semibold cursor-pointer"
                    >
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="INSPECTION">INSPECTION</option>
                      <option value="REPAIR">REPAIR</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Quick status closing */}
            {selectedTicket.status !== 'COMPLETED' && selectedTicket.status !== 'NEW' && (
              <button
                onClick={() => updateTicketStatus(selectedTicket._id, 'COMPLETED', { note: 'Administrator manually closed ticket.' })}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                CLOSE TICKET
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
