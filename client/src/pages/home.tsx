import { useState, useRef, useEffect, useCallback } from "react";
import { templates, type CardData, type TemplateConfig } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Type,
  Palette,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import otvLogoPath from "@assets/otv_1773042288152.jpg";

const CATEGORIES = [
  { value: "JUSTICE", label: "\u09AC\u09BF\u099A\u09BE\u09B0", labelEn: "JUSTICE" },
  { value: "NATIONAL", label: "\u099C\u09BE\u09A4\u09C0\u09AF\u09BC", labelEn: "NATIONAL" },
  { value: "WORLD", label: "\u09AC\u09BF\u09B6\u09CD\u09AC", labelEn: "WORLD" },
  { value: "BREAKING", label: "\u09AC\u09CD\u09B0\u09C7\u0995\u09BF\u0982", labelEn: "BREAKING" },
  { value: "SPORTS", label: "\u0996\u09C7\u09B2\u09BE\u09A7\u09C1\u09B2\u09BE", labelEn: "SPORTS" },
  { value: "POLITICS", label: "\u09B0\u09BE\u099C\u09A8\u09C0\u09A4\u09BF", labelEn: "POLITICS" },
  { value: "ENTERTAINMENT", label: "\u09AC\u09BF\u09A8\u09CB\u09A6\u09A8", labelEn: "ENTERTAINMENT" },
  { value: "INVESTIGATION", label: "\u0985\u09A8\u09C1\u09B8\u09A8\u09CD\u09A7\u09BE\u09A8", labelEn: "INVESTIGATION" },
  { value: "OPINION", label: "\u09AE\u09A4\u09BE\u09AE\u09A4", labelEn: "OPINION" },
  { value: "TRENDING", label: "\u099F\u09CD\u09B0\u09C7\u09A8\u09CD\u09A1\u09BF\u0982", labelEn: "TRENDING" },
  { value: "CRIME", label: "\u0985\u09AA\u09B0\u09BE\u09A7", labelEn: "CRIME" },
  { value: "EDUCATION", label: "\u09B6\u09BF\u0995\u09CD\u09B7\u09BE", labelEn: "EDUCATION" },
];

const CANVAS_SIZE = 1200;

function FloatingParticle({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        background: "radial-gradient(circle, rgba(0,136,255,0.3) 0%, transparent 70%)",
      }}
      initial={{ y: "100vh", opacity: 0 }}
      animate={{
        y: "-20vh",
        opacity: [0, 0.6, 0.3, 0],
      }}
      transition={{
        duration: 12 + Math.random() * 8,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

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
  const [activeTab, setActiveTab] = useState<"edit" | "style">("edit");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainPhotoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const templateGalleryRef = useRef<HTMLDivElement>(null);

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
    const url = URL.createObjectURL(file);
    setMainPhotoSrc(url);
    const img = await loadImg(url);
    setMainPhotoImg(img);
  }, [loadImg]);

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoSrc(url);
    const img = await loadImg(url);
    setLogoImg(img);
  }, [loadImg]);

  const renderCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const cardData: CardData = {
      headline,
      category,
      viaText,
      mainPhoto: mainPhotoImg,
      channelLogo: logoImg,
      personName,
      personTitle,
      highlightColor,
    };

    selectedTemplate.render(ctx, cardData, CANVAS_SIZE, CANVAS_SIZE);

    if (!isPro) {
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.font = `700 38px "Montserrat", sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.fillText("OTV.ONLINE", 0, 0);
      ctx.restore();
    }
  }, [headline, category, viaText, mainPhotoImg, logoImg, selectedTemplate, isPro, personName, personTitle, highlightColor]);

  useEffect(() => {
    if (fontsReady) renderCard();
  }, [renderCard, fontsReady]);

  const generatePremiumCard = useCallback(() => {
    setIsGenerating(true);
    setIsGenerated(false);
    setTimeout(() => {
      renderCard();
      setIsGenerated(true);
      setIsGenerating(false);
    }, 800);
  }, [renderCard]);

  const downloadPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `otv-card-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const downloadJPG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `otv-card-${Date.now()}.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  }, []);

  const downloadPDF = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    const imgSize = Math.min(pdfW - 20, pdfH - 20);
    pdf.addImage(imgData, "PNG", (pdfW - imgSize) / 2, (pdfH - imgSize) / 2, imgSize, imgSize);
    pdf.save(`otv-card-${Date.now()}.pdf`);
  }, []);

  const scrollGallery = (dir: number) => {
    templateGalleryRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#04060e] text-white overflow-hidden relative" style={{ fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', 'Montserrat', sans-serif" }} data-testid="home-page">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(8)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 2} x={10 + i * 12} size={80 + i * 30} />
        ))}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(0,100,255,0.08)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(0,80,200,0.05)_0%,transparent_70%)]" />
      </div>

      <header className="relative z-50 border-b border-white/[0.06] bg-[#04060e]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img src={otvLogoPath} alt="OTV" className="w-10 h-10 rounded-lg object-contain" data-testid="img-otv-logo" />
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent" data-testid="text-app-title">
                OTV Card Maker
              </h1>
              <p className="text-[10px] text-blue-400/60 hidden sm:block font-medium tracking-wider uppercase">otv.online &middot; \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09A8\u09BF\u0989\u099C \u0995\u09BE\u09B0\u09CD\u09A1</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 backdrop-blur-sm">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">\u09AB\u09CD\u09B0\u09BF</span>
              <Switch checked={isPro} onCheckedChange={setIsPro} data-testid="switch-pro-toggle" />
              <span className="text-[10px] flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400 font-bold uppercase tracking-wider">\u09AA\u09CD\u09B0\u09CB</span>
              </span>
            </div>
          </motion.div>
        </div>
      </header>

      <motion.div
        className="relative z-10 border-b border-white/[0.04] bg-white/[0.01]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-white/40 flex items-center gap-2 uppercase tracking-[0.2em]">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              \u099F\u09C7\u09AE\u09CD\u09AA\u09B2\u09C7\u099F \u09B8\u09BF\u09B2\u09C7\u0995\u09CD\u099F \u0995\u09B0\u09C1\u09A8
              <span className="text-blue-400/60 ml-1">({templates.length})</span>
            </h2>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => scrollGallery(-1)} className="text-white/30 w-7 h-7" data-testid="button-scroll-left">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => scrollGallery(1)} className="text-white/30 w-7 h-7" data-testid="button-scroll-right">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div ref={templateGalleryRef} className="flex gap-2.5 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }} data-testid="template-gallery">
            {templates.map((t, i) => (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
                onClick={() => { setSelectedTemplate(t); setCategory(t.defaultCategory); setIsGenerated(false); }}
                className={`flex-shrink-0 w-[120px] rounded-xl overflow-visible transition-all duration-300 group ${
                  selectedTemplate.id === t.id
                    ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-[#04060e] scale-105"
                    : "ring-1 ring-white/[0.06] opacity-60"
                }`}
                data-testid={`button-template-${t.id}`}
              >
                <div className="w-full h-[80px] rounded-t-xl relative overflow-hidden" style={{ background: `linear-gradient(145deg, ${t.previewColors[0]}, ${t.previewColors[1]})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-2 left-2 flex flex-col gap-0.5">
                    <div className="w-6 h-[3px] rounded-full" style={{ backgroundColor: t.accentColor }} />
                    <div className="w-12 h-[2px] bg-white/25 rounded-full" />
                    <div className="w-8 h-[2px] bg-white/15 rounded-full" />
                  </div>
                  {selectedTemplate.id === t.id && (
                    <motion.div layoutId="template-check" className="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Eye className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </div>
                <div className="px-2 py-1.5 bg-white/[0.03] rounded-b-xl">
                  <p className="text-[10px] font-bold text-white/80 truncate">{t.nameBn}</p>
                  <p className="text-[8px] text-white/30 truncate uppercase tracking-wider">{t.name}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_480px] gap-6 items-start">
          <motion.div
            className="order-2 lg:order-1 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-1">
              {[
                { id: "edit" as const, icon: Type, label: "\u09B8\u09AE\u09CD\u09AA\u09BE\u09A6\u09A8\u09BE" },
                { id: "style" as const, icon: Palette, label: "\u09B8\u09CD\u099F\u09BE\u0987\u09B2" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "text-white/40 border border-transparent"
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "edit" ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-white/30 text-[10px] uppercase tracking-[0.15em] font-bold">\u09A8\u09BF\u0989\u099C \u09AB\u099F\u09CB</Label>
                      <input ref={mainPhotoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" data-testid="input-main-photo" />
                      <div
                        onClick={() => mainPhotoInputRef.current?.click()}
                        className="border border-dashed border-white/[0.08] bg-white/[0.02] rounded-xl p-3 text-center cursor-pointer transition-all duration-300 hover:border-blue-400/30 hover:bg-blue-500/[0.03] group"
                        data-testid="dropzone-main-photo"
                      >
                        {mainPhotoSrc ? (
                          <div className="relative">
                            <img src={mainPhotoSrc} alt="Main" className="w-full h-20 object-cover rounded-lg" />
                            <button onClick={(e) => { e.stopPropagation(); setMainPhotoSrc(null); setMainPhotoImg(null); }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center" data-testid="button-remove-photo">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="py-2">
                            <Upload className="w-6 h-6 mx-auto text-white/20 mb-1 group-hover:text-blue-400/50 transition-colors" />
                            <p className="text-[10px] text-white/30">\u09AB\u099F\u09CB \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-white/30 text-[10px] uppercase tracking-[0.15em] font-bold">\u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2 \u09B2\u09CB\u0997\u09CB</Label>
                      <input ref={logoInputRef} type="file" accept="image/png,image/svg+xml,image/jpeg" onChange={handleLogoUpload} className="hidden" data-testid="input-logo" />
                      <div
                        onClick={() => logoInputRef.current?.click()}
                        className="border border-dashed border-white/[0.08] bg-white/[0.02] rounded-xl p-3 text-center cursor-pointer transition-all duration-300 hover:border-blue-400/30 hover:bg-blue-500/[0.03] group"
                        data-testid="dropzone-logo"
                      >
                        {logoSrc ? (
                          <div className="relative">
                            <img src={logoSrc} alt="Logo" className="h-10 mx-auto object-contain" />
                            <button onClick={(e) => { e.stopPropagation(); setLogoSrc(null); setLogoImg(null); }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center" data-testid="button-remove-logo">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="py-2">
                            <ImageIcon className="w-6 h-6 mx-auto text-white/20 mb-1 group-hover:text-blue-400/50 transition-colors" />
                            <p className="text-[10px] text-white/30">PNG \u09B2\u09CB\u0997\u09CB</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-white/30 text-[10px] uppercase tracking-[0.15em] font-bold">\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE / Headline</Label>
                    <Textarea
                      value={headline}
                      onChange={(e) => { setHeadline(e.target.value); setIsGenerated(false); }}
                      placeholder="\u09A8\u09BF\u0989\u099C \u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE \u09B2\u09BF\u0996\u09C1\u09A8 (\u09AC\u09BE\u0982\u09B2\u09BE / English)"
                      className="bg-white/[0.03] border-white/[0.06] text-white min-h-[90px] resize-none text-sm rounded-xl focus:border-blue-400/40 focus:ring-blue-400/20 placeholder:text-white/20"
                      style={{ fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif" }}
                      data-testid="textarea-headline"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-white/30 text-[10px] uppercase tracking-[0.15em] font-bold">\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF</Label>
                      <Select value={category} onValueChange={(v) => { setCategory(v); setIsGenerated(false); }}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl" data-testid="select-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0c1020] border-white/[0.1] backdrop-blur-xl">
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c.value} value={c.value} className="text-white/80 focus:text-white focus:bg-blue-500/20">
                              {c.label} ({c.labelEn})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/30 text-[10px] uppercase tracking-[0.15em] font-bold">Via \u099F\u09C7\u0995\u09CD\u09B8\u099F</Label>
                      <Input
                        value={viaText}
                        onChange={(e) => { setViaText(e.target.value); setIsGenerated(false); }}
                        placeholder="Via | OTV"
                        className="bg-white/[0.03] border-white/[0.06] text-white text-sm rounded-xl"
                        data-testid="input-via-text"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-white/30 text-[10px] uppercase tracking-[0.15em] font-bold">\u09AC\u09CD\u09AF\u0995\u09CD\u09A4\u09BF\u09B0 \u09A8\u09BE\u09AE</Label>
                      <Input
                        value={personName}
                        onChange={(e) => setPersonName(e.target.value)}
                        placeholder="\u09AF\u09C7\u09AE\u09A8: \u0986\u0987\u09AE\u09BE\u09A8 \u09B8\u09BE\u09A6\u09BF\u0995"
                        className="bg-white/[0.03] border-white/[0.06] text-white text-sm rounded-xl"
                        data-testid="input-person-name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/30 text-[10px] uppercase tracking-[0.15em] font-bold">\u09AA\u09A6\u09AC\u09C0</Label>
                      <Input
                        value={personTitle}
                        onChange={(e) => setPersonTitle(e.target.value)}
                        placeholder="\u09AF\u09C7\u09AE\u09A8: CEO, 10 Minute School"
                        className="bg-white/[0.03] border-white/[0.06] text-white text-sm rounded-xl"
                        data-testid="input-person-title"
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="style"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label className="text-white/30 text-[10px] uppercase tracking-[0.15em] font-bold">\u0985\u09CD\u09AF\u09BE\u0995\u09CD\u09B8\u09C7\u09A8\u09CD\u099F \u0995\u09BE\u09B2\u09BE\u09B0</Label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { color: "#ffc107", name: "\u09B8\u09CB\u09A8\u09BE\u09B2\u09C0" },
                        { color: "#ff6600", name: "\u0995\u09AE\u09B2\u09BE" },
                        { color: "#cc0000", name: "\u09B2\u09BE\u09B2" },
                        { color: "#00e676", name: "\u09B8\u09AC\u09C1\u099C" },
                        { color: "#0088ff", name: "\u09A8\u09C0\u09B2" },
                        { color: "#9c27b0", name: "\u09AC\u09C7\u0997\u09C1\u09A8\u09C0" },
                        { color: "#d4af37", name: "\u0997\u09CB\u09B2\u09CD\u09A1" },
                        { color: "#a855f7", name: "\u09AA\u09BE\u09B0\u09CD\u09AA\u09B2" },
                      ].map((c) => (
                        <button
                          key={c.color}
                          onClick={() => { setHighlightColor(c.color); setIsGenerated(false); }}
                          className={`group flex flex-col items-center gap-1 transition-all duration-300 ${
                            highlightColor === c.color ? "scale-110" : "opacity-50"
                          }`}
                          data-testid={`button-color-${c.color.replace("#", "")}`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg transition-all ${
                              highlightColor === c.color ? "ring-2 ring-white ring-offset-2 ring-offset-[#04060e]" : ""
                            }`}
                            style={{ backgroundColor: c.color }}
                          />
                          <span className="text-[8px] text-white/40">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {!isPro && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-gradient-to-br from-amber-500/[0.08] to-orange-500/[0.04] border border-amber-500/20 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <h3 className="font-bold text-amber-400 text-xs">\u09AA\u09CD\u09B0\u09CB \u0986\u09AA\u0997\u09CD\u09B0\u09C7\u09A1 \u0995\u09B0\u09C1\u09A8</h3>
                      </div>
                      <ul className="text-[11px] text-white/40 space-y-1">
                        <li>\u0993\u09AF\u09BC\u09BE\u099F\u09BE\u09B0\u09AE\u09BE\u09B0\u09CD\u0995 \u099B\u09BE\u09DC\u09BE \u09A1\u09BE\u0989\u09A8\u09B2\u09CB\u09A1</li>
                        <li>\u0986\u09A8\u09B2\u09BF\u09AE\u09BF\u099F\u09C7\u09A1 \u0995\u09BE\u09B0\u09CD\u09A1 \u09A4\u09C8\u09B0\u09BF</li>
                        <li>\u09B8\u09AC \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u099F\u09C7\u09AE\u09CD\u09AA\u09B2\u09C7\u099F</li>
                      </ul>
                      <Button onClick={() => setIsPro(true)} size="sm" className="mt-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-[10px] rounded-lg" data-testid="button-upgrade-pro">
                        <Crown className="w-3 h-3 mr-1" />
                        Pro \u0985\u09CD\u09AF\u09BE\u0995\u09CD\u099F\u09BF\u09AD\u09C7\u099F \u0995\u09B0\u09C1\u09A8
                      </Button>
                    </motion.div>
                  )}

                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                    <h3 className="font-bold text-[10px] text-white/30 mb-2 uppercase tracking-[0.15em]">API Integration</h3>
                    <p className="text-[10px] text-white/20 mb-2">Templated.io-\u09A4\u09C7 template \u09AC\u09BE\u09A8\u09BF\u09AF\u09BC\u09C7 ID \u09A6\u09BE\u0993</p>
                    <Input placeholder="API Key" className="bg-white/[0.03] border-white/[0.06] text-white text-[10px] rounded-lg" data-testid="input-api-key" />
                    <p className="text-[8px] text-white/15 mt-1.5">Layers: main_photo, channel_logo, main_headline, category_badge, via_text</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={generatePremiumCard}
                disabled={isGenerating}
                size="lg"
                className="w-full relative overflow-visible bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 text-white font-bold text-sm tracking-wide rounded-xl h-12 no-default-hover-elevate no-default-active-elevate"
                data-testid="button-generate-card"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-xl blur-xl" />
                {isGenerating ? (
                  <motion.span
                    className="flex items-center gap-2 relative z-10"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    \u099C\u09C7\u09A8\u09BE\u09B0\u09C7\u099F \u09B9\u099A\u09CD\u099B\u09C7...
                  </motion.span>
                ) : (
                  <span className="flex items-center gap-2 relative z-10">
                    <Sparkles className="w-5 h-5" />
                    \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u0995\u09BE\u09B0\u09CD\u09A1 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8
                  </span>
                )}
              </Button>
            </motion.div>

            <AnimatePresence>
              {isGenerated && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-br from-blue-500/[0.06] to-cyan-500/[0.03] border border-blue-400/20 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                      <Sparkles className="w-4 h-4 text-blue-400" />
                    </motion.div>
                    <h3 className="font-bold text-xs text-blue-300">\u0995\u09BE\u09B0\u09CD\u09A1 \u09A4\u09C8\u09B0\u09BF \u09B9\u09AF\u09BC\u09C7\u099B\u09C7! \u09A1\u09BE\u0989\u09A8\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8:</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={downloadPNG} className="bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold flex-1 min-w-[90px] rounded-lg text-xs no-default-hover-elevate no-default-active-elevate" data-testid="button-download-png">
                      <FileImage className="w-3.5 h-3.5 mr-1.5" />
                      PNG
                    </Button>
                    <Button onClick={downloadJPG} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold flex-1 min-w-[90px] rounded-lg text-xs no-default-hover-elevate no-default-active-elevate" data-testid="button-download-jpg">
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      JPG
                    </Button>
                    <Button onClick={downloadPDF} className="bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold flex-1 min-w-[90px] rounded-lg text-xs no-default-hover-elevate no-default-active-elevate" data-testid="button-download-pdf">
                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                      PDF (A4)
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
              <h3 className="font-bold text-[10px] text-white/25 mb-2 uppercase tracking-[0.15em]">\u0995\u09BF\u09AD\u09BE\u09AC\u09C7 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09AC\u09C7\u09A8</h3>
              <ol className="text-[11px] text-white/30 space-y-1 list-decimal list-inside" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
                <li>\u0989\u09AA\u09B0\u09C7\u09B0 \u099F\u09C7\u09AE\u09CD\u09AA\u09B2\u09C7\u099F \u09A5\u09C7\u0995\u09C7 \u09AA\u099B\u09A8\u09CD\u09A6\u09C7\u09B0\u099F\u09BF \u09B8\u09BF\u09B2\u09C7\u0995\u09CD\u099F \u0995\u09B0\u09C1\u09A8</li>
                <li>\u09A8\u09BF\u0989\u099C \u09AB\u099F\u09CB \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8</li>
                <li>\u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2 \u09B2\u09CB\u0997\u09CB \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8 (PNG)</li>
                <li>\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE \u0993 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09B2\u09BF\u0996\u09C1\u09A8</li>
                <li>"\u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u0995\u09BE\u09B0\u09CD\u09A1 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8" \u09AC\u09BE\u099F\u09A8\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C1\u09A8</li>
                <li>PNG / JPG / PDF \u09A1\u09BE\u0989\u09A8\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8</li>
              </ol>
            </div>
          </motion.div>

          <motion.div
            className="order-1 lg:order-2 lg:sticky lg:top-[68px] lg:self-start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-3 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-white/25 uppercase tracking-[0.2em]">\u09B2\u09BE\u0987\u09AD \u09AA\u09CD\u09B0\u09BF\u09AD\u09BF\u0989</span>
                </div>
                <span className="text-[9px] text-white/15 bg-white/[0.04] px-2 py-0.5 rounded-md">{selectedTemplate.nameBn}</span>
              </div>
              <div className="relative bg-black/40 rounded-xl overflow-hidden" data-testid="preview-container">
                <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="w-full" data-testid="canvas-preview" />
                {isGenerating && (
                  <motion.div
                    className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <motion.div
                        className="w-10 h-10 border-3 border-blue-400/30 border-t-blue-400 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="text-xs text-blue-300 font-semibold">\u099C\u09C7\u09A8\u09BE\u09B0\u09C7\u099F \u09B9\u099A\u09CD\u099B\u09C7...</span>
                    </div>
                  </motion.div>
                )}
              </div>
              <div className="flex items-center justify-between mt-2 px-1">
                <p className="text-[9px] text-white/15">1200 x 1200 px</p>
                <p className="text-[9px] text-white/15">otv.online</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-white/[0.04] bg-[#04060e]/80 mt-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img src={otvLogoPath} alt="OTV" className="w-7 h-7 rounded object-contain" />
              <div>
                <p className="text-[10px] font-bold text-white/20">OTV Card Maker</p>
                <p className="text-[8px] text-white/10">otv.online</p>
              </div>
            </div>
            <p className="text-[9px] text-white/10" style={{ fontFamily: "'Noto Sans Bengali', sans-serif" }}>
              \u09AA\u09CD\u09B0\u09BF\u09AE\u09BF\u09AF\u09BC\u09BE\u09AE \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C0 \u09A8\u09BF\u0989\u099C \u09AB\u099F\u09CB \u0995\u09BE\u09B0\u09CD\u09A1 \u099C\u09C7\u09A8\u09BE\u09B0\u09C7\u099F\u09B0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
