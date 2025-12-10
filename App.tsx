import React, { useState, useEffect, useRef } from 'react';
import { Download, Check, X, Search, Globe, Loader2, Sparkles, Filter } from 'lucide-react';
import html2canvas from 'html2canvas';
import { UI_TRANSLATIONS } from './translations';
import { getAllActivities } from './activitiesData';
import { Activity, Language } from './types';

function App() {
  const [lang, setLang] = useState<Language>('en');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [generatedIds, setGeneratedIds] = useState<number[]>([]);
  const [downloadCount, setDownloadCount] = useState(0);
  
  // Filters
  const [ageFilter, setAgeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const t = UI_TRANSLATIONS[lang];

  // Load activities on mount and lang change
  useEffect(() => {
    const all = getAllActivities(lang);
    setActivities(all);
  }, [lang]);

  const filteredActivities = activities.filter(act => {
    const matchAge = ageFilter === 'all' || act.age === ageFilter;
    const matchLevel = levelFilter === 'all' || act.level === levelFilter;
    const term = search.toLowerCase();
    const matchSearch = search === '' || 
      act.title.toLowerCase().includes(term) || 
      act.theme.toLowerCase().includes(term);
    return matchAge && matchLevel && matchSearch;
  });

  const handleSelectAll = () => {
    const ids = filteredActivities.map(a => a.id);
    // Merge unique
    setSelectedIds(prev => Array.from(new Set([...prev, ...ids])));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    if (selectedIds.length === 0) {
      alert(t.alertSelect);
      return;
    }
    setGeneratedIds(selectedIds);
    // Scroll to first card
    setTimeout(() => {
      document.getElementById('flashcards-start')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const downloadCard = async (id: number) => {
    const element = document.getElementById(`card-${id}`);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true // if images are external
      });
      
      const link = document.createElement('a');
      const act = activities.find(a => a.id === id);
      const safeTitle = act ? act.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'activity';
      link.download = `rhetoric_card_${id}_${safeTitle}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
      setDownloadCount(prev => prev + 1);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const handleDownloadAll = async () => {
    if (generatedIds.length === 0) return;
    if (!window.confirm(t.confirmDownload)) return;
    
    setIsDownloading(true);
    setProgress(0);
    
    for (let i = 0; i < generatedIds.length; i++) {
      await downloadCard(generatedIds[i]);
      setProgress(Math.round(((i + 1) / generatedIds.length) * 100));
      // Small delay to prevent browser hanging
      await new Promise(r => setTimeout(r, 500));
    }
    
    setIsDownloading(false);
    alert(t.alertComplete);
  };

  const uniqueAges = Array.from(new Set(activities.map(a => a.age))).sort();
  const uniqueLevels = Array.from(new Set(activities.map(a => a.level))).sort();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20">
      
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
             <div>
               <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                 <Sparkles className="w-8 h-8 text-yellow-300" />
                 {t.title}
               </h1>
               <p className="text-blue-100 text-lg opacity-90">{t.subtitle}</p>
             </div>

             {/* Language Switcher */}
             <div className="flex gap-2 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
               {(['en', 'el', 'es', 'sv', 'it'] as Language[]).map((l) => (
                 <button
                   key={l}
                   onClick={() => setLang(l)}
                   className={`px-3 py-1 rounded-md font-medium transition-all ${
                     lang === l 
                       ? 'bg-white text-blue-800 shadow-sm' 
                       : 'text-blue-100 hover:bg-white/10'
                   }`}
                 >
                   {l.toUpperCase()}
                 </button>
               ))}
             </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2 text-yellow-300 font-bold">
              <Globe className="w-5 h-5" />
              {t.badgeTitle}
            </div>
            <p className="text-white font-medium">{t.badgeDesc}</p>
            <p className="text-sm text-blue-200 mt-1">{t.badgeSub}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        
        {/* Stats & Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{t.statsTotal}</p>
            <p className="text-2xl font-bold text-gray-800">{activities.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{t.statsSelected}</p>
            <p className="text-2xl font-bold text-blue-600">{selectedIds.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{t.statsGenerated}</p>
            <p className="text-2xl font-bold text-purple-600">{generatedIds.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
             <p className="text-sm text-gray-500">{t.statsDownloaded}</p>
             <p className="text-2xl font-bold text-green-600">{downloadCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.labelSearch}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-black"
                  placeholder="..."
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.labelAge}</label>
              <select 
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="all">{t.optAllAges}</option>
                {uniqueAges.map(age => <option key={age} value={age}>{age} {t.yearsShort}</option>)}
              </select>
            </div>

            <div className="w-full md:w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.labelLevel}</label>
              <select 
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="all">{t.optAllLevels}</option>
                {uniqueLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100">
             <button 
               onClick={handleSelectAll}
               className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
             >
               <Check className="w-4 h-4" /> {t.btnSelectAll}
             </button>
             <button 
               onClick={handleDeselectAll}
               className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
             >
               <X className="w-4 h-4" /> {t.btnDeselectAll}
             </button>
             
             <div className="flex-1" />
             
             <button 
               onClick={handleGenerate}
               className="flex items-center gap-2 px-6 py-2.5 font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
             >
               <Sparkles className="w-5 h-5" /> {t.btnGenerate} ({selectedIds.length})
             </button>
          </div>
        </div>

        {/* Selection List */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" /> {t.filterTitle}
          </h2>
          
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
               {t.noResults}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActivities.map(act => (
                <div 
                  key={act.id}
                  onClick={() => toggleSelection(act.id)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    selectedIds.includes(act.id)
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 ring-offset-2'
                      : 'border-transparent bg-white hover:border-gray-200 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-3xl" role="img" aria-label="icon">{act.icon}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                       selectedIds.includes(act.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedIds.includes(act.id) && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1 line-clamp-1" title={act.title}>{act.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{act.theme}</p>
                  <div className="flex gap-2 text-xs font-medium">
                    <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">{act.level}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">{act.age} {t.yearsShort}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">{act.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Generated Cards Area */}
        {generatedIds.length > 0 && (
          <div id="flashcards-start" className="pt-8 border-t-2 border-dashed border-gray-200">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-gray-800">{t.cardOverview}</h2>
               <button 
                 onClick={handleDownloadAll}
                 disabled={isDownloading}
                 className="flex items-center gap-2 px-6 py-3 font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isDownloading ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                 ) : (
                   <Download className="w-5 h-5" />
                 )}
                 {isDownloading ? `${progress}%` : t.btnDownload}
               </button>
            </div>

            <div className="space-y-12">
               {generatedIds.map(id => {
                 const act = activities.find(a => a.id === id);
                 if (!act) return null;
                 
                 return (
                   <div key={id} className="flex flex-col items-center gap-4">
                     <div 
                       id={`card-${id}`} 
                       className="w-full max-w-[800px] bg-white rounded-none shadow-2xl overflow-hidden text-slate-800 relative"
                       style={{ aspectRatio: '1.414/1' }} // A4 Landscape ratio approximation or just landscape
                     >
                        {/* Card Header Stripe */}
                        <div className="bg-[#1e3a8a] text-white p-6 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                             <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-4xl shadow-inner backdrop-blur-sm">
                               {act.icon}
                             </div>
                             <div>
                               <h2 className="text-3xl font-extrabold tracking-tight leading-tight">{act.title}</h2>
                               <p className="text-blue-200 font-medium text-lg">{act.theme}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="text-5xl font-black text-white/20 -mb-2">#{id}</div>
                             <div className="flex gap-2 justify-end">
                                <span className="bg-white/20 px-3 py-1 rounded text-sm font-semibold">{act.level}</span>
                                <span className="bg-white/20 px-3 py-1 rounded text-sm font-semibold">{act.age} {t.yearsShort}</span>
                             </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-8 grid grid-cols-12 gap-8 h-[calc(100%-120px)]">
                           {/* Left Column */}
                           <div className="col-span-7 flex flex-col gap-6">
                              <div className="bg-blue-50 p-5 rounded-xl border-l-4 border-blue-600">
                                 <h4 className="text-sm uppercase tracking-wider font-bold text-blue-800 mb-2">{t.cardConcept}</h4>
                                 <p className="text-xl font-medium leading-relaxed">{act.concept}</p>
                              </div>
                              
                              <div>
                                 <h4 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-2 border-b pb-1">{t.cardDescTitle}</h4>
                                 <p className="text-lg leading-relaxed text-slate-700">{act.description}</p>
                              </div>

                              <div className="mt-auto bg-slate-100 p-4 rounded-lg">
                                 <h4 className="flex items-center gap-2 font-bold text-slate-700 mb-2">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    {t.cardRhetoricTitle}
                                 </h4>
                                 <p className="text-slate-800 font-medium italic">"{act.rhetoric}"</p>
                              </div>
                           </div>

                           {/* Right Column */}
                           <div className="col-span-5 flex flex-col gap-6 border-l pl-8 border-slate-100">
                              <div>
                                <h4 className="text-sm uppercase tracking-wider font-bold text-slate-500 mb-3">{t.cardFocusTitle}</h4>
                                <ul className="space-y-2">
                                   {act.focusPoints.map((fp, i) => (
                                      <li key={i} className="flex items-start gap-2 text-slate-700 font-medium">
                                         <span className="text-blue-500 mt-1">•</span> {fp}
                                      </li>
                                   ))}
                                </ul>
                              </div>

                              <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100 shadow-sm">
                                <h4 className="text-sm uppercase tracking-wider font-bold text-yellow-700 mb-3">{t.cardExamplesTitle}</h4>
                                <div className="space-y-2">
                                  {act.examples.map((ex, i) => (
                                     <div key={i} className="flex gap-2">
                                        <span className="text-yellow-500">“</span>
                                        <p className="text-slate-800 italic font-medium">{ex}</p>
                                     </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="mt-auto grid grid-cols-2 gap-4 text-sm text-slate-500">
                                 <div>
                                    <span className="block font-bold text-slate-400 uppercase text-xs mb-1">{t.cardMaterials}</span>
                                    {act.materials}
                                 </div>
                                 <div>
                                    <span className="block font-bold text-slate-400 uppercase text-xs mb-1">{t.cardDuration}</span>
                                    {act.duration}
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Footer Stripe (Credits) */}
                        <div className="absolute bottom-0 w-full bg-slate-50 px-6 py-2 text-[10px] text-slate-400 flex justify-between items-center border-t">
                           <span>{t.cardFooterCredit}</span>
                           <span>{t.cardFooterAuthor}</span>
                        </div>
                     </div>

                     <button 
                       onClick={() => downloadCard(id)}
                       className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                     >
                       <Download className="w-4 h-4" /> {t.downloadSingle}
                     </button>
                   </div>
                 );
               })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;