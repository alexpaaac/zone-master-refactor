import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, Game, GameSession, RiskZone, CanvasState, ZoneEditorState } from '@/types';

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_GAMES'; payload: Game[] }
  | { type: 'SET_CURRENT_GAME'; payload: Game | undefined }
  | { type: 'SET_CURRENT_SESSION'; payload: GameSession | undefined }
  | { type: 'UPDATE_GAME'; payload: { id: string; updates: Partial<Game> } }
  | { type: 'ADD_GAME'; payload: Game }
  | { type: 'DELETE_GAME'; payload: string }
  | { type: 'UPDATE_CANVAS'; payload: Partial<CanvasState> }
  | { type: 'UPDATE_ZONE_EDITOR'; payload: Partial<ZoneEditorState> }
  | { type: 'ADD_RISK_ZONE'; payload: { gameId: string; zone: RiskZone } }
  | { type: 'UPDATE_RISK_ZONE'; payload: { gameId: string; zoneId: string; updates: Partial<RiskZone> } }
  | { type: 'DELETE_RISK_ZONE'; payload: { gameId: string; zoneId: string } }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppState = {
  games: [],
  canvas: {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    isZoneCreating: false,
  },
  zoneEditor: {
    mode: 'select',
    activeZoneType: 'rectangle',
    isResizing: false,
  },
  isLoading: false,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_GAMES':
      return { ...state, games: action.payload };

    case 'SET_CURRENT_GAME':
      return { ...state, currentGame: action.payload };

    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };

    case 'UPDATE_GAME':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.id
            ? { ...game, ...action.payload.updates }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.id
          ? { ...state.currentGame, ...action.payload.updates }
          : state.currentGame,
      };

    case 'ADD_GAME':
      return {
        ...state,
        games: [action.payload, ...state.games],
      };

    case 'DELETE_GAME':
      return {
        ...state,
        games: state.games.filter(game => game.id !== action.payload),
        currentGame: state.currentGame?.id === action.payload ? undefined : state.currentGame,
      };

    case 'UPDATE_CANVAS':
      return {
        ...state,
        canvas: { ...state.canvas, ...action.payload },
      };

    case 'UPDATE_ZONE_EDITOR':
      return {
        ...state,
        zoneEditor: { ...state.zoneEditor, ...action.payload },
      };

    case 'ADD_RISK_ZONE':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? { ...game, riskZones: [...game.riskZones, action.payload.zone] }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.gameId
          ? { ...state.currentGame, riskZones: [...state.currentGame.riskZones, action.payload.zone] }
          : state.currentGame,
      };

    case 'UPDATE_RISK_ZONE':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? {
                ...game,
                riskZones: game.riskZones.map(zone =>
                  zone.id === action.payload.zoneId
                    ? { ...zone, ...action.payload.updates }
                    : zone
                ),
              }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.gameId
          ? {
              ...state.currentGame,
              riskZones: state.currentGame.riskZones.map(zone =>
                zone.id === action.payload.zoneId
                  ? { ...zone, ...action.payload.updates }
                  : zone
              ),
            }
          : state.currentGame,
      };

    case 'DELETE_RISK_ZONE':
      return {
        ...state,
        games: state.games.map(game =>
          game.id === action.payload.gameId
            ? {
                ...game,
                riskZones: game.riskZones.filter(zone => zone.id !== action.payload.zoneId),
              }
            : game
        ),
        currentGame: state.currentGame?.id === action.payload.gameId
          ? {
              ...state.currentGame,
              riskZones: state.currentGame.riskZones.filter(zone => zone.id !== action.payload.zoneId),
            }
          : state.currentGame,
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
  setCurrentGame: (game: Game | undefined) => void;
  updateCurrentGame: (game: Game) => void;
  updateGame: (id: string, updates: Partial<Game>) => void;
  addRiskZone: (gameId: string, zone: RiskZone) => void;
  updateRiskZone: (gameId: string, zoneId: string, updates: Partial<RiskZone>) => void;
  deleteRiskZone: (gameId: string, zoneId: string) => void;
  updateCanvas: (updates: Partial<CanvasState>) => void;
  updateZoneEditor: (updates: Partial<ZoneEditorState>) => void;
  updateCurrentSession: (session: GameSession) => void;
  // Computed properties
  currentGame: Game | undefined;
  currentSession: GameSession | undefined;
  games: Game[];
  setGames: (games: Game[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper actions
  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | undefined) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setCurrentGame = (game: Game | undefined) => {
    dispatch({ type: 'SET_CURRENT_GAME', payload: game });
  };

  const updateCurrentGame = (game: Game) => {
    dispatch({ type: 'SET_CURRENT_GAME', payload: game });
    // Check if game exists in array, if not add it
    const gameExists = state.games.some(g => g.id === game.id);
    if (gameExists) {
      dispatch({ type: 'UPDATE_GAME', payload: { id: game.id, updates: game } });
    } else {
      dispatch({ type: 'ADD_GAME', payload: game });
    }
  };

  const updateGame = (id: string, updates: Partial<Game>) => {
    dispatch({ type: 'UPDATE_GAME', payload: { id, updates } });
  };

  const updateCurrentSession = (session: GameSession) => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
  };

  const setGames = (games: Game[]) => {
    dispatch({ type: 'SET_GAMES', payload: games });
  };

  const addRiskZone = (gameId: string, zone: RiskZone) => {
    dispatch({ type: 'ADD_RISK_ZONE', payload: { gameId, zone } });
  };

  const updateRiskZone = (gameId: string, zoneId: string, updates: Partial<RiskZone>) => {
    dispatch({ type: 'UPDATE_RISK_ZONE', payload: { gameId, zoneId, updates } });
  };

  const deleteRiskZone = (gameId: string, zoneId: string) => {
    dispatch({ type: 'DELETE_RISK_ZONE', payload: { gameId, zoneId } });
  };

  const updateCanvas = (updates: Partial<CanvasState>) => {
    dispatch({ type: 'UPDATE_CANVAS', payload: updates });
  };

  const updateZoneEditor = (updates: Partial<ZoneEditorState>) => {
    dispatch({ type: 'UPDATE_ZONE_EDITOR', payload: updates });
  };

  const value: AppContextType = {
    state,
    dispatch,
    setLoading,
    setError,
    setCurrentGame,
    updateCurrentGame,
    updateGame,
    addRiskZone,
    updateRiskZone,
    deleteRiskZone,
    updateCanvas,
    updateZoneEditor,
    updateCurrentSession,
    // Computed properties
    currentGame: state.currentGame,
    currentSession: state.currentSession,
    games: state.games,
    setGames,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}