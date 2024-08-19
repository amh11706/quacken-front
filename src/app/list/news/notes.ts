export interface Note {
  title: string;
  points: string[];
}

/* Done but not released:
*/

/* In progress:
'Make your boat stand out more from your team.',
'Improve mobile scaling and zooming.',
*/

/* Planned:
'smoother boat turning.',
'1v1 queue.',
'1v1 map generation.',
'You can now add notes to a replay.',
'Map creators can now see a list of matches using their map. Viewable from the map editor.',
'New "Map Browser" page to view highlighted maps and creators.',
'Added a way to delete maps.',
'Added sort by popularity to the map browser.',
'refactor mat-chip autocomplete usage.',
*/

export const Notes: Note[] = [
  {
    title: 'Release 20 August 2024',
    points: [
      'Overtime!',
      'There are several overtime modes to choose from in the lobby settings.',
      'The default mode is "5 + 5 turns" which extends the game 5 turns at a time up to 2 times.',
      'The match queue now has an unrated option. This means guests can now use the queue as well.',
      'Maps can now be rated directly from the map search.',
    ],
  },
  {
    title: 'Release 17 August 2024',
    points: [
      '1v1 queue is now available! You can now queue for 1v1 games from the new tab in the escape menu.',
      '1v1 games are rated separately from team games. 1v1 games can only be rated thru the 1v1 queue.',
      'The queue chooses a random top rated map. Make sure to rate your favorite maps to see them in the queue later!',
      'Your boat outline is now lighter than your team color.',
      'Respawns are now limited to once every 5 seconds.',
    ],
  },
  {
    title: 'Release 01 August 2024',
    points: [
      'Mobile improvements with help from Straft.',
      'Zoom and pan work more consistently on mobile.',
      'HUD is now smaller on small screens.',
      'Discord users and roles can now be mentioned from in game.',
      'Paused matches now only remain paused while pause has a majority vote.',
      'A player leaving with no pause credits now forfeits the match.',
      'Map search now includes partial name and description matches.',
    ],
  },
  {
    title: 'Release 14 July 2024',
    points: [
      'Chain shot now only removes stored tokens. It will remove a lot more tokens than before though.',
      'First win now always gives at least 25 rank points.',
      'Disconnected players now still show on the team they were on.',
    ],
  },
  {
    title: 'Release 08 July 2024',
    points: [
      'Map preview now zooms on hover.',
      'Map editor bug fixes. Now somewhat less likely to erase your maps.',
      'Forfeit team score now shows F instead of 0.',
    ],
  },
  {
    title: 'Release 29 June 2024',
    points: [
      'Escape menu now always opens to the lobby tab.',
      'Black ship can now be used.',
      'Turn timer is now more accurate even when the tab is not focused.',
    ],
  },
  {
    title: 'Release 03 March 2024',
    points: [
      'Emoji picker!',
      'Type a colon : in chat to open the emoji picker.',
      'Donators can now set their own emoji in their account settings.',
      'Click your name for a quick link to the emoji picker.',
      'Added show team damage setting.',
      'Updated ui library to improve security.',
      'Users can only have one client in a rated match at a time.',
      'Rank circles are now updated more reliably.',
      'Map search now has autocomplete.',
    ],
  },
  {
    title: 'Release 23 February 2024',
    points: [
      'Players can now pause the game for up to 2 minutes per game per player.',
      'You can vote to end the game early from the pause screen.',
      'Disconnects automatically pause the game.',
      'You can no longer have bots in a rated game if any player is above 125 rating.',
      'Op command is now a toggle. You don\'t have to specify true/false.',
      'You can now click the scores to toggle between normal and extra stats.',
      'Tooltips no longer block clicks.',
      'Link buttons are now actual links.',
    ],
  },
  {
    title: 'Release 19 February 2024',
    points: [
      'The great (rank) reset!',
      'Rating is now based on win/loss rather than score.',
      'Teams must be within 100 points average of each other to be rated.',
      'New checkbox to make a match rated or unrated.',
      'You can now see replays of any player.',
      'Stat leaderboards now have a link to the replay where the record was achieved.',
      'Added search and sort to the match history page.',
      'Pausing a replay now pauses the animation, not just the timer.',
      'Custom maps now work in sea battle.',
      'You can now toggle back to unready when unlimited time is enabled.',
      'Rejoining a lobby no longer erases your moves.',
      'Joining and shuffling teams no longer causes player list shuffling.',
      'FPS display can now be dragged around in addition to turning it on or off from the graphic settings.',
      'Chat now scrolls smoothly.',
      'Chat commands now have a timestamp on hover.',
      'Chat commands now persist entered text in a more natural way.',
    ],
  },
  {
    title: 'Release 21 January 2024',
    points: [
      'Match history reworked; It now shows results and team info.',
      'Profile page now includes w/l last 30 days and vs you (if it\'s not your profile).',
      'Leaderboards now only show players who have played in the last 30 days.',
      'New setting to show the moves of boats on your team.',
      'Added a bunch of new statistics visible during a match. Shift + Tab to show (if enabled).',
      'Fixed map sort by rating so maps with only 1 rating are not at the top.',
      'Fixed AI thinking rocks taste good.',
      'Fixed AI sometimes ignoring the main cluster.',
    ],
  },
  {
    title: 'Release 27 August 2023',
    points: [
      'Max turn time increased to 60 seconds.',
      'New setting to enable shift click to place maneuvers.',
      'More contrast between your boat color and your team color.',
      'Water now uses more variations.',
      'Private lobbies are now slightly more private.',
    ],
  },
  {
    title: 'Release 04 June 2023',
    points: [
      'Capture the flag adjustments.',
      'Boats carrying a 2 point flag now get 1 less move per turn.',
      'Bomber boat can no longer pick up flags.',
      'Kicked boats will now drop their flags.',
    ],
  },
  {
    title: 'Release 27 May 2023',
    points: [
      'New game mode! Capture the flag.',
      'Two variations: Take the enemy flags to your base, or plant flags to defend.',
      'Four new boat classes: Sniper, Builder, Healer, and Bomber.',
      'Sea battle now ends when only one team is left rather than on first sink.',
      'Selected maneuver is now more likely to generate faster',
      'Flotsam now drops before the winds and whirls act.',
      'Dropping flotsam on a boat now immediately affects the boat.',
      'Quacken lobby type temporarily removed.',
    ],
  },
  {
    title: 'Release 06 April 2022',
    points: [
      'Mini cade update.',
      'New lobby setting for "Fish names" instead of player names on boats.',
      'Advanced map setting mode while in a lobby now allows drawing directly on the map.',
      'Fixed a bug causing sound spam at the end of a match.',
      'The lobby will now only wait ~5 seconds for lagged players.',
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
