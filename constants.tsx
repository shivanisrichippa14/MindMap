
import React from 'react';
import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'all', name: 'All Bookmarks', icon: '📁', color: 'blue' },
  { id: 'work', name: 'Work', icon: '💼', color: 'indigo' },
  { id: 'learning', name: 'Learning', icon: '📚', color: 'emerald' },
  { id: 'tech', name: 'Technology', icon: '💻', color: 'purple' },
  { id: 'personal', name: 'Personal', icon: '👤', color: 'rose' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: 'orange' },
];

export const CATEGORY_COLORS: Record<string, string> = {
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  purple: 'bg-purple-500',
  rose: 'bg-rose-500',
  orange: 'bg-orange-500',
  gray: 'bg-slate-500'
};
