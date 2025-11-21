
export interface User {
  id: string;
  name: string;
  avatar: string;
  currentMl: number;
  targetMl: number;
  color: string;
}

export interface Challenge {
  id: string;
  title: string;
  participants: User[];
  status: 'active' | 'completed';
  startDate: string;
  endDate?: string;
  targetMl: number; // Daily target or total target
  type: 'daily' | 'total';
}

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'You', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', currentMl: 1250, targetMl: 3000, color: 'var(--chart-1)' },
  { id: 'u2', name: 'Sarah', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', currentMl: 1800, targetMl: 3000, color: 'var(--chart-2)' },
  { id: 'u3', name: 'Mike', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', currentMl: 950, targetMl: 3000, color: 'var(--chart-3)' },
  { id: 'u4', name: 'Alex', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', currentMl: 2100, targetMl: 3000, color: 'var(--chart-4)' },
];

export const MOCK_HISTORY: Challenge[] = [
  {
    id: 'c-prev-1',
    title: 'Weekend Hydration',
    status: 'completed',
    startDate: '2023-10-10',
    endDate: '2023-10-12',
    targetMl: 3000,
    type: 'daily',
    participants: [
      { ...MOCK_USERS[0], currentMl: 2800 },
      { ...MOCK_USERS[1], currentMl: 3200 },
      { ...MOCK_USERS[2], currentMl: 1500 },
    ]
  },
  {
    id: 'c-prev-2',
    title: 'Office Water Wars',
    status: 'completed',
    startDate: '2023-10-01',
    endDate: '2023-10-05',
    targetMl: 15000,
    type: 'total',
    participants: [
      { ...MOCK_USERS[0], currentMl: 14000 },
      { ...MOCK_USERS[1], currentMl: 16500 },
    ]
  }
];

export const CURRENT_CHALLENGE: Challenge = {
  id: 'c-curr-1',
  title: 'Daily Grind',
  status: 'active',
  startDate: new Date().toISOString(),
  targetMl: 3000,
  type: 'daily',
  participants: MOCK_USERS
};
