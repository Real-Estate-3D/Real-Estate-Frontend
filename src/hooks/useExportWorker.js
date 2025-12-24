import { useState, useCallback, useRef } from 'react';

export const useExportWorker = () => {
  const [exports, setExports] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const workerRef = useRef(null);
  const exportIdCounter = useRef(0);

  const initWorker = useCallback(() => {
    if (!workerRef.current) {
      try {
        workerRef.current = new Worker('/workers/exportWorker.js', { type: 'classic' });
      } catch (error) {
        console.error('Failed to create worker:', error);
        return;
      }
      
      workerRef.current.onmessage = (e) => {
        const { type, progress, message, data, layerName, error, note } = e.data;

        switch (type) {
          case 'PROGRESS':
            setExports(prev => prev.map(exp => 
              exp.status === 'processing' 
                ? { ...exp, progress, message }
                : exp
            ));
            break;

          case 'GEOJSON_COMPLETE':
            setExports(prev => prev.map(exp => {
              if (exp.status === 'processing' && exp.layerName === layerName) {
                if (exp.format === 'geojson') {
                  // Only download for actual GeoJSON exports
                  downloadFile(data, `${toSafeFilenameBase(layerName)}.geojson`, 'application/json');
                  setIsExporting(false);
                  return {
                    ...exp, 
                    status: 'completed', 
                    progress: 100,
                    data,
                    message: 'Export completed successfully',
                    completedAt: new Date()
                  };
                } else {
                  // For KML/SHP, just update progress, don't download yet
                  return {
                    ...exp,
                    progress: 50,
                    message: 'Converting format...'
                  };
                }
              }
              return exp;
            }));
            break;

          case 'KML_COMPLETE':
            setExports(prev => prev.map(exp => 
              exp.status === 'processing' && exp.format === 'kml' && exp.layerName === layerName
                ? { 
                    ...exp, 
                    status: 'completed', 
                    progress: 100,
                    message: 'Export completed successfully',
                    completedAt: new Date()
                  }
                : exp
            ));
            downloadBlob(data, `${toSafeFilenameBase(layerName)}.kml`);
            setIsExporting(false);
            break;

          case 'SHP_COMPLETE':
            setExports(prev => prev.map(exp => 
              exp.status === 'processing' && exp.format === 'shp' && exp.layerName === layerName
                ? { 
                    ...exp, 
                    status: 'completed', 
                    progress: 100,
                    message: note || 'Export completed successfully',
                    completedAt: new Date()
                  }
                : exp
            ));
            downloadBlob(data, `${toSafeFilenameBase(layerName)}.zip`);
            setIsExporting(false);
            break;

          case 'ERROR':
            setExports(prev => prev.map(exp => 
              exp.status === 'processing'
                ? { 
                    ...exp, 
                    status: 'error', 
                    message: error || 'Export failed',
                    completedAt: new Date()
                  }
                : exp
            ));
            setIsExporting(false);
            break;

          default:
            break;
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('Worker error:', error);
        setExports(prev => prev.map(exp => 
          exp.status === 'processing'
            ? { 
                ...exp, 
                status: 'error', 
                message: 'Worker error occurred',
                completedAt: new Date()
              }
            : exp
        ));
        setIsExporting(false);
      };
    }
    return workerRef.current;
  }, []);

  const exportLayer = useCallback(async ({ layerName, format, url }) => {
    const worker = initWorker();
    setIsExporting(true);

    const exportId = ++exportIdCounter.current;
    const newExport = {
      id: exportId,
      layerName,
      format,
      status: 'processing',
      progress: 0,
      message: 'Initializing export...',
      startedAt: new Date(),
      completedAt: null
    };

    setExports(prev => [newExport, ...prev]);

    if (format === 'geojson') {
      worker.postMessage({
        type: 'FETCH_GEOJSON',
        data: { url, layerName }
      });
    } else {
      worker.postMessage({
        type: 'FETCH_GEOJSON',
        data: { url, layerName }
      });
      
      const handleConversion = (e) => {
        if (e.data.type === 'GEOJSON_COMPLETE') {
          if (format === 'kml') {
            worker.postMessage({
              type: 'CONVERT_TO_KML',
              data: { geojson: e.data.data, layerName }
            });
          } else if (format === 'shp') {
            worker.postMessage({
              type: 'CONVERT_TO_SHP',
              data: { geojson: e.data.data, layerName }
            });
          }
          worker.removeEventListener('message', handleConversion);
        }
      };
      
      worker.addEventListener('message', handleConversion);
    }
  }, [initWorker]);

  const clearExport = useCallback((exportId) => {
    setExports(prev => prev.filter(exp => exp.id !== exportId));
  }, []);

  const clearAllExports = useCallback(() => {
    setExports([]);
  }, []);

  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return {
    exports,
    isExporting,
    exportLayer,
    clearExport,
    clearAllExports,
    terminateWorker
  };
};

function downloadFile(data, filename, mimeType) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: mimeType });
  downloadBlob(blob, filename);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function toSafeFilenameBase(value) {
  // Avoid characters that are invalid on Windows/macOS file systems.
  // In particular, GeoServer typeName often includes a workspace prefix: workspace:layer
  return String(value || 'export')
    .replace(/[:\\/\\?%*|"<>]/g, '__')
    .trim()
    .slice(0, 180);
}
