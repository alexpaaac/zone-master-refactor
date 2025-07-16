// Session service - handles game sessions and results
import { GameSession, Click, GameResult, Game, RiskZone } from '@/types';

class SessionService {
  private sessions: GameSession[] = [];

  // Start a new game session
  async startSession(gameId: string): Promise<GameSession> {
    const session: GameSession = {
      id: `session-${Date.now()}`,
      gameId,
      startTime: new Date().toISOString(),
      clicks: [],
      foundZones: [],
      score: 0,
      timeSpent: 0,
      completed: false
    };

    this.sessions.push(session);
    return session;
  }

  // Record a click during gameplay
  async recordClick(sessionId: string, x: number, y: number, hitZoneId?: string): Promise<Click> {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const click: Click = {
      id: `click-${Date.now()}`,
      x,
      y,
      timestamp: new Date().toISOString(),
      hitZoneId
    };

    session.clicks.push(click);

    // If a zone was hit and not already found, add it to found zones
    if (hitZoneId && !session.foundZones.includes(hitZoneId)) {
      session.foundZones.push(hitZoneId);
    }

    return click;
  }

  // End a game session and calculate results
  async endSession(sessionId: string, game: Game): Promise<GameResult> {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const endTime = new Date();
    const startTime = new Date(session.startTime);
    const timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    // Calculate results
    const foundZones = game.riskZones.filter(zone => session.foundZones.includes(zone.id));
    const missedZones = game.riskZones.filter(zone => !session.foundZones.includes(zone.id));
    
    const accuracy = game.riskZones.length > 0 ? foundZones.length / game.riskZones.length : 0;
    const efficiency = this.calculateEfficiency(session, game, foundZones);
    const score = this.calculateScore(accuracy, efficiency, timeSpent, game);

    // Update session
    const updatedSession: GameSession = {
      ...session,
      endTime: endTime.toISOString(),
      timeSpent,
      score,
      completed: true
    };

    // Update in storage
    const sessionIndex = this.sessions.findIndex(s => s.id === sessionId);
    this.sessions[sessionIndex] = updatedSession;

    return {
      session: updatedSession,
      game,
      foundZones,
      missedZones,
      accuracy,
      efficiency
    };
  }

  // Get session by ID
  async getSession(sessionId: string): Promise<GameSession | undefined> {
    return this.sessions.find(s => s.id === sessionId);
  }

  // Get sessions for a game
  async getGameSessions(gameId: string): Promise<GameSession[]> {
    return this.sessions.filter(s => s.gameId === gameId);
  }

  // Calculate efficiency based on clicks and time
  private calculateEfficiency(session: GameSession, game: Game, foundZones: RiskZone[]): number {
    if (foundZones.length === 0) return 0;

    // Efficiency factors:
    // 1. Click efficiency - fewer clicks is better
    // 2. Time efficiency - faster completion is better
    // 3. Precision - hitting zones vs missing

    const maxClicks = game.maxClicks || 20;
    const timeLimit = game.timeLimit || 300;
    
    const clickEfficiency = Math.max(0, 1 - (session.clicks.length / maxClicks));
    const timeEfficiency = Math.max(0, 1 - (session.timeSpent / timeLimit));
    const precisionEfficiency = foundZones.length / session.clicks.length;

    // Weighted average
    return (clickEfficiency * 0.3 + timeEfficiency * 0.3 + precisionEfficiency * 0.4);
  }

  // Calculate score based on various factors
  private calculateScore(accuracy: number, efficiency: number, timeSpent: number, game: Game): number {
    const baseScore = 1000;
    const accuracyBonus = accuracy * 500;
    const efficiencyBonus = efficiency * 300;
    
    // Time bonus/penalty
    const timeLimit = game.timeLimit || 300;
    const timeRatio = timeSpent / timeLimit;
    const timeBonus = timeRatio < 0.5 ? 200 : timeRatio < 0.8 ? 100 : 0;
    const timePenalty = timeRatio > 1 ? 200 : 0;

    // Difficulty multiplier
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.2,
      hard: 1.5,
      expert: 2
    }[game.difficulty];

    const finalScore = Math.max(0, 
      (baseScore + accuracyBonus + efficiencyBonus + timeBonus - timePenalty) * difficultyMultiplier
    );

    return Math.round(finalScore);
  }

  // Get analytics data
  async getAnalytics(gameId?: string) {
    const sessions = gameId 
      ? this.sessions.filter(s => s.gameId === gameId && s.completed)
      : this.sessions.filter(s => s.completed);

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageScore: 0,
        averageAccuracy: 0,
        averageTime: 0,
        completionRate: 0
      };
    }

    const totalSessions = sessions.length;
    const averageScore = sessions.reduce((sum, s) => sum + s.score, 0) / totalSessions;
    const averageTime = sessions.reduce((sum, s) => sum + s.timeSpent, 0) / totalSessions;
    
    // Calculate average accuracy (would need game data for this in real implementation)
    const averageAccuracy = 0.75; // Placeholder
    const completionRate = 0.85; // Placeholder

    return {
      totalSessions,
      averageScore: Math.round(averageScore),
      averageAccuracy: Math.round(averageAccuracy * 100),
      averageTime: Math.round(averageTime),
      completionRate: Math.round(completionRate * 100)
    };
  }
}

export const sessionService = new SessionService();