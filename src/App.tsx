import React, { useState } from 'react';
import {
  Upload,
  Play,
  Cpu,
  Clock,
  Layers,
  Image as ImageIcon,
  AlertCircle,
  SplitSquareHorizontal
} from 'lucide-react';
import './App.css'; 

interface FastAPIResponse {
  imagen_original: string;
  imagen_filtro: string;
  filtro: string;
  tiempo: number;
  mask: number;
  sigma: number;
  blocks: number;
  threads: number;
}

const App: React.FC = () => {
  // --- ESTADOS ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<FastAPIResponse | null>(null);

  // Parámetros
  const [filterType, setFilterType] = useState('gaussiano');
  const [maskSize, setMaskSize] = useState(3);
  const [sigma, setSigma] = useState(1.0);
  const [blocks, setBlocks] = useState(32);
  const [threads, setThreads] = useState(32);

  // --- MANEJADORES ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
      setError(null);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('filtro', filterType);
    formData.append('mask_size', String(maskSize));
    formData.append('sigma', String(sigma));
    formData.append('blocks', String(blocks));
    formData.append('threads', String(threads));

    try {
      const res = await fetch('http://localhost:8000/filtros/procesar_imagen', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Error HTTP ${res.status}`);
      }

      const data: FastAPIResponse = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError('Error al conectar con FastAPI. Verifica el servidor backend.');
    } finally {
      setLoading(false);
    }
  };

  // --- UI ---
  return (
    <div className="min-h-screen text-white font-sans p-4 md:p-8 relative overflow-hidden">
      {/* Elementos de Fondo */}
      <div className="absolute inset-0 grid-bg pointer-events-none"></div>
      <div className="bg-blob-teal"></div>
      <div className="bg-blob-blue"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <header className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 tracking-tight">
              <Cpu className="text-teal-400" size={36} />
              <span className="neon-text">PyCUDA Lab</span>
            </h1>
            <p className="text-slate-400 mt-2 text-lg">
              Procesamiento de Imágenes Paralelo Distribuido
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
            <div className={`w-3 h-3 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400 shadow-[0_0_10px_#4ade80]'}`}></div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {loading ? 'Procesando Kernel' : 'GPU Lista'}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Panel Izquierdo: Configuración */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-teal-200">
                <Layers size={20} /> Configuración del Filtro
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de filtro</label>
                  <select
                    className="w-full p-3 rounded-lg glass-input text-sm"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="gaussiano" className="bg-slate-800">Gaussiano</option>
                    <option value="laplace" className="bg-slate-800">Laplaciano</option>
                    <option value="sobel" className="bg-slate-800">Sobel</option>
                    <option value="sharpen" className="bg-slate-800">Sharpen</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Máscara</label>
                        <input
                            type="number"
                            value={maskSize}
                            onChange={(e) => setMaskSize(Number(e.target.value))}
                            className="w-full p-3 rounded-lg glass-input text-center font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Sigma</label>
                        <input
                            type="number"
                            step="0.1"
                            value={sigma}
                            onChange={(e) => setSigma(Number(e.target.value))}
                            className="w-full p-3 rounded-lg glass-input text-center font-mono"
                        />
                    </div>
                </div>

                {/* Configuración GPU */}
                <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                    <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-bold flex items-center gap-2">
                        <Cpu size={12}/> Configuración Kernel
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Bloques</label>
                            <input
                                type="number"
                                value={blocks}
                                onChange={(e) => setBlocks(Number(e.target.value))}
                                className="w-full p-2 rounded glass-input text-center font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Hilos/Bloque</label>
                            <input
                                type="number"
                                value={threads}
                                onChange={(e) => setThreads(Number(e.target.value))}
                                className="w-full p-2 rounded glass-input text-center font-mono text-sm"
                            />
                        </div>
                    </div>
                </div>

                <button
                  onClick={handleProcess}
                  disabled={!selectedFile || loading}
                  className={`w-full mt-2 py-4 rounded-xl font-bold text-white transition-all transform duration-200 relative overflow-hidden flex justify-center items-center gap-2 ${
                    !selectedFile || loading
                      ? 'bg-slate-700/50 cursor-not-allowed text-slate-500 border border-white/5'
                      : 'primary-btn hover:scale-[1.02] shadow-lg hover:shadow-teal-500/20'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <Play size={18} fill="currentColor" />
                      Ejecutar en CUDA
                    </>
                  )}
                </button>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-lg flex gap-3 items-start animate-pulse">
                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Métricas */}
            {results && (
              <div className="glass-panel p-6 rounded-2xl border-t-4 border-t-teal-400 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-semibold mb-4 text-white flex gap-2 items-center">
                  <Clock size={18} className="text-teal-400"/> Rendimiento
                </h3>
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">Filtro:</span>
                    <span className="text-teal-300 capitalize">{results.filtro}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-slate-400">Tiempo Kernel:</span>
                    <span className="text-yellow-300 font-bold text-base">{results.tiempo.toFixed(5)} s</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-1">
                     <div>Grid: {results.blocks}x{results.threads}</div>
                     <div>Mask: {results.mask}px</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Panel Derecho: Visualización */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Input de Imagen */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="font-medium mb-3 flex items-center gap-2 text-slate-300">
                <ImageIcon size={18} /> Imagen de Entrada (Host)
              </h3>

              {!previewUrl ? (
                <label className="group flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-teal-500/50 hover:bg-teal-500/5 transition-all">
                  <div className="cursor-pointer text-center">
                    <div className="p-4 bg-slate-800 rounded-full mb-3 group-hover:scale-110 transition-transform shadow-lg inline-block">
                      <Upload className="text-teal-400" size={24} />
                    </div>
                    <p className="text-slate-300 font-medium group-hover:text-teal-300 transition-colors">Click para subir imagen</p>
                    <p className="text-slate-500 text-xs mt-1">Soporta PNG, JPG, JPEG</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </div>
                </label>
              ) : (
                <div className="relative h-64 bg-black/20 rounded-lg overflow-hidden flex items-center justify-center border border-white/5">
                  <img
                    src={previewUrl}
                    alt="Original"
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setResults(null);
                    }}
                    className="absolute top-3 right-3 bg-black/50 hover:bg-red-500/80 text-white rounded-full p-2 transition backdrop-blur-md border border-white/10"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Comparativa */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="font-medium mb-4 flex items-center gap-2 text-slate-300">
                <SplitSquareHorizontal size={18} className="text-teal-400" /> Resultados (Device GPU)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Imagen Host -> Device */}
                <div className="bg-slate-900/80 rounded-xl border border-white/10 overflow-hidden h-80 relative flex items-center justify-center group">
                  {loading ? (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500/30 border-t-teal-400 mx-auto mb-3"></div>
                        <span className="text-xs text-teal-400 animate-pulse">Copiando Memoria...</span>
                    </div>
                  ) : results ? (
                    <img
                      src={`data:image/jpeg;base64,${results.imagen_original}`}
                      alt="Original Gris"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-slate-600 text-sm italic">Esperando imagen...</div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm p-2 text-center text-xs text-slate-300 font-mono border-t border-white/10">
                    Host &rarr; Device (Escala de Grises)
                  </div>
                </div>

                {/* Imagen Resultado */}
                <div className="bg-slate-900/80 rounded-xl border border-white/10 overflow-hidden h-80 relative flex items-center justify-center group">
                  {loading ? (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-400 mx-auto mb-3"></div>
                        <span className="text-xs text-blue-400 animate-pulse">Aplicando Filtro...</span>
                    </div>
                  ) : results ? (
                    <img
                      src={`data:image/jpeg;base64,${results.imagen_filtro}`}
                      alt="Filtrada"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-slate-600 text-sm italic">Esperando procesamiento...</div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-r from-teal-900/80 to-blue-900/80 backdrop-blur-sm p-2 text-center text-xs text-white font-mono border-t border-white/10">
                    Resultado Final (Convolución)
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default App;