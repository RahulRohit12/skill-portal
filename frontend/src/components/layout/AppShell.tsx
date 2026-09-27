import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { MessageSquare, X, Send, Bot, Sparkles, Menu, GraduationCap } from 'lucide-react';

export const AppShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Hi! I am TAI, your AI Learning Assistant. How can I help you with your courses, DSA problems, or tests today?' }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const q = chatInput.trim();
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setChatInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Great question regarding "${q}"! To master this topic, check out the relevant modules under Courses and practice the related coding problems in the Assignments section.`
        }
      ]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#090b0e] text-slate-100 flex">
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#0c0e12] border-b border-[#191c24] z-30 px-4 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg"
          aria-label="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0077b6] via-[#0096c7] to-[#00c2ff] flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-sm tracking-tight text-white flex items-center">
            SKILL<span className="text-[#00c2ff]">X</span> ACADEMY
          </span>
        </div>
        <div className="w-6" />
      </div>

      {/* Full-Height Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />

      {/* Main Workspace Frame */}
      <div className="flex-1 lg:pl-[84px] min-w-0 flex flex-col min-h-screen pt-14 lg:pt-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Floating Blue Chat Widget Button (as in bottom right of user's images) */}
      <div className="fixed bottom-6 right-6 z-40">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="w-12 h-12 rounded-full bg-[#00b4d8] hover:bg-[#0096c7] text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30 transition-all hover:scale-105"
            title="Ask TAI Assistant"
          >
            <MessageSquare className="w-5 h-5 fill-slate-950" />
          </button>
        ) : (
          <div className="w-80 sm:w-96 rounded-2xl bg-[#12151c] border border-[#1f2430] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Chat Header */}
            <div className="px-4 py-3 bg-[#161922] border-b border-[#1f2430] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#00b4d8] text-slate-950 flex items-center justify-center text-xs font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Ask TAI</span>
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-semibold">• Online</span>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 h-72 overflow-y-auto space-y-3 text-xs">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] px-3 py-2 rounded-xl leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#00b4d8] text-slate-950 font-medium'
                        : 'bg-[#181c26] text-slate-200 border border-[#222734]'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-2 border-t border-[#1f2430] flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask TAI a question..."
                className="flex-1 bg-[#181c26] border border-[#222734] focus:border-[#00b4d8] text-slate-100 text-xs px-3 py-2 rounded-xl outline-none"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#00b4d8] hover:bg-[#0096c7] text-slate-950 rounded-xl font-bold transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

