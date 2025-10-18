import React, { useState } from 'react';
import { Dimensions, DimensionUnit } from './types';
import ConverterModal from './components/ConverterModal';
import CalculatorIcon from './components/icons/CalculatorIcon';

const App: React.FC = () => {
  const [dimensions, setDimensions] = useState<Dimensions>({ length: '', width: '', depth: '' });
  const [units, setUnits] = useState({
    length: DimensionUnit.INCHES,
    width: DimensionUnit.INCHES,
    depth: DimensionUnit.INCHES,
  });
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setDimensions(prev => ({ ...prev, [id]: value }));
  };

  const handleUnitChange = (dim: keyof Dimensions, newUnit: DimensionUnit) => {
    setUnits(prev => ({ ...prev, [dim]: newUnit }));
  };

  const handleAddToDimension = (targetDimension: 'length' | 'width' | 'depth', valueInInches: number) => {
    setUnits(prev => ({ ...prev, [targetDimension]: DimensionUnit.INCHES }));
    setDimensions(prev => ({ ...prev, [targetDimension]: valueInInches.toFixed(2) }));
  };

  const calculateVolume = () => {
    setResult(null);
    setError(null);

    const lengthVal = parseFloat(dimensions.length);
    const widthVal = parseFloat(dimensions.width);
    const depthVal = parseFloat(dimensions.depth);

    if (isNaN(lengthVal) || isNaN(widthVal) || isNaN(depthVal) || lengthVal <= 0 || widthVal <= 0 || depthVal <= 0) {
      setError('Please enter valid positive numerical values for all dimensions.');
      return;
    }

    const INCH_TO_M = 0.0254;
    const FEET_TO_M = 0.3048;

    const getDimInMeters = (value: number, unit: DimensionUnit): number => {
        switch (unit) {
          case DimensionUnit.INCHES:
            return value * INCH_TO_M;
          case DimensionUnit.FEET:
            return value * FEET_TO_M;
          case DimensionUnit.METERS:
            return value;
          default:
            return 0; // Should not happen
        }
    };

    const lengthM = getDimInMeters(lengthVal, units.length);
    const widthM = getDimInMeters(widthVal, units.width);
    const depthM = getDimInMeters(depthVal, units.depth);

    const netVolumeM3 = lengthM * widthM * depthM;
    const wastageFactor = 1.03;
    const finalVolumeM3 = netVolumeM3 * wastageFactor;
    
    setResult(finalVolumeM3.toFixed(2));
  };
  
  const placeholders = {
    [DimensionUnit.INCHES]: { l: '252', w: '180', d: '18'},
    [DimensionUnit.METERS]: { l: '6.4', w: '4.5', d: '0.45'},
    [DimensionUnit.FEET]: { l: '21', w: '15', d: '1.5'}
  };

  const getUnitButtonClass = (isActive: boolean) => 
    `px-3 py-1 rounded-md text-sm font-semibold transition-all duration-200 ${
      isActive
      ? 'gradient-button text-white'
      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
    }`;

  return (
    <>
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold text-blue-600">Horizon Heights</h1>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">RMC Volume Calculator</p>
        </header>

        <div className="p-6 mb-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-inner">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-800 dark:text-gray-100 text-center mb-6 w-[95%] mx-auto">Concrete Volume Tools</h2>

          <div className="w-full">
            <div className="p-6 bg-transparent rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2 border-gray-300 dark:border-gray-600">
                Footing Dimensions
              </h3>
              <div className="space-y-6">
                
                {/* Length */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="length" className="block text-lg font-medium text-gray-700 dark:text-gray-300">Length</label>
                    <div className="flex gap-1">
                      <button onClick={() => handleUnitChange('length', DimensionUnit.METERS)} className={getUnitButtonClass(units.length === DimensionUnit.METERS)}>m</button>
                      <button onClick={() => handleUnitChange('length', DimensionUnit.FEET)} className={getUnitButtonClass(units.length === DimensionUnit.FEET)}>ft</button>
                      <button onClick={() => handleUnitChange('length', DimensionUnit.INCHES)} className={getUnitButtonClass(units.length === DimensionUnit.INCHES)}>in</button>
                    </div>
                  </div>
                  <input type="number" id="length" value={dimensions.length} onChange={handleDimensionChange} className="w-full p-3 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150" placeholder={`e.g., ${placeholders[units.length].l}`} />
                </div>

                {/* Width */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="width" className="block text-lg font-medium text-gray-700 dark:text-gray-300">Width</label>
                    <div className="flex gap-1">
                      <button onClick={() => handleUnitChange('width', DimensionUnit.METERS)} className={getUnitButtonClass(units.width === DimensionUnit.METERS)}>m</button>
                      <button onClick={() => handleUnitChange('width', DimensionUnit.FEET)} className={getUnitButtonClass(units.width === DimensionUnit.FEET)}>ft</button>
                      <button onClick={() => handleUnitChange('width', DimensionUnit.INCHES)} className={getUnitButtonClass(units.width === DimensionUnit.INCHES)}>in</button>
                    </div>
                  </div>
                  <input type="number" id="width" value={dimensions.width} onChange={handleDimensionChange} className="w-full p-3 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150" placeholder={`e.g., ${placeholders[units.width].w}`} />
                </div>

                {/* Depth */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="depth" className="block text-lg font-medium text-gray-700 dark:text-gray-300">Depth</label>
                    <div className="flex gap-1">
                      <button onClick={() => handleUnitChange('depth', DimensionUnit.METERS)} className={getUnitButtonClass(units.depth === DimensionUnit.METERS)}>m</button>
                      <button onClick={() => handleUnitChange('depth', DimensionUnit.FEET)} className={getUnitButtonClass(units.depth === DimensionUnit.FEET)}>ft</button>
                      <button onClick={() => handleUnitChange('depth', DimensionUnit.INCHES)} className={getUnitButtonClass(units.depth === DimensionUnit.INCHES)}>in</button>
                    </div>
                  </div>
                  <input type="number" id="depth" value={dimensions.depth} onChange={handleDimensionChange} className="w-full p-3 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150" placeholder={`e.g., ${placeholders[units.depth].d}`} />
                </div>

              </div>
            </div>
          </div>
        </div>

        <button onClick={calculateVolume} className="w-full py-3 mt-6 gradient-button">
          Calculate Concrete Volume (M³)
        </button>
        
        {result && (
            <div className="mt-8 p-5 bg-green-100 dark:bg-green-900/50 border-t border-green-200 dark:border-green-700 rounded-lg text-center">
                <p className="text-gray-700 dark:text-gray-300 text-lg mb-2">Total Concrete Order Quantity <strong>(Including 3% Wastage)</strong>:</p>
                <p className="text-5xl font-extrabold text-green-600 dark:text-green-400">{result} m³</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-3">Order this many Cubic Meters (M³) from the Ready Mix supplier.</p>
            </div>
        )}

        {error && (
             <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded-lg text-center">
                {error}
            </div>
        )}

      </div>
      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 rounded-full shadow-lg text-white flex items-center justify-center hover:bg-blue-700 transition transform hover:scale-110">
        <CalculatorIcon />
      </button>

      <ConverterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddToDimension={handleAddToDimension} />
    </>
  );
};

export default App;
