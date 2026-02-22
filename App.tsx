import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Play, Layout, Plus, Type, FileText, List, Table as TableIcon, CheckSquare, Info, X, ChevronUp, ChevronDown, Trash2, MonitorPlay, Download, Image as ImageIcon } from 'lucide-react';

// ==========================================
// REFACTORING HINTS FOR IDE:
// This single-file monolithic React app should be split into a standard Vite modular structure.
// Recommended folder structure:
// - /src/types/index.ts              (for SlideType, SlideData, Slide)
// - /src/constants/index.ts          (for THEMES, DEFAULT_SLIDES, TEMPLATE_GUIDE)
// - /src/services/aiService.ts       (for generateSlidesFromAI)
// - /src/components/ui/              (for EditableText)
// - /src/components/slides/          (for MainSlide, TocSlide, TableSlide, etc.)
// - /src/components/SlideRenderer.tsx(Master renderer)
// - /src/App.tsx                     (Main layout, sidebar, and state management)
// ==========================================

// --- Types & Schemas ---
// [REFACTOR HINT]: Extract to /src/types/index.ts
type SlideType = 'main' | 'toc' | 'main_point' | 'secondary_point' | 'table' | 'image' | 'end';

interface SlideData {
  title?: string;
  subtitle?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
  imageUrl?: string;
  notes?: string;
}

interface Slide {
  id: string;
  type: SlideType;
  data: SlideData;
}

// --- Constants & Default Data ---
// [REFACTOR HINT]: Extract to /src/constants/index.ts
const THEMES = [
  { id: 'midnight', name: 'Midnight Indigo' },
  { id: 'corporate', name: 'Corporate Slate' },
  { id: 'neon', name: 'Cyberpunk Neon' }
];

// Default placeholder presentation
const DEFAULT_SLIDES: Slide[] = [
  {
    id: '1',
    type: 'main',
    data: { title: 'The Future of Web Apps', subtitle: 'Building smart, scalable presentations with AI', notes: 'Welcome the audience and set the tone for the presentation.' }
  },
  {
    id: '2',
    type: 'image',
    data: { title: 'A New Perspective', imageUrl: 'https://image.pollinations.ai/prompt/abstract-geometric-shapes-glowing-blue-and-purple-dark-background?width=1920&height=1080&nologo=true', notes: 'Mention how visualizing data opens up new opportunities.' }
  },
  {
    id: '3',
    type: 'main_point',
    data: { title: 'The DOM is the perfect styling engine.', subtitle: 'Leveraging HTML and CSS gives us native accessibility and instant global theming.', notes: 'Compare this to canvas-based solutions like Figma.' }
  }
];

const TEMPLATE_GUIDE: { type: SlideType; name: string; desc: string; mock: Slide }[] = [
  { type: 'main', name: 'Main Title', desc: 'The opening slide. Needs a big bold title and an optional subtitle.', mock: { id: 'm1', type: 'main', data: { title: 'Project Apollo', subtitle: 'Reaching for the stars in Q4' } } },
  { type: 'toc', name: 'Table of Contents', desc: 'Displays a numbered list of topics or agenda items.', mock: { id: 'm2', type: 'toc', data: { title: 'Agenda', items: ['Introduction', 'Market Analysis', 'Financials', 'Q&A'] } } },
  { type: 'main_point', name: 'Main Point', desc: 'A dramatic, high-impact slide for emphasizing a single core idea.', mock: { id: 'm3', type: 'main_point', data: { title: 'Growth is accelerating.', subtitle: 'We have seen a 40% YoY increase in users.' } } },
  { type: 'secondary_point', name: 'Detailed List', desc: 'Perfect for bullet points or features. Displays items in a clean grid.', mock: { id: 'm4', type: 'secondary_point', data: { title: 'Key Features', items: ['End-to-end encryption', 'Real-time collaboration', 'Offline mode', 'Cloud backups'] } } },
  { type: 'table', name: 'Data Table', desc: 'Best for structured tabular data. Automatically handles columns and rows cleanly.', mock: { id: 'm5', type: 'table', data: { title: 'Q3 Financials', headers: ['Metric', 'Target', 'Actual'], rows: [['Revenue', '$1.2M', '$1.5M'], ['Churn', '5%', '3.2%']] } } },
  { type: 'image', name: 'Image Focus', desc: 'Showcases a massive image. The AI will generate a custom image URL for you.', mock: { id: 'm7', type: 'image', data: { title: 'Visual Expansion', imageUrl: 'https://image.pollinations.ai/prompt/vibrant-sunset-over-futuristic-city?width=1920&height=1080&nologo=true' } } },
  { type: 'end', name: 'End / Thank You', desc: 'The closing slide. Uses a vivid gradient text to leave a strong final impression.', mock: { id: 'm6', type: 'end', data: { title: 'Thank You', subtitle: 'Questions? Contact hello@slideai.com' } } }
];

// --- AI Service ---
// [REFACTOR HINT]: Extract to /src/services/aiService.ts
const generateSlidesFromAI = async (inputText: string): Promise<Slide[]> => {
  const apiKey = ""; // API key is provided by the execution environment
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const systemInstruction = `
    You are an expert presentation designer. Convert the user's raw text into a structured presentation.
    You MUST output valid JSON matching this schema. 
    Choose the best slide template for each piece of content.
    Available slide types: "main", "toc", "main_point", "secondary_point", "table", "image", "end".
    
    CRITICAL INSTRUCTION FOR "image" SLIDES:
    If you use the "image" slide type, you MUST provide an 'imageUrl' property. Construct the URL dynamically using this exact format:
    https://image.pollinations.ai/prompt/{detailed-visual-description}?width=1920&height=1080&nologo=true
    Replace {detailed-visual-description} with a highly descriptive, hyphenated search term (e.g., futuristic-corporate-office-with-blue-lighting).
  `;

  const schema = {
    type: "OBJECT",
    properties: {
      slides: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            type: { type: "STRING", enum: ["main", "toc", "main_point", "secondary_point", "table", "image", "end"] },
            title: { type: "STRING" }, subtitle: { type: "STRING" },
            items: { type: "ARRAY", items: { type: "STRING" } },
            headers: { type: "ARRAY", items: { type: "STRING" } },
            rows: { type: "ARRAY", items: { type: "ARRAY", items: { type: "STRING" } } },
            imageUrl: { type: "STRING" }
          },
          required: ["type", "title"]
        }
      }
    }
  };

  const payload = {
    contents: [{ parts: [{ text: inputText }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: { responseMimeType: "application/json", responseSchema: schema }
  };

  let retries = 5; let delay = 1000;
  while (retries > 0) {
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) throw new Error("Empty response from AI");
      const parsed = JSON.parse(textResponse);
      
      return parsed.slides.map((s: any) => ({
        id: Math.random().toString(36).substring(7),
        type: s.type || 'main',
        data: {
          title: s.title ? String(s.title) : undefined,
          subtitle: s.subtitle ? String(s.subtitle) : undefined,
          imageUrl: s.imageUrl ? String(s.imageUrl) : undefined,
          items: Array.isArray(s.items) ? s.items.map(String) : undefined,
          headers: Array.isArray(s.headers) ? s.headers.map(String) : undefined,
          rows: Array.isArray(s.rows) ? s.rows.map((row: any) => Array.isArray(row) ? row.map(String) : []) : undefined
        }
      }));
    } catch (error) {
      retries--;
      if (retries === 0) throw error;
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }
  return [];
};


// --- UI Components ---
// [REFACTOR HINT]: Extract to /src/components/ui/EditableText.tsx

// Editable text component for inline editing
const EditableText = ({ text, tag: Tag = 'div', className, onChange }: any) => {
  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (e.currentTarget.textContent !== text) {
      onChange(e.currentTarget.textContent || '');
    }
  };
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      className={`editable-text transition-all ${className}`}
      onBlur={handleBlur}
    >
      {text || 'Click to edit'}
    </Tag>
  );
};


// --- Slide Template Components ---
// [REFACTOR HINT]: Extract each component below to its own file in /src/components/slides/

const MainSlide = ({ data, updateData }: any) => (
  <div className="flex flex-col items-center justify-center h-full w-full text-center px-40 relative z-10">
    <EditableText tag="h1" text={data.title} onChange={(val: string) => updateData({ title: val })} className="text-8xl font-bold text-[var(--slide-text-main)] mb-12 tracking-tight leading-tight drop-shadow-lg" />
    <EditableText tag="p" text={data.subtitle} onChange={(val: string) => updateData({ subtitle: val })} className="text-5xl text-[var(--slide-accent-sub)] font-light max-w-6xl drop-shadow-md" />
  </div>
);

// --- Master Renderer ---
// [REFACTOR HINT]: Extract to /src/components/SlideRenderer.tsx. Remember to import the individual slide components.
const SlideRenderer = ({ slide, updateSlideData }: { slide: Slide, updateSlideData?: (id: string, newData: Partial<SlideData>) => void }) => {
  const handleUpdate = (newData: Partial<SlideData>) => {
    if (updateSlideData) updateSlideData(slide.id, newData);
  };

  let content;
  switch (slide.type) {
    case 'main': content = <MainSlide data={slide.data} updateData={handleUpdate} />; break;
    case 'toc': content = <TocSlide data={slide.data} updateData={handleUpdate} />; break;
    case 'main_point': content = <MainPointSlide data={slide.data} updateData={handleUpdate} />; break;
    case 'secondary_point': content = <SecondaryPointSlide data={slide.data} updateData={handleUpdate} />; break;
    case 'table': content = <TableSlide data={slide.data} updateData={handleUpdate} />; break;
    case 'image': content = <ImageSlide data={slide.data} updateData={handleUpdate} />; break;
    case 'end': content = <EndSlide data={slide.data} updateData={handleUpdate} />; break;
    default: content = <div className="text-white text-6xl flex items-center justify-center h-full relative z-10">Unknown Template</div>;
  }

  // Ensure DOM scaling wrapper gets an ID so html2canvas can target it cleanly!
  return (
    <div id="slide-canvas-content" key={slide.id} className="absolute inset-0 bg-[var(--slide-bg)] overflow-hidden animate-slide-in">
      <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 z-0" style={{ backgroundColor: 'var(--slide-accent)', opacity: 0.15 }} />
      <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[100px] pointer-events-none transition-colors duration-1000 z-0" style={{ backgroundColor: 'var(--slide-accent-sub)', opacity: 0.15 }} />
      {content}
    </div>
  );
};


// --- Main Application ---
// [REFACTOR HINT]: Keep this as /src/App.tsx, but import all the extracted components, types, and services.
export default function App() {
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [theme, setTheme] = useState('midnight');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Restore Poppins Font dynamically
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => link.remove();
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.isContentEditable) return;
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentIndex(prev => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(prev => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  // Fullscreen tracking
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Scaling math
  useEffect(() => {
    const calculateScale = () => {
      if (!canvasWrapperRef.current) return;
      const { clientWidth, clientHeight } = canvasWrapperRef.current;
      const scaleX = clientWidth / 1920;
      const scaleY = clientHeight / 1080;
      setScale(document.fullscreenElement ? Math.min(scaleX, scaleY) : Math.min(scaleX, scaleY) * 0.95);
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasWrapperRef.current?.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const handleExportPNG = async () => {
    const element = document.getElementById('slide-canvas-content');
    if (!element) return;
    
    setIsExporting(true);
    try {
      // Dynamically load html2canvas to save app bundle size initially
      if (!(window as any).html2canvas) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      
      const html2canvas = (window as any).html2canvas;
      // useCORS allows us to capture the external Unsplash/Pollinations images
      const canvas = await html2canvas(element, { scale: 1, useCORS: true, backgroundColor: null });
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `Slide_${currentIndex + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
      alert("Export failed. Make sure any external images allow cross-origin rendering.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setIsGenerating(true); setError('');
    try {
      const generatedSlides = await generateSlidesFromAI(inputText);
      if (generatedSlides.length > 0) {
        setSlides(generatedSlides);
        setCurrentIndex(0);
      } else setError("AI didn't return any slides.");
    } catch (err: any) {
      setError(err.message || "Failed to generate presentation.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Slide Management Handlers ---
  const updateSlideData = (id: string, newData: Partial<SlideData>) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, data: { ...s.data, ...newData } } : s));
  };

  const addBlankSlide = () => {
    const newSlide: Slide = { id: Math.random().toString(36).substring(7), type: 'main_point', data: { title: 'New Slide', subtitle: 'Click to edit' } };
    setSlides([...slides, newSlide]);
    setCurrentIndex(slides.length);
  };

  const deleteSlide = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (slides.length <= 1) return;
    setSlides(prev => prev.filter((_, i) => i !== index));
    if (currentIndex >= index && currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const moveSlide = (e: React.MouseEvent, index: number, direction: -1 | 1) => {
    e.stopPropagation();
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === slides.length - 1) return;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[index + direction];
    newSlides[index + direction] = temp;
    setSlides(newSlides);
    setCurrentIndex(index + direction);
  };

  const currentSlide = slides[currentIndex];

  const getSlideIcon = (type: SlideType) => {
    switch(type) {
      case 'main': return <Layout size={16} />; case 'toc': return <List size={16} />;
      case 'main_point': return <Type size={16} />; case 'secondary_point': return <FileText size={16} />;
      case 'table': return <TableIcon size={16} />; case 'image': return <ImageIcon size={16} />; 
      case 'end': return <Play size={16} />; default: return <Layout size={16} />;
    }
  };

  return (
    <div className={`flex h-screen w-full bg-neutral-950 text-slate-200 overflow-hidden theme-${theme}`} style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      <style>{`
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-in { animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .theme-midnight { --slide-bg: #0f172a; --slide-text-main: #ffffff; --slide-text-sub: #94a3b8; --slide-accent: #6366f1; --slide-accent-sub: #818cf8; --slide-card-bg: rgba(30, 41, 59, 0.5); --slide-border: #334155; }
        .theme-corporate { --slide-bg: #f8fafc; --slide-text-main: #0f172a; --slide-text-sub: #475569; --slide-accent: #0284c7; --slide-accent-sub: #0369a1; --slide-card-bg: #ffffff; --slide-border: #e2e8f0; }
        .theme-neon { --slide-bg: #09090b; --slide-text-main: #ffffff; --slide-text-sub: #a1a1aa; --slide-accent: #ec4899; --slide-accent-sub: #22d3ee; --slide-card-bg: rgba(24, 24, 27, 0.8); --slide-border: #ec4899; }

        .editable-text:hover { outline: 2px dashed var(--slide-accent-sub); outline-offset: 8px; border-radius: 4px; cursor: text; }
        .editable-text:focus { outline: 3px solid var(--slide-accent) !important; outline-offset: 8px; border-radius: 4px; cursor: text; background: rgba(0,0,0,0.2); }
      `}</style>

      {/* Left Sidebar */}
      <div className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col z-20 shadow-xl shrink-0">
        <div className="p-6 border-b border-neutral-800 flex items-center gap-2">
          <Layout className="text-indigo-500" /> <h1 className="text-xl font-bold text-white">SlideAI</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-neutral-700">
          {slides.map((slide, index) => (
            <div key={slide.id} className="relative group">
              <button
                onClick={() => setCurrentIndex(index)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex flex-col gap-2 ${currentIndex === index ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300' : 'bg-neutral-800 border-transparent text-slate-400 hover:bg-neutral-700 hover:text-slate-200'}`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                  {getSlideIcon(slide.type)} <span>Slide {index + 1}</span>
                </div>
                <span className="text-sm font-medium truncate w-full block text-white">{slide.data?.title || 'Untitled Slide'}</span>
              </button>
              
              <div className="absolute right-2 top-2 hidden group-hover:flex flex-col gap-1 bg-neutral-900 shadow-md rounded border border-neutral-700 p-1 z-10">
                <button onClick={(e) => moveSlide(e, index, -1)} disabled={index === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30"><ChevronUp size={14}/></button>
                <button onClick={(e) => moveSlide(e, index, 1)} disabled={index === slides.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30"><ChevronDown size={14}/></button>
                <button onClick={(e) => deleteSlide(e, index)} disabled={slides.length === 1} className="p-1 text-red-400 hover:text-red-300 disabled:opacity-30"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
          <button onClick={addBlankSlide} className="w-full flex items-center justify-center gap-2 p-3 mt-4 rounded-lg border border-dashed border-neutral-700 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 transition-colors text-sm font-medium">
            <Plus size={16} /> Add Blank Slide
          </button>
        </div>

        <div className="p-4 border-t border-neutral-800 shrink-0">
          <button onClick={() => setShowInfo(true)} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-slate-300 transition-colors text-sm font-medium">
            <Info size={16} className="text-indigo-400" /> Template Guide
          </button>
        </div>
      </div>

      {/* Center Column */}
      <div className="flex-1 flex flex-col relative bg-[#1a1a1a] min-w-0">
        
        {/* Top toolbar */}
        <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6 z-20 shrink-0">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-slate-400 flex items-center gap-2">
              Theme:
              <select value={theme} onChange={(e) => setTheme(e.target.value)} className="bg-neutral-800 text-xs text-white border border-neutral-700 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-semibold">
                {THEMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 mr-2">1920x1080 ({(scale * 100).toFixed(0)}%)</span>
            <button onClick={handleExportPNG} disabled={isExporting} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-sm font-medium transition-colors border border-neutral-700 disabled:opacity-50">
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
              <span className="hidden sm:inline">Export PNG</span>
            </button>
            <button onClick={toggleFullscreen} className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-bold shadow-lg transition-colors">
              <MonitorPlay size={16} /> Present
            </button>
          </div>
        </div>

        {/* Canvas Wrapper */}
        <div ref={canvasWrapperRef} className={`flex-1 flex items-center justify-center overflow-hidden relative ${isFullscreen ? 'bg-black' : 'p-4 sm:p-8 bg-[#1a1a1a]'}`}>
          <div className="relative shadow-2xl bg-[#0f172a]" style={{ width: `${1920 * scale}px`, height: `${1080 * scale}px` }}>
            <div className="overflow-hidden absolute top-0 left-0" style={{ width: '1920px', height: '1080px', transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              {currentSlide && currentSlide.data ? (
                <SlideRenderer slide={currentSlide} updateSlideData={updateSlideData} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500 text-4xl">No slides left.</div>
              )}
            </div>
          </div>
          {isFullscreen && (
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 text-sm tracking-widest font-mono uppercase bg-black/40 px-4 py-2 rounded-full pointer-events-none">
               Use arrows to navigate • ESC to exit
             </div>
          )}
        </div>

        {/* Speaker Notes Area (Hidden in Fullscreen) */}
        {!isFullscreen && (
          <div className="h-40 bg-neutral-900 border-t border-neutral-800 flex flex-col z-20 shrink-0">
             <div className="px-6 py-2 border-b border-neutral-800 bg-neutral-950/50 flex items-center gap-2">
               <FileText size={14} className="text-slate-500"/>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Speaker Notes</span>
             </div>
             <textarea 
               value={currentSlide?.data?.notes || ''}
               onChange={(e) => updateSlideData(currentSlide.id, { notes: e.target.value })}
               placeholder="Click here to add talking points and speaker notes for this slide..."
               className="flex-1 w-full bg-transparent p-6 text-slate-300 text-sm resize-none outline-none placeholder-slate-600 font-sans leading-relaxed"
             />
          </div>
        )}
      </div>

      {/* Right Sidebar: AI Input */}
      <div className="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col z-20 shadow-xl shrink-0">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><Plus size={16} className="text-indigo-500"/> Content to Slides</h2>
        </div>
        <div className="flex-1 p-6 flex flex-col gap-4">
          <p className="text-xs text-slate-400">Paste your raw text below. Ask for an image slide explicitly if you want pictures!</p>
          <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="e.g. Slide 1: Welcome. Slide 2: An image of a futuristic server room. Slide 3: Our features table..." className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>}
          <button onClick={handleGenerate} disabled={isGenerating || !inputText.trim()} className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20">
            {isGenerating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <>Generate Presentation</>}
          </button>
        </div>
      </div>

      {/* Template Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8">
          <div className="bg-neutral-900 rounded-2xl w-full max-w-5xl max-h-full flex flex-col border border-neutral-700 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Info className="text-indigo-500" /> Template Guide</h2>
                <p className="text-slate-400 text-sm mt-1">The AI maps your content into these predefined styled layouts.</p>
              </div>
              <button onClick={() => setShowInfo(false)} className="p-2 text-slate-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-neutral-700">
              {TEMPLATE_GUIDE.map((template) => (
                <div key={template.type} className="flex flex-col lg:flex-row gap-6 bg-neutral-950/50 p-6 rounded-xl border border-neutral-800">
                  <div className="w-[320px] h-[180px] bg-neutral-950 rounded-lg overflow-hidden relative shrink-0 shadow-lg border border-neutral-700">
                    <div style={{ width: '1920px', height: '1080px', transform: 'scale(0.16666)', transformOrigin: 'top left', position: 'absolute' }}>
                      <SlideRenderer slide={template.mock} />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2"><span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-500/30">{template.type}</span></div>
                    <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                    <p className="text-slate-400 leading-relaxed mb-4">{template.desc}</p>
                    <div className="bg-neutral-900 rounded p-3 text-xs font-mono text-slate-500 border border-neutral-800"><span className="text-indigo-400">Requires data keys: </span>{Object.keys(template.mock.data).join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}