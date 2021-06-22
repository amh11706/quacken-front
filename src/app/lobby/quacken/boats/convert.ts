import { Boat } from './boat';

export interface BoatStatus {
  id: number;
  x: number;
  y: number;
  t: number;
  tf?: number;
  tm?: number;
  s?: number;
  c?: number;
  cd?: number;
}

export interface BoatSync extends BoatStatus {
  oId?: number;
  team?: number;
  inSZ: boolean;
  n: string;
  ti?: string;
  f: number;
  b: number;
  tp: number;
  ty: number;
  ml: number;
  mDamage: number;
  mMoves: number;
  inSq: number;
  dShot?: number;
}

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
  boat.setPos(sBoat.x, sBoat.y)
    .setTreasure(sBoat.t)
    .draw();
  if (sBoat.ti) boat.title = sBoat.ti;
  boat.rotateTransition = 0;
  boat.imageOpacity = 1;
  boat.opacity = 1;
  boat.moveTransition = [0, 0];
  boat.face = sBoat.f * boat.spinDeg;
  boat.moveLock = sBoat.ml;
  boat.tokenPoints = sBoat.tp;
  boat.bomb = sBoat.b;
  boat.id = sBoat.id;
  boat.oId = sBoat.oId;
  boat.team = sBoat.team ?? boat.team;
  boat.inSZ = sBoat.inSZ;
  boat.maxDamage = sBoat.mDamage;
  boat.maxMoves = sBoat.mMoves;
  boat.renderName = boat.title;
  boat.influence = sBoat.inSq !== undefined ? Math.sqrt(sBoat.inSq) : boat.influence;
  boat.maxShots = sBoat.dShot;
  boat.type = sBoat.ty;
}
