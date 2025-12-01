import React, { useState } from 'react';
import { Upload, Play, Cpu, Clock, Layers, Image as ImageIcon, Activity, AlertCircle } from 'lucide-react';

const App = () => {
  // --- ESTADOS ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Parámetros de configuración (Coinciden con los Form fields de FastAPI)
  const [filterType, setFilterType] = useState('sobel'); // edge_detection, blur, etc.
  const [maskSize, setMaskSize] = useState('3');
  const [blocks, setBlocks] = useState(128);
  const [threads, setThreads] = useState(128);

  // Resultados del Backend
  const [results, setResults] = useState(null);

  // --- MANEJADORES ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProcessedUrl(null);
      setResults(null);
      setError(null);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    // Creamos el FormData para enviar archivos y datos a FastAPI
    const formData = new FormData();
    formData.append('file', selectedFile); // FastAPI: UploadFile
    formData.append('filter_type', filterType); // FastAPI: Form(...)
    formData.append('mask_size', maskSize);     // FastAPI: Form(...)
    formData.append('blocks', blocks);          // FastAPI: Form(...)
    formData.append('threads', threads);        // FastAPI: Form(...)

    try {
      // --------------------------------------------------------
      // CONEXIÓN CON FASTAPI (Descomentar cuando el back esté listo)
      // --------------------------------------------------------
      /*
      // Asegúrate que tu compañero corra FastAPI en el puerto 8000 (default)
      const response = await fetch('http://localhost:8000/process-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Asumiendo que FastAPI devuelve la imagen en base64 y los metadatos
      setProcessedUrl(`data:image/png;base64,${data.processed_image_base64}`);
      setResults({
        blocksUsed: data.blocks,
        threadsUsed: data.threads,
        executionTime: data.execution_time, // Ej: "0.045s"
        maskUsed: `${maskSize}x${maskSize} - ${filterType}`
      });
      */

      // --------------------------------------------------------
      // SIMULACIÓN (Para que puedas presentar el diseño mientras esperas el back)
      // --------------------------------------------------------
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simula delay de red + GPU
      
      // Simulamos éxito
      setProcessedUrl(previewUrl); 
      setResults({
        blocksUsed: blocks,
        threadsUsed: threads,
        executionTime: (Math.random() * 0.1).toFixed(4) + 's',
        maskUsed: `Máscara ${maskSize}x${maskSize} - ${filterType.toUpperCase()}`
      });

    } catch (err) {
      setError("No se pudo conectar con el servidor FastAPI. Revisa que esté corriendo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 border-b border-gray-200 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Cpu className="text-teal-600" />
              PyCUDA & FastAPI Lab
            </h1>
            <p className="text-gray-500 mt-1">
              Laboratorio 03 - Computación Paralela Distribuida
            </p>
          </div>
          <div className="hidden md:block text-right">
            <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-teal-200">Estado: Frontend Listo</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Panel Izquierdo: Controles */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
                <Layers size={20} /> Parámetros Kernel
              </h2>
              
              <div className="space-y-5">
                {/* Filtro */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Algoritmo de Convolución</label>
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-gray-50"
                  >
                    <option value="sobel">Detección de Bordes (Sobel)</option>
                    <option value="blur">Desenfoque Gaussiano (Blur)</option>
                    <option value="sharpen">Enfocar (Sharpen)</option>
                    <option value="emboss">Relieve (Emboss)</option>
                  </select>
                </div>

                {/* Tamaño Máscara */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño del Kernel (Máscara)</label>
                  <div className="flex gap-4">
                    {['3', '7'].map((size) => (
                      <label key={size} className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 border rounded-lg transition-all ${maskSize === size ? 'bg-teal-50 border-teal-500 text-teal-700' : 'hover:bg-gray-50'}`}>
                        <input 
                          type="radio" 
                          name="mask" 
                          value={size} 
                          checked={maskSize === size}
                          onChange={(e) => setMaskSize(e.target.value)}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <span className="font-medium">{size} x {size}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* CUDA Grid */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase mb-3 block">Configuración GPU (Grid/Block)</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Bloques</label>
                      <input 
                        type="number" 
                        value={blocks}
                        onChange={(e) => setBlocks(Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:border-teal-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Hilos por Bloque</label>
                      <input 
                        type="number" 
                        value={threads}
                        onChange={(e) => setThreads(Number(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:border-teal-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Botón Procesar */}
                <button
                  onClick={handleProcess}
                  disabled={!selectedFile || loading}
                  className={`w-full py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 text-white font-medium transition-all shadow-md
                    ${!selectedFile || loading 
                      ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                      : 'bg-teal-600 hover:bg-teal-700 hover:shadow-lg transform hover:-translate-y-0.5'
                    }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Procesando en GPU...
                    </>
                  ) : (
                    <>
                      <Play size={20} fill="currentColor" />
                      Ejecutar PyCUDA
                    </>
                  )}
                </button>
                
                {error && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex gap-2 items-start">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Panel de Métricas */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Métricas de Rendimiento</h3>
              {results ? (
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-gray-500">Bloques Lanzados:</span>
                    <span className="font-bold text-gray-900">{results.blocksUsed}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-gray-500">Hilos/Bloque:</span>
                    <span className="font-bold text-gray-900">{results.threadsUsed}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-teal-50 border border-teal-100 rounded">
                    <span className="text-teal-700">Tiempo GPU:</span>
                    <span className="font-bold text-teal-700 flex items-center gap-1">
                      <Clock size={14} /> {results.executionTime}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-400 text-center pt-2">
                    {results.maskUsed}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <Activity size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Esperando ejecución...</p>
                </div>
              )}
            </div>
          </div>

          {/* Panel Derecho: Visualización */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Input Imagen */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <ImageIcon size={18} /> Imagen de Entrada
              </h3>
              
              {!previewUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center bg-gray-50 hover:bg-teal-50 hover:border-teal-300 transition-all group">
                  <label className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                    <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="text-teal-500" size={24} />
                    </div>
                    <span className="text-gray-600 font-medium">Cargar imagen para procesar</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
              ) : (
                <div className="relative h-64 bg-black/5 rounded-lg overflow-hidden flex items-center justify-center group">
                  <img src={previewUrl} alt="Original" className="max-h-full max-w-full object-contain shadow-lg" />
                  <button 
                    onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}
                    className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full hover:bg-red-50 text-gray-600 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Resultado */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Layers size={18} /> Resultado de Convolución
              </h3>
              
              <div className="border border-gray-100 rounded-xl h-[500px] flex items-center justify-center bg-slate-900 overflow-hidden relative">
                {loading ? (
                  <div className="text-center text-white z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="font-medium text-lg animate-pulse">Calculando Kernel CUDA...</p>
                    <p className="text-sm text-slate-400 mt-2">Enviando a FastAPI...</p>
                  </div>
                ) : processedUrl ? (
                  <>
                    <img src={processedUrl} alt="Procesada" className="max-h-full max-w-full object-contain" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 text-center backdrop-blur-sm">
                      Procesado por PyCUDA vía FastAPI
                    </div>
                  </>
                ) : (
                  <div className="text-slate-600 text-center px-6">
                    <div className="inline-block p-4 rounded-full bg-slate-800 mb-3">
                      <Cpu size={32} className="text-slate-600" />
                    </div>
                    <p>La imagen procesada por la GPU aparecerá aquí</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default App;