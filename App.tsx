
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plan, SiteContent, GalleryImage, SocialPost, Testimonial, Inquiry } from './types';
import { INITIAL_CONTENT } from './constants';
import { PlanCard } from './components/PlanCard';
import { ServicesRibbon } from './components/ServicesRibbon';
import {
  loadContent, saveContent,
  loadInquiries, addInquiry, updateInquiry as updateInquiryFB, deleteInquiry as deleteInquiryFB,
  uploadImage
} from './firebaseService';
import { 
  Instagram, Facebook, Linkedin, Quote, GlassWater, Award, 
  ShieldCheck, Mail, Phone, MapPin, Send, CalendarCheck, 
  Heart, MessageCircle, ChevronLeft, ChevronRight, Settings, 
  Plus, Trash2, X, Save, RotateCcw, Lock, Upload, Image as ImageIcon,
  ArrowLeft, Clock, Users, Calendar, Info, BarChart3, PieChart, TrendingUp, Download, StickyNote, Check, Filter, List, DollarSign, Target, Key, Eye, EyeOff, LogIn, LogOut, FileText,
  Star, Coffee, Utensils
} from 'lucide-react';


const AdminDashboard: React.FC<{ 
  content: SiteContent, 
  onUpdate: (newContent: SiteContent) => void, 
  inquiries: Inquiry[],
  onUpdateInquiry: (id: string, updates: Partial<Inquiry>) => void,
  onDeleteInquiry: (id: string) => void,
  onLogout: () => void,
  onClose: () => void 
}> = ({ content, onUpdate, inquiries, onUpdateInquiry, onDeleteInquiry, onLogout, onClose }) => {
  const [localContent, setLocalContent] = useState<SiteContent>(content);
  // Fix: Added missing tab types to activeTab state union
  const [activeTab, setActiveTab] = useState<'general' | 'about' | 'gallery' | 'social' | 'plans' | 'crm' | 'legal' | 'recipe' | 'testimonials'>('crm');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Fix: Expanded the field type for uploadingFor state to include all possible values
  const [uploadingFor, setUploadingFor] = useState<{ field: 'gallery' | 'about' | 'socialFeed' | 'recipe', index?: number } | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(inquiries.map(inq => inq.category));
    return ['All', ...Array.from(cats)];
  }, [inquiries]);

  const filteredInquiries = useMemo(() => {
    if (filterCategory === 'All') return inquiries;
    return inquiries.filter(inq => inq.category === filterCategory);
  }, [inquiries, filterCategory]);

  const analytics = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return d.toLocaleString('default', { month: 'short' });
    });

    const leadTrend = months.map(m => {
      const count = inquiries.filter(inq => {
        const inqDate = new Date(inq.timestamp);
        return inqDate.toLocaleString('default', { month: 'short' }) === m;
      }).length;
      return { month: m, count };
    });

    const categorySummary = inquiries.reduce((acc, inq) => {
      acc[inq.category] = (acc[inq.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(categorySummary).map(([name, value]) => ({ name, value }));
    
    return { leadTrend, categoryData, totalLeads: inquiries.length };
  }, [inquiries]);

  const handleInputChange = (field: keyof SiteContent, value: any) => {
    setLocalContent(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (field: 'gallery' | 'socialFeed' | 'plans' | 'testimonials', defaultItem: any) => {
    handleInputChange(field, [...(localContent[field] as any[]), defaultItem]);
  };

  const removeItem = (field: 'gallery' | 'socialFeed' | 'plans' | 'testimonials', index: number) => {
    const list = [...(localContent[field] as any[])];
    list.splice(index, 1);
    handleInputChange(field, list);
  };

  const updateItem = (field: 'gallery' | 'socialFeed' | 'plans' | 'testimonials', index: number, updates: any) => {
    const list = [...(localContent[field] as any[])];
    list[index] = { ...list[index], ...updates };
    handleInputChange(field, list);
  };

  const exportToCSV = () => {
    const headers = ["ID", "Timestamp", "Full Name", "Email", "Event Name", "Date", "Time", "Category", "Capacity", "Budget", "Description", "Admin Notes"];
    const rows = inquiries.map(inq => [
      inq.id,
      inq.timestamp,
      `"${inq.fullName.replace(/"/g, '""')}"`,
      inq.email,
      `"${inq.eventName.replace(/"/g, '""')}"`,
      inq.eventDate,
      inq.startTime,
      inq.category,
      inq.capacity,
      `"${inq.budget || 'N/A'}"`,
      `"${inq.description.replace(/"/g, '""')}"`,
      `"${(inq.notes || '').replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `elite_mixology_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingFor) return;

    try {
      const downloadURL = await uploadImage(file, uploadingFor.field);
      if (uploadingFor.field === 'recipe') {
        handleInputChange('recipe', { ...localContent.recipe, image: downloadURL });
      } else if (uploadingFor.field === 'about') {
        handleInputChange('aboutImage', downloadURL);
      } else {
        updateItem(uploadingFor.field as any, uploadingFor.index!, { url: downloadURL });
      }
    } catch (error) {
      console.error('Upload failed, falling back to base64:', error);
      // Fallback to base64 if Firebase Storage fails
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (uploadingFor.field === 'recipe') {
          handleInputChange('recipe', { ...localContent.recipe, image: base64String });
        } else if (uploadingFor.field === 'about') {
          handleInputChange('aboutImage', base64String);
        } else {
          updateItem(uploadingFor.field as any, uploadingFor.index!, { url: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
    setUploadingFor(null);
    if (e.target) e.target.value = '';
  };

  const triggerUpload = (field: 'gallery' | 'socialFeed' | 'recipe' | 'about', index?: number) => {
    setUploadingFor({ field, index });
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in duration-300">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
      <div className="flex items-center justify-between p-6 border-b border-zinc-800">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="flex items-center gap-2 text-zinc-500 hover:text-[#FF69B4] transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Website</span>
          </button>
          <div className="h-6 w-px bg-zinc-800"></div>
          <div className="flex items-center gap-3">
            <Settings className="text-[#FF69B4]" size={20} />
            <h2 className="text-lg font-serif text-white uppercase tracking-widest">Admin Portal</h2>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => { if(confirm('Reset all content to defaults?')) { onUpdate(INITIAL_CONTENT); setLocalContent(INITIAL_CONTENT); } }} className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
            <RotateCcw size={16} /> Reset
          </button>
          <button onClick={async () => { await saveContent(localContent); onUpdate(localContent); onClose(); }} className="btn-hotpink px-6 py-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <Save size={16} /> Save
          </button>
          <button onClick={onLogout} className="px-4 py-2 border border-zinc-800 hover:border-red-500/50 hover:text-red-500 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-zinc-800 p-4 flex flex-col gap-2 bg-zinc-950/50">
          {[
            { id: 'crm', label: 'CRM Leads', icon: Users },
            { id: 'general', label: 'Hero Content', icon: ImageIcon },
            { id: 'about', label: 'About Story', icon: Info },
            { id: 'gallery', label: 'Gallery Portfolio', icon: List },
            { id: 'recipe', label: 'Recipe Focus', icon: GlassWater },
            { id: 'social', label: 'Social Feed', icon: Instagram },
            { id: 'plans', label: 'Tiered Plans', icon: Utensils },
            { id: 'testimonials', label: 'Testimonials', icon: Quote },
            { id: 'legal', label: 'Legal Content', icon: ShieldCheck },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#FF69B4] text-white shadow-[0_0_15px_rgba(255,105,180,0.3)]' : 'text-zinc-500 hover:bg-white/5 hover:text-white'}`}>
              <span className="flex items-center gap-3">
                <tab.icon size={14} />
                {tab.label}
              </span>
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-zinc-950/30">
          <div className="max-w-5xl mx-auto space-y-12">
            
            {activeTab === 'crm' && (
              <div className="space-y-12 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-[#D4AF37] font-serif text-2xl">Elite Dashboard</h3>
                    <p className="text-zinc-500 text-xs mt-1">Real-time lead management.</p>
                  </div>
                  <button onClick={exportToCSV} className="flex items-center gap-2 border border-zinc-800 hover:border-[#D4AF37] text-zinc-400 hover:text-[#D4AF37] px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">
                    <Download size={14} /> Export CSV
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 h-64 flex flex-col">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4">
                      <TrendingUp size={14} className="text-[#FF69B4]" /> Trends
                    </div>
                    <div className="flex-1 flex items-end justify-between gap-2 px-2">
                      {analytics.leadTrend.map((d, i) => {
                        const max = Math.max(...analytics.leadTrend.map(x => x.count), 1);
                        const height = (d.count / max) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full bg-gradient-to-t from-[#FF69B4] to-[#ff85c1] rounded-t-lg" style={{ height: `${Math.max(height, 5)}%` }} />
                            <span className="text-[8px] uppercase tracking-tighter text-zinc-600">{d.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 h-64 flex flex-col">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4">
                      <PieChart size={14} className="text-[#D4AF37]" /> Distribution
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      {analytics.categoryData.map((c, i) => (
                        <div key={i} className="mb-3">
                          <div className="flex justify-between text-[8px] uppercase tracking-widest mb-1">
                            <span className="text-zinc-400">{c.name}</span>
                            <span className="text-white">{c.value}</span>
                          </div>
                          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-[#D4AF37]" style={{ width: `${(c.value / Math.max(analytics.totalLeads, 1)) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-[#FF69B4]/10 to-[#D4AF37]/10 border border-white/10 rounded-3xl p-6 h-64 flex flex-col justify-center items-center text-center">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-2">Total Vision Manifested</span>
                    <span className="text-6xl font-serif pink-gold-text mb-4">{analytics.totalLeads}</span>
                  </div>
                </div>

                <div className="grid gap-6">
                  {filteredInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 group shadow-sm hover:shadow-lg transition-all">
                      <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 pb-6 border-b border-zinc-800/50">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-xl font-serif text-white">{inquiry.fullName}</h4>
                            <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-bold border border-[#D4AF37]/20">{inquiry.category}</span>
                          </div>
                          <p className="text-[#FF69B4] text-xs font-bold uppercase tracking-widest">{inquiry.email}</p>
                        </div>
                        <div className="text-left md:text-right">
                          <span className="text-[10px] uppercase tracking-widest text-zinc-600 block mb-1">Proposed Event</span>
                          <span className="text-white text-xs font-medium">{inquiry.eventDate}</span>
                        </div>
                        <button onClick={() => { if(confirm('Remove this lead?')) onDeleteInquiry(inquiry.id); }} className="text-zinc-800 hover:text-red-500 transition-colors">
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Schedule</p>
                          <p className="text-white text-sm flex items-center gap-2"><Clock size={12} /> {inquiry.startTime}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Occasion</p>
                          <p className="text-white text-sm font-medium">{inquiry.eventName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Budget</p>
                          <p className="text-[#FF69B4] text-sm font-bold flex items-center gap-1"><DollarSign size={12} /> {inquiry.budget}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Client Vision</p>
                          <p className="text-zinc-400 text-xs italic line-clamp-2">"{inquiry.description}"</p>
                        </div>
                      </div>

                      <div className="bg-black/50 rounded-2xl p-6 border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                            <StickyNote size={14} className="text-[#FF69B4]" /> Internal Notes
                          </div>
                          <button onClick={() => setEditingNoteId(editingNoteId === inquiry.id ? null : inquiry.id)} className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold hover:text-white transition-colors">
                            {editingNoteId === inquiry.id ? 'Save' : 'Edit'}
                          </button>
                        </div>
                        {editingNoteId === inquiry.id ? (
                          <textarea autoFocus defaultValue={inquiry.notes || ''} onBlur={(e) => { onUpdateInquiry(inquiry.id, { notes: e.target.value }); setEditingNoteId(null); }} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white text-sm focus:border-[#FF69B4] outline-none min-h-[100px] resize-none" placeholder="Internal comments..." />
                        ) : (
                          <p className={`text-sm ${inquiry.notes ? 'text-zinc-300' : 'text-zinc-700 italic'} whitespace-pre-wrap`}>{inquiry.notes || 'No administrative notes yet.'}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'recipe' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-[#D4AF37] font-serif text-2xl">Cocktail of the Month</h3>
                <div className="bg-zinc-900/40 p-8 rounded-3xl border border-white/5 space-y-6">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-64 h-64 rounded-2xl overflow-hidden bg-black border border-zinc-800 relative group/recipe">
                      <img src={localContent.recipe.image} className="w-full h-full object-cover" />
                      <button onClick={() => triggerUpload('recipe')} className="absolute inset-0 bg-black/60 opacity-0 group-hover/recipe:opacity-100 flex items-center justify-center text-white transition-opacity"><Upload size={24} /></button>
                    </div>
                    <div className="flex-1 space-y-4">
                      <input value={localContent.recipe.name} onChange={(e) => handleInputChange('recipe', { ...localContent.recipe, name: e.target.value })} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white font-serif text-xl outline-none focus:border-[#FF69B4]" placeholder="Recipe Name" />
                      <textarea value={localContent.recipe.description} onChange={(e) => handleInputChange('recipe', { ...localContent.recipe, description: e.target.value })} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white resize-none h-24 outline-none focus:border-[#FF69B4]" placeholder="Short Description" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Ingredients (one per line)</label>
                    <textarea value={localContent.recipe.ingredients.join('\n')} onChange={(e) => handleInputChange('recipe', { ...localContent.recipe, ingredients: e.target.value.split('\n') })} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white resize-none h-40 outline-none focus:border-[#FF69B4]" placeholder="Ingredients..." />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Instructions (one per line)</label>
                    <textarea value={localContent.recipe.instructions.join('\n')} onChange={(e) => handleInputChange('recipe', { ...localContent.recipe, instructions: e.target.value.split('\n') })} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white resize-none h-40 outline-none focus:border-[#FF69B4]" placeholder="Instructions..." />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-[#D4AF37] font-serif text-2xl">Main Headlines</h3>
                <div className="bg-zinc-900/40 p-8 rounded-3xl border border-white/5 space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Hero Title</label>
                    <input value={localContent.heroTitle} onChange={(e) => handleInputChange('heroTitle', e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white text-lg font-serif outline-none focus:border-[#FF69B4]" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Hero Subtitle</label>
                    <textarea value={localContent.heroSubtitle} onChange={(e) => handleInputChange('heroSubtitle', e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white resize-none h-32 outline-none focus:border-[#FF69B4]" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-[#D4AF37] font-serif text-2xl">About Story</h3>
                <div className="bg-zinc-900/40 p-8 rounded-3xl border border-white/5 space-y-6">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-64 h-64 rounded-2xl overflow-hidden bg-black border border-zinc-800 relative group/about">
                      <img src={localContent.aboutImage} className="w-full h-full object-cover" />
                      <button onClick={() => triggerUpload('about')} className="absolute inset-0 bg-black/60 opacity-0 group-hover/about:opacity-100 flex items-center justify-center text-white transition-opacity"><Upload size={24} /></button>
                    </div>
                    <div className="flex-1 space-y-4">
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold flex items-center gap-2">
                        About Title
                      </label>
                      <input value={localContent.aboutTitle} onChange={(e) => handleInputChange('aboutTitle', e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white outline-none focus:border-[#FF69B4]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold flex items-center gap-2">
                       <Target size={12} className="text-[#FF69B4]" /> Mission Statement
                    </label>
                    <textarea value={localContent.missionStatement} onChange={(e) => handleInputChange('missionStatement', e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white resize-none h-32 italic font-serif text-lg outline-none focus:border-[#FF69B4]" />
                  </div>
                  {[1, 2, 3].map(i => (
                    <div key={i}>
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2 font-bold">Paragraph {i}</label>
                      <textarea value={(localContent as any)[`aboutText${i}`]} onChange={(e) => handleInputChange(`aboutText${i}` as any, e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white resize-none h-32 outline-none focus:border-[#FF69B4]" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="text-[#D4AF37] font-serif text-2xl">Portfolio Gallery</h3>
                  <button onClick={() => addItem('gallery', { url: '', title: 'New Event', size: 'col-span-2 row-span-2' })} className="btn-hotpink px-4 py-2 rounded-lg text-[10px] font-bold flex items-center gap-2"><Plus size={14} /> Add Slot</button>
                </div>
                <div className="grid gap-6">
                  {localContent.gallery.map((img, i) => (
                    <div key={i} className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 flex flex-col md:flex-row gap-6 hover:border-[#FF69B4]/30 transition-colors group">
                      <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden bg-black shrink-0 border border-zinc-800 relative">
                        {img.url ? <img src={img.url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-zinc-800 bg-zinc-950"><ImageIcon size={32} /></div>}
                        <button onClick={() => triggerUpload('gallery', i)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white"><Upload size={24} /></button>
                      </div>
                      <div className="flex-1 space-y-4">
                        <input placeholder="Image URL" value={img.url} onChange={(e) => updateItem('gallery', i, { url: e.target.value })} className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white" />
                        <input placeholder="Title" value={img.title} onChange={(e) => updateItem('gallery', i, { title: e.target.value })} className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white" />
                        <select value={img.size} onChange={(e) => updateItem('gallery', i, { size: e.target.value })} className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white outline-none">
                          <option value="col-span-1 row-span-1">Small (1x1)</option>
                          <option value="col-span-2 row-span-1">Wide (2x1)</option>
                          <option value="col-span-1 row-span-2">Tall (1x2)</option>
                          <option value="col-span-2 row-span-2">Large (2x2)</option>
                        </select>
                      </div>
                      <button onClick={() => removeItem('gallery', i)} className="p-2 text-zinc-700 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'testimonials' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="text-[#D4AF37] font-serif text-2xl">Client Testimonials</h3>
                  <button onClick={() => addItem('testimonials', { name: 'New Client', event: 'Event Type', text: 'Truly remarkable experience.' })} className="btn-hotpink px-4 py-2 rounded-lg text-[10px] font-bold flex items-center gap-2"><Plus size={14} /> Add Quote</button>
                </div>
                <div className="grid gap-6">
                  {localContent.testimonials.map((test, i) => (
                    <div key={i} className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-4 hover:border-[#FF69B4]/30 transition-colors">
                      <div className="grid md:grid-cols-2 gap-4">
                        <input value={test.name} onChange={(e) => updateItem('testimonials', i, { name: e.target.value })} className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white outline-none focus:border-[#FF69B4]" placeholder="Client Name" />
                        <input value={test.event} onChange={(e) => updateItem('testimonials', i, { event: e.target.value })} className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-xs text-white outline-none focus:border-[#FF69B4]" placeholder="Event Type" />
                      </div>
                      <textarea value={test.text} onChange={(e) => updateItem('testimonials', i, { text: e.target.value })} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-sm text-white resize-none h-24 outline-none focus:border-[#FF69B4]" placeholder="Testimonial quote..." />
                      <button onClick={() => removeItem('testimonials', i)} className="text-zinc-600 hover:text-red-500 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"><Trash2 size={14} /> Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'legal' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-[#D4AF37] font-serif text-2xl">Legal Documentation</h3>
                <div className="bg-zinc-900/40 p-8 rounded-3xl border border-white/5 space-y-8">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-3 font-bold flex items-center gap-2">
                       <ShieldCheck size={14} className="text-[#FF69B4]" /> Privacy Policy
                    </label>
                    <textarea 
                      value={localContent.privacyPolicy} 
                      onChange={(e) => handleInputChange('privacyPolicy', e.target.value)} 
                      className="w-full bg-black border border-zinc-800 p-6 rounded-2xl text-white text-sm leading-relaxed h-[200px] focus:border-[#FF69B4] outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-3 font-bold flex items-center gap-2">
                       <FileText size={14} className="text-[#D4AF37]" /> Terms & Conditions
                    </label>
                    <textarea 
                      value={localContent.termsAndConditions} 
                      onChange={(e) => handleInputChange('termsAndConditions', e.target.value)} 
                      className="w-full bg-black border border-zinc-800 p-6 rounded-2xl text-white text-sm leading-relaxed h-[200px] focus:border-[#D4AF37] outline-none" 
                    />
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'social' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-[#D4AF37] font-serif text-2xl">Social Aesthetics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {localContent.socialFeed.map((post, i) => (
                    <div key={i} className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
                      <div className="aspect-square rounded-lg overflow-hidden bg-black relative group/post">
                        {post.url ? <img src={post.url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={32} /></div>}
                        <button onClick={() => triggerUpload('socialFeed', i)} className="absolute inset-0 bg-black/60 opacity-0 group-hover/post:opacity-100 transition-all flex items-center justify-center"><Upload size={20} /></button>
                      </div>
                      <input placeholder="Image URL" value={post.url} onChange={(e) => updateItem('socialFeed', i, { url: e.target.value })} className="w-full bg-black border border-zinc-800 p-2 rounded text-[10px] text-white" />
                      <button onClick={() => removeItem('socialFeed', i)} className="w-full py-2 text-[8px] text-zinc-600 hover:text-red-500 uppercase font-bold tracking-widest">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'plans' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-[#D4AF37] font-serif text-2xl">Package Tiers</h3>
                <div className="grid gap-8">
                  {localContent.plans.map((plan, i) => (
                    <div key={i} className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 space-y-6 hover:border-[#FF69B4]/30 transition-colors">
                      <div className="grid md:grid-cols-2 gap-6">
                        <input value={plan.name} onChange={(e) => updateItem('plans', i, { name: e.target.value })} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white text-sm focus:border-[#FF69B4] outline-none" />
                        <input type="number" value={plan.price} onChange={(e) => updateItem('plans', i, { price: parseInt(e.target.value) || 0 })} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white text-sm focus:border-[#FF69B4] outline-none" />
                      </div>
                      <textarea value={plan.description} onChange={(e) => updateItem('plans', i, { description: e.target.value })} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white text-sm resize-none focus:border-[#FF69B4] outline-none" rows={2} />
                      <textarea value={plan.features.join('\n')} onChange={(e) => updateItem('plans', i, { features: e.target.value.split('\n') })} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-white text-sm resize-none h-32 focus:border-[#FF69B4] outline-none" placeholder="Features (one per line)" />
                      <div className="flex items-center gap-3 p-4 bg-black rounded-xl border border-zinc-800">
                        <input type="checkbox" id={`popular-${i}`} checked={plan.popular} onChange={(e) => updateItem('plans', i, { popular: e.target.checked })} className="w-5 h-5 accent-[#FF69B4]" />
                        <label htmlFor={`popular-${i}`} className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Mark as Exclusive Selection</label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LegalModal: React.FC<{ title: string, content: string, onClose: () => void }> = ({ title, content, onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[40px] p-10 relative overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF69B4] to-transparent opacity-50"></div>
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-600 hover:text-white transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-3xl font-serif text-white mb-8 pink-gold-text">{title}</h2>
        <div className="overflow-y-auto custom-scrollbar flex-1 pr-4">
          <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
        <div className="mt-8 pt-8 border-t border-white/5 flex justify-end">
          <button onClick={onClose} className="px-8 py-3 btn-hotpink rounded-xl text-xs font-bold uppercase tracking-widest">Understood</button>
        </div>
      </div>
    </div>
  );
};

const LoginOverlay: React.FC<{ onLogin: (pass: string) => boolean, onClose: () => void }> = ({ onLogin, onClose }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(password);
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className={`w-full max-w-md bg-zinc-950 border ${error ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'border-white/5'} rounded-[40px] p-10 relative overflow-hidden transition-all duration-300`}>
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-600 hover:text-white transition-colors"><X size={20} /></button>
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-[#FF69B4]/10 border border-[#FF69B4]/20 flex items-center justify-center mb-6 shadow-2xl">
            <Lock className="text-[#FF69B4]" size={24} />
          </div>
          <h2 className="text-3xl font-serif text-white mb-2">Secure Access</h2>
          <p className="text-zinc-500 text-sm">Enter administrative key to access the portal.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#FF69B4] transition-colors" size={18} />
            <input autoFocus type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Access Key" className="w-full bg-black/40 border border-white/10 pl-12 pr-12 py-5 rounded-2xl text-white focus:outline-none focus:border-[#FF69B4] text-center tracking-[0.4em]" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-[#FF69B4] transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <p className="text-red-500 text-[10px] uppercase tracking-widest font-bold text-center animate-pulse">Invalid Key</p>}
          <button type="submit" className="w-full py-5 btn-hotpink rounded-2xl font-bold uppercase tracking-[0.4em] text-xs flex items-center justify-center group">
            Authenticate <LogIn className="ml-3 group-hover:translate-x-1 transition-transform" size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

const InteractiveCalendar: React.FC<{ onDateSelect: (date: Date) => void, selectedDate: Date | null }> = ({ onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = date.getDay();
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentMonth]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-zinc-950/50 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[#D4AF37] font-serif text-lg tracking-wider">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h4>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-[#FF69B4] transition-colors"><ChevronLeft size={20} /></button>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-[#FF69B4] transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => <div key={day} className="text-center text-[10px] uppercase tracking-widest text-zinc-600 font-bold">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} className="h-10" />;
          const selected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const past = date < new Date(new Date().setHours(0,0,0,0));
          return (
            <button key={date.toISOString()} disabled={past} onClick={() => onDateSelect(date)} className={`h-10 w-full flex items-center justify-center rounded-xl text-sm transition-all border border-transparent ${past ? 'text-zinc-800 cursor-not-allowed' : 'text-zinc-400 hover:border-[#FF69B4]/50'} ${selected ? 'bg-[#FF69B4] !text-white shadow-[0_0_15px_rgba(255,105,180,0.5)] transform scale-110 z-10' : ''}`}>
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const InquiryPage: React.FC<{ onBack: () => void, onSubmit: (data: Omit<Inquiry, 'id' | 'timestamp'>) => void }> = ({ onBack, onSubmit }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate) return;
    const formData = new FormData(e.currentTarget);
    onSubmit({
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      eventName: formData.get('eventName') as string,
      startTime: formData.get('startTime') as string,
      category: formData.get('category') as string,
      capacity: formData.get('capacity') as string,
      budget: formData.get('budget') as string,
      description: formData.get('description') as string,
      eventDate: selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    });
    setFormSubmitted(true);
    setTimeout(onBack, 4000);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative animate-in fade-in duration-700">
      <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-fixed grayscale"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black"></div>
      <div className="relative z-10 p-6 md:p-12">
        <button onClick={onBack} className="flex items-center gap-3 text-zinc-500 hover:text-[#FF69B4] transition-colors group mb-12">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-[0.3em]">Back to Experience</span>
        </button>
        <div className="max-w-5xl mx-auto">
          {formSubmitted ? (
            <div className="py-24 flex flex-col items-center text-center animate-in zoom-in fade-in duration-500">
              <div className="w-24 h-24 rounded-full bg-[#FF69B4]/10 border border-[#FF69B4]/30 flex items-center justify-center mb-8"><Send className="text-[#FF69B4] animate-bounce" size={40} /></div>
              <h3 className="text-3xl font-serif text-white mb-3">Vision Received</h3>
              <p className="text-zinc-500 text-lg">Expect contact within 24 hours.</p>
            </div>
          ) : (
            <div className="bg-zinc-950/40 backdrop-blur-3xl border border-white/5 rounded-[40px] overflow-hidden grid lg:grid-cols-5">
              <div className="lg:col-span-2 p-8 md:p-12 border-r border-white/5 bg-[#FF69B4]/[0.02]">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-6 font-bold">1. Select Date</label>
                <InteractiveCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
              </div>
              <div className="lg:col-span-3 p-8 md:p-12">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <label className="block text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] mb-2 font-bold">2. Event Details</label>
                  <div className="grid md:grid-cols-2 gap-8">
                    <input name="fullName" required type="text" className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:outline-none focus:border-[#FF69B4]" placeholder="Full Name" />
                    <input name="email" required type="email" className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:outline-none focus:border-[#FF69B4]" placeholder="Email" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <input name="eventName" required type="text" className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:outline-none focus:border-[#FF69B4]" placeholder="Event Name" />
                    <input name="startTime" required type="time" className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:outline-none focus:border-[#FF69B4]" />
                  </div>
                  <div className="grid md:grid-cols-3 gap-8">
                    <select name="category" className="bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#FF69B4]">
                      <option>Luxury Wedding</option>
                      <option>Corporate Gala</option>
                      <option>Private Speakeasy</option>
                    </select>
                    <select name="capacity" className="bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#FF69B4]">
                      <option>Boutique (Under 50)</option>
                      <option>Standard (50 - 150)</option>
                      <option>Grand (150+)</option>
                    </select>
                    <select name="budget" className="bg-black/40 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#FF69B4]">
                      <option>$1,000 - $2,500</option>
                      <option>$2,500 - $5,000</option>
                      <option>$5,000 - $10,000</option>
                      <option>$10,000+</option>
                    </select>
                  </div>
                  <textarea name="description" required rows={4} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white focus:outline-none focus:border-[#FF69B4] resize-none" placeholder="Atmosphere Vision..."></textarea>
                  <button type="submit" disabled={!selectedDate} className={`w-full py-6 btn-hotpink rounded-2xl font-bold uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-4 transition-all ${!selectedDate ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}>
                    Submit Vision <Send size={18} />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [content, setContent] = useState<SiteContent>(INITIAL_CONTENT);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [currentView, setCurrentView] = useState<'landing' | 'inquiry'>('landing');
  const [showAdmin, setShowAdmin] = useState(false);
  const [expandedTestimonials, setExpandedTestimonials] = useState<Set<number>>(new Set());
  const [showLogin, setShowLogin] = useState(false);
  const [legalModal, setLegalModal] = useState<{ title: string, content: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('is_authenticated') === 'true');
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load content and inquiries from Firebase on mount
  useEffect(() => {
    const init = async () => {
      try {
        const [fbContent, fbInquiries] = await Promise.all([loadContent(), loadInquiries()]);
        setContent(fbContent);
        setInquiries(fbInquiries);
      } catch (error) {
        console.error('Error loading from Firebase:', error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Gallery Carousel Effect
  useEffect(() => {
    if (isCarouselPaused) return;
    const intervalId = setInterval(() => {
      setGalleryIndex((prev) => (prev + 1) % content.gallery.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [isCarouselPaused, content.gallery.length]);

  const handleLogin = (pass: string) => {
    if (pass === 'Mix2026') {
      setIsAuthenticated(true);
      setShowLogin(false);
      setShowAdmin(true);
      localStorage.setItem('is_authenticated', 'true');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowAdmin(false);
    localStorage.removeItem('is_authenticated');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#FF69B4] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Loading Experience</p>
        </div>
      </div>
    );
  }

  if (currentView === 'inquiry') {
    return <InquiryPage onBack={() => setCurrentView('landing')} onSubmit={async (d) => {
      const inquiryData = { ...d, timestamp: new Date().toISOString() };
      try {
        const id = await addInquiry(inquiryData);
        setInquiries(p => [{ ...inquiryData, id }, ...p]);
      } catch (error) {
        console.error('Error submitting inquiry:', error);
        // Fallback: still add locally
        setInquiries(p => [{ ...inquiryData, id: crypto.randomUUID() }, ...p]);
      }
    }} />;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#FF69B4] selection:text-white overflow-x-hidden">
      {showLogin && <LoginOverlay onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
      {legalModal && <LegalModal title={legalModal.title} content={legalModal.content} onClose={() => setLegalModal(null)} />}
      {showAdmin && (
        <AdminDashboard
          content={content} onUpdate={setContent} inquiries={inquiries}
          onUpdateInquiry={async (id, u) => {
            try { await updateInquiryFB(id, u); } catch (e) { console.error(e); }
            setInquiries(p => p.map(i => i.id === id ? { ...i, ...u } : i));
          }}
          onDeleteInquiry={async (id) => {
            try { await deleteInquiryFB(id); } catch (e) { console.error(e); }
            setInquiries(p => p.filter(i => i.id !== id));
          }}
          onLogout={handleLogout} onClose={() => setShowAdmin(false)}
        />
      )}

      <header className="h-screen flex items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className="relative z-10 px-4 max-w-4xl">
          <span className="text-[#D4AF37] text-xs font-bold tracking-[0.4em] uppercase mb-6 block">Excellence in Every Pour</span>
          <h1 className="text-6xl md:text-9xl font-serif mb-8 pink-gold-text leading-tight">{content.heroTitle}</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">LET'S SHAKE UP the Traditional Catering with our XCLUSIVE MOBILE BARTENDING XPERIANCE!!</p>
        </div>
      </header>

      <section className="py-24 bg-zinc-950 px-6 border-y border-zinc-900 relative text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#FF69B4]/5 blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <Target className="mx-auto text-[#D4AF37] mb-8" size={32} />
          <h2 className="text-3xl md:text-5xl font-serif pink-gold-text mb-8">{content.missionStatement.split('\n\n')[0]}</h2>
          <p className="text-lg md:text-2xl font-serif italic pink-gold-text leading-relaxed">"{content.missionStatement.split('\n\n').slice(1).join('\n\n')}"</p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-32 bg-black px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#FF69B4]/30 to-[#D4AF37]/30 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative rounded-[40px] overflow-hidden border border-white/10 aspect-[4/5] shadow-2xl">
                <img src={content.aboutImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Master Mixologist" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8">
                  <span className="text-[#FF69B4] text-[10px] font-bold uppercase tracking-[0.4em] block mb-2">The Artisan</span>
                  <h3 className="text-3xl font-serif text-white uppercase tracking-widest">Lead Visionary</h3>
                </div>
              </div>
            </div>
            
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-5xl md:text-7xl font-serif pink-gold-text leading-tight">{content.aboutTitle}</h2>
              </div>
              
              <div className="space-y-6">
                <p className="text-zinc-400 text-lg font-light leading-relaxed">
                  {content.aboutText1}
                </p>
                <p className="text-zinc-300 text-xl font-medium leading-relaxed border-l-2 border-[#FF69B4] pl-6 py-2 italic">
                  {content.aboutText2}
                </p>
                <p className="text-zinc-500 text-base font-light leading-relaxed">
                  {content.aboutText3}
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-zinc-950 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-4xl md:text-5xl font-serif pink-gold-text">Capturing Brilliance</h2>
            <button onClick={() => setCurrentView('inquiry')} className="btn-hotpink px-10 py-4 rounded-xl font-bold uppercase text-xs flex items-center gap-3">Book Night <CalendarCheck size={16} /></button>
          </div>
          
          <div 
            className="relative group/carousel h-[600px] md:h-[750px] rounded-[40px] overflow-hidden border border-white/5 bg-black shadow-2xl"
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
          >
            {content.gallery.map((img, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  idx === galleryIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
                }`}
              >
                <img src={img.url} className="w-full h-full object-cover" alt={img.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-16 left-16 max-w-xl">
                  <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.5em] mb-4 block animate-in fade-in slide-in-from-left-4 duration-700 delay-300">Portfolio Exhibition {idx + 1}</span>
                  <h3 className="text-4xl md:text-6xl font-serif text-white pink-gold-text animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">{img.title}</h3>
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => setGalleryIndex((p) => (p - 1 + content.gallery.length) % content.gallery.length)}
              className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:border-[#FF69B4] hover:text-[#FF69B4] transition-all opacity-0 group-hover/carousel:opacity-100 z-20"
            >
              <ChevronLeft size={32} />
            </button>
            
            <button 
              onClick={() => setGalleryIndex((p) => (p + 1) % content.gallery.length)}
              className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:border-[#FF69B4] hover:text-[#FF69B4] transition-all opacity-0 group-hover/carousel:opacity-100 z-20"
            >
              <ChevronRight size={32} />
            </button>
            
            <div className="absolute bottom-16 right-16 flex gap-4 z-20">
              {content.gallery.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setGalleryIndex(idx)}
                  className={`h-1.5 transition-all duration-500 rounded-full ${idx === galleryIndex ? 'w-16 bg-[#FF69B4]' : 'w-6 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Ribbon integrated directly above plans */}
      <ServicesRibbon />

      <section id="plans" className="py-32 bg-black px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#FF69B4] py-4 px-6 text-center rounded-2xl mb-10">
            <p className="text-white font-serif italic text-lg md:text-xl tracking-wide">Fully insured | Travel available | Custom packages on request</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          {content.plans.map(p => <PlanCard key={p.id} plan={p} onSelect={() => setCurrentView('inquiry')} isSelected={false} />)}
        </div>

        <div className="max-w-6xl mx-auto mt-16 bg-[#FF69B4] rounded-2xl py-8 px-6 text-center">
          <h3 className="text-white font-serif italic text-2xl md:text-3xl mb-3">Add-ons Available</h3>
          <p className="text-white font-bold text-sm md:text-base tracking-wide mb-4">Dry Ice | Mobile Bar | Ice | Alcohol | Chasers | Additional Hours</p>
          <p className="text-white/80 text-[10px] md:text-xs font-bold uppercase tracking-widest">Charges may vary depending on event size, location, and custom requests.</p>
        </div>
      </section>

      {/* Testimonials Section - side-by-side cards */}
      <section className="py-32 bg-zinc-950 px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <span className="text-[#FF69B4] text-xs font-bold uppercase tracking-[0.5em] mb-4 block">Kind Words</span>
            <h2 className="text-4xl md:text-6xl font-serif pink-gold-text">Client Testimonials</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.testimonials.map((test, idx) => (
              <div
                key={idx}
                className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-10 rounded-[40px] flex flex-col h-full shadow-2xl hover:border-[#FF69B4]/30 transition-all group"
              >
                <Quote className="mb-8 text-[#D4AF37]/40 group-hover:text-[#FF69B4]/40 transition-colors" size={32} />
                <div className="mb-10 flex-grow">
                  <p className="text-lg md:text-xl font-serif italic text-white/90 leading-relaxed">
                    "{expandedTestimonials.has(idx) || test.text.length <= 150 ? test.text : test.text.slice(0, 150).trimEnd() + '...'}"
                  </p>
                  {test.text.length > 150 && (
                    <button
                      onClick={() => setExpandedTestimonials(prev => {
                        const next = new Set(prev);
                        next.has(idx) ? next.delete(idx) : next.add(idx);
                        return next;
                      })}
                      className="mt-3 text-[#FF69B4] text-xs font-bold uppercase tracking-widest hover:text-[#D4AF37] transition-colors"
                    >
                      {expandedTestimonials.has(idx) ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </div>
                <div className="flex flex-col items-start pt-6 border-t border-white/5">
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} className="fill-[#D4AF37] text-[#D4AF37]" />)}
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-[#FF69B4] mb-1">{test.name}</h4>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">{test.event}</span>
                  {test.timeframe && <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium mt-1">{test.timeframe}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cocktail Recipe of the Month Section */}
      <section className="py-32 bg-black px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#FF69B4]/20 to-[#D4AF37]/20 blur-3xl opacity-50"></div>
              <div className="relative rounded-[40px] overflow-hidden border border-white/10 aspect-[4/5] shadow-2xl">
                <img src={content.recipe.image} className="w-full h-full object-cover" alt={content.recipe.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-tighter text-zinc-500 font-bold">Prep</span>
                    <span className="text-white font-serif">5 min</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-tighter text-zinc-500 font-bold">Skill</span>
                    <span className="text-white font-serif">Master</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-12 order-1 lg:order-2">
              <div className="space-y-4">
                <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.5em] block">Signature Craft</span>
                <h2 className="text-5xl md:text-7xl font-serif text-white pink-gold-text leading-tight">{content.recipe.name}</h2>
                <p className="text-zinc-400 text-lg font-light leading-relaxed max-w-xl">{content.recipe.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h4 className="text-white text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-3">
                    <List size={14} className="text-[#FF69B4]" /> Elements
                  </h4>
                  <ul className="space-y-4">
                    {content.recipe.ingredients.map((ing, i) => (
                      <li key={i} className="text-sm text-zinc-500 flex items-center gap-3">
                        <div className="w-1 h-1 rounded-full bg-[#D4AF37]"></div>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-6">
                  <h4 className="text-white text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-3">
                    <Utensils size={14} className="text-[#D4AF37]" /> Orchestration
                  </h4>
                  <ul className="space-y-4">
                    {content.recipe.instructions.map((step, i) => (
                      <li key={i} className="text-sm text-zinc-500 flex gap-3">
                        <span className="text-[#FF69B4] font-serif shrink-0">0{i+1}.</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <button onClick={() => setCurrentView('inquiry')} className="btn-hotpink px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center gap-4 group">
                Taste the Brilliance <ArrowLeft size={18} className="rotate-180 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-32 bg-zinc-950 px-6 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#D4AF37] text-xs font-bold tracking-[0.4em] uppercase mb-6 block">Follow Us</span>
            <h2 className="text-5xl md:text-7xl font-serif pink-gold-text mb-4">@barbae_llc</h2>
            <p className="text-zinc-400 text-lg font-light">Behind the bar and beyond — follow our journey on Instagram</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {content.socialFeed.map((post, idx) => (
              <a key={idx} href="https://www.instagram.com/barbae_llc/" target="_blank" rel="noopener noreferrer" className="relative group aspect-square rounded-2xl overflow-hidden border border-white/5">
                <img src={post.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Instagram post ${idx + 1}`} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                  <Instagram size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </a>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="https://www.instagram.com/barbae_llc/" target="_blank" rel="noopener noreferrer" className="btn-hotpink px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs inline-block">
              Follow @barbae_llc
            </a>
          </div>
        </div>
      </section>

      <footer className="py-24 border-t border-zinc-900 bg-black text-gray-400">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
            {/* Column 1: Brand & Social */}
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-3xl pink-gold-text mb-4 tracking-wider">Barbae Xperiance</h3>
                <p className="text-sm font-light leading-relaxed max-w-xs">LET'S SHAKE UP the Traditional Catering with our XCLUSIVE MOBILE BARTENDING XPERIANCE!!</p>
              </div>
              <div className="flex gap-6">
                <a href="https://www.instagram.com/barbae_llc/" target="_blank" rel="noopener noreferrer" className="p-2 border border-white/5 rounded-full hover-pulse transition-all duration-300">
                  <Instagram size={20} />
                </a>
                <a href="https://www.facebook.com/people/Barbae-Xperiance/61559362225127/" target="_blank" rel="noopener noreferrer" className="p-2 border border-white/5 rounded-full hover-pulse transition-all duration-300">
                  <Facebook size={20} />
                </a>
                <a href="https://www.tiktok.com/@barbae_xperiance" target="_blank" rel="noopener noreferrer" className="p-2 border border-white/5 rounded-full hover-pulse transition-all duration-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                </a>
              </div>
            </div>

            {/* Column 2: Contact */}
            <div className="space-y-6 md:ml-auto md:text-right">
              <h5 className="text-white text-[10px] font-bold uppercase tracking-[0.3em]">Contact</h5>
              <ul className="space-y-4 text-sm font-light md:items-end md:flex md:flex-col">
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-[#D4AF37]" />
                  <a href="mailto:booking@barbae.buzz" className="hover:text-white transition-colors">booking@barbae.buzz</a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-[#D4AF37]" />
                  <a href="tel:+19546384903" className="hover:text-white transition-colors">954-638-4903</a>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin size={16} className="text-[#D4AF37]" />
                  <span>Fort Lauderdale, FL, United States, Florida</span>
                </li>
                <li className="pt-2">
                  <button onClick={() => setCurrentView('inquiry')} className="btn-hotpink px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs">Book Inquiry</button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] uppercase tracking-[0.3em] font-medium text-zinc-600">
            <div className="flex gap-8">
              <button onClick={() => setLegalModal({title: 'Privacy Policy', content: content.privacyPolicy})} className="hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={() => setLegalModal({title: 'Terms & Conditions', content: content.termsAndConditions})} className="hover:text-white transition-colors">Terms & Conditions</button>
            </div>
            <div className="flex items-center gap-4">
              <p>&copy; {new Date().getFullYear()} Barbae Xperiance LLC. All Rights Manifested.</p>
              <button onClick={() => isAuthenticated ? setShowAdmin(true) : setShowLogin(true)} className="hover:text-white/40 transition-colors opacity-30 hover:opacity-100 flex items-center gap-1">
                <Lock size={8} /> Admin
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
