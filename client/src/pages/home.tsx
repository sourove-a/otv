import { useState, useRef, useEffect, useCallback } from "react";
import { templates, type CardData, type TemplateConfig } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Zap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
} from "lucide-react";
import { jsPDF } from "jspdf";

const CATEGORIES = [
  "JUSTICE",
  "NATIONAL",
  "WORLD",
  "BREAKING",
  "SPORTS",
  "POLITICS",
  "ENTERTAINMENT",
  "INVESTIGATION",
  "OPINION",
  "TRENDING",
  "CRIME",
  "EDUCATION",
];

const CANVAS_SIZE = 1200;

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig>(templates[0]);
  const [headline, setHeadline] = useState("3 PERSON GET 2.5 YEARS JAIL FOR K!LLING 20 DOGS IN JATRABARI");
  const [category, setCategory] = useState("JUSTICE");
  const [viaText, setViaText] = useState("Via | Jamuna TV");
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
  const [generatedDataUrl, setGeneratedDataUrl] = useState<string | null>(null);
  const [fontsReady, setFontsReady] = useState(false);

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
      ctx.globalAlpha = 0.2;
      ctx.font = `700 42px "Montserrat", sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.fillText("BD NEWS CARD MAKER", 0, 0);
      ctx.restore();
    }
  }, [headline, category, viaText, mainPhotoImg, logoImg, selectedTemplate, isPro, personName, personTitle, highlightColor]);

  useEffect(() => {
    if (fontsReady) {
      renderCard();
    }
  }, [renderCard, fontsReady]);

  const generatePremiumCard = useCallback(() => {
    setIsGenerating(true);
    setIsGenerated(false);
    setTimeout(() => {
      renderCard();
      const canvas = canvasRef.current;
      if (canvas) {
        setGeneratedDataUrl(canvas.toDataURL("image/png"));
        setIsGenerated(true);
      }
      setIsGenerating(false);
    }, 600);
  }, [renderCard]);

  const downloadPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsGenerating(true);
    setTimeout(() => {
      const link = document.createElement("a");
      link.download = `news-card-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setIsGenerating(false);
    }, 100);
  }, []);

  const downloadJPG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsGenerating(true);
    setTimeout(() => {
      const link = document.createElement("a");
      link.download = `news-card-${Date.now()}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
      setIsGenerating(false);
    }, 100);
  }, []);

  const downloadPDF = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsGenerating(true);
    setTimeout(() => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgSize = Math.min(pdfW - 20, pdfH - 20);
      const xOff = (pdfW - imgSize) / 2;
      const yOff = (pdfH - imgSize) / 2;
      pdf.addImage(imgData, "PNG", xOff, yOff, imgSize, imgSize);
      pdf.save(`news-card-${Date.now()}.pdf`);
      setIsGenerating(false);
    }, 100);
  }, []);

  const templateGalleryRef = useRef<HTMLDivElement>(null);
  const scrollGallery = (dir: number) => {
    templateGalleryRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0a0e1f] text-white" data-testid="home-page">
      <header className="border-b border-[#1a1e3f] bg-[#0d1225]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight" data-testid="text-app-title">BD News Card Maker</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Premium News Photo Card Generator</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#1a1e3f] rounded-md px-3 py-1.5">
              <span className="text-xs text-gray-400">Free</span>
              <Switch
                checked={isPro}
                onCheckedChange={setIsPro}
                data-testid="switch-pro-toggle"
              />
              <span className="text-xs flex items-center gap-1">
                <Crown className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">Pro</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-[#1a1e3f] bg-[#0d1225]/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Templates ({templates.length})
            </h2>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => scrollGallery(-1)}
                className="text-gray-400 w-7 h-7"
                data-testid="button-scroll-left"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => scrollGallery(1)}
                className="text-gray-400 w-7 h-7"
                data-testid="button-scroll-right"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div
            ref={templateGalleryRef}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
            data-testid="template-gallery"
          >
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTemplate(t);
                  setCategory(t.defaultCategory);
                }}
                className={`flex-shrink-0 w-[130px] rounded-md p-0.5 transition-all duration-200 ${
                  selectedTemplate.id === t.id
                    ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-[#0a0e1f]"
                    : "ring-1 ring-[#2a2e4f] opacity-70"
                }`}
                data-testid={`button-template-${t.id}`}
              >
                <div
                  className="w-full h-[90px] rounded-md flex items-end p-2"
                  style={{
                    background: `linear-gradient(135deg, ${t.previewColors[0]}, ${t.previewColors[1]})`,
                  }}
                >
                  <div className="flex flex-col items-start gap-1">
                    <div
                      className="w-8 h-1 rounded-full"
                      style={{ backgroundColor: t.accentColor }}
                    />
                    <div className="w-16 h-1 bg-white/30 rounded-full" />
                    <div className="w-12 h-1 bg-white/20 rounded-full" />
                  </div>
                </div>
                <div className="px-2 py-1.5 text-left">
                  <p className="text-[10px] font-semibold text-white truncate">{t.name}</p>
                  <p className="text-[9px] text-gray-500 truncate">{t.nameBn}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
          <div className="order-2 lg:order-1 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-400 text-xs uppercase tracking-wider">Main Photo</Label>
                <input
                  ref={mainPhotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  data-testid="input-main-photo"
                />
                <div
                  onClick={() => mainPhotoInputRef.current?.click()}
                  className="border-2 border-dashed border-[#2a2e4f] rounded-md p-4 text-center cursor-pointer transition-colors group"
                  data-testid="dropzone-main-photo"
                >
                  {mainPhotoSrc ? (
                    <div className="relative">
                      <img src={mainPhotoSrc} alt="Main" className="w-full h-24 object-cover rounded" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMainPhotoSrc(null);
                          setMainPhotoImg(null);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center"
                        data-testid="button-remove-photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                      <p className="text-xs text-gray-500">Click to upload news photo</p>
                      <p className="text-[10px] text-gray-600 mt-1">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400 text-xs uppercase tracking-wider">Channel Logo</Label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                  data-testid="input-logo"
                />
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="border-2 border-dashed border-[#2a2e4f] rounded-md p-4 text-center cursor-pointer transition-colors"
                  data-testid="dropzone-logo"
                >
                  {logoSrc ? (
                    <div className="relative">
                      <img src={logoSrc} alt="Logo" className="h-12 mx-auto object-contain" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLogoSrc(null);
                          setLogoImg(null);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center"
                        data-testid="button-remove-logo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                      <p className="text-xs text-gray-500">Upload PNG logo</p>
                      <p className="text-[10px] text-gray-600 mt-1">Transparent PNG recommended</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400 text-xs uppercase tracking-wider">
                Headline / \u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE
              </Label>
              <Textarea
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Enter news headline (Bangla + English supported)"
                className="bg-[#111633] border-[#2a2e4f] text-white min-h-[100px] resize-none text-sm"
                data-testid="textarea-headline"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-400 text-xs uppercase tracking-wider">
                  Category / \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger
                    className="bg-[#111633] border-[#2a2e4f] text-white"
                    data-testid="select-category"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1e3f] border-[#2a2e4f]">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="text-white">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400 text-xs uppercase tracking-wider">Via Text</Label>
                <Input
                  value={viaText}
                  onChange={(e) => setViaText(e.target.value)}
                  placeholder="Via | Channel Name"
                  className="bg-[#111633] border-[#2a2e4f] text-white text-sm"
                  data-testid="input-via-text"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-400 text-xs uppercase tracking-wider">
                  Person Name (Optional)
                </Label>
                <Input
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g. Ayman Sadiq"
                  className="bg-[#111633] border-[#2a2e4f] text-white text-sm"
                  data-testid="input-person-name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400 text-xs uppercase tracking-wider">
                  Person Title (Optional)
                </Label>
                <Input
                  value={personTitle}
                  onChange={(e) => setPersonTitle(e.target.value)}
                  placeholder="e.g. CEO, 10 Minute School"
                  className="bg-[#111633] border-[#2a2e4f] text-white text-sm"
                  data-testid="input-person-title"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400 text-xs uppercase tracking-wider">Accent Color</Label>
              <div className="flex gap-2 flex-wrap">
                {["#ffc107", "#ff6600", "#cc0000", "#00e676", "#4a90d9", "#9c27b0", "#d4af37", "#a855f7"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setHighlightColor(c)}
                    className={`w-8 h-8 rounded-md transition-all ${
                      highlightColor === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#0a0e1f] scale-110" : "opacity-70"
                    }`}
                    style={{ backgroundColor: c }}
                    data-testid={`button-color-${c.replace("#", "")}`}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={generatePremiumCard}
              disabled={isGenerating}
              size="lg"
              className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black font-bold text-base tracking-wide"
              data-testid="button-generate-card"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Generate Premium Card
                </span>
              )}
            </Button>

            {isGenerated && (
              <div className="bg-[#111633] border border-yellow-500/30 rounded-md p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <h3 className="font-semibold text-sm text-yellow-400">Card Generated!</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={downloadPNG}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-semibold flex-1 min-w-[100px]"
                    data-testid="button-download-png"
                  >
                    <FileImage className="w-4 h-4 mr-2" />
                    PNG
                  </Button>
                  <Button
                    onClick={downloadJPG}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold flex-1 min-w-[100px]"
                    data-testid="button-download-jpg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    JPG
                  </Button>
                  <Button
                    onClick={downloadPDF}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold flex-1 min-w-[100px]"
                    data-testid="button-download-pdf"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    PDF (A4)
                  </Button>
                </div>
              </div>
            )}

            {!isPro && (
              <div className="bg-gradient-to-r from-yellow-500/10 to-amber-600/10 border border-yellow-500/20 rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-semibold text-yellow-400 text-sm">Upgrade to Pro</h3>
                </div>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>No watermark on exports</li>
                  <li>Unlimited downloads</li>
                  <li>All premium templates</li>
                  <li>Priority support</li>
                </ul>
                <Button
                  onClick={() => setIsPro(true)}
                  size="sm"
                  className="mt-3 bg-yellow-500 text-black font-semibold text-xs"
                  data-testid="button-upgrade-pro"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Activate Pro (Demo)
                </Button>
              </div>
            )}

            <div className="bg-[#111633] border border-[#2a2e4f] rounded-md p-4">
              <h3 className="font-semibold text-sm text-gray-300 mb-2">
                API / Templated.io Integration
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Templated.io-\u09A4\u09C7 template \u09AC\u09BE\u09A8\u09BF\u09AF\u09BC\u09C7 ID \u09A6\u09BE\u0993\u0964 \u09A4\u09BE\u09B9\u09B2\u09C7 API \u09A6\u09BF\u09AF\u09BC\u09C7 \u0985\u099F\u09CB\u09AE\u09C7\u099F\u09BF\u0995 \u0995\u09BE\u09B0\u09CD\u09A1 \u09AC\u09BE\u09A8\u09BE\u09A8\u09CB \u09AF\u09BE\u09AC\u09C7\u0964
              </p>
              <Input
                placeholder="Enter Templated.io API Key"
                className="bg-[#0a0e1f] border-[#2a2e4f] text-white text-xs"
                data-testid="input-api-key"
              />
              <p className="text-[10px] text-gray-600 mt-2">
                Layer names: main_photo, channel_logo, main_headline, category_badge, via_text
              </p>
            </div>

            <div className="bg-[#111633] border border-[#2a2e4f] rounded-md p-4">
              <h3 className="font-semibold text-sm text-gray-300 mb-2">
                \u0995\u09BF\u09AD\u09BE\u09AC\u09C7 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09AC\u09C7\u09A8
              </h3>
              <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                <li>\u099F\u09C7\u09AE\u09CD\u09AA\u09B2\u09C7\u099F \u09B8\u09BF\u09B2\u09C7\u0995\u09CD\u099F \u0995\u09B0\u09C1\u09A8</li>
                <li>\u09A8\u09BF\u0989\u099C \u09AB\u099F\u09CB \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8</li>
                <li>\u099A\u09CD\u09AF\u09BE\u09A8\u09C7\u09B2 \u09B2\u09CB\u0997\u09CB \u0986\u09AA\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8 (PNG)</li>
                <li>\u09B9\u09C7\u09A1\u09B2\u09BE\u0987\u09A8, \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF, Via \u099F\u09C7\u0995\u09CD\u09B8\u099F \u09B2\u09BF\u0996\u09C1\u09A8</li>
                <li>PNG / JPG / PDF \u09A1\u09BE\u0989\u09A8\u09B2\u09CB\u09A1 \u0995\u09B0\u09C1\u09A8</li>
              </ol>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:sticky lg:top-20 lg:self-start">
            <div className="bg-[#111633] border border-[#2a2e4f] rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Live Preview
                </h3>
                <div className="flex items-center gap-2">
                  <Badge className="no-default-active-elevate text-[10px] bg-[#1a1e3f] text-gray-400 border-[#2a2e4f]">
                    {selectedTemplate.name}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={renderCard}
                    className="w-7 h-7 text-gray-400"
                    data-testid="button-refresh-preview"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="relative bg-black rounded overflow-hidden" data-testid="preview-container">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_SIZE}
                  height={CANVAS_SIZE}
                  className="w-full max-w-[500px] mx-auto"
                  data-testid="canvas-preview"
                />
              </div>
              <p className="text-[10px] text-gray-600 text-center mt-2">
                1200 x 1200 px | High Resolution | Social Media Ready
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-[#1a1e3f] bg-[#0d1225]/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-gray-600">
            BD News Card Maker &mdash; Premium Bangladeshi News Photo Card Generator
          </p>
          <p className="text-[10px] text-gray-700 mt-1">
            Supports Bangla Unicode | Noto Sans Bengali | Montserrat
          </p>
        </div>
      </footer>
    </div>
  );
}
