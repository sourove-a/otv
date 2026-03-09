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
  Users,
  Move,
  GripVertical,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Copy,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import otvLogoTransparent from "@assets/otv_1773042288152.jpg";

const otvLogoPath = "/images/otv-logo-transparent.png";

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
const DUAL_TEMPLATES = ["dual-quote", "dual-quote-split"];

const GLASS = {
  panel: "rgba(255,255,255,0.035)",
  panelBorder: "rgba(255,255,255,0.06)",
  panelHover: "rgba(255,255,255,0.06)",
  input: "rgba(255,255,255,0.04)",
  inputBorder: "rgba(255,255,255,0.07)",
  blur: "blur(50px) saturate(200%)",
  blurSm: "blur(30px) saturate(180%)",
  radius: "24px",
  radiusSm: "18px",
  radiusXl: "32px",
};

const OTV_LOGO_DEFAULT_SIZE = 100;

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig>(templates[0]);
  const [headline, setHeadline] = useState("\u099C\u09BE\u099F\u09CD\u09B0\u09BE\u09AC\u09BE\u09DC\u09C0\u09A4\u09C7 \u09E8\u09E6\u099F\u09BF \u0995\u09C1\u0995\u09C1\u09B0 \u09B9\u09A4\u09CD\u09AF\u09BE\u09B0 \u0998\u099F\u09A8\u09BE\u09AF\u09BC \u09E9 \u099C\u09A8\u09C7\u09B0 \u09E8.\u09EB \u09AC\u099B\u09B0\u09C7\u09B0 \u099C\u09C7\u09B2");
  const [headline2, setHeadline2] = useState("");
  const [category, setCategory] = useState("JUSTICE");
  const [viaText, setViaText] = useState("Via | OTV");
  const [personName, setPersonName] = useState("");
  const [personTitle, setPersonTitle] = useState("");
  const [personName2, setPersonName2] = useState("");
  const [personTitle2, setPersonTitle2] = useState("");
  const [highlightColor, setHighlightColor] = useState("#ffc107");
  const [mainPhotoSrc, setMainPhotoSrc] = useState<string | null>(null);
  const [mainPhotoImg, setMainPhotoImg] = useState<HTMLImageElement | null>(null);
  const [secondPhotoSrc, setSecondPhotoSrc] = useState<string | null>(null);
  const [secondPhotoImg, setSecondPhotoImg] = useState<HTMLImageElement | null>(null);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [otvLogoImg, setOtvLogoImg] = useState<HTMLImageElement | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [activeSection, setActiveSection] = useState<"content" | "style" | "settings">("content");
  const [otvLogoX, setOtvLogoX] = useState(CANVAS_SIZE / 2);
  const [otvLogoY, setOtvLogoY] = useState(CANVAS_SIZE - 60);
  const [otvLogoSize, setOtvLogoSize] = useState(OTV_LOGO_DEFAULT_SIZE);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const mainPhotoInputRef = useRef<HTMLInputElement>(null);
  const secondPhotoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const isDual = DUAL_TEMPLATES.includes(selectedTemplate.id);

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

  useEffect(() => {
    loadImg(otvLogoPath).then(setOtvLogoImg).catch(() => {
      loadImg(otvLogoTransparent).then(setOtvLogoImg).catch(() => {});
    });
  }, [loadImg]);

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (mainPhotoSrc) URL.revokeObjectURL(mainPhotoSrc);
    const url = URL.createObjectURL(file);
    setMainPhotoSrc(url);
    setMainPhotoImg(await loadImg(url));
    setIsGenerated(false);
  }, [loadImg, mainPhotoSrc]);

  const handleSecondPhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (secondPhotoSrc) URL.revokeObjectURL(secondPhotoSrc);
    const url = URL.createObjectURL(file);
    setSecondPhotoSrc(url);
    setSecondPhotoImg(await loadImg(url));
    setIsGenerated(false);
  }, [loadImg, secondPhotoSrc]);

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
    selectedTemplate.render(ctx, {
      headline, headline2, category, viaText,
      mainPhoto: mainPhotoImg, secondPhoto: secondPhotoImg,
      channelLogo: logoImg, otvLogo: otvLogoImg,
      personName, personTitle, personName2, personTitle2, highlightColor,
      otvLogoX, otvLogoY, otvLogoSize,
    }, CANVAS_SIZE, CANVAS_SIZE);
    if (!isPro) {
      ctx.save();
      ctx.globalAlpha = 0.10;
      ctx.font = '700 42px "Montserrat", sans-serif';
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.fillText("OTV.ONLINE", 0, 0);
      ctx.restore();
    }
  }, [headline, headline2, category, viaText, mainPhotoImg, secondPhotoImg, logoImg, otvLogoImg, selectedTemplate, isPro, personName, personTitle, personName2, personTitle2, highlightColor, otvLogoX, otvLogoY, otvLogoSize]);

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

  const copyToClipboard = useCallback(async () => {
    const c = canvasRef.current; if (!c) return;
    try {
      const blob = await new Promise<Blob | null>((res) => c.toBlob(res, "image/png"));
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      }
    } catch (_) {}
  }, []);

  const handlePreviewMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;
    const logoHalf = otvLogoSize / 2;
    if (cx >= otvLogoX - logoHalf - 30 && cx <= otvLogoX + logoHalf + 30 &&
        cy >= otvLogoY - logoHalf - 30 && cy <= otvLogoY + logoHalf + 30) {
      setIsDraggingLogo(true);
    }
  }, [otvLogoX, otvLogoY, otvLogoSize]);

  const handlePreviewMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingLogo || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const cx = Math.max(0, Math.min(CANVAS_SIZE, (e.clientX - rect.left) * scaleX));
    const cy = Math.max(0, Math.min(CANVAS_SIZE, (e.clientY - rect.top) * scaleY));
    setOtvLogoX(cx);
    setOtvLogoY(cy);
  }, [isDraggingLogo]);

  const handlePreviewMouseUp = useCallback(() => {
    setIsDraggingLogo(false);
  }, []);

  const handlePreviewTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!previewRef.current || e.touches.length !== 1) return;
    const rect = previewRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const cx = (touch.clientX - rect.left) * scaleX;
    const cy = (touch.clientY - rect.top) * scaleY;
    const logoHalf = otvLogoSize / 2;
    if (cx >= otvLogoX - logoHalf - 40 && cx <= otvLogoX + logoHalf + 40 &&
        cy >= otvLogoY - logoHalf - 40 && cy <= otvLogoY + logoHalf + 40) {
      setIsDraggingLogo(true);
      e.preventDefault();
    }
  }, [otvLogoX, otvLogoY, otvLogoSize]);

  const handlePreviewTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingLogo || !previewRef.current || e.touches.length !== 1) return;
    e.preventDefault();
    const rect = previewRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const cx = Math.max(0, Math.min(CANVAS_SIZE, (touch.clientX - rect.left) * scaleX));
    const cy = Math.max(0, Math.min(CANVAS_SIZE, (touch.clientY - rect.top) * scaleY));
    setOtvLogoX(cx);
    setOtvLogoY(cy);
  }, [isDraggingLogo]);

  const resetLogoPosition = useCallback(() => {
    setOtvLogoX(CANVAS_SIZE / 2);
    setOtvLogoY(CANVAS_SIZE - 60);
    setOtvLogoSize(OTV_LOGO_DEFAULT_SIZE);
  }, []);

  const sectionTabs = [
    { id: "content" as const, icon: Camera, label: "\u0995\u09A8\u09CD\u099F\u09C7\u09A8\u09CD\u099F" },
    { id: "style" as const, icon: Wand2, label: "\u09B8\u09CD\u099F\u09BE\u0987\u09B2" },
    { id: "settings" as const, icon: Settings2, label: "\u09B8\u09C7\u099F\u09BF\u0982\u09B8" },
  ];

  return (
    <div className="min-h-screen text-white relative" style={{ fontFamily: BN, background: "linear-gradient(165deg, #04060e 0%, #0a0e1c 30%, #060a16 60%, #080c18 100%)" }} data-testid="home-page">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div className="absolute -top-60 -right-60 w-[800px] h-[800px] rounded-full" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, rgba(99,102,241,0.03) 40%, transparent 70%)" }} animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute top-1/4 -left-40 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)" }} animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
        <motion.div className="absolute bottom-10 right-1/3 w-[500px] h-[400px]" style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.04) 0%, transparent 70%)" }} animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }} />
        <div className="absolute inset-0" style={{ background: "repeating-conic-gradient(rgba(255,255,255,0.003) 0% 25%, transparent 0% 50%) 0 0 / 60px 60px" }} />
      </div>

      <header className="relative z-50 sticky top-0" style={{ background: "rgba(4,6,14,0.55)", backdropFilter: GLASS.blur, WebkitBackdropFilter: GLASS.blur, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, type: "spring" }}>
            <div className="relative">
              <img src={otvLogoPath} alt="OTV" className="w-10 h-10 rounded-2xl object-contain" style={{ background: "rgba(255,255,255,0.06)", padding: "3px" }} data-testid="img-otv-logo" onError={(e) => { (e.target as HTMLImageElement).src = otvLogoTransparent; }} />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#04060e]" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-white/95 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }} data-testid="text-app-title">OTV Card Maker</h1>
              <p className="text-[8px] text-white/20 font-semibold" style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.2em" }}>PREMIUM CARD STUDIO</p>
            </div>
          </motion.div>
          <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl" style={{ background: GLASS.panel, border: `1px solid ${GLASS.panelBorder}`, backdropFilter: GLASS.blurSm }}>
              <span className="text-[8px] text-white/25 font-bold" style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.1em" }}>FREE</span>
              <Switch checked={isPro} onCheckedChange={setIsPro} data-testid="switch-pro-toggle" />
              <div className="flex items-center gap-1">
                <Crown className={`w-3.5 h-3.5 transition-colors duration-500 ${isPro ? "text-amber-400" : "text-white/15"}`} />
                <span className="text-[8px] font-bold transition-colors duration-500" style={{ fontFamily: "'Montserrat', sans-serif", color: isPro ? "#fbbf24" : "rgba(255,255,255,0.15)" }}>PRO</span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 pt-5 pb-3">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
            <div className="flex items-center gap-2.5 mb-3">
              <Layers className="w-3.5 h-3.5 text-blue-400/50" />
              <span className="text-[9px] font-bold text-white/15 uppercase" style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.2em" }}>{templates.length} Templates</span>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }} data-testid="template-gallery">
              {templates.map((t, i) => {
                const isActive = selectedTemplate.id === t.id;
                const isSplit = DUAL_TEMPLATES.includes(t.id);
                return (
                  <motion.button
                    key={t.id}
                    initial={{ opacity: 0, y: 18, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.025 * i, duration: 0.4, type: "spring" }}
                    onClick={() => { setSelectedTemplate(t); setCategory(t.defaultCategory); setIsGenerated(false); }}
                    className="flex-shrink-0 snap-center group relative"
                    data-testid={`button-template-${t.id}`}
                  >
                    <div className={`w-[105px] overflow-hidden transition-all duration-500 ${isActive ? "scale-[1.03]" : "opacity-40 hover:opacity-75"}`} style={{ borderRadius: GLASS.radiusSm, border: isActive ? "2px solid rgba(59,130,246,0.5)" : `1px solid ${GLASS.panelBorder}`, boxShadow: isActive ? "0 8px 32px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.05)" : "none" }}>
                      <div className="h-[72px] relative" style={isSplit ? { background: `linear-gradient(90deg, ${t.previewColors[0]} 50%, ${t.previewColors[1]} 50%)` } : { background: `linear-gradient(135deg, ${t.previewColors[0]}, ${t.previewColors[1]})` }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-2.5 right-2.5 space-y-[2px]">
                          <div className="h-[3px] w-6 rounded-full" style={{ backgroundColor: t.accentColor }} />
                          <div className="h-[2px] w-[55%] bg-white/20 rounded-full" />
                          <div className="h-[2px] w-[35%] bg-white/10 rounded-full" />
                        </div>
                        {isActive && (
                          <motion.div layoutId="tmpl-active" className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(59,130,246,0.9)", boxShadow: "0 2px 12px rgba(59,130,246,0.4)" }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </div>
                      <div className="px-2.5 py-2" style={{ background: GLASS.panel }}>
                        <p className="text-[9px] font-bold text-white/65 truncate leading-tight">{t.nameBn}</p>
                        <p className="text-[7px] text-white/18 truncate mt-0.5" style={{ fontFamily: "'Montserrat', sans-serif" }}>{t.name}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] xl:grid-cols-[1fr_500px] gap-6 items-start">

            <motion.div className="order-2 lg:order-1 space-y-4" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }}>
              <div className="flex gap-1 p-1" style={{ background: GLASS.panel, border: `1px solid ${GLASS.panelBorder}`, borderRadius: GLASS.radius, backdropFilter: GLASS.blurSm }}>
                {sectionTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-bold transition-all duration-400 relative ${activeSection === tab.id ? "text-white" : "text-white/20 hover:text-white/35"}`}
                    style={{ borderRadius: "18px" }}
                    data-testid={`tab-${tab.id}`}
                  >
                    {activeSection === tab.id && (
                      <motion.div layoutId="tab-glass" className="absolute inset-0" style={{ borderRadius: "18px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", boxShadow: "0 4px 20px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.04)" }} transition={{ type: "spring", stiffness: 350, damping: 30 }} />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeSection === "content" && (
                  <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-4">
                    <div className="grid gap-3 grid-cols-2">
                      <div>
                        <p className="text-[8px] font-bold text-white/18 uppercase mb-2 pl-1" style={{ letterSpacing: "0.18em" }}>{isDual ? "\u09AB\u099F\u09CB \u09E7" : "\u09A8\u09BF\u0989\u099C \u09AB\u099F\u09CB"}</p>
                        <input ref={mainPhotoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" data-testid="input-main-photo" />
                        <label htmlFor="photo-upload" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") mainPhotoInputRef.current?.click(); }} className="block cursor-pointer transition-all duration-400 overflow-hidden group" style={{ background: GLASS.panel, border: `1.5px dashed ${GLASS.inputBorder}`, borderRadius: GLASS.radiusSm, backdropFilter: GLASS.blurSm }} data-testid="dropzone-main-photo">
                          {mainPhotoSrc ? (
                            <div className="relative">
                              <img src={mainPhotoSrc} alt="Uploaded news photo" className="w-full h-28 object-cover" />
                              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(4,6,14,0.5) 0%, transparent 60%)" }} />
                              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (mainPhotoSrc) URL.revokeObjectURL(mainPhotoSrc); setMainPhotoSrc(null); setMainPhotoImg(null); }} className="absolute top-2 right-2 w-6 h-6 rounded-xl flex items-center justify-center transition-all" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)" }} aria-label="Remove photo" data-testid="button-remove-photo">
                                <X className="w-3 h-3 text-white/80" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-7 group-hover:scale-105 transition-transform duration-500">
                              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-2" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.1)" }}>
                                <Upload className="w-4 h-4 text-blue-400/40" />
                              </div>
                              <p className="text-[10px] text-white/25 font-medium">{isDual ? "\u09AC\u09BE\u09AE \u09AB\u099F\u09CB" : "\u09AB\u099F\u09CB \u0986\u09AA\u09B2\u09CB\u09A1"}</p>
                            </div>
                          )}
                        </label>
                      </div>

                      <div>
                        <p className="text-[8px] font-bold text-white/18 uppercase mb-2 pl-1" style={{ letterSpacing: "0.18em" }}>{isDual ? "\u09AB\u099F\u09CB \u09E8" : "\u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2 \u09B2\u09CB\u0997\u09CB"}</p>
                        {isDual ? (
                          <>
                            <input ref={secondPhotoInputRef} type="file" accept="image/*" onChange={handleSecondPhotoUpload} className="hidden" id="photo2-upload" data-testid="input-second-photo" />
                            <label htmlFor="photo2-upload" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") secondPhotoInputRef.current?.click(); }} className="block cursor-pointer transition-all duration-400 overflow-hidden group" style={{ background: GLASS.panel, border: `1.5px dashed ${GLASS.inputBorder}`, borderRadius: GLASS.radiusSm, backdropFilter: GLASS.blurSm }} data-testid="dropzone-second-photo">
                              {secondPhotoSrc ? (
                                <div className="relative">
                                  <img src={secondPhotoSrc} alt="Second photo" className="w-full h-28 object-cover" />
                                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(4,6,14,0.5) 0%, transparent 60%)" }} />
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (secondPhotoSrc) URL.revokeObjectURL(secondPhotoSrc); setSecondPhotoSrc(null); setSecondPhotoImg(null); }} className="absolute top-2 right-2 w-6 h-6 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)" }} aria-label="Remove second photo" data-testid="button-remove-second-photo">
                                    <X className="w-3 h-3 text-white/80" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-7 group-hover:scale-105 transition-transform duration-500">
                                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-2" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.1)" }}>
                                    <Users className="w-4 h-4 text-blue-400/40" />
                                  </div>
                                  <p className="text-[10px] text-white/25 font-medium">{"\u09A1\u09BE\u09A8 \u09AB\u099F\u09CB"}</p>
                                </div>
                              )}
                            </label>
                          </>
                        ) : (
                          <>
                            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" data-testid="input-logo" />
                            <label htmlFor="logo-upload" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") logoInputRef.current?.click(); }} className="block cursor-pointer transition-all duration-400 overflow-hidden group" style={{ background: GLASS.panel, border: `1.5px dashed ${GLASS.inputBorder}`, borderRadius: GLASS.radiusSm, backdropFilter: GLASS.blurSm }} data-testid="dropzone-logo">
                              {logoSrc ? (
                                <div className="relative flex items-center justify-center py-5">
                                  <img src={logoSrc} alt="Uploaded channel logo" className="h-16 object-contain" />
                                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (logoSrc) URL.revokeObjectURL(logoSrc); setLogoSrc(null); setLogoImg(null); }} className="absolute top-2 right-2 w-6 h-6 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)" }} aria-label="Remove logo" data-testid="button-remove-logo">
                                    <X className="w-3 h-3 text-white/80" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-7 group-hover:scale-105 transition-transform duration-500">
                                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-2" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.1)" }}>
                                    <ImageIcon className="w-4 h-4 text-blue-400/40" />
                                  </div>
                                  <p className="text-[10px] text-white/25 font-medium">PNG {"\u09B2\u09CB\u0997\u09CB"}</p>
                                </div>
                              )}
                            </label>
                          </>
                        )}
                      </div>
                    </div>

                    {isDual && (
                      <div>
                        <p className="text-[8px] font-bold text-white/18 uppercase mb-2 pl-1" style={{ letterSpacing: "0.18em" }}>{"\u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2 \u09B2\u09CB\u0997\u09CB"}</p>
                        <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload-dual" data-testid="input-logo-dual" />
                        <label htmlFor="logo-upload-dual" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") logoInputRef.current?.click(); }} className="block cursor-pointer transition-all duration-400 overflow-hidden group" style={{ background: GLASS.panel, border: `1.5px dashed ${GLASS.inputBorder}`, borderRadius: GLASS.radiusSm }} data-testid="dropzone-logo-dual">
                          {logoSrc ? (
                            <div className="relative flex items-center justify-center py-4">
                              <img src={logoSrc} alt="Uploaded channel logo" className="h-12 object-contain" />
                              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (logoSrc) URL.revokeObjectURL(logoSrc); setLogoSrc(null); setLogoImg(null); }} className="absolute top-2 right-2 w-6 h-6 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)" }} aria-label="Remove logo" data-testid="button-remove-logo-dual">
                                <X className="w-3 h-3 text-white/80" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center py-4 gap-2 group-hover:scale-105 transition-transform duration-500">
                              <ImageIcon className="w-4 h-4 text-blue-400/25" />
                              <p className="text-[10px] text-white/18 font-medium">PNG {"\u09B2\u09CB\u0997\u09CB \u0986\u09AA\u09B2\u09CB\u09A1"}</p>
                            </div>
                          )}
                        </label>
                      </div>
                    )}

                    <div>
                      <p className="text-[8px] font-bold text-white/18 uppercase mb-2 pl-1" style={{ letterSpacing: "0.18em" }}>{isDual ? "\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE \u09E7 (\u09AC\u09BE\u09AE)" : "\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE"}</p>
                      <Textarea
                        value={headline}
                        onChange={(e) => { setHeadline(e.target.value); setIsGenerated(false); }}
                        placeholder={"\u09A8\u09BF\u0989\u099C \u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE \u09B2\u09BF\u0996\u09C1\u09A8..."}
                        className="border-0 text-white text-sm resize-none min-h-[72px] focus-visible:ring-1 focus-visible:ring-blue-500/20"
                        style={{ background: GLASS.input, borderRadius: GLASS.radiusSm, fontFamily: BN, border: `1px solid ${GLASS.inputBorder}` }}
                        data-testid="textarea-headline"
                      />
                    </div>

                    {(isDual || selectedTemplate.id === "news-summary") && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <p className="text-[8px] font-bold text-white/18 uppercase mb-2 pl-1" style={{ letterSpacing: "0.18em" }}>{isDual ? "\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE \u09E8 (\u09A1\u09BE\u09A8)" : "\u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 / \u09AC\u09C1\u09B2\u09C7\u099F"}</p>
                        <Textarea
                          value={headline2}
                          onChange={(e) => { setHeadline2(e.target.value); setIsGenerated(false); }}
                          placeholder={isDual ? "\u09A6\u09CD\u09AC\u09BF\u09A4\u09C0\u09AF\u09BC \u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE..." : "\u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u09B2\u09BE\u0987\u09A8\u09C7 \u09A8\u09A4\u09C1\u09A8 \u09AC\u09C1\u09B2\u09C7\u099F..."}
                          className="border-0 text-white text-sm resize-none min-h-[72px] focus-visible:ring-1 focus-visible:ring-blue-500/20"
                          style={{ background: GLASS.input, borderRadius: GLASS.radiusSm, fontFamily: BN, border: `1px solid ${GLASS.inputBorder}` }}
                          data-testid="textarea-headline2"
                        />
                      </motion.div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[8px] font-bold text-white/18 uppercase mb-2 pl-1" style={{ letterSpacing: "0.18em" }}>{"\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF"}</p>
                        <Select value={category} onValueChange={(v) => { setCategory(v); setIsGenerated(false); }}>
                          <SelectTrigger className="border-0 text-white text-xs h-11" style={{ background: GLASS.input, borderRadius: GLASS.radiusSm, border: `1px solid ${GLASS.inputBorder}` }} data-testid="select-category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-0" style={{ background: "rgba(8,12,24,0.96)", backdropFilter: GLASS.blur, borderRadius: GLASS.radiusSm, border: `1px solid ${GLASS.panelBorder}` }}>
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c.value} value={c.value} className="text-white/65 text-xs focus:bg-blue-500/8 focus:text-white" style={{ borderRadius: "12px" }}>
                                {c.bn} &middot; {c.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-white/18 uppercase mb-2 pl-1" style={{ letterSpacing: "0.18em" }}>Via</p>
                        <Input value={viaText} onChange={(e) => { setViaText(e.target.value); setIsGenerated(false); }} placeholder="Via | OTV" className="border-0 text-white text-xs h-11" style={{ background: GLASS.input, borderRadius: GLASS.radiusSm, border: `1px solid ${GLASS.inputBorder}` }} data-testid="input-via-text" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[8px] font-bold text-white/18 uppercase mb-2 pl-1" style={{ letterSpacing: "0.18em" }}>{isDual ? "\u09AC\u09CD\u09AF\u0995\u09CD\u09A4\u09BF \u09E7" : "\u09AC\u09CD\u09AF\u0995\u09CD\u09A4\u09BF\u09B0 \u09A8\u09BE\u09AE"}</p>
                        <Input value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder={"\u09A8\u09BE\u09AE"} className="border-0 text-white text-xs h-11" style={{ background: GLASS.input, borderRadius: GLASS.radiusSm, fontFamily: BN, border: `1px solid ${GLASS.inputBorder}` }} data-testid="input-person-name" />
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-white/18 uppercase mb-2 pl-1" style={{ letterSpacing: "0.18em" }}>{"\u09AA\u09A6\u09AC\u09C0"}</p>
                        <Input value={personTitle} onChange={(e) => setPersonTitle(e.target.value)} placeholder={"\u09AA\u09A6\u09AC\u09C0"} className="border-0 text-white text-xs h-11" style={{ background: GLASS.input, borderRadius: GLASS.radiusSm, fontFamily: BN, border: `1px solid ${GLASS.inputBorder}` }} data-testid="input-person-title" />
                      </div>
                    </div>

                    {isDual && (
                      <motion.div className="grid grid-cols-2 gap-3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                        <div>
                          <p className="text-[8px] font-bold text-white/18 uppercase mb-2 pl-1" style={{ letterSpacing: "0.18em" }}>{"\u09AC\u09CD\u09AF\u0995\u09CD\u09A4\u09BF \u09E8"}</p>
                          <Input value={personName2} onChange={(e) => setPersonName2(e.target.value)} placeholder={"\u09A8\u09BE\u09AE \u09E8"} className="border-0 text-white text-xs h-11" style={{ background: GLASS.input, borderRadius: GLASS.radiusSm, fontFamily: BN, border: `1px solid ${GLASS.inputBorder}` }} data-testid="input-person-name2" />
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-white/18 uppercase mb-2 pl-1" style={{ letterSpacing: "0.18em" }}>{"\u09AA\u09A6\u09AC\u09C0 \u09E8"}</p>
                          <Input value={personTitle2} onChange={(e) => setPersonTitle2(e.target.value)} placeholder={"\u09AA\u09A6\u09AC\u09C0 \u09E8"} className="border-0 text-white text-xs h-11" style={{ background: GLASS.input, borderRadius: GLASS.radiusSm, fontFamily: BN, border: `1px solid ${GLASS.inputBorder}` }} data-testid="input-person-title2" />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {activeSection === "style" && (
                  <motion.div key="style" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-5">
                    <div>
                      <p className="text-[8px] font-bold text-white/18 uppercase mb-3 pl-1" style={{ letterSpacing: "0.18em" }}>{"\u0985\u09CD\u09AF\u09BE\u0995\u09CD\u09B8\u09C7\u09A8\u09CD\u099F \u0995\u09BE\u09B2\u09BE\u09B0"}</p>
                      <div className="grid grid-cols-4 gap-2.5">
                        {ACCENT_COLORS.map((c) => {
                          const isActive = highlightColor === c.color;
                          return (
                            <button key={c.color} onClick={() => { setHighlightColor(c.color); setIsGenerated(false); }} className="group" data-testid={`button-color-${c.color.replace("#", "")}`}>
                              <div className={`relative p-3.5 flex flex-col items-center gap-2 transition-all duration-400 ${isActive ? "scale-[1.06]" : "opacity-35 hover:opacity-65"}`} style={{ borderRadius: GLASS.radiusSm, background: isActive ? `${c.color}08` : GLASS.panel, border: isActive ? `2px solid ${c.color}35` : `1px solid ${GLASS.panelBorder}`, boxShadow: isActive ? `0 4px 24px ${c.color}18, inset 0 1px 0 rgba(255,255,255,0.03)` : "none" }}>
                                <div className={`w-9 h-9 rounded-2xl transition-all duration-400 ${isActive ? "scale-110" : ""}`} style={{ backgroundColor: c.color, boxShadow: isActive ? `0 4px 24px ${c.color}40` : "none" }} />
                                <span className="text-[8px] font-bold text-white/35">{c.bn}</span>
                                {isActive && (
                                  <motion.div layoutId="color-check" className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: c.color, boxShadow: `0 2px 10px ${c.color}40` }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
                                    <Check className="w-3 h-3 text-white" />
                                  </motion.div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-4" style={{ background: GLASS.panel, border: `1px solid ${GLASS.panelBorder}`, borderRadius: GLASS.radius, backdropFilter: GLASS.blurSm }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.12)" }}>
                            <Move className="w-4 h-4 text-blue-400/60" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-white/50">OTV {"\u09B2\u09CB\u0997\u09CB \u09AA\u09CB\u099C\u09BF\u09B6\u09A8"}</span>
                            <p className="text-[8px] text-white/20">{"\u09AA\u09CD\u09B0\u09BF\u09AD\u09BF\u0989\u09A4\u09C7 \u09A1\u09CD\u09B0\u09CD\u09AF\u09BE\u0997 \u0995\u09B0\u09C7 \u09B8\u09B0\u09BE\u09A8"}</p>
                          </div>
                        </div>
                        <button onClick={resetLogoPosition} className="p-2 rounded-xl transition-all hover:scale-105" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${GLASS.panelBorder}` }} data-testid="button-reset-logo-pos">
                          <RotateCcw className="w-3.5 h-3.5 text-white/30" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setOtvLogoSize(Math.max(40, otvLogoSize - 15))} className="p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${GLASS.panelBorder}` }} data-testid="button-logo-smaller">
                          <ZoomOut className="w-3.5 h-3.5 text-white/30" />
                        </button>
                        <div className="flex-1 relative h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${((otvLogoSize - 40) / 180) * 100}%`, background: "linear-gradient(90deg, rgba(59,130,246,0.3), rgba(99,102,241,0.4))" }} />
                        </div>
                        <button onClick={() => setOtvLogoSize(Math.min(220, otvLogoSize + 15))} className="p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${GLASS.panelBorder}` }} data-testid="button-logo-bigger">
                          <ZoomIn className="w-3.5 h-3.5 text-white/30" />
                        </button>
                        <span className="text-[9px] text-white/20 font-mono w-8 text-right">{otvLogoSize}</span>
                      </div>
                    </div>

                    <div className="p-4" style={{ background: GLASS.panel, border: `1px solid ${GLASS.panelBorder}`, borderRadius: GLASS.radius }}>
                      <div className="flex items-center gap-2.5 mb-2">
                        <img src={otvLogoPath} alt="OTV" className="w-7 h-7 rounded-xl object-contain" style={{ background: "rgba(255,255,255,0.06)", padding: "2px" }} onError={(e) => { (e.target as HTMLImageElement).src = otvLogoTransparent; }} />
                        <span className="text-[10px] font-bold text-white/40">OTV {"\u09B2\u09CB\u0997\u09CB \u09B8\u09AC \u0995\u09BE\u09B0\u09CD\u09A1\u09C7 \u09B8\u09CD\u09AC\u09AF\u09BC\u0982\u0995\u09CD\u09B0\u09BF\u09AF\u09BC"}</span>
                      </div>
                      <p className="text-[8px] text-white/18 leading-relaxed">{"\u0993\u099F\u09BF\u09AD\u09BF \u09B2\u09CB\u0997\u09CB \u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u0995\u09BE\u09B0\u09CD\u09A1\u09C7 \u0985\u099F\u09CB\u09AE\u09CD\u09AF\u09BE\u099F\u09BF\u0995 \u09AF\u09CB\u0997 \u09B9\u09AF\u09BC \u2022 \u099F\u09CD\u09B0\u09BE\u09A8\u09CD\u09B8\u09AA\u09CD\u09AF\u09BE\u09B0\u09C7\u09A8\u09CD\u099F \u09AC\u09CD\u09AF\u09BE\u0995\u0997\u09CD\u09B0\u09BE\u0989\u09A8\u09CD\u09A1"}</p>
                    </div>

                    {!isPro && (
                      <div className="p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.04), rgba(245,158,11,0.02))", border: "1px solid rgba(251,191,36,0.1)", borderRadius: GLASS.radius }}>
                        <div className="absolute top-0 right-0 w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle, rgba(251,191,36,0.06), transparent 70%)" }} />
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-2.5">
                            <Crown className="w-5 h-5 text-amber-400" />
                            <span className="text-[13px] font-bold text-amber-300">{"\u09AA\u09CD\u09B0\u09CB \u0986\u09AA\u0997\u09CD\u09B0\u09C7\u09A1"}</span>
                          </div>
                          <p className="text-[10px] text-white/22 mb-3 leading-relaxed">{"\u0993\u09AF\u09BC\u09BE\u099F\u09BE\u09B0\u09AE\u09BE\u09B0\u09CD\u0995 \u099B\u09BE\u09DC\u09BE \u0986\u09A8\u09B2\u09BF\u09AE\u09BF\u099F\u09C7\u09A1 \u0995\u09BE\u09B0\u09CD\u09A1 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8"}</p>
                          <Button onClick={() => setIsPro(true)} size="sm" className="no-default-hover-elevate no-default-active-elevate text-[10px] font-bold" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000", borderRadius: GLASS.radiusSm }} data-testid="button-upgrade-pro">
                            <Crown className="w-3.5 h-3.5 mr-1.5" /> {"\u0985\u09CD\u09AF\u09BE\u0995\u09CD\u099F\u09BF\u09AD\u09C7\u099F"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeSection === "settings" && (
                  <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-4">
                    <div className="p-5" style={{ background: GLASS.panel, border: `1px solid ${GLASS.panelBorder}`, borderRadius: GLASS.radius, backdropFilter: GLASS.blurSm }}>
                      <p className="text-[8px] font-bold text-white/18 uppercase mb-3" style={{ letterSpacing: "0.18em" }}>{"\u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u09AC\u09BF\u09A7\u09BF"}</p>
                      <div className="space-y-2.5">
                        {[
                          "\u099F\u09C7\u09AE\u09CD\u09AA\u09B2\u09C7\u099F \u09B8\u09BF\u09B2\u09C7\u0995\u09CD\u099F \u0995\u09B0\u09C1\u09A8",
                          "\u09A8\u09BF\u0989\u099C \u09AB\u099F\u09CB \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8",
                          "\u09A1\u09C1\u09AF\u09BC\u09BE\u09B2 \u099F\u09C7\u09AE\u09CD\u09AA\u09B2\u09C7\u099F\u09C7 \u09E8\u099F\u09BF \u09AB\u099F\u09CB \u0986\u09AA\u09B2\u09CB\u09A1",
                          "OTV \u09B2\u09CB\u0997\u09CB \u09A1\u09CD\u09B0\u09CD\u09AF\u09BE\u0997 \u0995\u09B0\u09C7 \u09B8\u09B0\u09BE\u09A8",
                          "\u09B2\u09CB\u0997\u09CB \u09B8\u09BE\u0987\u099C \u09AC\u09BE\u09DC\u09BE\u09A8 \u09AC\u09BE \u0995\u09AE\u09BE\u09A8",
                          "\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE \u0993 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09B2\u09BF\u0996\u09C1\u09A8",
                          "\u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u0995\u09BE\u09B0\u09CD\u09A1 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8",
                          "PNG / JPG / PDF \u09A1\u09BE\u0989\u09A8\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8",
                          "\u0995\u09CD\u09B2\u09BF\u09AA\u09AC\u09CB\u09B0\u09CD\u09A1\u09C7 \u0995\u09AA\u09BF \u0995\u09B0\u09C1\u09A8",
                        ].map((step, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.1)" }}>
                              <span className="text-[7px] text-blue-400 font-bold">{i + 1}</span>
                            </div>
                            <p className="text-[10px] text-white/22 leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <button
                  onClick={generatePremiumCard}
                  disabled={isGenerating}
                  className="w-full relative overflow-hidden group disabled:opacity-50 transition-all duration-500"
                  style={{ height: 56, borderRadius: GLASS.radius }}
                  data-testid="button-generate-card"
                >
                  <div className="absolute inset-0 transition-all duration-500" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1, #4f46e5)" }} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(135deg, #60a5fa, #818cf8, #6366f1)" }} />
                  <div className="absolute inset-[1px] opacity-30" style={{ borderRadius: "22px", background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 50%)" }} />
                  <div className="absolute -inset-2 rounded-3xl opacity-25 group-hover:opacity-45 blur-2xl transition-all" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }} />
                  <span className="relative z-10 flex items-center justify-center gap-2.5 text-white font-bold text-[13px]">
                    {isGenerating ? (
                      <>
                        <motion.span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                        {"\u099C\u09C7\u09A8\u09BE\u09B0\u09C7\u099F \u09B9\u099A\u09CD\u099B\u09C7..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4.5 h-4.5" />
                        {"\u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u0995\u09BE\u09B0\u09CD\u09A1 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8"}
                      </>
                    )}
                  </span>
                </button>
              </motion.div>

              <AnimatePresence>
                {isGenerated && (
                  <motion.div initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="p-5" style={{ background: "rgba(34,197,94,0.03)", border: "1px solid rgba(34,197,94,0.12)", borderRadius: GLASS.radius, backdropFilter: GLASS.blurSm }}>
                    <div className="flex items-center gap-2.5 mb-4">
                      <motion.div className="w-6 h-6 rounded-xl bg-green-500/15 flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      </motion.div>
                      <span className="text-xs font-bold text-green-300">{"\u0995\u09BE\u09B0\u09CD\u09A1 \u09A4\u09C8\u09B0\u09BF! \u09A1\u09BE\u0989\u09A8\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8:"}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { fn: downloadPNG, icon: FileImage, label: "PNG", color: "from-emerald-500 to-green-600", tid: "button-download-png" },
                        { fn: downloadJPG, icon: Download, label: "JPG", color: "from-blue-500 to-indigo-600", tid: "button-download-jpg" },
                        { fn: downloadPDF, icon: FileText, label: "PDF", color: "from-rose-500 to-red-600", tid: "button-download-pdf" },
                        { fn: copyToClipboard, icon: Copy, label: "\u0995\u09AA\u09BF", color: "from-violet-500 to-purple-600", tid: "button-copy-clipboard" },
                      ].map((dl, i) => (
                        <motion.div key={dl.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}>
                          <button onClick={dl.fn} className={`w-full py-3 text-white font-bold text-[10px] flex items-center justify-center gap-1.5 bg-gradient-to-br ${dl.color} transition-all hover:scale-[1.03] active:scale-[0.97]`} style={{ borderRadius: GLASS.radiusSm }} data-testid={dl.tid}>
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

            <motion.div className="order-1 lg:order-2 lg:sticky lg:top-[64px] lg:self-start" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1, type: "spring" }}>
              <div className="p-3 relative" style={{ background: GLASS.panel, border: `1px solid ${GLASS.panelBorder}`, borderRadius: GLASS.radiusXl, backdropFilter: GLASS.blurSm, boxShadow: "0 12px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)" }}>
                <div className="flex items-center justify-between px-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <motion.div className="w-2 h-2 rounded-full" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }} animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                    <span className="text-[8px] font-bold text-white/12 uppercase" style={{ letterSpacing: "0.2em" }}>{"\u09B2\u09BE\u0987\u09AD \u09AA\u09CD\u09B0\u09BF\u09AD\u09BF\u0989"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[7px] text-white/10 px-2.5 py-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${GLASS.panelBorder}` }}>{selectedTemplate.nameBn}</span>
                    {isDraggingLogo && (
                      <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-[7px] text-blue-400/60 px-2 py-1 rounded-xl" style={{ background: "rgba(59,130,246,0.08)" }}>
                        <Move className="w-3 h-3 inline mr-0.5" />{"\u09B8\u09B0\u09BE\u09A8\u09CB \u09B9\u099A\u09CD\u099B\u09C7..."}
                      </motion.span>
                    )}
                  </div>
                </div>
                <div
                  ref={previewRef}
                  className="overflow-hidden relative"
                  style={{ background: "#000", borderRadius: GLASS.radius, cursor: isDraggingLogo ? "grabbing" : "default" }}
                  data-testid="preview-container"
                  onMouseDown={handlePreviewMouseDown}
                  onMouseMove={handlePreviewMouseMove}
                  onMouseUp={handlePreviewMouseUp}
                  onMouseLeave={handlePreviewMouseUp}
                  onTouchStart={handlePreviewTouchStart}
                  onTouchMove={handlePreviewTouchMove}
                  onTouchEnd={handlePreviewMouseUp}
                >
                  <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="w-full block" data-testid="canvas-preview" />
                  <AnimatePresence>
                    {isGenerating && (
                      <motion.div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(4,6,14,0.6)", backdropFilter: "blur(12px)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex flex-col items-center gap-4">
                          <motion.div className="w-10 h-10 rounded-full" style={{ border: "3px solid rgba(99,102,241,0.15)", borderTopColor: "#6366f1" }} animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                          <span className="text-[10px] text-indigo-300 font-semibold">{"\u099C\u09C7\u09A8\u09BE\u09B0\u09C7\u099F \u09B9\u099A\u09CD\u099B\u09C7..."}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl pointer-events-auto" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <GripVertical className="w-3 h-3 text-white/25" />
                      <span className="text-[7px] text-white/30 font-medium">{"\u09B2\u09CB\u0997\u09CB \u09A1\u09CD\u09B0\u09CD\u09AF\u09BE\u0997 \u0995\u09B0\u09C1\u09A8"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-2.5 mt-2.5">
                  <span className="text-[7px] text-white/8 font-mono">1200 &times; 1200</span>
                  <div className="flex items-center gap-1.5">
                    <img src={otvLogoPath} alt="" className="w-3.5 h-3.5 rounded-md object-contain" style={{ background: "rgba(255,255,255,0.06)", padding: "1px" }} onError={(e) => { (e.target as HTMLImageElement).src = otvLogoTransparent; }} />
                    <span className="text-[7px] text-white/8" style={{ fontFamily: "'Montserrat', sans-serif" }}>otv.online</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      <footer className="relative z-10 py-8 mt-6" style={{ borderTop: `1px solid ${GLASS.panelBorder}` }}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img src={otvLogoPath} alt="OTV" className="w-7 h-7 rounded-xl object-contain opacity-25" style={{ background: "rgba(255,255,255,0.04)", padding: "2px" }} onError={(e) => { (e.target as HTMLImageElement).src = otvLogoTransparent; }} />
            <span className="text-[9px] text-white/8 font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>OTV Card Maker &middot; Premium Card Studio &middot; otv.online</span>
          </div>
          <p className="text-[8px] text-white/6">{"\u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09A8\u09BF\u0989\u099C \u09AB\u099F\u09CB \u0995\u09BE\u09B0\u09CD\u09A1 \u099C\u09C7\u09A8\u09BE\u09B0\u09C7\u099F\u09B0"}</p>
        </div>
      </footer>
    </div>
  );
}
