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
    loadSessions();
    loadHistory();
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
    } catch { }
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

  return (
    <div className="flex h-[91vh] bg-background overflow-hidden font-body-md text-on-background">
      {/* SideNavBar for Recent Conversations */}
      <aside className="w-80 bg-surface-container-low border-r border-outline-variant flex flex-col min-h-0 overflow-hidden shrink-0">
        <div className="px-stack-md py-stack-md border-b border-outline-variant flex-shrink-0 flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm font-semibold text-primary">Recent Conversations</h3>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 p-2 space-y-2">
          {sessions.length === 0 ? (
            <div className="p-6 text-center text-on-surface-variant text-sm font-label-md">
              No conversations yet. Start chatting!
            </div>
          ) : (
            sessions.map((session, index) => (
              <div
                key={session.session_id || `session-${index}`}
                className="px-4 py-3 hover:bg-surface-container-high transition-all rounded-lg cursor-pointer group relative flex flex-col"
                onClick={() => loadSession(session.session_id)}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-label-md text-on-surface flex-1 pr-2 truncate">
                    {session.preview || 'New Conversation'}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteSession(session.session_id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-error hover:opacity-80 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-on-surface-variant font-label-sm">
                  <span>{new Date(session.last_active).toLocaleDateString()}</span>
                  <span>
                    {new Date(session.last_active).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="flex justify-between items-center w-full px-margin-desktop py-stack-sm h-16 sticky top-0 z-50 bg-surface border-b border-outline-variant flex-shrink-0">
          <div className="flex items-center gap-stack-md">
            <span className="font-headline-md text-headline-md font-bold text-primary">CareMate AI Assistant</span>
            <span className="text-xs bg-surface-container px-2 py-1 rounded text-on-surface-variant">HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={createNewChat}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-label-md hover:opacity-90 transition-opacity shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>
        </header>

        {/* Chat Workspace */}
        <section className="flex-1 overflow-hidden flex flex-col bg-background relative">
          {/* Message Area */}
          <div className="flex-1 overflow-y-auto px-margin-desktop py-stack-lg space-y-stack-lg flex flex-col">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center mt-10">
                <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center mb-stack-md shadow-sm">
                  <Bot className="w-10 h-10 text-on-primary-container" />
                </div>
                <h3 className="font-headline-md text-headline-md font-semibold text-on-surface mb-stack-sm">Welcome to CareMate AI</h3>
                <p className="font-body-md text-on-surface-variant max-w-md">
                  Describe your symptoms securely, and I'll help you understand possible conditions and recommend specialists.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'user' ? (
                  <div className="flex flex-col items-end max-w-2xl ml-auto">
                    <div className="bg-primary text-on-primary p-4 rounded-xl rounded-tr-none shadow-sm">
                      <p className="font-body-md whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    {msg.time && (
                      <span className="text-label-sm text-on-surface-variant mt-2 px-2">{msg.time}</span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-start max-w-4xl">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-on-primary-container text-[20px]">smart_toy</span>
                      </div>
                      <div className="flex-1 space-y-stack-md">
                        <div className={`${msg.isConfirmation ? 'bg-secondary-container border-secondary' : 'bg-surface-container-low border-outline-variant'} border p-stack-lg rounded-xl rounded-tl-none shadow-sm`}>
                          <p className={`font-body-md whitespace-pre-wrap ${msg.isConfirmation ? 'text-on-secondary-container font-semibold' : 'text-on-surface'}`}>
                            {msg.text}
                          </p>
                          {msg.source && (
                            <div className="mt-stack-sm pt-stack-sm border-t border-outline-variant">
                              <p className="text-[11px] text-on-surface-variant">Source: {msg.source}</p>
                            </div>
                          )}

                          {/* Recommended Specialists Mapping */}
                          {msg.relatedDoctors?.length > 0 && (
                            <div className="mt-stack-lg space-y-stack-sm">
                              <p className="font-label-md text-on-surface uppercase tracking-wider mb-2">Recommended Specialists</p>
                              {msg.relatedDoctors.map((doctor, doctorIndex) => {
                                const actualId = doctor._id || doctor.id || doctor.doctorId;
                                const doctorId = actualId || `doctor-${msg.id}-${doctorIndex}`;
                                const isBookingOpen = !!bookingDoctors[doctorId];
                                const form = bookingForms[doctorId] || {};
                                return (
                                  <div key={doctorId} className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant shadow-sm transition-all">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center shrink-0">
                                          <User className="w-6 h-6 text-on-primary-container" />
                                        </div>
                                        <div>
                                          <h4 className="font-headline-sm text-on-surface">Dr. {doctor.name?.first} {doctor.name?.last}</h4>
                                          <p className="font-label-md text-primary">{doctor.specialization}</p>
                                          <p className="font-label-sm text-on-surface-variant mt-1">{doctor.yearsExperience} years experience</p>
                                        </div>
                                      </div>
                                    </div>

                                    {isBookingOpen ? (
                                      <div className="mt-stack-md bg-surface p-4 rounded-xl border border-outline-variant space-y-stack-md">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                                          <div>
                                            <label className="block font-label-sm text-on-surface-variant uppercase mb-1">Select Date</label>
                                            <input
                                              type="date"
                                              value={form.selectedDate || ''}
                                              onChange={(e) => updateBookingForm(doctorId, 'selectedDate', e.target.value)}
                                              min={dayjs().format('YYYY-MM-DD')}
                                              className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-on-surface bg-surface-container-lowest"
                                            />
                                          </div>
                                          <div>
                                            <label className="block font-label-sm text-on-surface-variant uppercase mb-1">Select Time</label>
                                            <select
                                              value={form.selectedTime || ''}
                                              onChange={(e) => updateBookingForm(doctorId, 'selectedTime', e.target.value)}
                                              className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-on-surface bg-surface-container-lowest"
                                            >
                                              <option value="">Choose time</option>
                                              {generateTimeSlots().map(slot => (
                                                <option key={slot} value={slot}>{slot}</option>
                                              ))}
                                            </select>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block font-label-sm text-on-surface-variant uppercase mb-1">Notes (Optional)</label>
                                          <textarea
                                            value={form.bookingNotes || ''}
                                            onChange={(e) => updateBookingForm(doctorId, 'bookingNotes', e.target.value)}
                                            className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-on-surface bg-surface-container-lowest"
                                            rows={2}
                                            placeholder="Any specific concerns..."
                                          />
                                        </div>
                                        <div className="flex gap-stack-sm pt-2">
                                          <button
                                            onClick={() => handleBookAppointment(doctor, doctorId)}
                                            disabled={booking === doctorId || !form.selectedDate || !form.selectedTime}
                                            className="flex-1 bg-secondary text-on-secondary py-2 rounded-xl font-label-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                          >
                                            {booking === doctorId ? 'Booking...' : <><CheckCircle className="w-4 h-4" /> Confirm Booking</>}
                                          </button>
                                          <button
                                            onClick={() => closeBookingForm(doctorId)}
                                            className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-xl font-label-md hover:bg-surface-container transition-colors"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => openBookingForm(doctorId)}
                                        className="mt-3 w-full border border-primary text-primary py-2 rounded-xl font-label-md hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
                                      >
                                        <Calendar className="w-4 h-4" />
                                        Book Appointment
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        {msg.time && (
                          <span className="block text-label-sm text-on-surface-variant px-2">{msg.time}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div className="flex flex-col items-start max-w-4xl">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-primary-container text-[20px]">smart_toy</span>
                  </div>
                  <div className="bg-surface-container-low border border-outline-variant px-4 py-3 rounded-xl rounded-tl-none shadow-sm flex items-center h-12">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Anchor */}
          <div className="p-stack-lg border-t border-outline-variant bg-surface-container-lowest shrink-0">
            <div className="max-w-4xl mx-auto relative">
              <div className="flex items-end gap-stack-md bg-surface border border-outline rounded-2xl p-2 pr-4 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 transition-all">
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">attach_file</span>
                </button>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-2 font-body-md text-on-surface placeholder:text-on-surface-variant outline-none"
                  placeholder="Ask CareMate AI about symptoms or conditions..."
                  rows={1}
                />
                <div className="flex items-center gap-2 pb-1.5">
                  <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">mic</span>
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={loading || !message.trim()}
                    className="bg-primary text-on-primary p-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}