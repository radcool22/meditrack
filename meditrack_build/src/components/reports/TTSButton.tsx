'use client';

import { useState } from 'react';
import { Volume2, Languages, Loader2 } from 'lucide-react';

interface TTSButtonProps {
  text: string;
}

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'bn', label: 'Bengali' },
  { code: 'mr', label: 'Marathi' },
];

export default function TTSButton({ text }: TTSButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showLangs, setShowLangs] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = async (language: string = 'en') => {
    setLoading(true);
    setShowLangs(false);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      if (!res.ok) throw new Error('Failed to generate speech');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      const audio = new Audio(url);
      audio.onended = () => setPlaying(false);
      audio.play();
      setPlaying(true);
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-1">
      <button
        onClick={() => handlePlay('en')}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
        {playing ? 'Playing...' : 'Listen'}
      </button>

      <button
        onClick={() => setShowLangs(!showLangs)}
        className="p-2 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
        title="Change language"
      >
        <Languages className="w-4 h-4" />
      </button>

      {showLangs && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10 min-w-[140px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handlePlay(lang.code)}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}

      {audioUrl && !playing && (
        <audio src={audioUrl} className="hidden" />
      )}
    </div>
  );
}
