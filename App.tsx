import React, { useState } from 'react';
import { Dimensions, DimensionUnit, DimensionValue } from './types';
import ConverterModal from './components/ConverterModal';
import CalculatorIcon from './components/icons/CalculatorIcon';

interface HistoryItem {
  id: string;
  length: string;
  width: string;
  depth: string;
  volume: number;
}

const App: React.FC = () => {
  const [dimensions, setDimensions] = useState<Dimensions>({
    length: { main: '', sub: '' },
    width: { main: '', sub: '' },
    depth: { main: '', sub: '' },
  });
  const [units, setUnits] = useState({
    length: DimensionUnit.INCHES,
    width: DimensionUnit.INCHES,
    depth: DimensionUnit.INCHES,
  });
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleDimensionChange = (dim: keyof Dimensions, part: 'main' | 'sub', value: string) => {
    let finalValue = value;
    
    if (units[dim] === DimensionUnit.FEET && part === 'sub' && value !== '') {
      const numVal = parseInt(value, 10);
      if (!isNaN(numVal)) {
        if (numVal < 0) finalValue = '0';
        else if (numVal > 11) finalValue = '11';
      }
    }

    setDimensions(prev => ({
      ...prev,
      [dim]: { ...prev[dim], [part]: finalValue }
    }));
  };

  const handleUnitChange = (dim: keyof Dimensions, newUnit: DimensionUnit) => {
    setUnits(prev => ({ ...prev, [dim]: newUnit }));
  };

  const handleAddToDimension = (targetDimension: 'length' | 'width' | 'depth', valueInInches: number) => {
    setUnits(prev => ({ ...prev, [targetDimension]: DimensionUnit.INCHES }));
    setDimensions(prev => ({
      ...prev,
      [targetDimension]: { main: valueInInches.toFixed(2), sub: '' }
    }));
  };

  const calculateVolume = () => {
    setResult(null);
    setError(null);

    const getDimInMeters = (dimKey: keyof Dimensions): number | null => {
      const val = dimensions[dimKey];
      const unit = units[dimKey];
      const main = parseFloat(val.main);
      const sub = parseFloat(val.sub || '0');

      if (isNaN(main) || main < 0) return null;

      const INCH_TO_M = 0.0254;
      const FEET_TO_M = 0.3048;

      switch (unit) {
        case DimensionUnit.INCHES:
          return main * INCH_TO_M;
        case DimensionUnit.METERS:
          return main;
        case DimensionUnit.FEET:
          const validSub = Math.max(0, Math.min(11, sub));
          const totalFeet = main + (validSub / 12);
          return totalFeet * FEET_TO_M;
        default:
          return 0;
      }
    };

    const lM = getDimInMeters('length');
    const wM = getDimInMeters('width');
    const dM = getDimInMeters('depth');

    if (lM === null || wM === null || dM === null || lM <= 0 || wM <= 0 || dM <= 0) {
      setError('Please enter valid positive numerical values for all dimensions.');
      return;
    }

    const netVolumeM3 = lM * wM * dM;
    const wastageFactor = 1.03;
    const finalVolumeM3 = netVolumeM3 * wastageFactor;
    
    const formattedResult = finalVolumeM3.toFixed(2);
    setResult(formattedResult);

    const formatDisplay = (dim: keyof Dimensions) => {
        const u = units[dim];
        const v = dimensions[dim];
        if (u === DimensionUnit.FEET) return `${v.main}' ${v.sub}"`;
        if (u === DimensionUnit.METERS) return `${v.main}m`;
        return `${v.main}"`;
    };

    const newItem: HistoryItem = {
        id: Date.now().toString(),
        length: formatDisplay('length'),
        width: formatDisplay('width'),
        depth: formatDisplay('depth'),
        volume: finalVolumeM3
    };
    setHistory(prev => [...prev, newItem]);
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete all entries?')) {
        setHistory([]);
        setResult(null);
    }
  };
  
  const totalVolume = history.reduce((sum, item) => sum + item.volume, 0);

  const placeholders = {
    [DimensionUnit.INCHES]: { main: '252', sub: '' },
    [DimensionUnit.METERS]: { main: '6.4', sub: '' },
    [DimensionUnit.FEET]: { main: '21', sub: '0' }
  };

  const getUnitButtonClass = (isActive: boolean) => 
    `px-3 py-1 rounded-md text-sm font-semibold transition-all duration-200 text-white ${
      isActive
      ? 'gradient-button'
      : 'bg-gray-500 dark:bg-gray-600'
    }`;

  const renderDimensionInput = (dim: keyof Dimensions, label: string) => {
    const isFeet = units[dim] === DimensionUnit.FEET;
    
    return (
      <div key={dim}>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor={dim} className="block text-lg font-medium text-gray-700 dark:text-gray-300">{label}</label>
          <div className="flex gap-1">
            <button onClick={() => handleUnitChange(dim, DimensionUnit.METERS)} className={getUnitButtonClass(units[dim] === DimensionUnit.METERS)}>m</button>
            <button onClick={() => handleUnitChange(dim, DimensionUnit.FEET)} className={getUnitButtonClass(units[dim] === DimensionUnit.FEET)}>ft</button>
            <button onClick={() => handleUnitChange(dim, DimensionUnit.INCHES)} className={getUnitButtonClass(units[dim] === DimensionUnit.INCHES)}>in</button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-grow">
            <div className="relative">
              <input 
                type="number" 
                value={dimensions[dim].main} 
                onChange={(e) => handleDimensionChange(dim, 'main', e.target.value)} 
                className="w-full p-3 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                placeholder={`e.g., ${placeholders[units[dim]].main}`} 
              />
              {isFeet && <span className="absolute right-3 top-3 text-gray-400 text-sm pointer-events-none">ft</span>}
            </div>
          </div>
          
          {isFeet && (
            <div className="w-1/3">
              <div className="relative">
                <input 
                  type="number"
                  min="0"
                  max="11"
                  value={dimensions[dim].sub} 
                  onChange={(e) => handleDimensionChange(dim, 'sub', e.target.value)} 
                  className="w-full p-3 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150" 
                  placeholder="in" 
                />
                <span className="absolute right-3 top-3 text-gray-400 text-sm pointer-events-none">in</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full gap-8 py-8">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold text-blue-600">Horizon Heights</h1>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">RMC Volume Calculator</p>
        </header>

        <div className="p-6 mb-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-inner">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-gray-100 text-center mb-4 w-[95%] mx-auto font-sans">Concrete Volume Tools</h2>

          <div className="w-full">
            <div className="p-6 bg-transparent rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2 border-gray-300 dark:border-gray-600">
                Footing Dimensions
              </h3>
              <div className="space-y-6">
                {renderDimensionInput('length', 'Length')}
                {renderDimensionInput('width', 'Width')}
                {renderDimensionInput('depth', 'Depth')}
              </div>
            </div>
          </div>
        </div>

        <button onClick={calculateVolume} className="w-full py-3 mt-6 gradient-button">
          Calculate Concrete Volume (M³)
        </button>
        
        {result && (
            <div className="mt-8 p-5 bg-green-100 dark:bg-green-900/50 border-t border-green-200 dark:border-green-700 rounded-lg text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-gray-700 dark:text-gray-300 text-lg mb-2">Total Concrete Order Quantity <strong>(Including 3% Wastage)</strong>:</p>
                <p className="text-5xl font-extrabold text-green-600 dark:text-green-400">{result} m³</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-3">Order this many Cubic Meters (M³) from the Ready Mix supplier.</p>
            </div>
        )}

        {error && (
             <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded-lg text-center animate-in fade-in duration-200">
                {error}
            </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4 border-b pb-4 border-gray-300 dark:border-gray-600">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Calculation Summary</h3>
                <button 
                    type="button"
                    onClick={clearHistory}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors shadow-md hover:shadow-lg active:scale-95"
                >
                    Delete All
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="p-3 border dark:border-gray-600 font-bold text-gray-700 dark:text-gray-300">Length</th>
                            <th className="p-3 border dark:border-gray-600 font-bold text-gray-700 dark:text-gray-300">Width</th>
                            <th className="p-3 border dark:border-gray-600 font-bold text-gray-700 dark:text-gray-300">Depth</th>
                            <th className="p-3 border dark:border-gray-600 font-bold text-gray-700 dark:text-gray-300 text-right">Volume (m³)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="p-3 border dark:border-gray-600 text-gray-600 dark:text-gray-400">{item.length}</td>
                                <td className="p-3 border dark:border-gray-600 text-gray-600 dark:text-gray-400">{item.width}</td>
                                <td className="p-3 border dark:border-gray-600 text-gray-600 dark:text-gray-400">{item.depth}</td>
                                <td className="p-3 border dark:border-gray-600 text-right font-semibold text-blue-600 dark:text-blue-400">{item.volume.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-blue-50 dark:bg-blue-900/40">
                            <td colSpan={3} className="p-3 border dark:border-gray-600 font-extrabold text-gray-900 dark:text-white text-right uppercase tracking-wider">TOTAL VOLUME:</td>
                            <td className="p-3 border dark:border-gray-600 text-right font-black text-2xl text-blue-700 dark:text-blue-300 whitespace-nowrap">{totalVolume.toFixed(2)} m³</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 italic text-center">All volumes shown include 3% wastage factor.</p>
        </div>
      )}

      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 rounded-full shadow-lg text-white flex items-center justify-center hover:bg-blue-700 transition transform hover:scale-110">
        <CalculatorIcon />
      </button>

      <ConverterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddToDimension={handleAddToDimension} />
    </div>
  );
};

export default App;