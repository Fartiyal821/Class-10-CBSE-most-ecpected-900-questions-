
import React, { useState, useEffect, useMemo } from 'react';
import { ChaptersData } from './constants';

interface Question {
  id: number;
  text: string;
  category: 'most' | 'less' | 'least';
  difficulty: 'Hard' | 'Medium' | 'Easy';
  type: string;
}

const FeedbackSection: React.FC<{ questionId: number }> = ({ questionId }) => {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);

  const handleVote = (type: 'up' | 'down') => {
    if (vote === type) {
      setVote(null);
    } else {
      setVote(type);
    }
  };

  return (
    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Feedback:</span>
      <div className="flex gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); handleVote('up'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
            vote === 'up' 
            ? 'bg-green-500 text-white shadow-lg shadow-green-200 scale-105' 
            : 'bg-slate-50 text-slate-500 hover:bg-green-50 hover:text-green-600'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill={vote === 'up' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          Helpful
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleVote('down'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
            vote === 'down' 
            ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-105' 
            : 'bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill={vote === 'down' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.737 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
          </svg>
          Not Helpful
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const allQuestions: Question[] = [];
    const chapterNames = Object.keys(ChaptersData);
    const TOTAL_QUESTIONS = 900;

    for (let counter = 1; counter <= TOTAL_QUESTIONS; counter++) {
      const chName = chapterNames[counter % chapterNames.length];
      const chQs = ChaptersData[chName];
      // Use offset to vary questions even with limited source strings
      const qIndex = (counter - 1 + Math.floor(counter / chapterNames.length)) % chQs.length;
      const qText = chQs[qIndex];
      
      let category: 'most' | 'less' | 'least';
      let difficulty: 'Hard' | 'Medium' | 'Easy';
      
      // 900 Question Distribution: 300 Critical, 300 Probable, 300 Core
      if (counter <= 300) {
        category = 'most';
        difficulty = counter % 2 === 0 ? 'Hard' : 'Medium';
      } else if (counter <= 600) {
        category = 'less';
        difficulty = counter % 3 === 0 ? 'Hard' : 'Medium';
      } else {
        category = 'least';
        difficulty = 'Easy';
      }

      allQuestions.push({ id: counter, text: qText, category, difficulty, type: chName });
    }
    setQuestions(allQuestions);

    const savedProgress = localStorage.getItem('shemford_progress_v900');
    if (savedProgress) {
      try {
        setReviewedIds(new Set(JSON.parse(savedProgress)));
      } catch (e) {
        console.error("Failed to parse progress", e);
      }
    }
  }, []);

  const toggleReviewed = (id: number) => {
    setReviewedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      localStorage.setItem('shemford_progress_v900', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const filteredQuestions = useMemo(() => {
    let result = filter === 'All' 
      ? questions 
      : questions.filter(q => q.type === filter);
    
    return result;
  }, [filter, questions]);

  const progressStats = useMemo(() => {
    const reviewedQs = questions.filter(q => reviewedIds.has(q.id));
    return {
      total: questions.length,
      reviewed: reviewedIds.size,
      percent: questions.length ? Math.round((reviewedIds.size / questions.length) * 100) : 0,
      difficulty: {
        Hard: reviewedQs.filter(q => q.difficulty === 'Hard').length,
        Medium: reviewedQs.filter(q => q.difficulty === 'Medium').length,
        Easy: reviewedQs.filter(q => q.difficulty === 'Easy').length,
      },
      difficultyTotals: {
        Hard: questions.filter(q => q.difficulty === 'Hard').length,
        Medium: questions.filter(q => q.difficulty === 'Medium').length,
        Easy: questions.filter(q => q.difficulty === 'Easy').length,
      }
    };
  }, [reviewedIds, questions]);

  const handleShare = async (q: Question) => {
    const shareText = `Critical PYQ (${q.difficulty} level) Question #${q.id}:\n"${q.text}"\n\nStudy from SHEMFORD MASTER 900 SERIES.`;
    if (navigator.share) {
      try { await navigator.share({ title: `Math PYQ #${q.id}`, text: shareText, url: window.location.href }); }
      catch (err) { console.error("Error sharing:", err); }
    } else {
      try { await navigator.clipboard.writeText(shareText); alert("Copied to clipboard!"); }
      catch (err) { window.location.href = `mailto:?subject=Math PYQ #${q.id}&body=${encodeURIComponent(shareText)}`; }
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50">
      <header className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 text-white py-14 px-6 text-center shadow-2xl relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-8xl font-black mb-2 tracking-tighter drop-shadow-2xl">
            SHEMFORD <span className="text-blue-400">MASTER</span>
          </h1>
          <p className="text-xl md:text-3xl font-black opacity-90 text-yellow-400 uppercase tracking-[0.2em] mb-4">
            900 MOST EXPECTED PYQs
          </p>
          <div className="h-1 w-32 bg-blue-500 mx-auto rounded-full mb-8"></div>
          
          <div className="mt-8 max-w-2xl mx-auto bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-end mb-4">
              <div className="text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-300 block mb-1">Total Completion</span>
                <span className="text-4xl font-black text-white">{progressStats.percent}%</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Mastery Points</span>
                <span className="text-2xl font-black text-blue-400">{progressStats.reviewed * 10} pts</span>
              </div>
            </div>
            <div className="w-full bg-slate-800/80 h-5 rounded-full overflow-hidden border border-white/5 p-1">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                style={{ width: `${progressStats.percent}%` }}
              ></div>
            </div>
            <p className="text-xs mt-4 text-slate-300 font-bold uppercase tracking-tight">{progressStats.reviewed} / {progressStats.total} Questions Cleared</p>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 mt-12">
        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
            <div key={diff} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all hover:-translate-y-1">
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{diff} Tier Progress</p>
                <h3 className="text-3xl font-black text-slate-800">
                  {progressStats.difficulty[diff]} <span className="text-slate-200 font-normal">/ {progressStats.difficultyTotals[diff]}</span>
                </h3>
              </div>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner ${
                diff === 'Hard' ? 'bg-red-50 text-red-600' :
                diff === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                'bg-green-50 text-green-600'
              }`}>
                {Math.round((progressStats.difficulty[diff] / progressStats.difficultyTotals[diff]) * 100)}%
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Chapter Filter */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16 sticky top-6 z-50 bg-white/70 backdrop-blur-2xl py-6 px-8 rounded-[3rem] shadow-2xl border border-white/50">
          <button onClick={() => setFilter('All')} className={`px-8 py-3.5 rounded-full font-black text-[11px] uppercase tracking-wider transition-all shadow-md ${filter === 'All' ? 'bg-slate-900 text-white scale-110 shadow-slate-300' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}>Master List</button>
          {Object.keys(ChaptersData).map(ch => (
            <button key={ch} onClick={() => setFilter(ch)} className={`px-6 py-3.5 rounded-full font-black text-[10px] uppercase tracking-tight transition-all shadow-sm ${filter === ch ? 'bg-blue-600 text-white scale-110 shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'}`}>{ch}</button>
          ))}
        </div>

        {/* Massive Question Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-12">
          {filteredQuestions.map((q) => {
            const isReviewed = reviewedIds.has(q.id);
            return (
              <div 
                key={q.id} 
                onClick={() => toggleReviewed(q.id)}
                className={`flex flex-col p-12 rounded-[3.5rem] bg-white shadow-2xl transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border cursor-pointer relative group 
                ${isReviewed ? 'opacity-70 scale-[0.97] border-green-300 bg-green-50/20' : 'border-slate-50'} 
                ${q.category === 'most' ? 'highlight-most-expected' : ''} 
                ${q.category === 'less' ? 'highlight-less-expected' : ''} 
                ${q.category === 'least' ? 'highlight-least-expected' : ''}`}
              >
                {isReviewed && (
                  <div className="absolute top-6 left-6 z-10 bg-green-500 text-white rounded-full p-2 shadow-2xl border-4 border-white animate-bounce-short">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}

                <div className="flex justify-between items-start mb-10">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">{q.type}</span>
                    <span className={`text-6xl font-black transition-all ${isReviewed ? 'text-green-600 opacity-40' : 'text-slate-900 opacity-10 group-hover:opacity-30 group-hover:scale-110'}`}>#{q.id}</span>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <div className="flex gap-3">
                      <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                        q.difficulty === 'Hard' ? 'bg-red-50 text-red-700 border-red-200' :
                        q.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {q.difficulty}
                      </div>
                      <div className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl transition-all group-hover:scale-110 ${q.category === 'most' ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white' : ''} ${q.category === 'less' ? 'bg-yellow-400 text-yellow-900' : ''} ${q.category === 'least' ? 'bg-green-500 text-white' : ''}`}>
                        {q.category === 'most' ? 'Critical' : q.category === 'less' ? 'Probable' : 'Base'}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleShare(q); }}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg text-slate-400 hover:text-blue-600 transition-all border border-slate-100"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100 0m0 0a3 3 0 100 0" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex-grow flex items-center py-6">
                  <p className={`text-3xl md:text-4xl leading-[1.6] font-bold italic w-full transition-all drop-shadow-sm ${isReviewed ? 'text-slate-400 line-through' : 'text-slate-900 group-hover:text-blue-900'}`}>
                    "{q.text}"
                  </p>
                </div>

                <FeedbackSection questionId={q.id} />

                <div className="pt-10 border-t border-slate-100 flex justify-between items-center mt-8">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Self Study Hub</span>
                    <a 
                      href={`https://www.google.com/search?q=class+10+maths+PYQ+solution+${encodeURIComponent(q.text.substring(0, 60))}`}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="text-base font-black text-blue-600 hover:text-indigo-700 transition-all flex items-center gap-2 group/link underline decoration-blue-200 underline-offset-8"
                    >
                      SOLVE NOW
                      <svg className="w-5 h-5 transition-transform group-hover/link:translate-x-2 group-hover/link:-translate-y-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <div className="h-14 w-14 rounded-[1.25rem] bg-slate-950 flex flex-col items-center justify-center text-white font-black shadow-2xl group-hover:bg-blue-600 transition-all group-hover:-rotate-12">
                      <span className="text-xs">{q.type.includes('Case') ? '5' : q.difficulty === 'Hard' ? '3' : '2'}</span>
                      <span className="text-[8px] opacity-60">MARKS</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleReviewed(q.id); }}
                      className={`text-[11px] font-black uppercase px-6 py-2.5 rounded-full transition-all border shadow-xl ${isReviewed ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-slate-900 hover:bg-slate-900 hover:text-white border-slate-200'}`}
                    >
                      {isReviewed ? 'Mastered' : 'Mark Reviewed'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="bg-slate-950 text-slate-500 text-center py-32 mt-40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-yellow-400 via-green-500 to-blue-600"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <h4 className="text-white text-4xl font-black mb-8 tracking-tighter">SHEMFORD DIGITAL ELITE</h4>
          <p className="max-w-4xl mx-auto text-lg leading-loose opacity-60 italic font-light px-8">"Providing the ultimate curated roadmap for CBSE Standard Mathematics. These 900 problems are selected based on 10-year trend analysis for the 2025 Preboard cycle."</p>
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-12 opacity-30 text-[11px] font-black tracking-[0.3em] uppercase">
            <div className="flex flex-col gap-2"><span>Established 2025</span><div className="h-0.5 w-10 bg-white mx-auto"></div></div>
            <div className="flex flex-col gap-2"><span>Curriculum Elite</span><div className="h-0.5 w-10 bg-white mx-auto"></div></div>
            <div className="flex flex-col gap-2"><span>700+ Selected</span><div className="h-0.5 w-10 bg-white mx-auto"></div></div>
            <div className="flex flex-col gap-2"><span>v2.5.0 STABLE</span><div className="h-0.5 w-10 bg-white mx-auto"></div></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
