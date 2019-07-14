export const Settings = {
  nextBoat: {
    id: 1, group: 'lobby', type: 'boat', trigger: 'nextBoat',
    titles: ['Rocket', 'Armored', 'Bomb', 'Bread', , , , , , , 'Small Duck', 'Medium Duck', 'Large Duck', 'Defenduck'],
    groups: [
      { name: 'Standard', options: [0, 1, 2, 3] },
      { name: 'Ducks', options: [10, 11, 12, 13] }
    ]
  },
  mapScale: {
    id: 2, group: 'lobby', type: 'slider', label: 'Map Scale', min: 15, max: 100, step: 5
  },
  speed: {
    id: 3, group: 'lobby', type: 'slider', label: 'Animate Speed', min: 1, max: 5, step: 0.5
  },
  duckLvl: {
    id: 4, group: 'l/quacken', type: 'slider', label: 'Duck Level', min: 0, max: 11, step: 1
  },
  maxPlayers: {
    id: 5, group: 'l/quacken', type: 'slider', label: 'Max Players', min: 0, max: 13
  },
  publicMode: {
    id: 6, group: 'l/quacken', type: 'option', label: 'Lobby Privacy', options: [
      'Public', 'Public Application', 'Invite Only'
    ]
  },
  tileSet: {
    id: 7, group: 'l/quacken', type: 'tileSet'
  },
  structureSet: {
    id: 8, group: 'l/quacken', type: 'structureSet'
  },
  hotEntry: {
    id: 9, group: 'l/quacken', type: 'checkbox', label: 'Allow join while an<br>entry is in progress'
  },
};
