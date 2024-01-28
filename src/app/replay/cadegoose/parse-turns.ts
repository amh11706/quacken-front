import { InCmd } from '../../ws/ws-messages';
import { ParsedTurn } from '../../lobby/cadegoose/types';
import { Turn, Sync, BoatTick } from '../../lobby/quacken/boats/types';
import { Message } from '../../chat/types';
import { InMessage } from '../../ws/ws-subscribe-types';

export function ParseTurns(messages: InMessage[][]): [ParsedTurn[], string, number] {
  const turns: ParsedTurn[] = [];
  if (!messages?.length) return [turns, '', 0];
  let maxScore = 0;
  let map = '';
  let lastTurn = { teams: [{}, {}, {}, {}] } as ParsedTurn;
  let lastTurnRaw: Turn | undefined;
  let lastSync: Sync = { sync: [], cSync: [], turn: 0 };
  let moves: Record<number, { shots: number[], moves: number[] }> = {};
  let ticks: Record<number, BoatTick> = {};
  for (let i = 0; i < messages.length; i++) {
    const group = messages[i];
    if (!group) continue;
    const sinks: Message[][] = [[], []];
    for (const m of group) {
      switch (m.cmd) {
        case InCmd.LobbyJoin:
          lastSync = { sync: Object.values(m.data.boats || {}), cSync: [], turn: lastTurn.turn };
          map = m.data.map || '';
          break;
        case InCmd.Moves:
          Array.isArray(m.data)
            ? m.data.forEach(m => moves[m.t] = { shots: m.s || [], moves: m.m })
            : moves[m.data.t] = { shots: m.data.s || [], moves: m.data.m };
          break;
        case InCmd.DelBoat:
          lastSync.sync = lastSync.sync.filter(b => b.id !== m.data);
          break;
        case InCmd.NewBoat:
          lastSync.sync.push(m.data);
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
            rawTurn: lastTurnRaw || turn,
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
          lastTurnRaw = turn;
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
