import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { ChevronRight, Wrench, MapPin, Phone, ShieldCheck, Camera, Check, RefreshCw, X, MessageSquare, AlertTriangle } from 'lucide-react';

export default function TechnicianPortal() {
  const { tickets, updateTicketStatus } = useApp();
  const [selectedJob, setSelectedJob] = useState(null);
  const [repairNotes, setRepairNotes] = useState('');
  const [partsUsed, setPartsUsed] = useState('');
  const [saving, setSaving] = useState(false);

  // Stats
  const activeJobs = tickets.filter(t => !['COMPLETED', 'CANCELLED'].includes(t.status));
  const completedJobs = tickets.filter(t => t.status === 'COMPLETED');
  const urgentJobs = activeJobs.filter(t => t.priority === 'HIGH' || t.priority === 'CRITICAL');

  const getPriorityColor = (p) => {
    switch (p) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const handleAction = async (nextStatus, noteText = '') => {
    if (!selectedJob) return;
    setSaving(true);

    const details = {
      note: noteText || `Technician triggered stage update to ${nextStatus}.`
    };

    if (nextStatus === 'COMPLETED') {
      details.repairNotes = repairNotes;
      details.partsUsed = partsUsed;
      details.note = `Repair completed. Notes: ${repairNotes}. Parts: ${partsUsed}`;
    }

    const res = await updateTicketStatus(selectedJob._id, nextStatus, details);
    setSaving(false);

    if (res.success) {
      // update local detail item
      setSelectedJob({
        ...selectedJob,
        status: nextStatus,
        repairNotes: nextStatus === 'COMPLETED' ? repairNotes : undefined,
        partsUsed: nextStatus === 'COMPLETED' ? partsUsed : undefined
      });
      if (nextStatus === 'COMPLETED') {
        setRepairNotes('');
        setPartsUsed('');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 font-display">TECHNICIAN DASHBOARD</h1>
        <p className="text-gray-500 text-sm">Manage assigned device repairs and diagnostic logs.</p>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Active Jobs</p>
          <p className="text-2xl font-black text-slate-800 font-display mt-1">{activeJobs.length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Urgent Jobs</p>
          <p className="text-2xl font-black text-red-600 font-display mt-1">{urgentJobs.length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase">Completed</p>
          <p className="text-2xl font-black text-emerald-700 font-display mt-1">{completedJobs.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Jobs List */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="font-bold text-gray-800 font-display border-b border-gray-100 pb-2">MY SERVICE JOBS</h3>
          
          {activeJobs.length > 0 ? (
            <div className="space-y-3">
              {activeJobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() => setSelectedJob(job)}
                  className={`bg-white p-5 rounded-2xl border transition duration-200 cursor-pointer text-left shadow-sm ${
                    selectedJob && selectedJob._id === job._id
                      ? 'border-emerald-600 ring-1 ring-emerald-600/30'
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {job.ticketId}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase ${getPriorityColor(job.priority)}`}>
                      {job.priority}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-gray-900">{job.category}</h4>
                  <p className="text-[10px] text-gray-500 mt-1 truncate">{job.description}</p>
                  
                  <div className="flex items-center gap-1 mt-3.5 pt-2 border-t border-gray-50 text-[10px] text-gray-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-status-pulse"></span>
                    <span className="uppercase">{job.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-6">Nice! All assigned repair tickets completed.</p>
          )}
        </div>

        {/* Selected Job details */}
        <div className="lg:col-span-6">
          {selectedJob ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              
              <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                <div>
                  <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {selectedJob.ticketId}
                  </span>
                  <h3 className="font-bold text-gray-900 font-display mt-2">{selectedJob.category}</h3>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Customer Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-3">
                <div className="flex gap-2">
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Farmer Name</p>
                    <p className="font-bold text-gray-800">{selectedJob.farmerName}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Phone Number</p>
                    <p className="font-semibold text-gray-700 font-mono">{selectedJob.farmerPhone}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Farm Location</p>
                    <p className="font-semibold text-gray-700 leading-normal">{selectedJob.location}</p>
                  </div>
                </div>
              </div>

              {/* Problem details */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Issue Log</span>
                <p className="bg-slate-50 p-3 rounded-xl text-gray-600 leading-relaxed italic">
                  "{selectedJob.description}"
                </p>
              </div>

              {/* Status workflow controls */}
              <div className="border-t border-gray-100 pt-5 space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Workflow Actions</p>

                {selectedJob.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleAction('TECHNICIAN_ACCEPTED', 'Technician Ravi accepted repair request.')}
                    disabled={saving}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition cursor-pointer active:scale-95 flex justify-center items-center gap-1.5"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'ACCEPT JOB'}
                  </button>
                )}

                {selectedJob.status === 'TECHNICIAN_ACCEPTED' && (
                  <button
                    onClick={() => handleAction('INSPECTION', 'Technician Ravi checked in at farm plot. Began diagnostic inspect.')}
                    disabled={saving}
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition cursor-pointer active:scale-95 flex justify-center items-center gap-1.5"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'START INSPECTION'}
                  </button>
                )}

                {selectedJob.status === 'INSPECTION' && (
                  <button
                    onClick={() => handleAction('REPAIR', 'Diagnostic audit completed. Initiating wiring repairs.')}
                    disabled={saving}
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition cursor-pointer active:scale-95 flex justify-center items-center gap-1.5"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'START REPAIR'}
                  </button>
                )}

                {selectedJob.status === 'REPAIR' && (
                  <div className="space-y-4">
                    
                    {/* Notes form */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-gray-100 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Repair Notes</label>
                        <textarea
                          rows="2"
                          placeholder="e.g. Repaired probe wire, tightened relay solder joints."
                          value={repairNotes}
                          onChange={(e) => setRepairNotes(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Parts Replaced</label>
                        <input
                          type="text"
                          placeholder="e.g. Copper probe wire link"
                          value={partsUsed}
                          onChange={(e) => setPartsUsed(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleAction('COMPLETED')}
                      disabled={saving || !repairNotes.trim()}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition cursor-pointer active:scale-95 disabled:opacity-40"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'REPAIR COMPLETED'}
                    </button>
                  </div>
                )}

                {/* Alternate status triggers */}
                {['INSPECTION', 'REPAIR'].includes(selectedJob.status) && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => handleAction('WAITING_FOR_PART', 'Awaiting new capacitive probe replacement parts.')}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold py-2 rounded-lg text-center cursor-pointer"
                    >
                      NEED REPLACEMENT
                    </button>
                    <button
                      onClick={() => handleAction('ESCALATED', 'Irrigation hardware core failure. Escalating to engineering team.')}
                      className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold py-2 rounded-lg text-center cursor-pointer"
                    >
                      ESCALATE
                    </button>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-gray-200 rounded-2xl h-64 flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <Wrench size={28} className="mb-2 text-gray-300 animate-[spin_4s_linear_infinite]" />
              <p className="text-xs font-bold">No active job selected.</p>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[200px]">Select an active repair ticket from the left panel to execute workflow.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
