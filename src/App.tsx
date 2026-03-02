import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Loader2,
  Play,
  Layout,
  Plus,
  Type,
  FileText,
  List,
  Table as TableIcon,
  Info,
  X,
  ChevronUp,
  ChevronDown,
  Trash2,
  MonitorPlay,
  Download,
  Image as ImageIcon,
  Upload,
  Paperclip,
} from 'lucide-react';

import type { Slide, SlideData, SlideType } from './types';
import { THEMES, DEFAULT_SLIDES, TEMPLATE_GUIDE } from './constants';
import { generateSlidesFromAI } from './services/aiService';
import { SlideRenderer } from './components/SlideRenderer';

export default function App() {
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [theme, setTheme] = useState('midnight');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Restore Poppins Font dynamically
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.isContentEditable) return;
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
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
      setScale(
        document.fullscreenElement
          ? Math.min(scaleX, scaleY)
          : Math.min(scaleX, scaleY) * 0.95
      );
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasWrapperRef.current?.requestFullscreen().catch((err) => console.error(err));
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
      if (!(window as unknown as Record<string, unknown>).html2canvas) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src =
            'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const html2canvas = (window as unknown as Record<string, unknown>).html2canvas as (
        element: HTMLElement,
        options: Record<string, unknown>
      ) => Promise<HTMLCanvasElement>;

      // useCORS allows us to capture the external Unsplash/Pollinations images
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        backgroundColor: null,
      });
      const dataUrl = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.download = `Slide_${currentIndex + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed. Make sure any external images allow cross-origin rendering.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    setError('');
    try {
      const generatedSlides = await generateSlidesFromAI(inputText);
      if (generatedSlides.length > 0) {
        setSlides(generatedSlides);
        setCurrentIndex(0);
      } else {
        setError("AI didn't return any slides.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate presentation.');
    } finally {
      setIsGenerating(false);
    }
  };

  // --- File Input Handlers ---
  const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.csv', '.json', '.html', '.xml', '.rtf', '.log'];

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
      reader.readAsText(file);
    });
  };

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((f) => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      return SUPPORTED_EXTENSIONS.includes(ext);
    });

    if (validFiles.length === 0) {
      setError('Unsupported file type. Supported: ' + SUPPORTED_EXTENSIONS.join(', '));
      return;
    }

    try {
      const contents = await Promise.all(validFiles.map(readFileAsText));
      const combined = contents.join('\n\n---\n\n');
      setInputText((prev) => (prev ? prev + '\n\n---\n\n' + combined : combined));
      setAttachedFiles((prev) => [...prev, ...validFiles.map((f) => f.name)]);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read files.');
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const files = e.clipboardData?.files;
    if (files && files.length > 0) {
      e.preventDefault();
      processFiles(files);
    }
    // If no files, let the default paste behavior handle text
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = ''; // Reset so same file can be re-selected
    }
  }, [processFiles]);

  const removeAttachedFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Slide Management Handlers ---
  const updateSlideData = (id: string, newData: Partial<SlideData>) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, data: { ...s.data, ...newData } } : s))
    );
  };

  const addBlankSlide = () => {
    const newSlide: Slide = {
      id: Math.random().toString(36).substring(7),
      type: 'main_point',
      data: { title: 'New Slide', subtitle: 'Click to edit' },
    };
    setSlides([...slides, newSlide]);
    setCurrentIndex(slides.length);
  };

  const deleteSlide = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, i) => i !== index));
    if (currentIndex >= index && currentIndex > 0) setCurrentIndex((prev) => prev - 1);
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
    switch (type) {
      case 'main':
        return <Layout size={16} />;
      case 'toc':
        return <List size={16} />;
      case 'main_point':
        return <Type size={16} />;
      case 'secondary_point':
        return <FileText size={16} />;
      case 'table':
        return <TableIcon size={16} />;
      case 'image':
        return <ImageIcon size={16} />;
      case 'end':
        return <Play size={16} />;
      default:
        return <Layout size={16} />;
    }
  };

  return (
    <div
      className={`flex h-screen w-full bg-neutral-950 text-slate-200 overflow-hidden theme-${theme}`}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Left Sidebar */}
      <div className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col z-20 shadow-xl shrink-0">
        <div className="p-6 border-b border-neutral-800 flex items-center gap-2">
          <Layout className="text-indigo-500" />
          <h1 className="text-xl font-bold text-white">Slydex</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-neutral-700">
          {slides.map((slide, index) => (
            <div key={slide.id} className="relative group">
              <button
                onClick={() => setCurrentIndex(index)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex flex-col gap-2 ${
                  currentIndex === index
                    ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                    : 'bg-neutral-800 border-transparent text-slate-400 hover:bg-neutral-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                  {getSlideIcon(slide.type)} <span>Slide {index + 1}</span>
                </div>
                <span className="text-sm font-medium truncate w-full block text-white">
                  {slide.data?.title || 'Untitled Slide'}
                </span>
              </button>

              <div className="absolute right-2 top-2 hidden group-hover:flex flex-col gap-1 bg-neutral-900 shadow-md rounded border border-neutral-700 p-1 z-10">
                <button
                  onClick={(e) => moveSlide(e, index, -1)}
                  disabled={index === 0}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={(e) => moveSlide(e, index, 1)}
                  disabled={index === slides.length - 1}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={(e) => deleteSlide(e, index)}
                  disabled={slides.length === 1}
                  className="p-1 text-red-400 hover:text-red-300 disabled:opacity-30"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addBlankSlide}
            className="w-full flex items-center justify-center gap-2 p-3 mt-4 rounded-lg border border-dashed border-neutral-700 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 transition-colors text-sm font-medium"
          >
            <Plus size={16} /> Add Blank Slide
          </button>
        </div>

        <div className="p-4 border-t border-neutral-800 shrink-0">
          <button
            onClick={() => setShowInfo(true)}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-slate-300 transition-colors text-sm font-medium"
          >
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
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-neutral-800 text-xs text-white border border-neutral-700 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-semibold"
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 mr-2">
              1920x1080 ({(scale * 100).toFixed(0)}%)
            </span>
            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-sm font-medium transition-colors border border-neutral-700 disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              <span className="hidden sm:inline">Export PNG</span>
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-bold shadow-lg transition-colors"
            >
              <MonitorPlay size={16} /> Present
            </button>
          </div>
        </div>

        {/* Canvas Wrapper */}
        <div
          ref={canvasWrapperRef}
          className={`flex-1 flex items-center justify-center overflow-hidden relative ${
            isFullscreen ? 'bg-black' : 'p-4 sm:p-8 bg-[#1a1a1a]'
          }`}
        >
          <div
            className="relative shadow-2xl bg-[#0f172a]"
            style={{ width: `${1920 * scale}px`, height: `${1080 * scale}px` }}
          >
            <div
              className="overflow-hidden absolute top-0 left-0"
              style={{
                width: '1920px',
                height: '1080px',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              {currentSlide && currentSlide.data ? (
                <SlideRenderer slide={currentSlide} updateSlideData={updateSlideData} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500 text-4xl">
                  No slides left.
                </div>
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
              <FileText size={14} className="text-slate-500" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Speaker Notes
              </span>
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
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Plus size={16} className="text-indigo-500" /> Content to Slides
          </h2>
        </div>
        <div
          className="flex-1 p-6 flex flex-col gap-4"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p className="text-xs text-slate-400">
            Type, paste, drag & drop, or upload a file (.txt, .md, .csv, .json, etc.)
          </p>

          {/* Drop zone overlay */}
          <div className="relative flex-1 flex flex-col">
            {isDragOver && (
              <div className="absolute inset-0 z-10 bg-indigo-600/20 border-2 border-dashed border-indigo-400 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <div className="text-center">
                  <Upload size={32} className="mx-auto mb-2 text-indigo-400" />
                  <p className="text-indigo-300 font-semibold text-sm">Drop files here</p>
                </div>
              </div>
            )}

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onPaste={handlePaste}
              placeholder="e.g. Slide 1: Welcome. Slide 2: An image of a futuristic server room. Slide 3: Our features table..."
              className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Attached files chips */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((name, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium"
                >
                  <Paperclip size={12} />
                  <span className="max-w-[120px] truncate">{name}</span>
                  <button
                    onClick={() => removeAttachedFile(i)}
                    className="hover:text-white transition-colors ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* File picker button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-dashed border-neutral-700 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 transition-colors text-xs font-medium"
          >
            <Upload size={14} /> Upload File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.csv,.json,.html,.xml,.rtf,.log"
            onChange={handleFileSelect}
            className="hidden"
          />

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !inputText.trim()}
            className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Generating...
              </>
            ) : (
              <>Generate Presentation</>
            )}
          </button>
        </div>
      </div>

      {/* Template Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8">
          <div className="bg-neutral-900 rounded-2xl w-full max-w-5xl max-h-full flex flex-col border border-neutral-700 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Info className="text-indigo-500" /> Template Guide
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  The AI maps your content into these predefined styled layouts.
                </p>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-neutral-700">
              {TEMPLATE_GUIDE.map((template) => (
                <div
                  key={template.type}
                  className="flex flex-col lg:flex-row gap-6 bg-neutral-950/50 p-6 rounded-xl border border-neutral-800"
                >
                  <div className="w-[320px] h-[180px] bg-neutral-950 rounded-lg overflow-hidden relative shrink-0 shadow-lg border border-neutral-700">
                    <div
                      style={{
                        width: '1920px',
                        height: '1080px',
                        transform: 'scale(0.16666)',
                        transformOrigin: 'top left',
                        position: 'absolute',
                      }}
                    >
                      <SlideRenderer slide={template.mock} />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-500/30">
                        {template.type}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                    <p className="text-slate-400 leading-relaxed mb-4">{template.desc}</p>
                    <div className="bg-neutral-900 rounded p-3 text-xs font-mono text-slate-500 border border-neutral-800">
                      <span className="text-indigo-400">Requires data keys: </span>
                      {Object.keys(template.mock.data).join(', ')}
                    </div>
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
