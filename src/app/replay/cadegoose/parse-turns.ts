import { Message } from '../../chat/chat.service';
import { StatRow } from '../../lobby/cadegoose/stats/stats.component';
import { Sync, Clutter, Turn } from '../../lobby/quacken/boats/boats.component';
import { BoatStatus } from '../../lobby/quacken/boats/convert';
import { BoatTick } from '../../lobby/quacken/hud/hud.component';
import { InCmd } from '../../ws-messages';
import { InMessage } from '../../ws.service';

export interface ParsedTurn {
  turn: number;
  index: number;
  teams: {
    score: number;
    scoreChange: number;
    sinks: Message[];
  }[];
  sync: Sync;
  ticks: Record<number, BoatTick>;
  moves: Record<number, { shots: [], moves: [] }>;
  steps: BoatStatus[][];
  cSteps: Clutter[][];
  stats: Record<number, StatRow>;
}

export function ParseTurns(messages: InMessage[][]): [ParsedTurn[], string, number] {
  const turns: ParsedTurn[] = [];
  let maxScore = 0;
  let map = '';
  let lastTurn = { teams: [{}, {}, {}, {}] } as ParsedTurn;
  let lastSync: Sync = { sync: [], cSync: [], turn: 0 };
  let moves: Record<number, { shots: [], moves: [] }> = {};
  let ticks: Record<number, BoatTick> = {};
  for (let i = 0; i < messages.length; i++) {
    const group = messages[i];
    if (!group) continue;
    const sinks: Message[][] = [[], []];
    for (const m of group) {
      switch (m.cmd) {
        case InCmd.LobbyJoin:
          lastSync = { sync: Object.values(m.data.boats), cSync: [], turn: lastTurn.turn };
          map = m.data.map;
          break;
        case InCmd.Moves:
          moves[m.data.t] = { shots: m.data.s, moves: m.data.m };
          break;
        case InCmd.Sync:
          lastSync = m.data;
          break;
        case InCmd.BoatTicks:
          ticks = m.data;
          break;
        case InCmd.Turn:
          // eslint-disable-next-line no-case-declarations
          const turn: Turn = m.data;
          // eslint-disable-next-line no-case-declarations
          const parsed: ParsedTurn = {
            ticks,
            moves,
            sync: lastSync,
            turn: turns.length + 1,
            index: i,
            teams: turn.points.map((score, j) => {
              const team = { score, scoreChange: score - (lastTurn.teams[j]?.score || 0), sinks: sinks[j] || [] };
              if (team.scoreChange > maxScore) maxScore = team.scoreChange;
              return team;
            }),
            steps: turn.steps,
            cSteps: turn.cSteps,
            stats: turn.stats,
          };
          moves = {};
          ticks = {};
          lastTurn = parsed;
          turns.push(parsed);
          break;
        case InCmd.ChatMessage:
          if (m.data?.from === '_sink') sinks[m.data.copy ? 0 : 1]?.push(m.data);
          break;
        default:
      }
    }
  }
  return [turns, map, maxScore];
}
