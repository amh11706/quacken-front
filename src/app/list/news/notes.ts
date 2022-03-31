export interface Note {
  title: string;
  points: string[];
}

export const Notes: Note[] = [
  {
    title: 'Release 01 April 2022',
    points: [
      'Graphics Overhaul!',
      'We\'ve finally found an artist to help us move the game forward with new modes coming soon.',
      'New high-detail textures so it can look just as good when you zoom in as it does from afar.',
      'We hope you all enjoy these changes because there will be a lot more where this came from 😊',
    ],
  },
  {
    title: 'Release 22 February 2022',
    points: [
      'Maneuvers!',
      'Place or cycle through available maneuvers by holding shift when you click.',
      'Advanced jobber quality options: Fine tune every category.',
      'Unlimited and zero jobber quality options for some spicier configurations.',
      'Advanced map generation settings for finding the perfect map.',
      'Draggable cannon tokens.',
      'Control + click cannons to fill all.',
      'Moved ready button for unlimited time to below the timer bar.',
      'Player list on card hover is much less flickery.',
      'Nicer setting update messages.',
    ],
  },
  {
    title: 'Release 14 January 2022',
    points: [
      'Support for up to 4 cade teams!',
      'Unlimited time setting for practice. Slide time setting to max to enable.',
      'More options for how many bots you want in your lobby.',
      'Lag protection; no more grey moves. The server will now wait for your final moves regardless of lag before playing the turn.',
      'Attempted IOS mobile fix for drag and drop.',
      'Fixed discord link.',
    ],
  },
  {
    title: 'Release 30 May 2021',
    points: [
      'Feedback fueled fancy fixes.',
      'New setting for respawn delay!',
      '"Shuffle teams" button added for lobby owners.',
      '/team chat added.',
      'Player names will now show by default, as opposed to ship names.',
      'New match replays will update the damage immediately after a turn.',
      'Team icons in the player list to easier spot who is not yet on a team.',
      'Boats should no longer be able to face backwards after sinking.',
      'Hovering player counts on the lobby card now shows player names.',
      'Numerous other bug fixes and stability improvements.',
    ],
  },
  {
    title: 'Release 20 May 2021',
    points: [
      'Added sound effects!',
      'Cannons, alerts, and more subtle notifications for tells and the sort while the tab is hidden.',
      'Disengage is now two buttons, one for respawn island side, one for respawn ocean side.',
      'New setting for "Always focus chat" which disables keyboard shortcuts in favor of focusing the chat.',
      'Fixed the next move token selection to reset when you sink rather than giving you the wrong moves without showing it.',
      'Flags and rocks now draw above boats in a way that looks more correct.',
      'Move input which has not been confirmed by the server will now appear greyed out.',
    ],
  },
  {
    title: 'Release 12 May 2021',
    points: [
      'Cade AI is alive!',
      'Bot settings (enabled + difficulty) added which make bots pad the weaker team to even things up.',
      'Import .txt maps (from the java client) directly in the map editor.',
      'Many smaller fixes and improvements.',
    ],
  },
  {
    title: 'Release 02 May 2021',
    points: [
      'Global Cadesim web released!',
      'This is an adapted version of the project hosted at superquacken.com made by Imaduck and Captainvampi.',
      'Adapted in cooperation with Fatigue and Eyad.',
    ],
  },
];
