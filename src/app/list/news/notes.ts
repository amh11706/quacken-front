interface Note {
  title: string;
  points: string[];
}

export const Notes: Note[] = [
  {
    title: 'Release 22 October 2020',
    points: [
      'Round statistics for sinks / assists added.',
      'A score summary now shows at the end of a round.',
      'New setting for turn time between 10 and 35 seconds.',
      'New setting for showing or hiding the fps counter.',
    ],
  },
  {
    title: 'Release 16 October 2020',
    points: [
      'Round statistics added.',
      'Hover over the scoreboard to see statistics per player.',
      'Total scores for the round will be in the next update!',
    ],
  },
  {
    title: 'Release 04 October 2020',
    points: [
      '3D Cadegoose is released!',
      'It is mostly playable on mobile, but expect improvements in that area in the next update.',
    ],
  },
  {
    title: 'Release 23 September 2020',
    points: [
      'Further adjustments to damage and bilge rates.',
      'Randomized fish names for cade ships!',
      'Fixed a bug where starting a 2nd round did not close the menu.',
      'Fixed forgot password emails not being sent.',
    ],
  },
  {
    title: 'Release 14 September 2020',
    points: [
      'Major CadeGoose updates based on feedback and testing.',
      'New entry menu for choosing team, boat, and spawn side.',
      'Timer is now server side. No more odd behavior when someone disconnects.',
      'More consistent handling of boat sinks and respawns.',
      'All boat types are now playable with placeholder images.',
      'The next update will focus on further improving the CadeGoose UI. Thank you to everyone who has tested and given feedback so far!',
    ],
  },
  {
    title: 'Release 05 August 2020',
    points: [
      'CadeGoose 1.0 released!',
    ],
  },
  {
    title: 'Release 15 January 2020',
    points: [
      'Map editor updated to support hex tiles.',
      'New "Save All" option to save all unsaved tiles in a set.',
      'Undos and redos are now saved with the map.',
    ],
  },
  {
    title: 'Release 05 January 2020',
    points: [
      'Added HexaQuack lobby type. Map editor updates for this new map type coming soon!',
      'Fixed rare lobby crash when a player is kicked.',
    ],
  },
  {
    title: 'Release 01 January 2020',
    points: [
      'Fix lobby crash when a guest bombs the head.',
      'Treasure division is now triggered before server reboots.',
      'Chat input now greys out when it loses focus.',
    ],
  },
  {
    title: 'Release 22 August 2019',
    points: [
      'Defenducks can now spin on the spot.',
      'Player ducks no longer teleport when switching type mid turn.',
      'Fixed several bugs relating to kit switching.',
    ],
  },
  {
    title: 'Release 16 August 2019',
    points: [
      'Gave the ducks some laxative.',
      'Player ducks now take over an existing duck rather than spawning a new one.',
      'Added blinds and timers to spades.',
      'Fixed several bugs with the lobby list not updating properly.',
    ],
  },
  {
    title: 'Release 09 August 2019',
    points: [
      'Spades! There will be another update soon to add more features, but the base game is working.',
      'Draggable windows now jump to the top when clicked.',
      'Fixed a bug that would prevent you from making a lobby.',
    ],
  },
  {
    title: 'Release 04 August 2019',
    points: [
      'Enable reset password option on failed login.',
      'Map editor now saves state when you exit. No more lost data from accidental navigation.',
      'Inventories can now be opened via the 4th button on the right side of the chat box.',
      'Prizes! Every entry on a generated map awards coin and prize bags which will be openable in an upcoming release for more useful prize items.',
      'Added confirmation popup on logout.',
      'Bugfixes and bugbreaks.',
    ],
  },
];
