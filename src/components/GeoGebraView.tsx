import React, { useEffect, useRef, useState } from 'react';
import { CircleTask, GeometricObjectInfo } from '../types';
import { RefreshCw, ZoomIn, ZoomOut, Maximize2, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';

interface GeoGebraViewProps {
  task: CircleTask;
  onObjectsChange?: (objects: GeometricObjectInfo[]) => void;
  onAppletReady?: (api: any) => void;
  onRequestHint?: () => void;
  onCheck?: () => void;
}

declare global {
  interface Window {
    GGBApplet?: any;
    [key: string]: any;
  }
}

export function extractGeoGebraObjects(api: any): GeometricObjectInfo[] {
  if (!api || !api.getAllObjectNames) return [];
  try {
    const names: string[] = api.getAllObjectNames();
    const extracted: GeometricObjectInfo[] = [];

    for (const name of names) {
      const typeStr = (api.getObjectType(name) || '').toLowerCase();
      const definition = api.getCommandString(name) || (api.getDefinitionString ? api.getDefinitionString(name) : '');
      const objInfo: GeometricObjectInfo = {
        name,
        type: 'other',
        definition: definition || '',
      };

      if (typeStr === 'point') {
        objInfo.type = 'point';
        const px = api.getXcoord(name);
        const py = api.getYcoord(name);
        if (!isNaN(px) && !isNaN(py)) {
          objInfo.coords = { x: px, y: py };
        }
      } else if (typeStr === 'circle' || typeStr === 'conic' || typeStr === 'conicpart') {
        objInfo.type = 'circle';
        // 1. Try Center(c) and Radius(c)
        let cx = api.getValue(`x(Center(${name}))`);
        let cy = api.getValue(`y(Center(${name}))`);
        let radius = api.getValue(`Radius(${name})`);

        // 2. Try x(c), y(c) if Center() is NaN
        if (isNaN(cx) || isNaN(cy)) {
          cx = api.getValue(`x(${name})`);
          cy = api.getValue(`y(${name})`);
        }

        // 3. Try sampling radius if Radius() is NaN
        if (isNaN(radius) || radius <= 0) {
          const sampleDist = api.getValue(`sqrt((x(Point(${name}, 0)) - ${!isNaN(cx) ? cx : 0})^2 + (y(Point(${name}, 0)) - ${!isNaN(cy) ? cy : 0})^2)`);
          if (!isNaN(sampleDist) && sampleDist > 0) {
            radius = sampleDist;
          }
        }

        if (!isNaN(radius) && radius > 0) {
          objInfo.circleData = {
            centerX: !isNaN(cx) ? cx : 0,
            centerY: !isNaN(cy) ? cy : 0,
            radius: radius,
          };
        }
      } else if (typeStr === 'line' || typeStr === 'ray' || typeStr === 'segment') {
        objInfo.type = typeStr === 'segment' ? 'segment' : 'line';
        
        let foundCoeffs = false;

        // Method 1: Query x1, y1, x2, y2 from GeoGebra's Point(name, 0) and Point(name, 1) or getPointX / getPointY
        try {
          const p1x = api.getValue(`x(Point(${name}, 0))`);
          const p1y = api.getValue(`y(Point(${name}, 0))`);
          const p2x = api.getValue(`x(Point(${name}, 1))`);
          const p2y = api.getValue(`y(Point(${name}, 1))`);

          if (!isNaN(p1x) && !isNaN(p1y) && !isNaN(p2x) && !isNaN(p2y) && (p1x !== p2x || p1y !== p2y)) {
            const a = p2y - p1y;
            const b = -(p2x - p1x);
            const c = p2x * p1y - p1x * p2y;
            objInfo.lineCoeffs = { a, b, c };
            foundCoeffs = true;
          }
        } catch {
          // ignore
        }

        // Method 2: If GeoGebra provides points defining line/segment
        if (!foundCoeffs) {
          try {
            const ptNames = api.getPointsDefiningSegment ? api.getPointsDefiningSegment(name) : null;
            if (ptNames && ptNames.length >= 2) {
              const x1 = api.getXcoord(ptNames[0]);
              const y1 = api.getYcoord(ptNames[0]);
              const x2 = api.getXcoord(ptNames[1]);
              const y2 = api.getYcoord(ptNames[1]);
              if (!isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2) && (x1 !== x2 || y1 !== y2)) {
                const a = y2 - y1;
                const b = -(x2 - x1);
                const c = x2 * y1 - x1 * y2;
                objInfo.lineCoeffs = { a, b, c };
                foundCoeffs = true;
              }
            }
          } catch {
            // ignore
          }
        }

        // Method 3: Sample along line with x=0 and x=5 or test values
        if (!foundCoeffs) {
          try {
            // For general line 'f', y at x=0 is f(0), y at x=1 is f(1) if defined as function or intersect with x=0/x=1
            const yAt0 = api.getValue(`y(Intersect(${name}, Line((0,0), (0,1))))`);
            const yAt5 = api.getValue(`y(Intersect(${name}, Line((5,0), (5,1))))`);
            if (!isNaN(yAt0) && !isNaN(yAt5) && isFinite(yAt0) && isFinite(yAt5)) {
              const a = yAt5 - yAt0;
              const b = -5;
              const c = 5 * yAt0;
              objInfo.lineCoeffs = { a, b, c };
              foundCoeffs = true;
            }
          } catch {
            // ignore
          }
        }

        // Method 4: Parse equation string or definition string
        if (!foundCoeffs) {
          const eqString = api.getValueString ? api.getValueString(name) : '';
          const defString = api.getDefinitionString ? api.getDefinitionString(name) : '';
          const cmdString = api.getCommandString ? api.getCommandString(name) : '';
          const coeffs = parseLineEquationHelper(eqString) || parseLineEquationHelper(defString) || parseLineEquationHelper(cmdString);
          if (coeffs) objInfo.lineCoeffs = coeffs;
        }
      }

      extracted.push(objInfo);
    }
    return extracted;
  } catch (e) {
    console.warn('Error reading GeoGebra objects:', e);
    return [];
  }
}

function parseLineEquationHelper(eqStr: string): { a: number; b: number; c: number } | null {
  if (!eqStr) return null;
  try {
    // Clean string (e.g., "f: 2x + 3y = 5" -> "2x + 3y = 5" or "y = -0.5x + 3")
    const clean = (eqStr.includes(':') ? eqStr.split(':')[1] : eqStr).trim();
    if (!clean.includes('=')) return null;

    const [leftRaw, rightRaw] = clean.split('=');
    const left = leftRaw.trim();
    const right = rightRaw.trim();

    // 1. Simple constant cases
    const rightVal = parseFloat(right);
    if (left === 'y' && !isNaN(rightVal)) {
      return { a: 0, b: 1, c: -rightVal };
    }
    if (left === 'x' && !isNaN(rightVal)) {
      return { a: 1, b: 0, c: -rightVal };
    }

    // 2. Slope-intercept form: y = m*x + q  (e.g., "y = -0.75x + 4.5" or "y = 2x - 3" or "y = x")
    if (left === 'y') {
      const match = right.match(/^([+-]?\s*\d*(?:\.\d+)?)\s*\*?\s*x\s*([+-]\s*\d+(?:\.\d+)?)?$/);
      if (match) {
        let mStr = (match[1] || '').replace(/\s+/g, '');
        if (mStr === '' || mStr === '+') mStr = '1';
        else if (mStr === '-') mStr = '-1';
        const m = parseFloat(mStr);

        let qStr = (match[2] || '0').replace(/\s+/g, '');
        const q = parseFloat(qStr);

        if (!isNaN(m) && !isNaN(q)) {
          // mx - y + q = 0 -> a = m, b = -1, c = q
          return { a: m, b: -1, c: q };
        }
      }
    }

    // 3. General form on left: a x + b y = c  (e.g., "3x + 4y = 12" or "-2.5x + y = -3")
    const generalMatch = left.match(/^([+-]?\s*\d*(?:\.\d+)?)\s*\*?\s*x\s*([+-]\s*\d*(?:\.\d+)?)\s*\*?\s*y$/);
    if (generalMatch && !isNaN(rightVal)) {
      let aStr = (generalMatch[1] || '').replace(/\s+/g, '');
      if (aStr === '' || aStr === '+') aStr = '1';
      else if (aStr === '-') aStr = '-1';
      const a = parseFloat(aStr);

      let bStr = (generalMatch[2] || '').replace(/\s+/g, '');
      if (bStr === '' || bStr === '+') bStr = '1';
      else if (bStr === '-') bStr = '-1';
      const b = parseFloat(bStr);

      if (!isNaN(a) && !isNaN(b)) {
        return { a, b, c: -rightVal };
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export const GeoGebraView: React.FC<GeoGebraViewProps> = ({
  task,
  onObjectsChange,
  onAppletReady,
  onRequestHint,
  onCheck,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appletId = useRef(`ggb-applet-${Math.random().toString(36).substring(2, 9)}`);
  const [ggbApi, setGgbApi] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [constructedCount, setConstructedCount] = useState(0);

  // Initialize GeoGebra
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    const initGgb = () => {
      if (!window.GGBApplet) {
        // Wait or load script if not present
        const script = document.createElement('script');
        script.src = 'https://www.geogebra.org/apps/deployggb.js';
        script.async = true;
        script.onload = () => {
          if (isMounted) createGeoGebraApplet();
        };
        script.onerror = () => {
          if (isMounted) {
            setLoadError('Nepodařilo se načíst GeoGebra skript ze serveru geogebra.org.');
            setIsLoading(false);
          }
        };
        document.head.appendChild(script);
      } else {
        createGeoGebraApplet();
      }
    };

    const createGeoGebraApplet = () => {
      const container = document.getElementById(appletId.current);
      if (!container) return;

      container.innerHTML = '';

      const width = container.clientWidth || 760;
      const height = 520;

      const params = {
        id: appletId.current + '_inner',
        appName: 'geometry',
        width: width,
        height: height,
        showToolBar: true,
        borderColor: '#e2e8f0',
        showMenuBar: false,
        showAlgebraInput: false,
        showResetIcon: false,
        enableLabelDrags: true,
        enableShiftDragZoom: true,
        enableRightClick: true,
        showToolBarHelp: true,
        errorDialogsActive: false,
        useBrowserForJS: false,
        language: 'cs',
        customToolBar:
          '0 | 1 501 5 19 | 2 15 45 , 18 65 | 4 3 8 9 | 10 34 53 40 41 42 | 16 51 60 | 6',
        appletOnLoad: (api: any) => {
          if (!isMounted) return;
          setGgbApi(api);
          setIsLoading(false);
          if (onAppletReady) onAppletReady(api);
          setupTaskInGGB(api, task);

          // Register listeners for real-time detection
          try {
            api.registerAddListener(() => extractAndNotifyObjects(api));
            api.registerRemoveListener(() => extractAndNotifyObjects(api));
            api.registerUpdateListener(() => extractAndNotifyObjects(api));
          } catch (e) {
            console.warn('GeoGebra listener registration notice:', e);
          }
        },
      };

      const applet = new window.GGBApplet(params, true);
      applet.inject(appletId.current);
    };

    initGgb();

    return () => {
      isMounted = false;
    };
  }, [task.id]);

  // Update task geometry when task changes and api is ready
  useEffect(() => {
    if (ggbApi) {
      setupTaskInGGB(ggbApi, task);
    }
  }, [task, ggbApi]);

  const setupTaskInGGB = (api: any, currentTask: CircleTask) => {
    try {
      if (typeof api.reset === 'function') {
        api.reset();
      }
      
      // GeoGebra API: setAxesVisible(x, y) or showAxes(true)
      if (typeof api.setAxesVisible === 'function') {
        api.setAxesVisible(true, true);
      } else if (typeof api.setAxes === 'function') {
        api.setAxes(true, true);
      } else if (typeof api.showAxes === 'function') {
        api.showAxes(true);
      }

      if (typeof api.setGridVisible === 'function') {
        api.setGridVisible(true);
      } else if (typeof api.showGrid === 'function') {
        api.showGrid(true);
      }

      const { center: S, radius: r, pointM: M } = currentTask;

      // Define S
      api.evalCommand(`S = (${S.x}, ${S.y})`);
      api.setColor('S', 30, 64, 175); // Blue 800
      api.setPointSize('S', 6);
      api.setFixed('S', true, true); // fixed=true (cannot drag position), isSelectable=true (CAN be clicked/selected)
      api.setLabelVisible('S', true);
      api.setCaption('S', `S[${S.x}, ${S.y}]`);

      // Define circle k
      api.evalCommand(`k = Circle(S, ${r})`);
      api.setColor('k', 37, 99, 235); // Blue 600
      api.setLineThickness('k', 4);
      api.setFixed('k', true, true); // fixed=true, isSelectable=true (CAN be intersected, clicked)
      api.setLabelVisible('k', true);

      // Define point M
      api.evalCommand(`M = (${M.x}, ${M.y})`);
      api.setColor('M', 220, 38, 38); // Red 600
      api.setPointSize('M', 7);
      api.setFixed('M', true, true); // fixed=true, isSelectable=true (CAN be clicked/selected for segments/lines)
      api.setLabelVisible('M', true);
      api.setCaption('M', `M[${M.x}, ${M.y}]`);

      // Fit coordinate system nicely around S and M with padding
      const minX = Math.min(S.x - r - 2, M.x - 2.5);
      const maxX = Math.max(S.x + r + 2, M.x + 2.5);
      const minY = Math.min(S.y - r - 2, M.y - 2.5);
      const maxY = Math.max(S.y + r + 2, M.y + 2.5);

      api.setCoordSystem(minX, maxX, minY, maxY);
      extractAndNotifyObjects(api);
    } catch (err) {
      console.error('Error setting up GeoGebra task:', err);
    }
  };

  const extractAndNotifyObjects = (api: any) => {
    const extracted = extractGeoGebraObjects(api);
    const userObjects = extracted.filter(o => o.name !== 'S' && o.name !== 'k' && o.name !== 'M');
    setConstructedCount(userObjects.length);
    if (onObjectsChange) {
      onObjectsChange(extracted);
    }
  };

  const handleReset = () => {
    if (ggbApi) {
      setupTaskInGGB(ggbApi, task);
    }
  };

  const handleZoom = (inOut: 'in' | 'out') => {
    if (!ggbApi) return;
    try {
      const factor = inOut === 'in' ? 1.25 : 0.8;
      const { center: S, pointM: M } = task;
      const midX = (S.x + M.x) / 2;
      const midY = (S.y + M.y) / 2;
      ggbApi.evalCommand(`ZoomIn(${factor}, (${midX}, ${midY}))`);
    } catch {
      // fallback
    }
  };

  const handleFitView = () => {
    if (!ggbApi) return;
    const { center: S, radius: r, pointM: M } = task;
    const minX = Math.min(S.x - r - 2, M.x - 2.5);
    const maxX = Math.max(S.x + r + 2, M.x + 2.5);
    const minY = Math.min(S.y - r - 2, M.y - 2.5);
    const maxY = Math.max(S.y + r + 2, M.y + 2.5);
    ggbApi.setCoordSystem(minX, maxX, minY, maxY);
  };

  return (
    <div
      id="geogebra-container-card"
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col transition-all duration-200 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'w-full'
      }`}
    >
      {/* Top Toolbar Bar */}
      <div
        id="geogebra-view-header"
        className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold text-slate-800 tracking-tight">
            GeoGebra Rýsovací plátno
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-600 font-medium">
            {constructedCount > 0
              ? `${constructedCount} ${constructedCount === 1 ? 'vložený prvek' : constructedCount < 5 ? 'vložené prvky' : 'vložených prvků'}`
              : 'Připraveno ke konstrukci'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium">
          <button
            id="btn-ggb-fit"
            onClick={handleFitView}
            title="Vycentrovat pohled"
            className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vycentrovat</span>
          </button>

          <button
            id="btn-ggb-zoomin"
            onClick={() => handleZoom('in')}
            title="Přiblížit"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            id="btn-ggb-zoomout"
            onClick={() => handleZoom('out')}
            title="Oddálit"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            id="btn-ggb-reset"
            onClick={handleReset}
            title="Smazat uživatelskou konstrukci"
            className="px-2.5 py-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1 ml-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset konstrukce</span>
          </button>

          <button
            id="btn-ggb-fullscreen"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Zmenšit' : 'Celá obrazovka'}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors ml-1"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* GeoGebra Frame Area */}
      <div className="relative w-full bg-slate-100/50 flex-1 min-h-[480px] flex items-center justify-center">
        {isLoading && (
          <div
            id="ggb-loading-indicator"
            className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center z-10 gap-3"
          >
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-700">Načítám GeoGebra prostředí...</p>
            <p className="text-xs text-slate-400">Připravuji geometrické nástroje a zadanou úlohu</p>
          </div>
        )}

        {loadError && (
          <div
            id="ggb-error-box"
            className="p-6 bg-red-50 text-red-800 rounded-xl max-w-md text-center border border-red-200"
          >
            <p className="font-semibold text-sm mb-1">{loadError}</p>
            <p className="text-xs text-red-600 mb-3">
              Zkontrolujte připojení k internetu pro stažení knihovny GeoGebra.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
            >
              Zkusit znovu
            </button>
          </div>
        )}

        {/* The injection container */}
        <div
          ref={containerRef}
          id={appletId.current}
          className="w-full h-full flex items-center justify-center overflow-hidden"
          style={{ minHeight: '500px' }}
        />
      </div>

      {/* Interactive Helper Banner */}
      <div
        id="geogebra-quick-tools-bar"
        className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Doporučený postup:</span>
          <span className="hidden sm:inline text-slate-500">
            1. Úsečka SM → 2. Střed S_SM → 3. Thaletova kružnice τ → 4. Průsečíky T₁, T₂ → 5. Tečny
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRequestHint}
            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 hover:underline"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Potřebuji poradit
          </button>
        </div>
      </div>
    </div>
  );
};
