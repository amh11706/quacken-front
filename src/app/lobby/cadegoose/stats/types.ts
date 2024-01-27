export interface StatRow {
  user: string; team: number; stats: (string | number)[]; score: number;
}

export const enum Stat {
  Kills,
  Assists,
  Deaths,
  ShotsHit,
  ShotsFired,
  ShotsTaken,
  PointsContested,
  PointsScored,

  RocksBumped = 10,
  ShotsFriendly,
  ShotsFriendlyTaken,
  ShotsMissed,
  WhirlSpins,
  WindRides,

  LeftUsed,
  ForwardUsed,
  RightUsed,
  DoubleForwardUsed,
  TurnInSpotUsed,
  ChainshotUsed,
  FlotsamUsed,
}
