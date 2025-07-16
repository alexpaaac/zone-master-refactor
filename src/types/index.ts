// Core types for the Cohen3 gaming application

export interface RiskZone {
  id: string;
  type: 'rectangle' | 'circle' | 'polygon';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: Point[];
  color: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  found?: boolean;
  clickTime?: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface GameImage {
  id: string;
  url: string;
  width: number;
  height: number;
  alt?: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  images: GameImage[];
  riskZones: RiskZone[];
  timeLimit?: number;
  maxClicks?: number;
  targetRisks?: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface GameSession {
  id: string;
  gameId: string;
  startTime: string;
  endTime?: string;
  clicks: Click[];
  foundZones: string[];
  score: number;
  timeSpent: number;
  completed: boolean;
}

export interface Click {
  id: string;
  x: number;
  y: number;
  timestamp: string;
  hitZoneId?: string;
}

export interface GameResult {
  session: GameSession;
  game: Game;
  foundZones: RiskZone[];
  missedZones: RiskZone[];
  accuracy: number;
  efficiency: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}

// UI State types
export interface CanvasState {
  scale: number;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
  isZoneCreating: boolean;
  selectedZoneId?: string;
  hoveredZoneId?: string;
}

export interface ZoneEditorState {
  mode: 'create' | 'edit' | 'select';
  activeZoneType: RiskZone['type'];
  previewZone?: Partial<RiskZone>;
  isResizing: boolean;
  resizeHandle?: string;
}

export interface AppState {
  user?: User;
  currentGame?: Game;
  currentSession?: GameSession;
  games: Game[];
  canvas: CanvasState;
  zoneEditor: ZoneEditorState;
  isLoading: boolean;
  error?: string;
}

// API types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Event types
export interface CanvasEvent {
  type: 'click' | 'mousemove' | 'mousedown' | 'mouseup' | 'wheel';
  clientX: number;
  clientY: number;
  canvasX: number;
  canvasY: number;
  originalEvent: MouseEvent | WheelEvent;
}

export interface ZoneEvent {
  type: 'create' | 'update' | 'delete' | 'select';
  zone: RiskZone;
  changes?: Partial<RiskZone>;
}