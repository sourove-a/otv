import { useState, useRef, useEffect, useCallback } from "react";
import { templates, type TemplateConfig } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Upload,
  Image as ImageIcon,
  FileImage,
  FileText,
  Crown,
  Sparkles,
  X,
  Check,
  Camera,
  Wand2,
  Settings2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import otvLogoPath from "@assets/otv_1773042288152.jpg";

const CATEGORIES = [
  { value: "JUSTICE", bn: "\u09AC\u09BF\u099A\u09BE\u09B0" },
  { value: "NATIONAL", bn: "\u099C\u09BE\u09A4\u09C0\u09AF\u09BC" },
  { value: "WORLD", bn: "\u09AC\u09BF\u09B6\u09CD\u09AC" },
  { value: "BREAKING", bn: "\u09AC\u09CD\u09B0\u09C7\u0995\u09BF\u0982" },
  { value: "SPORTS", bn: "\u0996\u09C7\u09B2\u09BE" },
  { value: "POLITICS", bn: "\u09B0\u09BE\u099C\u09A8\u09C0\u09A4\u09BF" },
  { value: "ENTERTAINMENT", bn: "\u09AC\u09BF\u09A8\u09CB\u09A6\u09A8" },
  { value: "INVESTIGATION", bn: "\u0985\u09A8\u09C1\u09B8\u09A8\u09CD\u09A7\u09BE\u09A8" },
  { value: "OPINION", bn: "\u09AE\u09A4\u09BE\u09AE\u09A4" },
  { value: "TRENDING", bn: "\u099F\u09CD\u09B0\u09C7\u09A8\u09CD\u09A1\u09BF\u0982" },
  { value: "CRIME", bn: "\u0985\u09AA\u09B0\u09BE\u09A7" },
  { value: "EDUCATION", bn: "\u09B6\u09BF\u0995\u09CD\u09B7\u09BE" },
];

const ACCENT_COLORS = [
  { color: "#ffc107", bn: "\u09B8\u09CB\u09A8\u09BE\u09B2\u09C0" },
  { color: "#ff6b35", bn: "\u0995\u09AE\u09B2\u09BE" },
  { color: "#ef4444", bn: "\u09B2\u09BE\u09B2" },
  { color: "#22c55e", bn: "\u09B8\u09AC\u09C1\u099C" },
  { color: "#3b82f6", bn: "\u09A8\u09C0\u09B2" },
  { color: "#a855f7", bn: "\u09AC\u09C7\u0997\u09C1\u09A8\u09C0" },
  { color: "#d4af37", bn: "\u0997\u09CB\u09B2\u09CD\u09A1" },
  { color: "#ec4899", bn: "\u0997\u09CB\u09B2\u09BE\u09AA\u09C0" },
];

const CANVAS_SIZE = 1200;
const BN = "'Noto Sans Bengali', 'Hind Siliguri', sans-serif";

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig>(templates[0]);
  const [headline, setHeadline] = useState("\u099C\u09BE\u099F\u09CD\u09B0\u09BE\u09AC\u09BE\u09DC\u09C0\u09A4\u09C7 \u09E8\u09E6\u099F\u09BF \u0995\u09C1\u0995\u09C1\u09B0 \u09B9\u09A4\u09CD\u09AF\u09BE\u09B0 \u0998\u099F\u09A8\u09BE\u09AF\u09BC \u09E9 \u099C\u09A8\u09C7\u09B0 \u09E8.\u09EB \u09AC\u099B\u09B0\u09C7\u09B0 \u099C\u09C7\u09B2");
  const [category, setCategory] = useState("JUSTICE");
  const [viaText, setViaText] = useState("Via | OTV");
  const [personName, setPersonName] = useState("");
  const [personTitle, setPersonTitle] = useState("");
  const [highlightColor, setHighlightColor] = useState("#ffc107");
  const [mainPhotoSrc, setMainPhotoSrc] = useState<string | null>(null);
  const [mainPhotoImg, setMainPhotoImg] = useState<HTMLImageElement | null>(null);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [activeSection, setActiveSection] = useState<"content" | "style" | "settings">("content");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainPhotoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  const loadImg = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (mainPhotoSrc) URL.revokeObjectURL(mainPhotoSrc);
    const url = URL.createObjectURL(file);
    setMainPhotoSrc(url);
    setMainPhotoImg(await loadImg(url));
    setIsGenerated(false);
  }, [loadImg, mainPhotoSrc]);

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (logoSrc) URL.revokeObjectURL(logoSrc);
    const url = URL.createObjectURL(file);
    setLogoSrc(url);
    setLogoImg(await loadImg(url));
    setIsGenerated(false);
  }, [loadImg, logoSrc]);

  const renderCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    selectedTemplate.render(ctx, { headline, category, viaText, mainPhoto: mainPhotoImg, channelLogo: logoImg, personName, personTitle, highlightColor }, CANVAS_SIZE, CANVAS_SIZE);
    if (!isPro) {
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.font = '700 36px "Montserrat", sans-serif';
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.fillText("OTV.ONLINE", 0, 0);
      ctx.restore();
    }
  }, [headline, category, viaText, mainPhotoImg, logoImg, selectedTemplate, isPro, personName, personTitle, highlightColor]);

  const renderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!fontsReady) return;
    if (renderTimerRef.current) clearTimeout(renderTimerRef.current);
    renderTimerRef.current = setTimeout(() => renderCard(), 150);
    return () => { if (renderTimerRef.current) clearTimeout(renderTimerRef.current); };
  }, [renderCard, fontsReady]);

  const generatePremiumCard = useCallback(() => {
    setIsGenerating(true);
    setIsGenerated(false);
    const timer = setTimeout(() => { renderCard(); setIsGenerated(true); setIsGenerating(false); }, 900);
    return () => clearTimeout(timer);
  }, [renderCard]);

  const downloadPNG = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement("a"); a.download = `otv-card-${Date.now()}.png`; a.href = c.toDataURL("image/png"); a.click();
  }, []);
  const downloadJPG = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement("a"); a.download = `otv-card-${Date.now()}.jpg`; a.href = c.toDataURL("image/jpeg", 0.95); a.click();
  }, []);
  const downloadPDF = useCallback(async () => {
    const c = canvasRef.current; if (!c) return;
    const { jsPDF } = await import("jspdf");
    const d = c.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
    const s = Math.min(pw - 20, ph - 20);
    pdf.addImage(d, "PNG", (pw - s) / 2, (ph - s) / 2, s, s);
    pdf.save(`otv-card-${Date.now()}.pdf`);
  }, []);

  const sectionTabs = [
    { id: "content" as const, icon: Camera, label: "\u0995\u09A8\u09CD\u099F\u09C7\u09A8\u09CD\u099F" },
    { id: "style" as const, icon: Wand2, label: "\u09B8\u09CD\u099F\u09BE\u0987\u09B2" },
    { id: "settings" as const, icon: Settings2, label: "\u09B8\u09C7\u099F\u09BF\u0982\u09B8" },
  ];

  return (
    <div className="min-h-screen text-white relative" style={{ fontFamily: BN, background: "linear-gradient(180deg, #06080f 0%, #0a0d18 40%, #080b14 100%)" }} data-testid="home-page">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)" }} />
        <div className="absolute top-1/3 -left-20 w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px]" style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.04) 0%, transparent 70%)" }} />
      </div>

      <header className="relative z-50 sticky top-0" style={{ background: "rgba(6,8,15,0.7)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <motion.div className="flex items-center gap-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <img src={otvLogoPath} alt="OTV" className="w-9 h-9 rounded-xl object-cover" data-testid="img-otv-logo" />
            <div>
              <h1 className="text-sm font-bold text-white/90 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }} data-testid="text-app-title">OTV Card Maker</h1>
              <p className="text-[9px] text-white/25 font-medium" style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.15em" }}>otv.online</p>
            </div>
          </motion.div>
          <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-[9px] text-white/30 font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>FREE</span>
              <Switch checked={isPro} onCheckedChange={setIsPro} data-testid="switch-pro-toggle" />
              <Crown className={`w-3 h-3 ${isPro ? "text-amber-400" : "text-white/20"}`} />
            </div>
          </motion.div>
        </div>
      </header>

      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 pt-5 pb-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold text-white/20 uppercase" style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.2em" }}>{templates.length} Templates</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1" style={{ scrollbarWidth: "none" }} data-testid="template-gallery">
              {templates.map((t, i) => {
                const isActive = selectedTemplate.id === t.id;
                return (
                  <motion.button
                    key={t.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.4 }}
                    onClick={() => { setSelectedTemplate(t); setCategory(t.defaultCategory); setIsGenerated(false); }}
                    className="flex-shrink-0 group relative"
                    data-testid={`button-template-${t.id}`}
                  >
                    <div className={`w-[100px] rounded-2xl overflow-hidden transition-all duration-500 ${isActive ? "ring-[2.5px] ring-blue-400/80 ring-offset-[3px] ring-offset-[#080b14] scale-[1.02]" : "opacity-50 hover:opacity-80"}`}>
                      <div className="h-[68px] relative" style={{ background: `linear-gradient(135deg, ${t.previewColors[0]}, ${t.previewColors[1]})` }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-1.5 left-2 right-2 space-y-[2px]">
                          <div className="h-[2.5px] w-5 rounded-full" style={{ backgroundColor: t.accentColor }} />
                          <div className="h-[2px] w-[60%] bg-white/20 rounded-full" />
                          <div className="h-[2px] w-[40%] bg-white/10 rounded-full" />
                        </div>
                        {isActive && (
                          <motion.div layoutId="tmpl-active" className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30" transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                            <Check className="w-2.5 h-2.5 text-white" />
                          </motion.div>
                        )}
                      </div>
                      <div className="px-2 py-1.5" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <p className="text-[9px] font-bold text-white/70 truncate leading-tight">{t.nameBn}</p>
                        <p className="text-[7px] text-white/20 truncate" style={{ fontFamily: "'Montserrat', sans-serif" }}>{t.name}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-5 items-start">

            <motion.div className="order-2 lg:order-1 space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
              <div className="flex gap-0.5 p-0.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                {sectionTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-400 ${
                      activeSection === tab.id ? "text-white shadow-lg" : "text-white/25"
                    }`}
                    style={activeSection === tab.id ? { background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)" } : { border: "1px solid transparent" }}
                    data-testid={`tab-${tab.id}`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeSection === "content" && (
                  <motion.div key="content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[9px] font-bold text-white/20 uppercase mb-1.5 pl-1" style={{ letterSpacing: "0.15em" }}>{"\u09A8\u09BF\u0989\u099C \u09AB\u099F\u09CB"}</p>
                        <input ref={mainPhotoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" data-testid="input-main-photo" />
                        <label htmlFor="photo-upload" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") mainPhotoInputRef.current?.click(); }} className="block rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden group" style={{ background: "rgba(255,255,255,0.02)", border: "1.5px dashed rgba(255,255,255,0.06)" }} data-testid="dropzone-main-photo">
                          {mainPhotoSrc ? (
                            <div className="relative">
                              <img src={mainPhotoSrc} alt="Uploaded news photo" className="w-full h-24 object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (mainPhotoSrc) URL.revokeObjectURL(mainPhotoSrc); setMainPhotoSrc(null); setMainPhotoImg(null); }} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center" aria-label="Remove photo" data-testid="button-remove-photo">
                                <X className="w-3 h-3 text-white/80" />
                              </button>
                              <span className="absolute bottom-2 left-2 text-[8px] text-white/50 font-medium">{"\u09AB\u099F\u09CB \u09AF\u09CB\u0997 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7"}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-6 group-hover:scale-105 transition-transform">
                              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2" style={{ background: "rgba(59,130,246,0.08)" }}>
                                <Upload className="w-4 h-4 text-blue-400/50" />
                              </div>
                              <p className="text-[10px] text-white/30 font-medium">{"\u09AB\u099F\u09CB \u0986\u09AA\u09B2\u09CB\u09A1"}</p>
                            </div>
                          )}
                        </label>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold text-white/20 uppercase mb-1.5 pl-1" style={{ letterSpacing: "0.15em" }}>{"\u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2 \u09B2\u09CB\u0997\u09CB"}</p>
                        <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" data-testid="input-logo" />
                        <label htmlFor="logo-upload" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") logoInputRef.current?.click(); }} className="block rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden group" style={{ background: "rgba(255,255,255,0.02)", border: "1.5px dashed rgba(255,255,255,0.06)" }} data-testid="dropzone-logo">
                          {logoSrc ? (
                            <div className="relative flex items-center justify-center py-4">
                              <img src={logoSrc} alt="Uploaded channel logo" className="h-14 object-contain" />
                              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (logoSrc) URL.revokeObjectURL(logoSrc); setLogoSrc(null); setLogoImg(null); }} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center" aria-label="Remove logo" data-testid="button-remove-logo">
                                <X className="w-3 h-3 text-white/80" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-6 group-hover:scale-105 transition-transform">
                              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2" style={{ background: "rgba(59,130,246,0.08)" }}>
                                <ImageIcon className="w-4 h-4 text-blue-400/50" />
                              </div>
                              <p className="text-[10px] text-white/30 font-medium">PNG {"\u09B2\u09CB\u0997\u09CB"}</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <div>
                      <p className="text-[9px] font-bold text-white/20 uppercase mb-1.5 pl-1" style={{ letterSpacing: "0.15em" }}>{"\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE"}</p>
                      <Textarea
                        value={headline}
                        onChange={(e) => { setHeadline(e.target.value); setIsGenerated(false); }}
                        placeholder={"\u09A8\u09BF\u0989\u099C \u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE \u09B2\u09BF\u0996\u09C1\u09A8..."}
                        className="border-0 text-white text-sm rounded-2xl resize-none min-h-[80px] focus-visible:ring-1 focus-visible:ring-blue-500/30"
                        style={{ background: "rgba(255,255,255,0.03)", fontFamily: BN }}
                        data-testid="textarea-headline"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[9px] font-bold text-white/20 uppercase mb-1.5 pl-1" style={{ letterSpacing: "0.15em" }}>{"\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF"}</p>
                        <Select value={category} onValueChange={(v) => { setCategory(v); setIsGenerated(false); }}>
                          <SelectTrigger className="border-0 text-white rounded-2xl text-xs h-10" style={{ background: "rgba(255,255,255,0.03)" }} data-testid="select-category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-0 rounded-2xl" style={{ background: "rgba(12,16,32,0.98)", backdropFilter: "blur(40px)" }}>
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c.value} value={c.value} className="text-white/70 rounded-xl text-xs focus:bg-blue-500/10 focus:text-white">
                                {c.bn} &middot; {c.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-white/20 uppercase mb-1.5 pl-1" style={{ letterSpacing: "0.15em" }}>Via</p>
                        <Input value={viaText} onChange={(e) => { setViaText(e.target.value); setIsGenerated(false); }} placeholder="Via | OTV" className="border-0 text-white text-xs rounded-2xl h-10" style={{ background: "rgba(255,255,255,0.03)" }} data-testid="input-via-text" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[9px] font-bold text-white/20 uppercase mb-1.5 pl-1" style={{ letterSpacing: "0.15em" }}>{"\u09AC\u09CD\u09AF\u0995\u09CD\u09A4\u09BF\u09B0 \u09A8\u09BE\u09AE"}</p>
                        <Input value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder={"\u09AF\u09C7\u09AE\u09A8: \u0986\u09B0\u09BF\u09AB\u09C1\u09B2 \u0987\u09B8\u09B2\u09BE\u09AE"} className="border-0 text-white text-xs rounded-2xl h-10" style={{ background: "rgba(255,255,255,0.03)", fontFamily: BN }} data-testid="input-person-name" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-white/20 uppercase mb-1.5 pl-1" style={{ letterSpacing: "0.15em" }}>{"\u09AA\u09A6\u09AC\u09C0"}</p>
                        <Input value={personTitle} onChange={(e) => setPersonTitle(e.target.value)} placeholder={"\u09AF\u09C7\u09AE\u09A8: \u09B8\u09BE\u0982\u09AC\u09BE\u09A6\u09BF\u0995"} className="border-0 text-white text-xs rounded-2xl h-10" style={{ background: "rgba(255,255,255,0.03)", fontFamily: BN }} data-testid="input-person-title" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSection === "style" && (
                  <motion.div key="style" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-5">
                    <div>
                      <p className="text-[9px] font-bold text-white/20 uppercase mb-3 pl-1" style={{ letterSpacing: "0.15em" }}>{"\u0985\u09CD\u09AF\u09BE\u0995\u09CD\u09B8\u09C7\u09A8\u09CD\u099F \u0995\u09BE\u09B2\u09BE\u09B0"}</p>
                      <div className="grid grid-cols-4 gap-2">
                        {ACCENT_COLORS.map((c) => {
                          const isActive = highlightColor === c.color;
                          return (
                            <button key={c.color} onClick={() => { setHighlightColor(c.color); setIsGenerated(false); }} className="group" data-testid={`button-color-${c.color.replace("#", "")}`}>
                              <div className={`relative rounded-2xl p-3 flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? "scale-[1.05]" : "opacity-40 hover:opacity-70"}`} style={{ background: isActive ? `${c.color}10` : "rgba(255,255,255,0.02)", border: isActive ? `2px solid ${c.color}40` : "2px solid transparent" }}>
                                <div className={`w-8 h-8 rounded-xl shadow-lg transition-all ${isActive ? "scale-110" : ""}`} style={{ backgroundColor: c.color, boxShadow: isActive ? `0 4px 20px ${c.color}40` : "none" }} />
                                <span className="text-[8px] font-semibold text-white/40">{c.bn}</span>
                                {isActive && (
                                  <motion.div layoutId="color-check" className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: c.color }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  </motion.div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {!isPro && (
                      <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.06), rgba(245,158,11,0.03))", border: "1px solid rgba(251,191,36,0.12)" }}>
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, rgba(251,191,36,0.08), transparent 70%)" }} />
                        <div className="relative z-10">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Crown className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-bold text-amber-300">{"\u09AA\u09CD\u09B0\u09CB \u0986\u09AA\u0997\u09CD\u09B0\u09C7\u09A1"}</span>
                          </div>
                          <p className="text-[10px] text-white/25 mb-3 leading-relaxed">{"\u0993\u09AF\u09BC\u09BE\u099F\u09BE\u09B0\u09AE\u09BE\u09B0\u09CD\u0995 \u099B\u09BE\u09DC\u09BE \u0986\u09A8\u09B2\u09BF\u09AE\u09BF\u099F\u09C7\u09A1 \u0995\u09BE\u09B0\u09CD\u09A1 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8"}</p>
                          <Button onClick={() => setIsPro(true)} size="sm" className="rounded-xl text-[10px] font-bold no-default-hover-elevate no-default-active-elevate" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000" }} data-testid="button-upgrade-pro">
                            <Crown className="w-3 h-3 mr-1" /> {"\u0985\u09CD\u09AF\u09BE\u0995\u09CD\u099F\u09BF\u09AD\u09C7\u099F"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeSection === "settings" && (
                  <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-4">
                    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <p className="text-[9px] font-bold text-white/20 uppercase mb-2" style={{ letterSpacing: "0.15em" }}>API Integration</p>
                      <p className="text-[10px] text-white/15 mb-2">{"\u0985\u099F\u09CB\u09AE\u09C7\u09B6\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF Templated.io API Key \u09A6\u09BF\u09A8"}</p>
                      <Input placeholder="API Key" className="border-0 text-white text-[10px] rounded-xl h-9" style={{ background: "rgba(255,255,255,0.03)" }} data-testid="input-api-key" />
                      <p className="text-[7px] text-white/10 mt-1.5" style={{ fontFamily: "'Montserrat', monospace" }}>Layers: main_photo, channel_logo, main_headline, category_badge, via_text</p>
                    </div>
                    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <p className="text-[9px] font-bold text-white/20 uppercase mb-2" style={{ letterSpacing: "0.15em" }}>{"\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u09AC\u09BF\u09A7\u09BF"}</p>
                      <div className="space-y-2">
                        {[
                          "\u09E7. \u099F\u09C7\u09AE\u09CD\u09AA\u09B2\u09C7\u099F \u09B8\u09BF\u09B2\u09C7\u0995\u09CD\u099F \u0995\u09B0\u09C1\u09A8",
                          "\u09E8. \u09A8\u09BF\u0989\u099C \u09AB\u099F\u09CB \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8",
                          "\u09E9. \u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2 \u09B2\u09CB\u0997\u09CB \u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8",
                          "\u09EA. \u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE \u0993 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09B2\u09BF\u0996\u09C1\u09A8",
                          "\u09EB. \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u0995\u09BE\u09B0\u09CD\u09A1 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8",
                          "\u09EC. PNG / JPG / PDF \u09A1\u09BE\u0989\u09A8\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8",
                        ].map((step, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(59,130,246,0.1)" }}>
                              <span className="text-[7px] text-blue-400 font-bold">{i + 1}</span>
                            </div>
                            <p className="text-[10px] text-white/25 leading-relaxed">{step.substring(3)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <button
                  onClick={generatePremiumCard}
                  disabled={isGenerating}
                  className="w-full relative rounded-2xl overflow-hidden group disabled:opacity-50 transition-all duration-500"
                  style={{ height: 52 }}
                  data-testid="button-generate-card"
                >
                  <div className="absolute inset-0 transition-all duration-500" style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb, #1d4ed8)" }} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(135deg, #60a5fa, #3b82f6, #2563eb)" }} />
                  <div className="absolute -inset-1 rounded-2xl opacity-30 group-hover:opacity-50 blur-xl transition-all" style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }} />
                  <span className="relative z-10 flex items-center justify-center gap-2 text-white font-bold text-sm">
                    {isGenerating ? (
                      <>
                        <motion.span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                        {"\u099C\u09C7\u09A8\u09BE\u09B0\u09C7\u099F \u09B9\u099A\u09CD\u099B\u09C7..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {"\u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u0995\u09BE\u09B0\u09CD\u09A1 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8"}
                      </>
                    )}
                  </span>
                </button>
              </motion.div>

              <AnimatePresence>
                {isGenerated && (
                  <motion.div initial={{ opacity: 0, y: 15, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="rounded-2xl p-4" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <motion.div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                        <Check className="w-3 h-3 text-green-400" />
                      </motion.div>
                      <span className="text-xs font-bold text-green-300">{"\u0995\u09BE\u09B0\u09CD\u09A1 \u09A4\u09C8\u09B0\u09BF! \u09A1\u09BE\u0989\u09A8\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8:"}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { fn: downloadPNG, icon: FileImage, label: "PNG", color: "from-emerald-500 to-green-600", tid: "button-download-png" },
                        { fn: downloadJPG, icon: Download, label: "JPG", color: "from-blue-500 to-indigo-600", tid: "button-download-jpg" },
                        { fn: downloadPDF, icon: FileText, label: "PDF A4", color: "from-rose-500 to-red-600", tid: "button-download-pdf" },
                      ].map((dl, i) => (
                        <motion.div key={dl.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                          <button onClick={dl.fn} className={`w-full py-2.5 rounded-xl text-white font-bold text-[10px] flex items-center justify-center gap-1.5 bg-gradient-to-br ${dl.color} transition-all hover:scale-[1.02] active:scale-[0.98]`} data-testid={dl.tid}>
                            <dl.icon className="w-3.5 h-3.5" />
                            {dl.label}
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div className="order-1 lg:order-2 lg:sticky lg:top-[56px] lg:self-start" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }}>
              <div className="rounded-3xl p-2.5 relative" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", backdropFilter: "blur(20px)" }}>
                <div className="flex items-center justify-between px-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <motion.div className="w-1.5 h-1.5 rounded-full bg-blue-400" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                    <span className="text-[8px] font-bold text-white/15 uppercase" style={{ letterSpacing: "0.2em" }}>{"\u09B2\u09BE\u0987\u09AD \u09AA\u09CD\u09B0\u09BF\u09AD\u09BF\u0989"}</span>
                  </div>
                  <span className="text-[8px] text-white/10 px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.03)" }}>{selectedTemplate.nameBn}</span>
                </div>
                <div className="rounded-2xl overflow-hidden relative" style={{ background: "#000" }} data-testid="preview-container">
                  <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="w-full block" data-testid="canvas-preview" />
                  <AnimatePresence>
                    {isGenerating && (
                      <motion.div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex flex-col items-center gap-3">
                          <motion.div className="w-8 h-8 rounded-full" style={{ border: "2.5px solid rgba(59,130,246,0.2)", borderTopColor: "#3b82f6" }} animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                          <span className="text-[10px] text-blue-300 font-semibold">{"\u099C\u09C7\u09A8\u09BE\u09B0\u09C7\u099F \u09B9\u099A\u09CD\u099B\u09C7..."}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex items-center justify-between px-2 mt-2">
                  <span className="text-[7px] text-white/10" style={{ fontFamily: "'Montserrat', sans-serif" }}>1200 x 1200 px</span>
                  <div className="flex items-center gap-1">
                    <img src={otvLogoPath} alt="" className="w-3 h-3 rounded-sm object-cover" />
                    <span className="text-[7px] text-white/10" style={{ fontFamily: "'Montserrat', sans-serif" }}>otv.online</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      <footer className="relative z-10 py-6 mt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src={otvLogoPath} alt="OTV" className="w-6 h-6 rounded-lg object-cover opacity-30" />
            <span className="text-[9px] text-white/10 font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>OTV Card Maker &middot; otv.online</span>
          </div>
          <p className="text-[9px] text-white/8">{"\u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09A8\u09BF\u0989\u099C \u09AB\u099F\u09CB \u0995\u09BE\u09B0\u09CD\u09A1 \u099C\u09C7\u09A8\u09BE\u09B0\u09C7\u099F\u09B0"}</p>
        </div>
      </footer>
    </div>
  );
}
