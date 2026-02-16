
import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, User, Category } from './types';
import { DEFAULT_CATEGORIES } from './constants';
import { BookmarkCard } from './components/BookmarkCard';
import { analyzeBookmark, chatWithBookmarks } from './services/geminiService';

const App: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // AI Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedBookmarks = localStorage.getItem('mindmap_bookmarks');
    const savedUser = localStorage.getItem('mindmap_user');
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    localStorage.setItem('mindmap_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleLogin = () => {
    const mockUser: User = {
      id: 'usr_1',
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      joinedAt: Date.now(),
      plan: 'Pro'
    };
    setUser(mockUser);
    localStorage.setItem('mindmap_user', JSON.stringify(mockUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mindmap_user');
  };

  const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeBookmark(newUrl);
      const newBookmark: Bookmark = {
        id: crypto.randomUUID(),
        url: newUrl.startsWith('http') ? newUrl : `https://${newUrl}`,
        ...analysis,
        addedAt: Date.now()
      };
      setBookmarks(prev => [newBookmark, ...prev]);
      setNewUrl('');
      setIsAdding(false);
    } catch (error) {
      alert("Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const userMsg = chatQuery;
    setChatQuery('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    const aiResponse = await chatWithBookmarks(userMsg, bookmarks);
    setChatHistory(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setIsChatLoading(false);
  };

  const filteredBookmarks = bookmarks.filter(b => {
    const matchesCategory = activeCategory === 'all' || b.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent)] animate-pulse"></div>
        <div className="max-w-md w-full p-10 glass-effect rounded-[2.5rem] border border-slate-800 text-center relative z-10 shadow-2xl">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-blue-500/20 shadow-2xl transform rotate-12">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">MindMap</h1>
          <p className="text-slate-400 mb-10 leading-relaxed px-4">Your digital brain, organized by Gemini AI. Save anything, search everything.</p>
          <button onClick={handleLogin} className="w-full py-5 px-6 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-all active:scale-[0.98]">
            <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 glass-effect border-r border-slate-800 flex flex-col h-screen p-8 shrink-0">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="text-2xl font-black tracking-tighter">MindMap</span>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          {DEFAULT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                activeCategory === cat.id ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-blue-500/5 shadow-xl' : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl filter grayscale group-hover:grayscale-0 transition-all">{cat.icon}</span>
                <span className="font-bold text-sm tracking-tight">{cat.name}</span>
              </div>
              <span className="text-[10px] font-mono opacity-50">{cat.id === 'all' ? bookmarks.length : bookmarks.filter(b => b.category.toLowerCase() === cat.name.toLowerCase()).length}</span>
            </button>
          ))}
        </nav>

        {/* User Profile Summary */}
        <div className="mt-8 pt-8 border-t border-slate-800">
          <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
            <img src={user.avatar} className="w-10 h-10 rounded-xl bg-slate-800" alt="avatar" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 font-mono tracking-tighter">Plan: {user.plan}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-rose-400 transition-colors">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="px-10 py-8 flex items-center justify-between z-10">
          <div className="flex-1 max-w-xl relative">
            <input 
              type="text" 
              placeholder="Search your library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/30 transition-all outline-none text-sm placeholder:text-slate-600"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`px-6 py-4 rounded-2xl font-black text-sm transition-all border ${isChatOpen ? 'bg-indigo-600 border-indigo-500 shadow-indigo-500/20 shadow-2xl' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'}`}
            >
              Ask AI Brain
            </button>
            <button 
              onClick={() => setIsAdding(true)}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
            >
              New Link
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-10 pb-20 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
            {filteredBookmarks.map(b => (
              <BookmarkCard key={b.id} bookmark={b} onDelete={(id) => setBookmarks(prev => prev.filter(item => item.id !== id))} />
            ))}
          </div>
        </div>

        {/* AI Chat Drawer */}
        <div className={`absolute right-0 top-0 bottom-0 w-96 glass-effect border-l border-slate-800 z-30 transition-transform duration-500 transform ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black">AI Librarian</h3>
              <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2">
              {chatHistory.length === 0 && (
                <div className="text-center py-20 opacity-30 px-8">
                  <p className="text-sm italic">"Ask me anything about your saved content. I can summarize topics or find specific resources."</p>
                </div>
              )}
              {chatHistory.map((chat, i) => (
                <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${chat.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                    {chat.text}
                  </div>
                </div>
              ))}
              {isChatLoading && <div className="flex justify-start"><div className="bg-slate-800/50 p-4 rounded-2xl animate-pulse w-24 h-8"></div></div>}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleChat} className="relative">
              <input 
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                placeholder="Ask your digital brain..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-4 pr-12 text-sm focus:border-blue-500 outline-none"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400 p-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
            </form>
          </div>
        </div>
      </main>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-6">
          <div className="w-full max-w-lg bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-black mb-8">Save Discovery</h2>
            <form onSubmit={handleAddBookmark} className="space-y-6">
              <input 
                autoFocus
                required
                placeholder="Paste URL (e.g., github.com/react)"
                className="w-full bg-slate-800 border-none rounded-2xl py-6 px-6 text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                disabled={isAnalyzing}
              />
              <div className="flex flex-col gap-3">
                <button type="submit" disabled={isAnalyzing} className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3">
                  {isAnalyzing ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Deep Analyze & Save'}
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="w-full py-4 text-slate-500 font-bold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
