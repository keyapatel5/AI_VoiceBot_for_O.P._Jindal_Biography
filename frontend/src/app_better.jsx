import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "";
const cn = (...classes) => classes.filter(Boolean).join(' ');

export default function App() {
  const [step, setStep] = useState('splash');
  const [messages, setMessages] = useState([{ role: 'ai', text: "Welcome. I am O.P. Jindal." }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const videoRef = useRef(null);

  const mediaRef = useRef(null);
  const chunks = useRef([]);
  const endRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (step === 'splash') setTimeout(() => setStep('main'), 3000);
  }, [step]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const playAudio = (audioData) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Start video if not already playing
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => { });
      }

      const src = `data:audio/mpeg;base64,${audioData}`;
      const audio = new Audio(src);
      audioRef.current = audio;

      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
        audioRef.current = null;
      };
      audio.onerror = (e) => {
        console.error("Audio error:", e);
        setIsSpeaking(false);
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
        audioRef.current = null;
      };

      audio.play().catch(err => {
        console.error("Audio play failed:", err);
        setIsSpeaking(false);
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
        audioRef.current = null;
      });
    } catch (e) {
      console.error("Audio setup error:", e);
      setIsSpeaking(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  };

  const processResponse = async (res) => {
    try {
      const data = await res.json();
      if (data.user_text) setMessages(prev => [...prev, { role: 'user', text: data.user_text }]);
      const aiText = data.text ?? data.response ?? data.answer ?? data.reply ?? "";
      setMessages(prev => [...prev, { role: 'ai', text: aiText || "No answer received." }]);
      if (data.audio_data) playAudio(data.audio_data);
    } catch (e) {
      console.error("Error parsing response", e);
    }
    setLoading(false);
  };

  const handleSendText = async () => {
    if (!input.trim() || loading) return;
    const txt = input;
    setMessages(p => [...p, { role: 'user', text: txt }]);
    setLoading(true);
    setInput('');
    try {
      const res = await fetch(`${API_URL}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: txt })
      });
      await processResponse(res);
    } catch { setLoading(false); }
  };

  const startVoice = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRef.current = new MediaRecorder(s);
      chunks.current = [];
      mediaRef.current.ondataavailable = e => chunks.current.push(e.data);
      mediaRef.current.onstop = async () => {
        setLoading(true);
        const fd = new FormData();
        fd.append("file", new Blob(chunks.current, { type: "audio/webm" }), "in.webm");
        try {
          const res = await fetch(`${API_URL}/voice_chat/`, { method: "POST", body: fd });
          await processResponse(res);
        } catch (err) { console.error(err); setLoading(false); }
      };
      mediaRef.current.start();
      setIsRecording(true);
    } catch { alert("Mic blocked"); }
  };

  return (
    <div className="h-screen w-full bg-[#FAF9F6] text-stone-900 flex items-center justify-center font-sans overflow-hidden relative">
      <AnimatePresence mode="wait">

        {/* SPLASH — same on all devices */}
        {step === 'splash' ? (
          <motion.div key="s" exit={{ opacity: 0 }} className="text-center px-4">
            <h1 className="text-5xl sm:text-7xl font-serif tracking-tighter">O.P. JINDAL</h1>
            <p className="text-stone-400 tracking-[0.6em] mt-4 uppercase font-bold text-xs sm:text-sm">Digital Legacy</p>
          </motion.div>

        ) : (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col p-4 sm:p-6 lg:p-12"
          >
            {/* MAIN BODY */}
            <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-12 overflow-hidden min-h-0">

              {/* LEFT: CHRONOLOGY — desktop only */}
              <aside className="hidden lg:flex flex-col w-[300px] xl:w-[350px] border-r border-stone-200 pr-8 xl:pr-12 overflow-y-auto no-scrollbar shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-10">Chronology</p>
                <div className="space-y-8">
                  {messages.map((m, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-[9px] font-bold text-stone-300 uppercase">{m.role}</p>
                      <p className="text-xs leading-relaxed text-stone-600">{m.text}</p>
                    </div>
                  ))}
                  {loading && <div className="text-[10px] animate-pulse text-stone-400 uppercase">Generating...</div>}
                  <div ref={endRef} />
                </div>
              </aside>

              {/* RIGHT: PORTRAIT + SEARCH — all devices */}
              <div className="flex-1 flex flex-col min-h-0">

                {/* PORTRAIT */}
                <main className="flex-1 flex flex-col items-center justify-center relative min-h-0">
                  <div
  className={cn(
    "rounded-full overflow-hidden relative shadow-2xl transition-all duration-1000",
    "w-52 h-52 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[420px] lg:h-[420px] xl:w-[500px] xl:h-[500px]",
    isSpeaking ? "scale-105" : "grayscale-[0.8] opacity-80"
  )}
>
                    <video
                      ref={videoRef}
                      src="/avatar.mp4"
                      poster="/op.png"
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover rounded-full scale-[1.05]"
                      style={{ objectPosition: 'center 15%' }}
                    />
                  </div>

                  <div className="mt-6 sm:mt-10 text-center">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif tracking-tight">Om Prakash Jindal</h2>
                    <p className="text-stone-400 text-[10px] uppercase tracking-[0.4em] mt-2 font-bold">
                      {isSpeaking ? 'Speaking' : 'Ready'}
                    </p>
                  </div>
                </main>

                {/* SEARCH BAR */}
                <footer className="w-full pt-4 pb-4 sm:pb-6 lg:pb-8 shrink-0">
                  <div className="flex items-center bg-white border border-stone-200 p-1.5 sm:p-2 rounded-full shadow-sm focus-within:border-stone-900 transition-all w-full">
                    <button
                      onClick={() => { if (isRecording) { mediaRef.current?.stop(); setIsRecording(false); } else { startVoice(); } }}
                      className={cn(
                        "w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all shrink-0",
                        isRecording ? "bg-red-500 text-white" : "bg-stone-50 text-stone-900"
                      )}
                    >
                      {loading ? <Loader2 className="animate-spin text-stone-400" size={18} /> : <Mic size={18} />}
                    </button>

                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Inquire about the journey..."
                      className="flex-1 bg-transparent border-none outline-none px-3 sm:px-6 text-sm font-light min-w-0"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                      disabled={loading}
                    />

                    <button
                      onClick={handleSendText}
                      disabled={loading}
                      className="text-stone-400 hover:text-stone-900 mr-2 sm:mr-4 transition-colors shrink-0"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </footer>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}