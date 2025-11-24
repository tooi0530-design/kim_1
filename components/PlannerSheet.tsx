import React, { useCallback, useEffect, useState } from 'react';
import { DailyData, DAYS_OF_WEEK, PlanItem, CheckItem } from '../types';
import { generateSchedule, generateQuote } from '../services/gemini';
import { Plus, Trash2, Wand2, Loader2, CheckSquare, Square } from 'lucide-react';

interface PlannerSheetProps {
  data: DailyData;
  onUpdate: (newData: DailyData) => void;
}

const PlannerSheet: React.FC<PlannerSheetProps> = ({ data, onUpdate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiGoal, setAiGoal] = useState('');

  const dateObj = new Date(data.date);
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const dayOfWeekIndex = dateObj.getDay(); // 0 = Sun

  // Helpers to update specific fields
  const updateField = <K extends keyof DailyData>(key: K, value: DailyData[K]) => {
    onUpdate({ ...data, [key]: value });
  };

  const handlePlanChange = (id: number, text: string) => {
    const newPlans = data.plans.map(p => p.id === id ? { ...p, text } : p);
    updateField('plans', newPlans);
  };

  const addCheckItem = () => {
    const newItem: CheckItem = { id: Date.now().toString(), text: '', checked: false };
    updateField('checklist', [...data.checklist, newItem]);
  };

  const updateCheckItem = (id: string, updates: Partial<CheckItem>) => {
    const newList = data.checklist.map(item => item.id === id ? { ...item, ...updates } : item);
    updateField('checklist', newList);
  };

  const removeCheckItem = (id: string) => {
    updateField('checklist', data.checklist.filter(i => i.id !== id));
  };

  const handleAiGenerate = async () => {
    if (!aiGoal.trim()) return;
    setIsGenerating(true);
    try {
      const suggestions = await generateSchedule(aiGoal);
      
      // Merge suggestions into empty slots first
      const newPlans = [...data.plans];
      let suggestionIdx = 0;
      
      for (let i = 0; i < newPlans.length; i++) {
        if (!newPlans[i].text.trim() && suggestionIdx < suggestions.length) {
          newPlans[i] = { ...newPlans[i], text: suggestions[suggestionIdx] };
          suggestionIdx++;
        }
      }
      
      updateField('plans', newPlans);
      setShowAiPrompt(false);
      setAiGoal('');
    } catch (error) {
      alert("Failed to generate schedule. Please check your API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInspireMe = async () => {
      setIsGenerating(true);
      try {
          const quote = await generateQuote();
          if (quote) {
              const currentMemo = data.memo ? data.memo + '\n\n' : '';
              updateField('memo', currentMemo + `"${quote}"`);
          }
      } finally {
          setIsGenerating(false);
      }
  }

  // Paper color and borders
  const paperBg = "bg-[#FFF9E5]"; // Creamy paper color
  const borderColor = "border-black";

  return (
    <div className={`w-full max-w-3xl mx-auto p-6 md:p-8 shadow-2xl rounded-sm ${paperBg} text-gray-900 relative`}>
      
      {/* --- AI Modal --- */}
      {showAiPrompt && (
        <div className="absolute inset-0 z-20 bg-black/10 backdrop-blur-[1px] flex items-center justify-center rounded-sm">
          <div className="bg-white p-6 rounded-xl shadow-xl border-2 border-black w-11/12 max-w-md">
            <h3 className="text-lg font-bold mb-3">✨ Smart Schedule Helper</h3>
            <p className="mb-4 text-sm text-gray-600">What is your main goal for today?</p>
            <input 
              type="text" 
              className="w-full border-2 border-gray-300 rounded p-2 mb-4 focus:border-black focus:outline-none"
              placeholder="e.g. Study React Hooks, Clean the house..."
              value={aiGoal}
              onChange={(e) => setAiGoal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowAiPrompt(false)}
                className="px-4 py-2 text-gray-500 hover:text-black font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleAiGenerate}
                disabled={isGenerating}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating ? <Loader2 className="animate-spin w-4 h-4"/> : <Wand2 className="w-4 h-4"/>}
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Header --- */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide inline-block pb-1">
          일간 계획표
        </h1>
        <div className="border-b-2 border-dashed border-gray-400 w-full mt-2"></div>
      </div>

      {/* --- Top Section --- */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Left: Date Box */}
        <div className={`w-full md:w-5/12 border-2 ${borderColor} rounded-2xl p-4 flex flex-col justify-between aspect-[4/3] md:aspect-auto`}>
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-widest mb-2">TODAY</h2>
            <div className="text-xl font-medium mb-4">
              {month} <span className="mx-2 text-gray-400">/</span> {day}
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-y-2 text-center text-sm font-bold">
            {/* Days grid layout matches visual: 3 on top, 4 on bottom or similar flow. 
                The image has:
                MON TUE WED
                THU FRI SAT SUN
                Let's emulate that structure roughly, or just a 4x2 grid.
            */}
             <div className="col-span-4 grid grid-cols-7 gap-1">
                {DAYS_OF_WEEK.map((d, i) => {
                    // DAYS_OF_WEEK is SUN..SAT (0..6). 
                    // Image likely uses MON start. Let's adjust highlight logic.
                    // dayOfWeekIndex is 0 for Sun.
                    // If we render MON TUE WED THU FRI SAT SUN
                    // Mapping: Mon=1, Tue=2... Sat=6, Sun=0.
                    const isToday = i === (dayOfWeekIndex); 
                    return (
                        <div key={d} className={`flex flex-col items-center justify-center`}>
                            <span className={`${isToday ? 'bg-black text-white rounded-full w-8 h-8 flex items-center justify-center' : 'text-gray-500'}`}>
                                {d}
                            </span>
                        </div>
                    )
                })}
             </div>
          </div>
        </div>

        {/* Right: Today's To Do */}
        <div className={`w-full md:w-7/12 bg-[#D9D9D9] rounded-2xl p-4 flex flex-col relative border ${borderColor} md:border-none`}>
          <div className="flex justify-between items-center mb-2">
             <span className="font-bold text-sm">오늘의 할 일</span>
          </div>
          <textarea 
            className="w-full h-full bg-transparent resize-none outline-none text-gray-800 placeholder-gray-500 text-sm leading-relaxed"
            placeholder="Write your main tasks for today..."
            value={data.topTodo}
            onChange={(e) => updateField('topTodo', e.target.value)}
          />
        </div>
      </div>

      {/* --- Middle: Plan Table --- */}
      <div className={`w-full border-2 ${borderColor} mb-6`}>
        {/* Table Header */}
        <div className={`flex border-b-2 ${borderColor} bg-white/50`}>
          <div className={`w-16 border-r-2 ${borderColor} py-1 text-center font-bold text-sm flex items-center justify-center`}>
            번호
          </div>
          <div className="flex-1 py-1 px-4 font-bold text-sm flex items-center justify-between">
            <span>오늘의 계획</span>
            <button 
                onClick={() => setShowAiPrompt(true)}
                className="text-xs bg-black text-white px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-gray-800 transition-colors"
                title="AI Auto-fill"
            >
                <Wand2 size={10} /> AI Fill
            </button>
          </div>
        </div>
        
        {/* Table Rows */}
        {data.plans.map((plan, index) => (
          <div key={plan.id} className={`flex ${index !== data.plans.length - 1 ? 'border-b border-black' : ''} h-9`}>
            <div className={`w-16 border-r border-black flex items-center justify-center text-sm font-medium bg-transparent`}>
              {index + 1}
            </div>
            <input 
              type="text"
              className="flex-1 px-3 bg-transparent outline-none text-sm w-full"
              value={plan.text}
              onChange={(e) => handlePlanChange(plan.id, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* --- Bottom Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Checklist */}
        <div className="flex flex-col">
          <label className="font-bold text-sm mb-1 ml-1">체크리스트</label>
          <div className={`border-2 ${borderColor} rounded-2xl p-4 h-48 overflow-y-auto bg-white/30`} onClick={(e) => {
              // Focus empty space to add item if list is empty or clicked at bottom
              if (e.target === e.currentTarget) {
                   if (data.checklist.length === 0 || data.checklist[data.checklist.length-1].text !== '') {
                       addCheckItem();
                   }
              }
          }}>
            {data.checklist.map((item) => (
              <div key={item.id} className="flex items-start gap-2 mb-2 group">
                <button 
                    onClick={() => updateCheckItem(item.id, { checked: !item.checked })}
                    className="mt-0.5 text-gray-800 hover:text-black"
                >
                    {item.checked ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>
                <input 
                  type="text"
                  className={`bg-transparent outline-none text-sm w-full border-b border-transparent focus:border-gray-300 ${item.checked ? 'line-through text-gray-400' : ''}`}
                  value={item.text}
                  onChange={(e) => updateCheckItem(item.id, { text: e.target.value })}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          addCheckItem();
                      }
                      if (e.key === 'Backspace' && item.text === '') {
                          removeCheckItem(item.id);
                      }
                  }}
                  autoFocus={!item.text} // Auto focus new items
                />
                <button onClick={() => removeCheckItem(item.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                </button>
              </div>
            ))}
            {data.checklist.length === 0 && (
                <div className="text-gray-400 text-xs text-center mt-10 cursor-pointer" onClick={addCheckItem}>
                    Click to add items
                </div>
            )}
          </div>
        </div>

        {/* Memo */}
        <div className="flex flex-col relative">
          <div className="flex justify-between items-center mb-1 ml-1">
             <label className="font-bold text-sm">메모</label>
             <button onClick={handleInspireMe} className="text-[10px] text-gray-500 hover:text-black flex items-center gap-1">
                {isGenerating ? <Loader2 className="animate-spin w-3 h-3"/> : <Wand2 className="w-3 h-3"/>} Inspire Me
             </button>
          </div>
          
          <textarea 
            className={`border-2 ${borderColor} rounded-2xl p-4 h-48 w-full bg-white/30 resize-none outline-none text-sm`}
            value={data.memo}
            onChange={(e) => updateField('memo', e.target.value)}
          />
        </div>
      </div>

      {/* --- Footer --- */}
      <div className="flex flex-col">
        <label className="font-bold text-sm mb-1">하루 한 줄 마무리 /</label>
        <div className="relative">
            <input 
            type="text"
            className="w-full bg-transparent border-b-2 border-dashed border-gray-400 outline-none py-1 text-sm"
            value={data.summary}
            onChange={(e) => updateField('summary', e.target.value)}
            />
        </div>
      </div>

    </div>
  );
};

export default PlannerSheet;