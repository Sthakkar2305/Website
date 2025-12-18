"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Hand,
  Scan,
  Coins,
  CreditCard,
  Minus,
  Plus,
  CheckCircle2,
  Lock,
  Unlock,
  Circle as CircleIcon,
  Maximize2, // Icon for Ellipse mode
  ArrowDownToLine,
  ArrowLeftRight,
  MoveHorizontal,
  MoveVertical
} from "lucide-react";

// --- Data: Ring Size Chart ---
interface RingSize {
  indian: string;
  circumference: number;
  diameter: number;
}

const balkrushnaSizeChart: RingSize[] = [
  { indian: "1", circumference: 41.01, diameter: 13.1 },
  { indian: "2", circumference: 42.7, diameter: 13.3 },
  { indian: "3", circumference: 42.9, diameter: 13.7 },
  { indian: "4", circumference: 43.6, diameter: 13.9 },
  { indian: "5", circumference: 44.8, diameter: 14.3 },
  { indian: "6", circumference: 46.1, diameter: 14.7 },
  { indian: "7", circumference: 47.4, diameter: 15.1 },
  { indian: "8", circumference: 48.0, diameter: 15.3 },
  { indian: "9", circumference: 48.7, diameter: 15.5 },
  { indian: "10", circumference: 50.0, diameter: 15.9 },
  { indian: "11", circumference: 51.2, diameter: 16.3 },
  { indian: "12", circumference: 51.9, diameter: 16.5 },
  { indian: "13", circumference: 53.1, diameter: 16.9 },
  { indian: "14", circumference: 54.4, diameter: 17.3 },
  { indian: "15", circumference: 55.1, diameter: 17.5 },
  { indian: "16", circumference: 56.3, diameter: 17.9 },
  { indian: "17", circumference: 57.0, diameter: 18.1 },
  { indian: "18", circumference: 58.3, diameter: 18.5 },
  { indian: "19", circumference: 58.9, diameter: 18.8 },
  { indian: "20", circumference: 60.2, diameter: 19.2 },
  { indian: "21", circumference: 60.8, diameter: 19.4 },
  { indian: "22", circumference: 62.1, diameter: 19.8 },
  { indian: "23", circumference: 62.7, diameter: 20.0 },
  { indian: "24", circumference: 64.0, diameter: 20.4 },
  { indian: "25", circumference: 64.6, diameter: 20.6 },
  { indian: "26", circumference: 65.9, diameter: 21.0 },
  { indian: "27", circumference: 67.2, diameter: 21.1 },
  { indian: "28", circumference: 67.8, diameter: 21.6 },
  { indian: "29", circumference: 69.1, diameter: 22.0 },
  { indian: "30", circumference: 71.0, diameter: 22.3 },
  { indian: "31", circumference: 72.5, diameter: 23.0 },
  { indian: "32", circumference: 74.0, diameter: 23.5 },
  { indian: "33", circumference: 75.5, diameter: 24.0 },
  { indian: "34", circumference: 77.0, diameter: 24.5 },
  { indian: "35", circumference: 78.5, diameter: 25.0 },
  { indian: "36", circumference: 80.0, diameter: 25.5 },
  { indian: "37", circumference: 81.5, diameter: 26.0 },
  { indian: "38", circumference: 83.0, diameter: 26.5 },
  { indian: "39", circumference: 84.5, diameter: 27.0 },
  { indian: "40", circumference: 86.0, diameter: 27.5 },
  { indian: "41", circumference: 87.5, diameter: 28.0 },
  { indian: "42", circumference: 89.0, diameter: 28.5 },
  { indian: "43", circumference: 90.5, diameter: 29.0 },
  { indian: "44", circumference: 92.0, diameter: 29.5 },
  { indian: "45", circumference: 93.5, diameter: 30.0 },
  { indian: "46", circumference: 95.0, diameter: 30.5 },
  { indian: "47", circumference: 96.5, diameter: 31.0 },
  { indian: "48", circumference: 98.0, diameter: 31.5 },
  { indian: "49", circumference: 99.5, diameter: 32.0 },
  { indian: "50", circumference: 101.0, diameter: 32.5 },
];

export default function BalkrushnaRingMeasurementPage() {
  const [measuredSize, setMeasuredSize] = useState<RingSize | null>(null);

  // ===== CALIBRATION STATE (Source of Truth) =====
  const [pixelsPerMm, setPixelsPerMm] = useState<number>(0);
  const [isCalibrated, setIsCalibrated] = useState(false);

  // Measurement Values in MM
  const [fingerThicknessMm, setFingerThicknessMm] = useState(15.0);
  
  // NEW: Split Ring Dimensions for Ellipse/Irregular Mode
  const [ringWidthMm, setRingWidthMm] = useState(17.0);  // Horizontal Dia
  const [ringHeightMm, setRingHeightMm] = useState(17.0); // Vertical Dia

  // Calibration Temporary State
  const [calibCardWidthPx, setCalibCardWidthPx] = useState(200); 
  const [calibCoinWidthPx, setCalibCoinWidthPx] = useState(100);

  // UI State
  const [activeTab, setActiveTab] = useState("finger");
  // Updated Mode: 'circle' or 'ellipse' (for irregular rings)
  const [ringShapeMode, setRingShapeMode] = useState<"circle" | "ellipse">("circle");
  const [showCardCalib, setShowCardCalib] = useState(false);
  const [showCoinCalib, setShowCoinCalib] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Visualizer Refs
  const fingerVisualizerRef = useRef<HTMLDivElement>(null);
  const ringVisualizerRef = useRef<HTMLDivElement>(null);

  // --- Initialization ---
  useEffect(() => {
    const div = document.createElement("div");
    div.style.width = "1in";
    div.style.visibility = "hidden";
    document.body.appendChild(div);
    const pxPerInch = div.offsetWidth;
    document.body.removeChild(div);

    const initialPpm = pxPerInch / 25.4;
    setPixelsPerMm(initialPpm);
    
    // Default Calibration Values
    setCalibCardWidthPx(initialPpm * 53.98); 
    setCalibCoinWidthPx(initialPpm * 25.0);
  }, []);

  // --- Utilities ---
  const mmToPx = (mm: number) => mm * pixelsPerMm;
  const pxToMm = (px: number) => px / pixelsPerMm;

  // --- Action Handlers ---
  const saveCardCalibration = () => {
    const newPpm = calibCardWidthPx / 53.98;
    setPixelsPerMm(newPpm);
    setIsCalibrated(true);
    setShowCardCalib(false);
    resetMeasurements();
  };

  const saveCoinCalibration = () => {
    const newPpm = calibCoinWidthPx / 25.0;
    setPixelsPerMm(newPpm);
    setIsCalibrated(true);
    setShowCoinCalib(false);
    resetMeasurements();
  };

  const resetMeasurements = () => {
    setFingerThicknessMm(15.0);
    setRingWidthMm(17.0);
    setRingHeightMm(17.0);
    setMeasuredSize(null);
  };

  const calculateFingerSize = () => {
    const circ = fingerThicknessMm * Math.PI;
    findClosestSize(circ, "circumference");
  };

  // UPDATED: Calculate based on Shape Mode
  const calculateRingSize = () => {
    let diameterToUse = ringWidthMm; // Default circle
    
    if (ringShapeMode === 'ellipse') {
      // For irregular/bent rings, average the Widest and Narrowest parts
      // This is the standard Jeweler method for out-of-round rings
      diameterToUse = (ringWidthMm + ringHeightMm) / 2;
    }

    findClosestSize(diameterToUse, "diameter");
  };

  const findClosestSize = (value: number, type: "diameter" | "circumference") => {
    let closest = balkrushnaSizeChart[0];
    let minDiff = Math.abs(closest[type] - value);

    for (const size of balkrushnaSizeChart) {
      const diff = Math.abs(size[type] - value);
      if (diff < minDiff) {
        minDiff = diff;
        closest = size;
      }
    }
    setMeasuredSize(closest);
    
    // PRESERVED SCROLLING LOGIC
    setTimeout(() => {
       document.getElementById("result-card")?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // --- Input Handlers ---
  const handleSliderChange = (setter: (v: number) => void, val: string) => {
    if (isLocked) return;
    const num = parseFloat(val);
    setter(num);
    // If in circle mode, keep width/height synced
    if (ringShapeMode === 'circle' && (setter === setRingWidthMm || setter === setRingHeightMm)) {
        setRingWidthMm(num);
        setRingHeightMm(num);
    }
  };

  // UPDATED: Finer control (0.05mm) for high accuracy
  const handleFineTune = (setter: (v: number) => void, current: number, delta: number) => {
      if (isLocked) return;
      const limit = activeTab === 'finger' ? 40 : 80;
      const newVal = Math.max(5, Math.min(limit, current + delta));
      const rounded = Number(newVal.toFixed(2)); // Use 2 decimals for precision
      
      setter(rounded);
      // Sync if circle mode
      if (ringShapeMode === 'circle') {
          if (setter === setRingWidthMm) setRingHeightMm(rounded);
          if (setter === setRingHeightMm) setRingWidthMm(rounded);
      }
  }

  // --- Drag Logic ---
  
  // 1. Vertical Drag (Used for Finger & Ring Height)
  const handleVerticalDrag = (
    e: React.PointerEvent, 
    ref: React.RefObject<HTMLDivElement | null>, 
    setter: (v: number) => void
  ) => {
    if (isLocked || !ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    // For finger: Bottom line based. For ring: Center based is better, but keeping your logic logic consistent
    // Let's stick to your "Base Line" logic for Finger, but Center logic for Ring is easier?
    // User requested NO logic change for Finger.
    
    if (activeTab === 'finger') {
        const bottomLineY = rect.bottom - (rect.height * 0.15); 
        const mouseY = e.clientY;
        const heightPx = bottomLineY - mouseY;
        let newMm = pxToMm(heightPx);
        newMm = Math.max(5, Math.min(40, newMm));
        setter(Number(newMm.toFixed(1)));
    } else {
        // RING Vertical Drag (Center based expansion)
        // Dragging away from center increases size
        const centerY = rect.top + rect.height / 2;
        const distY = Math.abs(e.clientY - centerY);
        const heightMm = pxToMm(distY * 2); // Distance is radius, so *2 for diameter
        const validMm = Math.max(5, Math.min(80, heightMm));
        
        setter(Number(validMm.toFixed(2)));
        if (ringShapeMode === 'circle') setRingWidthMm(Number(validMm.toFixed(2)));
    }
  };

  // 2. Horizontal Drag (New for Ellipse Width)
  const handleHorizontalDrag = (e: React.PointerEvent, ref: React.RefObject<HTMLDivElement | null>) => {
      if (isLocked || !ref.current || activeTab !== 'ring') return;
      
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const distX = Math.abs(e.clientX - centerX);
      const widthMm = pxToMm(distX * 2);
      const validMm = Math.max(5, Math.min(80, widthMm));

      setRingWidthMm(Number(validMm.toFixed(2)));
      if (ringShapeMode === 'circle') setRingHeightMm(Number(validMm.toFixed(2)));
  };

  // --- Reusable Control Component ---
  const MeasurementControls = ({
    value,
    setValue,
    label,
    icon: Icon
  }: {
    value: number;
    setValue: (n: number) => void;
    label: string;
    icon?: any;
  }) => (
    <div className="space-y-3 mb-4">
      <div className="flex items-center justify-between">
         <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            {Icon && <Icon size={14} />} {label}
         </span>
         <span className="font-mono text-lg font-bold text-orange-600">{value.toFixed(2)} mm</span>
      </div>

      <div className="flex items-center gap-2">
         <Button
            variant="outline" size="icon" className="h-10 w-10 shrink-0"
            disabled={isLocked}
            onClick={() => handleFineTune(setValue, value, -0.05)}
         >
            <Minus size={14} />
         </Button>
         
         {/* Slider */}
         <div className="relative flex-1 h-10 flex items-center">
            <input
              type="range" min={5} max={activeTab === 'finger' ? 40 : 80} step={0.05}
              value={value}
              onChange={(e) => handleSliderChange(setValue, e.target.value)}
              disabled={isLocked}
              className="w-full absolute z-20 opacity-0 cursor-pointer h-full"
            />
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden relative z-10">
               <div 
                 className="h-full bg-orange-500"
                 style={{ width: `${((value - 5) / ((activeTab === 'finger' ? 40 : 80) - 5)) * 100}%` }}
               />
            </div>
            <div 
                className="absolute h-6 w-6 bg-white border-2 border-orange-600 rounded-full shadow z-10 pointer-events-none transition-all"
                style={{ 
                    left: `${((value - 5) / ((activeTab === 'finger' ? 40 : 80) - 5)) * 100}%`,
                    transform: 'translateX(-50%)'
                }}
            />
         </div>

         <Button
            variant="outline" size="icon" className="h-10 w-10 shrink-0"
            disabled={isLocked}
            onClick={() => handleFineTune(setValue, value, 0.05)}
         >
            <Plus size={14} />
         </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 font-sans bg-gray-50 dark:bg-gray-950 min-h-screen select-none">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black text-orange-600 dark:text-orange-500 tracking-tight">
          BALKRUSHNA
        </h1>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-[0.2em] mt-1">
          Precision Jewellers
        </p>

        {!isCalibrated ? (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-3 rounded-lg flex items-center justify-center gap-2 text-red-600 dark:text-red-400 text-sm font-semibold animate-pulse">
            <span>⚠ Calibration Required First</span>
          </div>
        ) : (
          <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 p-3 rounded-lg flex items-center justify-center gap-2 text-green-700 dark:text-green-400 text-sm font-semibold">
            <CheckCircle2 size={16} />
            <span>Device Calibrated</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-12 bg-white dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700 rounded-xl mb-4">
              <TabsTrigger value="finger" className="rounded-lg data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
                <Hand className="mr-2" size={16} /> Finger
              </TabsTrigger>
              <TabsTrigger value="ring" className="rounded-lg data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
                <Scan className="mr-2" size={16} /> Ring
              </TabsTrigger>
            </TabsList>

            {/* ===== FINGER TOOL (UNCHANGED LOGIC) ===== */}
            <TabsContent value="finger">
              <Card className="border-0 shadow-lg dark:bg-gray-900">
                <CardContent className="p-6">
                  {!isCalibrated && (
                    <Button onClick={() => setShowCardCalib(true)} className="w-full mb-6 bg-blue-600 text-white h-12 shadow-md">
                      <CreditCard className="mr-2" /> Calibrate Now
                    </Button>
                  )}

                  <div 
                    ref={fingerVisualizerRef}
                    className="relative w-full h-80 bg-white dark:bg-gray-950 rounded-2xl border-2 border-gray-100 dark:border-gray-800 shadow-inner overflow-hidden touch-none flex flex-col items-center justify-center"
                    onPointerMove={(e) => handleVerticalDrag(e, fingerVisualizerRef, setFingerThicknessMm)}
                  >
                      {/* FIXED BASE LINE LOGIC (PRESERVED) */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
                         <span className="text-6xl font-black text-gray-900 dark:text-white">bkj</span>
                      </div>
                      <div className="absolute w-full h-1 bg-gray-800 dark:bg-gray-600 z-10" style={{ bottom: '15%' }}>
                          <div className="absolute -bottom-6 w-full text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">Base Line (Fixed)</div>
                      </div>
                      <div 
                        className="absolute w-full border-b-2 border-orange-600 border-dashed z-20 flex items-end justify-center pb-1"
                        style={{ bottom: `calc(15% + ${mmToPx(fingerThicknessMm)}px)`, height: '20px' }}
                      >
                          <div className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                             <ArrowDownToLine size={10} /> Adjust
                          </div>
                      </div>
                      <div 
                        className="absolute w-full bg-orange-500/10 z-0 border-l border-r border-orange-200/30"
                        style={{ bottom: '15%', height: mmToPx(fingerThicknessMm) }}
                      />
                  </div>
                  
                  <div className="mt-6">
                    <MeasurementControls
                       value={fingerThicknessMm}
                       setValue={setFingerThicknessMm}
                       label="Finger Thickness"
                    />
                    <Button onClick={calculateFingerSize} className="w-full h-14 text-lg font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-lg rounded-xl mt-4">
                      Calculate My Size
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===== RING TOOL (UPDATED FOR 100% ACCURACY) ===== */}
            <TabsContent value="ring">
              <Card className="border-0 shadow-lg dark:bg-gray-900">
                <CardContent className="p-6">
                  {!isCalibrated && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <Button onClick={() => setShowCoinCalib(true)} className="bg-blue-600 text-white h-12">
                        <Coins className="mr-2" size={16} /> Coin
                      </Button>
                      <Button onClick={() => setShowCardCalib(true)} variant="outline" className="h-12 border-blue-200 text-blue-700">
                        <CreditCard className="mr-2" size={16} /> Card
                      </Button>
                    </div>
                  )}

                  {/* Mode Selector */}
                  <div className="flex gap-2 justify-center mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-full w-fit mx-auto">
                      <button 
                         onClick={() => { setRingShapeMode('circle'); setRingHeightMm(ringWidthMm); }}
                         className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${ringShapeMode === 'circle' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
                      >
                         <CircleIcon size={14} /> Standard Circle
                      </button>
                      <button 
                         onClick={() => setRingShapeMode('ellipse')}
                         className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${ringShapeMode === 'ellipse' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
                      >
                         <Maximize2 size={14} /> Bent/Oval Ring
                      </button>
                  </div>

                  {/* 100% Accuracy Visualizer */}
                  <div 
                    ref={ringVisualizerRef}
                    className="relative w-full h-80 bg-slate-950 rounded-2xl border-4 border-slate-800 shadow-2xl overflow-hidden touch-none flex items-center justify-center cursor-crosshair"
                    onPointerMove={(e) => {
                        handleHorizontalDrag(e, ringVisualizerRef);
                        handleVerticalDrag(e, ringVisualizerRef, setRingHeightMm);
                    }}
                  >
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    
                    {/* The Adjustable Ring Shape */}
                    <div
                        className="relative border-[3px] border-orange-500 rounded-full shadow-[0_0_30px_rgba(249,115,22,0.3)] z-10 box-content"
                        style={{ 
                            width: mmToPx(ringWidthMm), 
                            height: mmToPx(ringHeightMm),
                            backgroundColor: 'rgba(249,115,22,0.05)'
                        }}
                    >
                        {/* Center Crosshair */}
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-orange-500/40 -translate-y-1/2" />
                        <div className="absolute left-1/2 top-0 h-full w-[1px] bg-orange-500/40 -translate-x-1/2" />
                        
                        {/* Labels for "Inner Wall" */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-orange-400 font-bold whitespace-nowrap bg-slate-900 px-2 rounded-full border border-orange-500/30">
                            ▲ INNER WALL ▲
                        </div>
                    </div>

                    <div className="absolute bottom-3 text-center w-full text-slate-500 text-[10px] font-medium pointer-events-none">
                       {ringShapeMode === 'circle' ? 'Drag anywhere to resize' : 'Drag Horizontally for Width, Vertically for Height'}
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                     {/* Lock Toggle */}
                     <div className="flex justify-end mb-2">
                         <Button 
                           variant="ghost" size="sm" 
                           onClick={() => setIsLocked(!isLocked)}
                           className={isLocked ? "text-red-500 bg-red-50" : "text-gray-400"}
                         >
                           {isLocked ? <><Lock size={14} className="mr-1"/> Locked</> : <><Unlock size={14} className="mr-1"/> Unlock controls</>}
                         </Button>
                     </div>

                     {/* Controls */}
                     <MeasurementControls
                        value={ringWidthMm}
                        setValue={setRingWidthMm}
                        label={ringShapeMode === 'circle' ? "Diameter" : "Width (Horizontal)"}
                        icon={ringShapeMode === 'circle' ? CircleIcon : MoveHorizontal}
                     />
                     
                     {ringShapeMode === 'ellipse' && (
                         <MeasurementControls
                            value={ringHeightMm}
                            setValue={setRingHeightMm}
                            label="Height (Vertical)"
                            icon={MoveVertical}
                         />
                     )}

                     <Button
                        onClick={calculateRingSize}
                        className="w-full h-14 text-lg font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-lg rounded-xl mt-4"
                      >
                        Calculate My Size
                      </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* ===== RESULTS (PRESERVED) ===== */}
          {measuredSize && (
            <div id="result-card" className="pt-4 pb-10">
              <Card className="bg-green-600 text-white border-0 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl" />
                <CardContent className="p-8 text-center relative z-10">
                  <p className="text-sm font-medium uppercase tracking-widest opacity-90 mb-1">
                    Your Perfect Size
                  </p>
                  <div className="text-8xl font-black tracking-tight mb-6 drop-shadow-md">
                    {measuredSize.indian}
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <span className="block text-xs uppercase opacity-70">Diameter</span>
                        <span className="text-xl font-bold font-mono">{measuredSize.diameter}</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <span className="block text-xs uppercase opacity-70">Circumference</span>
                        <span className="text-xl font-bold font-mono">{measuredSize.circumference}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* ===== SIZE CHART SIDEBAR (PRESERVED) ===== */}
        <div className="hidden lg:block space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Standard Size Chart</CardTitle>
                </CardHeader>
                <CardContent className="h-[600px] overflow-y-auto pr-2">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-white dark:bg-gray-950 z-10">
                            <tr>
                                <th className="p-3 text-left font-bold border-b">Size</th>
                                <th className="p-3 text-left font-bold border-b">Dia</th>
                                <th className="p-3 text-left font-bold border-b">Circ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {balkrushnaSizeChart.map(s => (
                                <tr key={s.indian} className={`border-b border-gray-100 dark:border-gray-800 ${measuredSize?.indian === s.indian ? 'bg-green-50 dark:bg-green-900/40' : ''}`}>
                                    <td className="p-3 font-medium">{s.indian}</td>
                                    <td className="p-3 text-gray-500">{s.diameter}</td>
                                    <td className="p-3 text-gray-500">{s.circumference}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* ===== MODALS (Calibration - PRESERVED) ===== */}
      
      {/* CARD CALIBRATION */}
      {showCardCalib && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="text-orange-600" /> Calibration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                <strong>VERTICAL METHOD:</strong> Place your card <strong>Standing Up (Vertically)</strong> on the screen. Adjust the slider until the box matches the card's width.
              </p>
              <div className="flex justify-center mb-8">
                <div
                  className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-xl relative shadow-lg"
                  style={{ width: calibCardWidthPx, height: calibCardWidthPx * 1.58, maxWidth: "100%" }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
                      <ArrowLeftRight className="mb-2" />
                     <span className="text-lg font-bold text-center">CARD<br/>WIDTH</span>
                  </div>
                  <div className="absolute -bottom-7 w-full flex justify-between text-xs text-orange-600 font-bold uppercase tracking-widest">
                    <span>◄</span><span>Match Width</span><span>►</span>
                  </div>
                </div>
              </div>
              <input
                type="range" min={150} max={500} step={1}
                value={calibCardWidthPx}
                onChange={(e) => setCalibCardWidthPx(parseFloat(e.target.value))}
                className="w-full h-4 bg-gray-200 rounded-full appearance-none cursor-pointer accent-orange-600 mb-6"
              />
              <Button onClick={saveCardCalibration} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl">
                Confirm Calibration
              </Button>
              <Button variant="ghost" onClick={() => setShowCardCalib(false)} className="w-full mt-2">Cancel</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* COIN CALIBRATION */}
      {showCoinCalib && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Coins className="text-orange-600" /> Calibration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Place a <strong>₹2 Rupee Coin</strong> on the screen. Adjust until the circle matches the coin size.
              </p>
              <div className="flex justify-center mb-8">
                <div
                  className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-900/20 rounded-full relative shadow-lg"
                  style={{ width: calibCoinWidthPx, height: calibCoinWidthPx }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <span className="text-2xl font-bold">₹2</span>
                  </div>
                  <div className="absolute -bottom-7 w-full flex justify-center text-xs text-orange-600 font-bold uppercase tracking-widest">
                    <span>Match Circle</span>
                  </div>
                </div>
              </div>
              <input
                type="range" min={50} max={250} step={1}
                value={calibCoinWidthPx}
                onChange={(e) => setCalibCoinWidthPx(parseFloat(e.target.value))}
                className="w-full h-4 bg-gray-200 rounded-full appearance-none cursor-pointer accent-orange-600 mb-6"
              />
              <Button onClick={saveCoinCalibration} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl">
                Confirm Calibration
              </Button>
              <Button variant="ghost" onClick={() => setShowCoinCalib(false)} className="w-full mt-2">Cancel</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}