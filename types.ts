
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedAt: number;
  plan: 'Free' | 'Pro' | 'Enterprise';
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  addedAt: number;
  favicon?: string;
  color: string;
  readingTime?: string;
  keyTakeaway?: string;
}

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export interface AIAnalysisResponse {
  title: string;
  description: string;
  category: string;
  tags: string[];
  color: string;
  readingTime: string;
  keyTakeaway: string;
}
