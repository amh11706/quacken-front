import { Boat } from './boat';
import { BoatSync } from './types';

export function boatToSync(boat: Boat): BoatSync {
  return {
    id: boat.id,
    x: boat.pos.x,
    y: boat.pos.y,
    t: 0,
    team: boat.team,
    n: boat.name,
    ti: boat.title.match(/Bot\d+/) ? boat.title.substr(3) : '',
    f: boat.face / 90,
    b: 0,
    tp: boat.tokenPoints,
    ty: boat.type,
    ml: boat.moveLock,
    inSq: 0,
    mDamage: 0,
    mMoves: 0,
    inSZ: boat.inSZ,
  };
}

export function syncToBoat(boat: Boat, sBoat: BoatSync): void {
  boat.pos = { x: sBoat.x, y: sBoat.y };
  boat.treasure = sBoat.t;
  if (sBoat.ti) boat.title = sBoat.ti;
  boat.face = sBoat.f * 90;
  boat.moveLock = sBoat.ml;
  boat.tokenPoints = sBoat.tp;
  boat.bomb = sBoat.b;
  boat.id = sBoat.id;
  boat.team = sBoat.team ?? boat.team;
  boat.inSZ = sBoat.inSZ;
  boat.maxDamage = sBoat.mDamage;
  boat.maxMoves = sBoat.mMoves;
  boat.title = sBoat.ti || sBoat.n;
  boat.name = sBoat.n;
  boat.influence = sBoat.inSq !== undefined ? Math.sqrt(sBoat.inSq) : boat.influence;
  boat.maxShots = sBoat.dShot || 1;
  boat.type = sBoat.ty;
  boat.maneuvers = sBoat.mvr || [];
}
