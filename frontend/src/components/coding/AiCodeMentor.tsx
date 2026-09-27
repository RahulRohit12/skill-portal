import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Lightbulb,
  Bug,
  Cpu,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Code2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Key,
  Play,
  Square,
  Check,
  X,
  Trash2,
  Settings,
  ExternalLink
} from 'lucide-react';

interface AiCodeMentorProps {
  problemTitle: string;
  problemDescription: string;
  currentCode: string;
  language: string;
  lastExecutionError?: string;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  type?: 'hint' | 'bug' | 'complexity' | 'general';
  timestamp: string;
  modelUsed?: string;
}

const CANDIDATE_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.0-flash-exp',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-1.5-flash'
];

export const AiCodeMentor: React.FC<AiCodeMentorProps> = ({
  problemTitle,
  problemDescription,
  currentCode,
  language,
  lastExecutionError,
}) => {
  // Gemini API Key from localStorage or env
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('skillportal_gemini_api_key');
      if (stored) return stored;
    } catch {}
    return (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  });

  const [activeModel, setActiveModel] = useState<string>(() => {
    try {
      return localStorage.getItem('skillportal_working_gemini_model') || 'gemini-2.0-flash';
    } catch {
      return 'gemini-2.0-flash';
    }
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your Skillex Real Gemini AI Code Mentor. Stuck on "${problemTitle}"? You can speak into your microphone 🎤 or type your question!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Key Modal state
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [keyTestStatus, setKeyTestStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');
  const [keyTestMessage, setKeyTestMessage] = useState<string>('');

  // Voice Recognition (Speech-to-Text) state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Voice Output (Text-to-Speech) state
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('skillportal_voice_output') === 'true';
    } catch {
      return false;
    }
  });
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Text-to-Speech function
  const speakText = (text: string, messageId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Strip markdown formatting for natural voice readout
    const cleanText = text
      .replace(/[*#`_~]/g, '')
      .replace(/```[\s\S]*?```/g, 'Code snippet provided in chat.')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
  };

  // Toggle Microphone (Voice Prompting)
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported by your current browser. Please use Chrome or Edge for voice prompting.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      stopSpeaking();
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setIsListening(false);
    }
  };

  // Toggle voice output setting
  const toggleVoiceOutput = () => {
    const nextVal = !voiceOutputEnabled;
    setVoiceOutputEnabled(nextVal);
    try {
      localStorage.setItem('skillportal_voice_output', String(nextVal));
    } catch {}
    if (!nextVal) {
      stopSpeaking();
    }
  };

  // Dynamic discovery of working Gemini model for this API key
  const discoverWorkingModel = async (key: string): Promise<string | null> => {
    try {
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key.trim()}`
      );
      if (listRes.ok) {
        const listData = await listRes.json();
        if (Array.isArray(listData.models)) {
          const supported = listData.models.filter(
            (m: any) =>
              Array.isArray(m.supportedGenerationMethods) &&
              m.supportedGenerationMethods.includes('generateContent')
          );

          for (const cand of CANDIDATE_MODELS) {
            const match = supported.find(
              (m: any) => m.name === `models/${cand}` || m.name.endsWith(cand)
            );
            if (match) {
              const clean = match.name.replace(/^models\//, '');
              return clean;
            }
          }

          if (supported.length > 0) {
            return supported[0].name.replace(/^models\//, '');
          }
        }
      }
    } catch (e) {
      console.warn('Model discovery failed:', e);
    }
    return null;
  };

  // Test Gemini Key Connection
  const handleTestKey = async (keyToTest: string) => {
    if (!keyToTest.trim()) return;
    setKeyTestStatus('testing');
    setKeyTestMessage('Inspecting available Gemini models for your API key...');

    try {
      const cleanKey = keyToTest.trim();
      // First try listing models as instructed by Google
      const discovered = await discoverWorkingModel(cleanKey);

      const modelToTry = discovered || 'gemini-2.0-flash';

      // Test generating content
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelToTry}:generateContent?key=${cleanKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Respond with exactly: "OK"' }] }],
          }),
        }
      );

      const data = await res.json();
      if (res.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        setKeyTestStatus('valid');
        setActiveModel(modelToTry);
        localStorage.setItem('skillportal_working_gemini_model', modelToTry);
        setKeyTestMessage(`Connected to Google Gemini (${modelToTry}) successfully! 🎉`);
      } else {
        // Try fallback candidate models
        let foundWorking = false;
        for (const cand of CANDIDATE_MODELS) {
          if (cand === modelToTry) continue;
          try {
            const probeRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${cand}:generateContent?key=${cleanKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: 'Respond with: "OK"' }] }],
                }),
              }
            );
            const probeData = await probeRes.json();
            if (probeRes.ok && probeData?.candidates?.[0]?.content?.parts?.[0]?.text) {
              setKeyTestStatus('valid');
              setActiveModel(cand);
              localStorage.setItem('skillportal_working_gemini_model', cand);
              setKeyTestMessage(`Connected to Google Gemini (${cand}) successfully! 🎉`);
              foundWorking = true;
              break;
            }
          } catch {}
        }

        if (!foundWorking) {
          setKeyTestStatus('invalid');
          setKeyTestMessage(data?.error?.message || 'Invalid API key or model access restricted.');
        }
      }
    } catch (err: any) {
      setKeyTestStatus('invalid');
      setKeyTestMessage(err.message || 'Network error connecting to Gemini.');
    }
  };

  // Save Gemini Key
  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    setApiKey(trimmed);
    try {
      localStorage.setItem('skillportal_gemini_api_key', trimmed);
    } catch {}
    setShowKeyModal(false);
  };

  const handleClearKey = () => {
    setApiKey('');
    try {
      localStorage.removeItem('skillportal_gemini_api_key');
      localStorage.removeItem('skillportal_working_gemini_model');
    } catch {}
    setKeyInput('');
    setKeyTestStatus('idle');
    setKeyTestMessage('');
  };

  // Real Gemini Multi-Model Execution Engine
  const requestRealGemini = async (
    key: string,
    userPrompt: string
  ): Promise<{ text: string; model: string }> => {
    const cleanKey = key.trim();

    const systemPrompt = `You are an elite Computer Science Coding Mentor and Placement Coach at Skillex Academy.
Problem Title: ${problemTitle}
Problem Description: ${problemDescription}
Programming Language: ${language}

Student's Current Editor Code:
\`\`\`${language}
${currentCode}
\`\`\`
${lastExecutionError ? `Compiler / Runtime Error Output:\n\`\`\`\n${lastExecutionError}\n\`\`\`` : ''}

Mentor Persona:
- Warm, expert, clear, encouraging, and direct.
- If diagnosing a compiler or runtime error, pinpoint the exact line, why the compiler failed, and how the student can fix it.
- If giving a hint, provide clear intuition and algorithmic step-by-step guidance without writing out the complete solution immediately unless asked.
- If asked about Time/Space complexity, break down Big-O clearly.
- Keep formatting clean with bold text, short bullet points, and code snippets when helpful.`;

    const finalQuery = `${systemPrompt}\n\nStudent Query: ${userPrompt}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: finalQuery }],
        },
      ],
    };

    // Determine models to try in sequence
    const modelsToTry = Array.from(new Set([
      activeModel,
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-2.0-flash-exp',
      'gemini-1.5-pro-latest',
      'gemini-pro',
      'gemini-1.5-flash'
    ]));

    let lastErrorMessage = '';

    for (const model of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          setActiveModel(model);
          try {
            localStorage.setItem('skillportal_working_gemini_model', model);
          } catch {}
          return {
            text: data.candidates[0].content.parts[0].text,
            model,
          };
        }

        if (data?.error?.message) {
          lastErrorMessage = data.error.message;
          // If model is not found, continue trying the next model
          if (
            data.error.message.includes('not found') ||
            data.error.message.includes('not supported') ||
            res.status === 404
          ) {
            continue;
          } else {
            // Other error like API key invalid
            throw new Error(data.error.message);
          }
        }
      } catch (err: any) {
        if (err.message && !err.message.includes('not found') && !err.message.includes('not supported')) {
          throw err;
        }
        lastErrorMessage = err.message || 'Model probe failed';
      }
    }

    throw new Error(lastErrorMessage || 'All Gemini models exhausted.');
  };

  // AI Agent Request (Real Gemini API or Heuristic fallback)
  const callAiAgent = async (promptType: 'hint' | 'bug' | 'complexity' | 'custom', userQuery?: string) => {
    setLoading(true);
    stopSpeaking();

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let userPromptText = '';

    if (promptType === 'hint') {
      userPromptText = 'Can you give me a strategic hint for solving this problem without spoiling the full code?';
    } else if (promptType === 'bug') {
      userPromptText = lastExecutionError
        ? `I got this error during execution: "${lastExecutionError}". Can you explain why it happened in my code and how to fix it?`
        : 'Can you check my current code for logical bugs or edge-case oversights?';
    } else if (promptType === 'complexity') {
      userPromptText = 'What is the Time and Space complexity of my current solution, and how can it be optimized?';
    } else {
      userPromptText = userQuery || input;
    }

    if (!userPromptText.trim()) {
      setLoading(false);
      return;
    }

    // Add user message to chat
    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: userPromptText,
      timestamp: now,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (promptType === 'custom') setInput('');

    try {
      let replyText = '';
      let usedModel = '';

      if (apiKey && apiKey.trim().length > 10) {
        // REAL GEMINI API CALL WITH MULTI-MODEL RESILIENCE
        try {
          const geminiResult = await requestRealGemini(apiKey, userPromptText);
          replyText = geminiResult.text;
          usedModel = geminiResult.model;
        } catch (apiErr: any) {
          replyText = `⚠️ **Gemini API Notice**: ${apiErr.message || 'Could not connect to Gemini'}\n\n*Falling back to local mentor engine...*\n\n` + getFallbackReply(promptType, userPromptText);
        }
      } else {
        // Zero-config intelligent local engine
        await new Promise((r) => setTimeout(r, 600));
        replyText = getFallbackReply(promptType, userPromptText);
      }

      const aiMsgId = String(Date.now() + 1);
      const aiMsg: Message = {
        id: aiMsgId,
        sender: 'ai',
        text: replyText,
        modelUsed: usedModel || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // If voice output is enabled, speak response aloud!
      if (voiceOutputEnabled) {
        speakText(replyText, aiMsgId);
      }
    } catch (e: any) {
      const fallbackMsg = getFallbackReply(promptType, userPromptText);
      const aiMsgId = String(Date.now() + 1);
      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          sender: 'ai',
          text: fallbackMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      if (voiceOutputEnabled) {
        speakText(fallbackMsg, aiMsgId);
      }
    } finally {
      setLoading(false);
    }
  };

  const getFallbackReply = (promptType: string, userPromptText: string) => {
    if (promptType === 'hint') {
      return `💡 **Intuition & Hint for "${problemTitle}"**:
1. **Core Data Structure**: Think about lookup complexity. If you are scanning elements in nested loops (taking O(N²)), consider using a **HashMap** or **HashSet** to store seen items for O(1) lookups.
2. **Boundary & Edge Cases**:
   - Empty input collection or single item.
   - Negative indices or values.
   - Duplicates in input.
3. **Step 1**: Initialize auxiliary state before the loop.
4. **Step 2**: Iterate through the input once, checking your target condition before insertion.`;
    } else if (promptType === 'bug') {
      if (lastExecutionError) {
        return `🐛 **Bug & Error Diagnosis**:
Your code threw: \`${lastExecutionError}\`

**Root Cause Analysis**:
- **Syntax / Character Errors**: Look closely at illegal characters like lone backslashes \`\\\` or unclosed operator statements \`x * y *\`.
- **Operator Incompletion**: In expressions like \`x * y *\`, an operand is missing after the multiplication operator.
- **Array Bounds / Indexing**: Ensure loop boundary is \`i < arr.length\` rather than \`i <= arr.length\`.
- **Null Reference**: Verify objects are instantiated before accessing properties.`;
      }
      return `🔍 **Sanity Check & Code Review**:
- **Return Value**: Check whether every logical branch returns the expected type.
- **Variable Reset**: Check if loop variables reset correctly between iterations.
- **Input Edge Cases**: Test what happens when input is empty or has length 1.`;
    } else if (promptType === 'complexity') {
      const hasNestedLoops = /for.*for|while.*for|for.*while/s.test(currentCode);
      return `⚡ **Big-O Complexity Analysis**:
- **Time Complexity**: ${
        hasNestedLoops
          ? '**O(N²)** — Nested loops detected. For large inputs (N ≥ 10⁵), this may cause Time Limit Exceeded (TLE). Can you optimize it to **O(N)** or **O(N log N)**?'
          : '**O(N)** — Linear single-pass runtime. Highly optimal for competitive programming and product company interviews!'
      }
- **Space Complexity**: **O(1)** if solved in-place, or **O(N)** if using auxiliary hash table storage.
- **Recruiter Perspective**: At Google, Amazon, and Microsoft, demonstrating an optimization from O(N²) to O(N) is the key grading factor for SDE-1 roles.`;
    }
    return `🤖 **Skillex Mentor Advice**:
Regarding your question: "${userPromptText}"
In **${language}**, make sure to:
1. Validate inputs and handle edge boundaries.
2. Keep time complexity under ~10⁷ operations per second limit.
3. Use clean variable naming to impress technical interviewers.

Make the adjustments in your editor and click **Run Code** to verify against test cases!`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0e1118] text-slate-200">
      {/* Mentor Header */}
      <div className="p-3.5 bg-[#12151c] border-b border-[#1f2430] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-[#00c2ff] flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Bot className="w-4 h-4" />
            </div>
            {apiKey && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#12151c]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs font-black text-white">Skillex AI Code Mentor</h4>
              <button
                onClick={() => {
                  setKeyInput(apiKey);
                  setShowKeyModal(true);
                }}
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                  apiKey
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                    : 'bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25'
                }`}
                title="Click to configure Gemini API Key"
              >
                <Sparkles className="w-2.5 h-2.5" />
                <span>{apiKey ? `Gemini Active (${activeModel})` : 'Configure Gemini Key'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">Voice Prompting &bull; Real Gemini AI &bull; Audio Output</p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-1.5">
          {/* Voice Output Toggle */}
          <button
            onClick={toggleVoiceOutput}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              voiceOutputEnabled
                ? 'bg-[#00c2ff]/15 text-[#00c2ff] border-[#00c2ff]/40 shadow-sm shadow-[#00c2ff]/20'
                : 'bg-[#181c26] text-slate-400 border-[#232938] hover:text-slate-200'
            }`}
            title={voiceOutputEnabled ? 'Voice Output: ON (AI will speak answers)' : 'Voice Output: OFF'}
          >
            {voiceOutputEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Key Settings Button */}
          <button
            onClick={() => {
              setKeyInput(apiKey);
              setShowKeyModal(true);
            }}
            className="p-1.5 rounded-lg bg-[#181c26] hover:bg-[#202534] text-slate-400 hover:text-amber-300 border border-[#232938] transition-all cursor-pointer"
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
          </button>

          {/* Reset Chat */}
          <button
            onClick={() => {
              stopSpeaking();
              setMessages([
                {
                  id: 'welcome',
                  sender: 'ai',
                  text: `Chat reset. Ask me anything about "${problemTitle}" via text or voice!`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
            }}
            className="p-1.5 rounded-lg bg-[#181c26] hover:bg-[#202534] text-slate-400 hover:text-rose-400 border border-[#232938] transition-all cursor-pointer"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="p-2.5 bg-[#10131b] border-b border-[#1f2430] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => callAiAgent('hint')}
          disabled={loading}
          className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Get Hint</span>
        </button>

        <button
          onClick={() => callAiAgent('bug')}
          disabled={loading}
          className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Bug className="w-3.5 h-3.5" />
          <span>Explain Bug</span>
        </button>

        <button
          onClick={() => callAiAgent('complexity')}
          disabled={loading}
          className="px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Big-O Analysis</span>
        </button>

        {speechSupported && (
          <button
            onClick={toggleListening}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/30 text-purple-300'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isListening ? 'Listening...' : 'Voice Prompt'}</span>
          </button>
        )}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((m) => {
          const isAi = m.sender === 'ai';
          const isSpeaking = speakingMessageId === m.id;

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[92%] rounded-2xl p-3.5 space-y-2 leading-relaxed shadow-sm relative group ${
                  isAi
                    ? 'bg-[#141824] border border-[#22293d] text-slate-200'
                    : 'bg-gradient-to-r from-blue-600 to-sky-600 text-white font-medium'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 pb-1.5 border-b border-white/5">
                  <span className="font-bold flex items-center gap-1">
                    {isAi ? <Bot className="w-3 h-3 text-purple-400" /> : null}
                    {isAi ? `AI Mentor (${m.modelUsed || 'Gemini'})` : 'You'}
                  </span>

                  <div className="flex items-center gap-2">
                    <span>{m.timestamp}</span>

                    {/* AI Message Action Buttons */}
                    {isAi && (
                      <div className="flex items-center gap-1">
                        {/* Read Aloud Button */}
                        <button
                          onClick={() => speakText(m.text, m.id)}
                          className={`p-1 rounded hover:bg-white/10 transition-colors ${
                            isSpeaking ? 'text-[#00c2ff]' : 'text-slate-400 hover:text-slate-200'
                          }`}
                          title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                        >
                          {isSpeaking ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3" />}
                        </button>

                        {/* Copy Button */}
                        <button
                          onClick={() => copyToClipboard(m.text, m.id)}
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
                          title="Copy response"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Text */}
                <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2.5 text-slate-400 text-xs p-3.5 rounded-2xl bg-[#141824] border border-[#22293d] max-w-[80%]">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
            <div className="space-y-0.5">
              <span className="font-bold text-white block">Gemini AI is analyzing...</span>
              <span className="text-[10px] text-slate-400 block">Inspecting your Monaco code and problem constraints</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Prompting Waveform Indicator */}
      {isListening && (
        <div className="px-3.5 py-2 bg-rose-500/10 border-t border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="font-bold">Listening to your voice... Speak your question</span>
          </div>
          <button
            onClick={toggleListening}
            className="text-[11px] font-bold text-rose-300 hover:text-white px-2 py-0.5 rounded bg-rose-500/20"
          >
            Done Speaking
          </button>
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 bg-[#12151c] border-t border-[#1f2430]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim() && !loading) {
              callAiAgent('custom');
            }
          }}
          className="flex items-center gap-2"
        >
          {/* Microphone Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-950/60 animate-pulse'
                  : 'bg-[#161a24] hover:bg-[#1f2533] text-purple-400 border-[#232a3d] hover:border-purple-500/50'
              }`}
              title={isListening ? 'Click to stop listening' : 'Click to speak your prompt'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to speech...'
                : 'Ask Gemini in English or click 🎤 to speak...'
            }
            className="flex-1 bg-[#161a24] border border-[#232a3d] focus:border-purple-500 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 outline-none transition-all placeholder:text-slate-500"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-[#00c2ff] hover:from-purple-500 hover:to-[#00c2ff] text-white font-bold transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-purple-950/40"
            title="Send query to Gemini AI"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* ==================== GEMINI API KEY MODAL ==================== */}
      {showKeyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowKeyModal(false)}
        >
          <div
            className="bg-[#0e1118] border border-[#1f2430] w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowKeyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-[#141824]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Google Gemini API Configuration</h3>
                <p className="text-[11px] text-slate-400">Active Model: {activeModel}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Enter your Gemini API Key
              </label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setKeyTestStatus('idle');
                }}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 bg-[#141824] border border-[#22293d] focus:border-purple-500 text-white rounded-xl text-xs font-mono outline-none"
              />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Need a free key? Get one instantly from{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00c2ff] hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  Google AI Studio <ExternalLink className="w-3 h-3" />
                </a>.
              </p>
            </div>

            {/* Test result status message */}
            {keyTestStatus !== 'idle' && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                  keyTestStatus === 'valid'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : keyTestStatus === 'invalid'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-[#141824] border-[#22293d] text-slate-300'
                }`}
              >
                {keyTestStatus === 'testing' && <RefreshCw className="w-4 h-4 animate-spin text-purple-400 shrink-0" />}
                {keyTestStatus === 'valid' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {keyTestStatus === 'invalid' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span className="text-[11px]">{keyTestMessage}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between gap-2">
              {apiKey ? (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                >
                  Remove Key
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTestKey(keyInput)}
                  disabled={!keyInput.trim() || keyTestStatus === 'testing'}
                  className="px-3.5 py-2 bg-[#181c26] hover:bg-[#202534] text-slate-300 rounded-xl text-xs font-bold border border-[#232938] transition-all cursor-pointer disabled:opacity-50"
                >
                  Test Key
                </button>

                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-[#00c2ff] hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiCodeMentor;
