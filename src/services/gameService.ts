// Game service layer - abstracts API calls and business logic
import { Game, GameSession, RiskZone, ApiResponse, PaginatedResponse } from '@/types';

// Mock data for development
const mockGames: Game[] = [
  {
    id: '1',
    title: 'Industrial Safety Assessment',
    description: 'Identify potential hazards in a factory environment',
    images: [
      {
        id: 'img1',
        url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
        width: 800,
        height: 600,
        alt: 'Factory floor'
      }
    ],
    riskZones: [
      {
        id: 'zone1',
        type: 'rectangle',
        x: 150,
        y: 200,
        width: 100,
        height: 80,
        color: '#ef4444',
        description: 'Unguarded machinery - High injury risk',
        severity: 'high'
      },
      {
        id: 'zone2',
        type: 'circle',
        x: 400,
        y: 300,
        radius: 50,
        color: '#f59e0b',
        description: 'Chemical storage area - Potential exposure',
        severity: 'medium'
      }
    ],
    timeLimit: 300,
    maxClicks: 10,
    difficulty: 'medium',
    branding: {
      primaryColor: '#059669',
      secondaryColor: '#0891b2'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: '2',
    title: 'Construction Site Hazards',
    description: 'Find safety violations on a construction site',
    images: [
      {
        id: 'img2',
        url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
        width: 800,
        height: 600,
        alt: 'Construction site'
      }
    ],
    riskZones: [
      {
        id: 'zone3',
        type: 'rectangle',
        x: 200,
        y: 150,
        width: 120,
        height: 90,
        color: '#dc2626',
        description: 'No hard hat zone - Critical safety violation',
        severity: 'critical'
      }
    ],
    timeLimit: 240,
    maxClicks: 8,
    difficulty: 'hard',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  }
];

class GameService {
  private baseUrl = '/api/games';
  private cache = new Map<string, Game>();
  private games: Game[] = mockGames; // Use mock data for now

  // Get all games with pagination
  async getGames(page = 1, limit = 10, filters?: { difficulty?: string; isActive?: boolean }): Promise<PaginatedResponse<Game>> {
    try {
      let filteredGames = [...this.games];
      
      if (filters?.difficulty) {
        filteredGames = filteredGames.filter(game => game.difficulty === filters.difficulty);
      }
      
      if (filters?.isActive !== undefined) {
        filteredGames = filteredGames.filter(game => game.isActive === filters.isActive);
      }
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedGames = filteredGames.slice(startIndex, endIndex);
      
      return {
        data: paginatedGames,
        total: filteredGames.length,
        page,
        limit,
        hasMore: endIndex < filteredGames.length
      };
    } catch (error) {
      console.error('Error fetching games:', error);
      throw new Error('Failed to fetch games');
    }
  }

  // Get game by ID
  async getGame(id: string): Promise<Game> {
    try {
      // Check cache first
      if (this.cache.has(id)) {
        return this.cache.get(id)!;
      }

      const game = this.games.find(g => g.id === id);
      if (!game) {
        throw new Error(`Game with id ${id} not found`);
      }

      // Cache the result
      this.cache.set(id, game);
      return game;
    } catch (error) {
      console.error('Error fetching game:', error);
      throw new Error('Failed to fetch game');
    }
  }

  // Create new game
  async createGame(gameData: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>): Promise<Game> {
    try {
      const newGame: Game = {
        ...gameData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.games.unshift(newGame);
      this.cache.set(newGame.id, newGame);
      
      return newGame;
    } catch (error) {
      console.error('Error creating game:', error);
      throw new Error('Failed to create game');
    }
  }

  // Update game
  async updateGame(id: string, updates: Partial<Game>): Promise<Game> {
    try {
      const gameIndex = this.games.findIndex(g => g.id === id);
      if (gameIndex === -1) {
        throw new Error(`Game with id ${id} not found`);
      }

      const updatedGame = {
        ...this.games[gameIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.games[gameIndex] = updatedGame;
      this.cache.set(id, updatedGame);
      
      return updatedGame;
    } catch (error) {
      console.error('Error updating game:', error);
      throw new Error('Failed to update game');
    }
  }

  // Delete game
  async deleteGame(id: string): Promise<void> {
    try {
      const gameIndex = this.games.findIndex(g => g.id === id);
      if (gameIndex === -1) {
        throw new Error(`Game with id ${id} not found`);
      }

      this.games.splice(gameIndex, 1);
      this.cache.delete(id);
    } catch (error) {
      console.error('Error deleting game:', error);
      throw new Error('Failed to delete game');
    }
  }

  // Duplicate game
  async duplicateGame(id: string, overrides?: Partial<Game>): Promise<Game> {
    try {
      const originalGame = await this.getGame(id);
      const duplicatedGame = await this.createGame({
        ...originalGame,
        ...overrides,
        title: overrides?.title || `${originalGame.title} (Copy)`,
        riskZones: originalGame.riskZones.map(zone => ({
          ...zone,
          id: `${zone.id}-copy-${Date.now()}`
        }))
      });

      return duplicatedGame;
    } catch (error) {
      console.error('Error duplicating game:', error);
      throw new Error('Failed to duplicate game');
    }
  }

  // Risk zone operations
  async addRiskZone(gameId: string, zone: Omit<RiskZone, 'id'>): Promise<RiskZone> {
    try {
      const game = await this.getGame(gameId);
      const newZone: RiskZone = {
        ...zone,
        id: `zone-${Date.now()}`
      };

      const updatedGame = await this.updateGame(gameId, {
        riskZones: [...game.riskZones, newZone]
      });

      return newZone;
    } catch (error) {
      console.error('Error adding risk zone:', error);
      throw new Error('Failed to add risk zone');
    }
  }

  async updateRiskZone(gameId: string, zoneId: string, updates: Partial<RiskZone>): Promise<RiskZone> {
    try {
      const game = await this.getGame(gameId);
      const zoneIndex = game.riskZones.findIndex(z => z.id === zoneId);
      
      if (zoneIndex === -1) {
        throw new Error(`Risk zone with id ${zoneId} not found`);
      }

      const updatedZone = { ...game.riskZones[zoneIndex], ...updates };
      const updatedZones = [...game.riskZones];
      updatedZones[zoneIndex] = updatedZone;

      await this.updateGame(gameId, { riskZones: updatedZones });
      return updatedZone;
    } catch (error) {
      console.error('Error updating risk zone:', error);
      throw new Error('Failed to update risk zone');
    }
  }

  async deleteRiskZone(gameId: string, zoneId: string): Promise<void> {
    try {
      const game = await this.getGame(gameId);
      const updatedZones = game.riskZones.filter(z => z.id !== zoneId);
      
      await this.updateGame(gameId, { riskZones: updatedZones });
    } catch (error) {
      console.error('Error deleting risk zone:', error);
      throw new Error('Failed to delete risk zone');
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const gameService = new GameService();