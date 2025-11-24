import React, { useEffect, useState } from 'react';
import PlannerSheet from './components/PlannerSheet';
import { DailyData } from './types';
import { getDailyData, saveDailyData } from './services/storage';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const App: React.FC = () => {
  // Initialize with today's date in local time string YYYY-MM-DD
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  });

  const [dailyData, setDailyData] = useState<DailyData>(getDailyData(currentDate));

  // Load data when date changes
  useEffect(() => {
    setDailyData(getDailyData(currentDate));
  }, [currentDate]);

  // Save data when it changes (debounced could be better for perf, but simple effect works for this scale)
  useEffect(() => {
    saveDailyData(dailyData);
  }, [dailyData]);

  const handleDataUpdate = (newData: DailyData) => {
    setDailyData(newData);
  };

  const changeDate = (days: number) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - (offset * 60 * 1000));
    setCurrentDate(localDate.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-[#e5e7eb] flex flex-col items-center py-8 px-4">
      
      {/* Navigation Controls */}
      <div className="flex items-center gap-4 mb-6 bg-white px-6 py-3 rounded-full shadow-md sticky top-4 z-10 opacity-95 backdrop-blur">
        <button 
            onClick={() => changeDate(-1)} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Previous Day"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        
        <div className="flex flex-col items-center cursor-pointer" onClick={() => {
            // Simple date picker trigger could go here, for now using native input hidden
            const picker = document.getElementById('date-picker') as HTMLInputElement;
            picker?.showPicker();
        }}>
            <span className="font-bold text-lg text-gray-800">{currentDate}</span>
            <input 
                id="date-picker"
                type="date" 
                className="w-0 h-0 absolute opacity-0" 
                value={currentDate} 
                onChange={(e) => e.target.value && setCurrentDate(e.target.value)}
            />
        </div>

        <button 
            onClick={() => changeDate(1)} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Next Day"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        <button 
            onClick={goToToday}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
        >
            <CalendarIcon size={16} />
            Today
        </button>
      </div>

      <PlannerSheet 
        data={dailyData} 
        onUpdate={handleDataUpdate} 
      />
      
      <div className="mt-8 text-xs text-gray-400 font-sans">
        All data is saved locally in your browser.
      </div>
    </div>
  );
};

export default App;