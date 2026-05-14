import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, Mic, Send, Bot, Plus, Trash2, Calendar, Clock, User, CheckCircle, X } from 'lucide-react';
import dayjs from 'dayjs';

export default function EnhancedAIChat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(false);

  // State: store open/close and form data per doctorId!
  const [bookingDoctors, setBookingDoctors] = useState({});
  const [bookingForms, setBookingForms] = useState({});
  const [booking, setBooking] = useState(null);

  const messagesEndRef = useRef(null);

  const MODEL_API = process.env.NEXT_PUBLIC_MODEL_API || 'https://42tbnklm-5000.inc1.devtunnels.ms';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    (async () => {
      try {
        const { jsonFetch } = await import('@/lib/fetcher')
        const data = await jsonFetch('/api/auth/me')
        setCurrentUser(data)
      } catch (e) {
        // ignore
      }
    })()
    Promise.all([loadSessions(), loadHistory()]).then(() => setInitialLoading(false));
  }, []);

  const loadSessions = async () => {
    try {
      const response = await fetch(`${MODEL_API}/api/sessions`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) setSessions(data.sessions);
    } catch { }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch(`${MODEL_API}/api/history`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        const formattedMessages = data.messages.map(msg => ({
          id: msg.session_id + msg.timestamp,
          type: msg.role === 'user' ? 'user' : 'ai',
          text: msg.content,
          time: new Date(msg.timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          source: msg.source,
          relatedDoctors: msg.related_doctors
        }));
        setMessages(formattedMessages);
      }
    } catch { }
  };

  const loadSession = async (sessionId) => {
    setSessionLoading(true);
    try {
      const response = await fetch(`${MODEL_API}/api/session/${sessionId}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setCurrentSessionId(sessionId);
        const formattedMessages = data.messages.map(msg => ({
          id: msg.session_id + msg.timestamp,
          type: msg.role === 'user' ? 'user' : 'ai',
          text: msg.content,
          time: new Date(msg.timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          source: msg.source,
          relatedDoctors: msg.related_doctors
        }));
        setMessages(formattedMessages);
      }
    } catch { } finally {
      setSessionLoading(false);
    }
  };

  const deleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    try {
      const response = await fetch(`${MODEL_API}/api/session/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        loadSessions();
        if (currentSessionId === sessionId) {
          setMessages([]);
          createNewChat();
        }
      }
    } catch { }
  };

  const createNewChat = async () => {
    try {
      const response = await fetch(`${MODEL_API}/api/new-chat`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setCurrentSessionId(data.session_id);
        setMessages([]);
        loadSessions();
      }
    } catch { }
  };

  const handleSend = async () => {
    if (!message.trim() || loading) return;
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: message,
      time: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);
    setTyping(true);
    try {
      const response = await fetch(`${MODEL_API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: message })
      });
      const data = await response.json();
      setTyping(false);
      if (data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          text: data.response,
          time: data.timestamp,
          source: data.source,
          relatedDoctors: data.related_doctors
        };
        setMessages(prev => [...prev, aiMessage]);
        loadSessions();
      } else {
        alert('Failed to get response from AI');
      }
    } catch {
      alert('Failed to send message');
      setTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  // Corrected Open/Close + Form Initialization for This Doctor Only
  const openBookingForm = (doctorId) => {
    console.log('Opening booking form for doctor:', doctorId);
    setBookingDoctors(prev => {
      const updated = { ...prev, [doctorId]: true };
      console.log('Updated bookingDoctors:', updated);
      return updated;
    });
    setBookingForms(prev => ({
      ...prev,
      [doctorId]: { selectedDate: '', selectedTime: '', bookingNotes: '' }
    }));
  };
  const closeBookingForm = (doctorId) => {
    console.log('Closing booking form for doctor:', doctorId);
    setBookingDoctors(prev => ({ ...prev, [doctorId]: false }));
  };

  const updateBookingForm = (doctorId, field, value) => {
    setBookingForms(prev => ({
      ...prev,
      [doctorId]: {
        ...(prev[doctorId] || {}),
        [field]: value
      }
    }));
  };

  // Try to resolve a doctor object from the ML API to a real doctor _id
  // by querying our /api/doctors endpoint and matching by name/specialization.
  const resolveDoctorId = async (doctor) => {
    // fast-path: check common id fields
    const quick = doctor._id || doctor.id || doctor.doctor_id || doctor.doctorId;
    if (quick) return quick;

    try {
      const spec = (doctor.specialization || '').toString();
      const url = spec ? `/api/doctors?specialization=${encodeURIComponent(spec)}` : `/api/doctors`;
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        console.warn('Failed to fetch doctors for resolution', res.status);
        return null;
      }
      const list = await res.json();
      if (!Array.isArray(list) || list.length === 0) return null;

      const targetName = ((doctor.name?.first || '') + ' ' + (doctor.name?.last || '')).trim().toLowerCase();
      if (targetName) {
        // exact full-name match first
        const exact = list.find(d => (((d.name?.first || '') + ' ' + (d.name?.last || '')).trim().toLowerCase() === targetName));
        if (exact) return exact._id || exact.id || null;

        // try looser matching (first or last name included)
        const loose = list.find(d => {
          const n = ((d.name?.first || '') + ' ' + (d.name?.last || '')).trim().toLowerCase();
          return n.includes(targetName) || targetName.includes(n) || (d.doctorProfile?.specialization || '').toLowerCase() === spec.toLowerCase();
        });
        if (loose) return loose._id || loose.id || null;
      }

      // fallback: return first doctor in the same specialization (best-effort)
      const first = list[0];
      return first?._id || first?.id || null;
    } catch (err) {
      console.error('Error resolving doctor id:', err);
      return null;
    }
  };

  const handleBookAppointment = async (doctor, uniqueDoctorId) => {
    const form = bookingForms[uniqueDoctorId];
    if (!form?.selectedDate || !form?.selectedTime) {
      alert('Please select date and time');
      return;
    }

    // Extract the actual doctor ID - try multiple possible field names
    // If it's missing, attempt to resolve via our /api/doctors endpoint (best-effort)
    let actualDoctorId = doctor._id || doctor.id || doctor.doctor_id || doctor.doctorId;
    if (!actualDoctorId) {
      console.log('No direct doctor ID available from ML result, attempting to resolve by name/specialization...');
      actualDoctorId = await resolveDoctorId(doctor);
      if (!actualDoctorId) {
        console.error('Unable to resolve doctor from ML response:', doctor);
        // show a user-friendly message with an action
        if (confirm('Unable to locate the recommended doctor in the system. Would you like to browse all doctors to pick one?')) {
          window.location.href = '/doctors';
        }
        return;
      }
      console.log('Resolved doctor ID to:', actualDoctorId);
    }

    console.log('Booking appointment with:', {
      doctorId: actualDoctorId,
      doctorName: `${doctor.name?.first || ''} ${doctor.name?.last || ''}`,
      date: form.selectedDate,
      time: form.selectedTime
    });

    setBooking(uniqueDoctorId);
    const startDateTime = dayjs(`${form.selectedDate} ${form.selectedTime}`).toISOString();
    const endDateTime = dayjs(`${form.selectedDate} ${form.selectedTime}`).add(30, 'minute').toISOString();

    const requestBody = {
      doctorId: actualDoctorId.toString(), // Ensure it's a string
      start: startDateTime,
      end: endDateTime,
      notes: form.bookingNotes || ''
    };

    console.log('Sending booking request:', requestBody);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();
      console.log('Booking response:', responseData);

      if (response.ok) {
        const confirmationMessage = {
          id: Date.now() + 2,
          type: 'ai',
          text: `✅ Appointment booked successfully with Dr. ${doctor.name?.first || ''} ${doctor.name?.last || ''} on ${dayjs(startDateTime).format('MMMM DD, YYYY')} at ${dayjs(startDateTime).format('h:mm A')}. You will receive a confirmation email shortly.`,
          time: new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          isConfirmation: true
        };
        setMessages(prev => [...prev, confirmationMessage]);
        closeBookingForm(uniqueDoctorId);
        setBookingForms(prev => ({
          ...prev,
          [uniqueDoctorId]: { selectedDate: '', selectedTime: '', bookingNotes: '' }
        }));
      } else {
        console.error('Booking failed. Response:', responseData);
        alert(responseData.error || responseData.message || 'Failed to book appointment');
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setBooking(null);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-[91vh] bg-background overflow-hidden animate-pulse">
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden border-r border-border">
          <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
            </div>
          </div>
          <div className="flex-1 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="h-16 w-1/2 bg-muted rounded-2xl"></div>
            </div>
            <div className="flex items-start gap-3 justify-end">
              <div className="h-16 w-1/3 bg-muted rounded-2xl"></div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="h-24 w-1/2 bg-muted rounded-2xl"></div>
            </div>
          </div>
        </div>
        <div className="w-80 bg-card flex flex-col">
          <div className="px-6 py-5 border-b border-border">
            <div className="h-5 bg-muted rounded w-32"></div>
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[91vh] bg-background overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">AI Health Assistant</h2>
              <p className="text-xs text-muted-foreground">Powered by CareMate</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={createNewChat}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>
        </div>
        {/* Messages Container */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {sessionLoading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground text-sm">Loading conversation...</p>
              </div>
            ) : messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Bot className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to AI Health Assistant</h3>
                <p className="text-muted-foreground max-w-md">
                  Describe your symptoms and I'll help you understand possible conditions and recommend specialists.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3">
                {msg.type === 'ai' && (
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div className={`flex-1 ${msg.type === 'user' ? 'flex justify-end' : ''}`}>
                  <div
                    className={`inline-block max-w-2xl ${msg.type === 'user'
                      ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none'
                      : msg.isConfirmation
                        ? 'bg-green-50 border border-green-200 rounded-2xl rounded-tl-none'
                        : 'bg-card rounded-2xl rounded-tl-none border border-border shadow-sm'
                      } px-4 py-3`}
                  >
                    <p className={`text-sm whitespace-pre-wrap ${msg.isConfirmation ? 'text-green-800' : ''}`}>
                      {msg.text}
                    </p>
                    {msg.source && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground">Source: {msg.source}</p>
                      </div>
                    )}
                    {/* CORRECTED DOCTOR MAPPING: ONLY OPENS ONE FORM */}
                    {msg.relatedDoctors?.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-semibold text-foreground mb-3">Recommended Specialists:</p>
                        {msg.relatedDoctors.map((doctor, doctorIndex) => {
                          // Log the doctor object to see its structure
                          console.log('Doctor object:', doctor);

                          // Try different possible ID fields
                          const actualId = doctor._id || doctor.id || doctor.doctorId;
                          const doctorId = actualId || `doctor-${msg.id}-${doctorIndex}`;

                          console.log('Using doctorId:', doctorId, 'for doctor:', doctor.name);

                          const isBookingOpen = !!bookingDoctors[doctorId];
                          const form = bookingForms[doctorId] || {};
                          return (
                            <div key={doctorId} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start space-x-3">
                                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-6 h-6 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-foreground text-sm">
                                      Dr. {doctor.name?.first} {doctor.name?.last}
                                    </h4>
                                    <p className="text-xs text-teal-600 font-semibold">{doctor.specialization}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {doctor.yearsExperience} years experience
                                    </p>
                                  </div>
                                </div>
                              </div>
                              {isBookingOpen ? (
                                <div className="mt-3 space-y-3 bg-card p-4 rounded-lg border border-border">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                                        <Calendar size={12} className="inline mr-1" />
                                        Select Date
                                      </label>
                                      <input
                                        type="date"
                                        value={form.selectedDate || ''}
                                        onChange={(e) => updateBookingForm(doctorId, 'selectedDate', e.target.value)}
                                        min={dayjs().format('YYYY-MM-DD')}
                                        className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                                        <Clock size={12} className="inline mr-1" />
                                        Select Time
                                      </label>
                                      <select
                                        value={form.selectedTime || ''}
                                        onChange={(e) => updateBookingForm(doctorId, 'selectedTime', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      >
                                        <option value="">Choose time</option>
                                        {generateTimeSlots().map(slot => (
                                          <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                                      Notes (Optional)
                                    </label>
                                    <textarea
                                      value={form.bookingNotes || ''}
                                      onChange={(e) => updateBookingForm(doctorId, 'bookingNotes', e.target.value)}
                                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      rows={2}
                                      placeholder="Any specific concerns..."
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleBookAppointment(doctor, doctorId)}
                                      disabled={booking === doctorId || !form.selectedDate || !form.selectedTime}
                                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                    >
                                      {booking === doctorId ? (
                                        'Booking...'
                                      ) : (
                                        <>
                                          <CheckCircle size={16} />
                                          Confirm Booking
                                        </>
                                      )}
                                    </button>
                                    <button
                                      onClick={() => closeBookingForm(doctorId)}
                                      className="px-4 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => openBookingForm(doctorId)}
                                  className="w-full mt-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                  <Calendar size={16} />
                                  Book Appointment
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {msg.time && (
                      <p className={`text-xs mt-2 ${msg.type === 'user' ? 'opacity-80' : 'text-muted-foreground'}`}>
                        {msg.time}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="bg-card rounded-2xl rounded-tl-none px-4 py-3 inline-block shadow-sm border border-border">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        {/* Input */}
        <div className="bg-card border-t border-border px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="text-muted-foreground hover:text-foreground">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your symptoms..."
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-muted"
            />
            <button className="text-muted-foreground hover:text-foreground">
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={loading || !message.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      {/* Sidebar */}
      <div className="w-80 bg-card border-l border-border flex flex-col min-h-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex-shrink-0">
          <h3 className="font-semibold text-foreground">Recent AI Predictions</h3>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          {sessions.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No conversations yet. Start chatting!
            </div>
          ) : (
            sessions.map((session, i) => (
              <div
                key={session.session_id || `session-${i}`}
                className="px-6 py-4 hover:bg-background cursor-pointer border-b border-gray-100 group relative"
                onClick={() => loadSession(session.session_id)}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-foreground text-sm flex-1 pr-2">
                    {session.preview || 'New Prediction'}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(session.last_active).toLocaleDateString()}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteSession(session.session_id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(session.last_active).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}