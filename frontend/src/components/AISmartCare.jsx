import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { MessageSquare, X, Send, Cpu, Check, AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AISmartCare({ setActiveTab, setTrackedTicketId }) {
  const { askAIChat, activeDevice, createTicket } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'AI', text: 'Hello! I am your SmartCare Assistant. How can I help you with your irrigation system today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Diagnostic state hooks
  const [diagnostic, setDiagnostic] = useState(null);
  const [canEscalate, setCanEscalate] = useState(false);
  const [ticketDraft, setTicketDraft] = useState(null);
  const [ticketCreated, setTicketCreated] = useState(false);
  const [newTicketId, setNewTicketId] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenChat);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, diagnostic, ticketDraft]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setMessages(prev => [...prev, { sender: 'Farmer', text: userText }]);
    setInputText('');
    setLoading(true);
    setDiagnostic(null);
    setTicketDraft(null);

    // Call API / Local Mock chat
    const res = await askAIChat(userText);
    setLoading(false);

    if (res.success) {
      setMessages(prev => [...prev, { sender: 'AI', text: res.text }]);
      if (res.diagnosticStatus) {
        setDiagnostic(res.diagnosticStatus);
      }
      if (res.canEscalate) {
        setCanEscalate(true);
      }
      if (res.ticketDraft) {
        setTicketDraft(res.ticketDraft);
      }
    } else {
      setMessages(prev => [...prev, { sender: 'AI', text: 'I am experiencing some connectivity troubles checking your telemetry. Please check the network.' }]);
    }
  };

  const handleStillNotWorking = async () => {
    // Triggers escalation message
    setMessages(prev => [...prev, { sender: 'Farmer', text: 'Still not working.' }]);
    setLoading(true);
    setCanEscalate(false);

    const res = await askAIChat('still not working');
    setLoading(false);

    if (res.success) {
      setMessages(prev => [...prev, { sender: 'AI', text: res.text }]);
      if (res.ticketDraft) {
        setTicketDraft(res.ticketDraft);
      }
    }
  };

  const handleProblemSolved = () => {
    setMessages(prev => [...prev, { sender: 'Farmer', text: 'Problem solved!' }]);
    setMessages(prev => [...prev, { sender: 'AI', text: 'Excellent! Happy farming. If anything else acts up, just ask.' }]);
    setCanEscalate(false);
    setDiagnostic(null);
    setTicketDraft(null);
  };

  const handleCreateTicket = async () => {
    if (!ticketDraft) return;
    setLoading(true);

    const res = await createTicket({
      serialNumber: ticketDraft.serialNumber,
      productModel: ticketDraft.productModel,
      category: ticketDraft.category,
      description: ticketDraft.description,
      priority: ticketDraft.priority
    });

    setLoading(false);
    if (res.success) {
      setTicketCreated(true);
      setNewTicketId(res.ticket.ticketId);
      setTicketDraft(null);
      setMessages(prev => [...prev, {
        sender: 'AI',
        text: `✓ I've successfully registered your ticket! Service ID: ${res.ticket.ticketId}. A Hardware Technician has been recommended.`
      }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Floating pulsing button */}
      {!isOpen && (
        <button
          id="ai-floating-chat-btn"
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition cursor-pointer hover:shadow-emerald-700/30 active:scale-95 animate-connection-pulse"
          title="Open SmartCare Assistant"
        >
          <span className="text-2xl">🤖</span>
        </button>
      )}

      {/* Chat window panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-[slideUp_0.2s_ease-out]">
          
          {/* Header */}
          <div className="bg-emerald-800 text-white px-4 py-3 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <h3 className="text-xs font-bold font-display uppercase tracking-wider">SmartCare Assistant</h3>
                <span className="text-[9px] text-emerald-200 font-semibold uppercase">AI Diagnostics Live</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-emerald-700 rounded-lg transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'AI' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                  msg.sender === 'AI' 
                    ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none' 
                    : 'bg-emerald-700 text-white rounded-tr-none font-medium'
                }`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}

            {/* Diagnostic context display */}
            {diagnostic && (
              <div className="bg-white border border-blue-100 p-3.5 rounded-xl shadow-sm space-y-2.5 animate-pulse">
                <div className="flex items-center gap-1.5 border-b border-blue-50 pb-1.5 text-blue-800">
                  <Cpu size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
                  <p className="text-[10px] font-bold uppercase tracking-wider">System Telemetry Log</p>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div>
                    <span className="text-gray-400 font-bold">DEVICE:</span>
                    <p className="font-semibold text-gray-700">{diagnostic.device}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold">SENSOR:</span>
                    <p className="font-semibold text-gray-700">{diagnostic.sensor}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold">LATEST READING:</span>
                    <p className="font-bold text-red-600">{diagnostic.latestReading}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold">PREVIOUS READING:</span>
                    <p className="font-semibold text-gray-700">{diagnostic.previousReading}</p>
                  </div>
                  <div className="col-span-2 flex items-center gap-1 mt-1 pt-1.5 border-t border-blue-50/50">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-status-pulse"></span>
                    <span className="text-[9px] text-gray-400 font-bold">CONNECTIVITY: {diagnostic.connectivity}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Loading typing state */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 text-gray-400 rounded-2xl rounded-tl-none p-3 text-xs flex gap-1 items-center">
                  <span>Checking device</span>
                  <span className="flex gap-0.5 ml-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                  </span>
                </div>
              </div>
            )}

            {/* Support draft display */}
            {ticketDraft && (
              <div className="bg-white border border-amber-100 p-4 rounded-xl shadow-sm space-y-3.5">
                <div className="flex items-center gap-1.5 border-b border-amber-50 pb-1.5 text-amber-800">
                  <AlertTriangle size={14} className="text-amber-600" />
                  <p className="text-[10px] font-bold uppercase tracking-wider">Service Request Ticket Draft</p>
                </div>
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold">FARMER:</span>
                    <span className="font-semibold text-gray-700">{ticketDraft.farmerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold">MODEL:</span>
                    <span className="font-semibold text-gray-700">{ticketDraft.productModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold">CATEGORY:</span>
                    <span className="font-semibold text-gray-700">{ticketDraft.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold">PRIORITY:</span>
                    <span className="font-extrabold text-red-600 uppercase bg-red-50 px-1.5 py-0.5 rounded">
                      {ticketDraft.priority}
                    </span>
                  </div>
                  <div className="border-t border-amber-50/50 pt-2">
                    <span className="text-gray-400 font-bold">AUTO-DIAGNOSIS DETAILED LOGS:</span>
                    <p className="text-gray-600 mt-1 leading-normal italic">
                      "{ticketDraft.description}"
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCreateTicket}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-2 px-3 rounded-lg text-[10px] sm:text-xs transition cursor-pointer active:scale-95 shadow-sm text-center"
                >
                  [ CREATE SERVICE TICKET ]
                </button>
              </div>
            )}

            {/* Ticket created buttons */}
            {ticketCreated && (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex flex-col gap-2 items-center text-center">
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="text-[10px] font-extrabold text-emerald-800">TICKET GENERATED</span>
                <button
                  onClick={() => {
                    setTrackedTicketId(newTicketId);
                    setActiveTab('track-service');
                    setIsOpen(false);
                  }}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold py-1.5 rounded-lg transition cursor-pointer"
                >
                  GO TO TRACK WORKFLOW
                </button>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Action options buttons */}
          {canEscalate && (
            <div className="px-4 py-2 bg-slate-100/50 border-t border-gray-100 flex gap-2 justify-end">
              <button
                onClick={handleStillNotWorking}
                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-[10px] font-extrabold py-1.5 px-3 rounded-lg transition cursor-pointer"
              >
                STILL NOT WORKING
              </button>
              <button
                onClick={handleProblemSolved}
                className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-bold py-1.5 px-3 rounded-lg transition cursor-pointer"
              >
                PROBLEM SOLVED
              </button>
            </div>
          )}

          {/* Footer input form */}
          {!ticketDraft && !ticketCreated && (
            <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2 bg-white">
              <input
                type="text"
                placeholder="Ask chatbot to troubleshoot..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
              <button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white p-2 rounded-xl transition cursor-pointer shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
          )}

        </div>
      )}
    </div>
  );
}
