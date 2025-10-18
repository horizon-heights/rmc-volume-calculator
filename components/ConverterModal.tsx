
import React, { useState, useEffect } from 'react';

interface ConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToDimension: (targetDimension: 'length' | 'width' | 'depth', valueInInches: number) => void;
}

const ConverterModal: React.FC<ConverterModalProps> = ({ isOpen, onClose, onAddToDimension }) => {
  const [feetInput, setFeetInput] = useState('');
  const [meterInput, setMeterInput] = useState('');
  const [feetToInchResult, setFeetToInchResult] = useState<number | null>(null);
  const [meterToInchResult, setMeterToInchResult] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFeetInput('');
      setMeterInput('');
      setFeetToInchResult(null);
      setMeterToInchResult(null);
    }
  }, [isOpen]);

  const handleFeetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFeetInput(value);
    const feet = parseFloat(value);
    if (!isNaN(feet) && feet >= 0) {
      setFeetToInchResult(feet * 12);
    } else {
      setFeetToInchResult(null);
    }
  };

  const handleMeterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMeterInput(value);
    const meters = parseFloat(value);
    const INCH_PER_METER = 39.3701;
    if (!isNaN(meters) && meters >= 0) {
      setMeterToInchResult(meters * INCH_PER_METER);
    } else {
      setMeterToInchResult(null);
    }
  };

  const handleAddToDimension = (targetDimension: 'length' | 'width' | 'depth', source: 'ft' | 'm') => {
    const value = source === 'ft' ? feetToInchResult : meterToInchResult;
    if (value !== null) {
      onAddToDimension(targetDimension, value);
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 dark:bg-opacity-80 flex items-center justify-center p-4 z-50 modal-enter-active">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 z-10">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2 border-gray-300 dark:border-gray-600">Unit Converters</h3>
        <div className="space-y-6">
          {/* Feet to Inch Converter */}
          <div className="py-3">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Feet to Inch</h4>
            <div className="flex gap-2 items-end">
              <div className="flex-grow min-w-0">
                <label htmlFor="feetInput" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Feet (ft)</label>
                <input type="number" id="feetInput" value={feetInput} onChange={handleFeetChange} className="w-full p-3 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150" placeholder="e.g., 21" />
              </div>
              <p className="text-xl text-gray-500 dark:text-gray-400 mb-1">=</p>
              <div className="flex-grow min-w-0">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Inches (in)</label>
                <span className={`merged-text-result ${feetToInchResult !== null ? 'active-result' : ''}`}>
                  {feetToInchResult !== null ? feetToInchResult.toFixed(2) : 'Result'}
                </span>
              </div>
            </div>
            <div className="mt-3 flex justify-center gap-2">
              <button className="gradient-button px-4 py-2 text-sm" onClick={() => handleAddToDimension('length', 'ft')}>Add to Length</button>
              <button className="gradient-button px-4 py-2 text-sm" onClick={() => handleAddToDimension('width', 'ft')}>Add to Width</button>
              <button className="gradient-button px-4 py-2 text-sm" onClick={() => handleAddToDimension('depth', 'ft')}>Add to Depth</button>
            </div>
          </div>
          {/* Meter to Inch Converter */}
          <div className="py-3">
            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Meter to Inch</h4>
            <div className="flex gap-2 items-end">
              <div className="flex-grow min-w-0">
                <label htmlFor="meterInput" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Meter (m)</label>
                <input type="number" id="meterInput" value={meterInput} onChange={handleMeterChange} className="w-full p-3 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 border rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition duration-150" placeholder="e.g., 6.4" />
              </div>
              <p className="text-xl text-gray-500 dark:text-gray-400 mb-1">=</p>
              <div className="flex-grow min-w-0">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Inches (in)</label>
                <span className={`merged-text-result ${meterToInchResult !== null ? 'active-result' : ''}`}>
                  {meterToInchResult !== null ? meterToInchResult.toFixed(2) : 'Result'}
                </span>
              </div>
            </div>
            <div className="mt-3 flex justify-center gap-2">
                <button className="gradient-button px-4 py-2 text-sm" onClick={() => handleAddToDimension('length', 'm')}>Add to Length</button>
                <button className="gradient-button px-4 py-2 text-sm" onClick={() => handleAddToDimension('width', 'm')}>Add to Width</button>
                <button className="gradient-button px-4 py-2 text-sm" onClick={() => handleAddToDimension('depth', 'm')}>Add to Depth</button>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-full py-2 mt-8 gradient-button">
          Close
        </button>
      </div>
    </div>
  );
};

export default ConverterModal;
