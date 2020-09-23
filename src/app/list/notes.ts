interface Note {
  title: string;
  content: string;
}

export const Notes: Note[] = [
  {
    title: 'Release 23 Septemner 2020',
    content: `
    <ul>
      <li>Further adjustments to damage and bilge rates.</li>
      <li>Randomized fish names for cade ships!</li>
      <li>Fixed a bug where starting a 2nd round did not close the menu.</li>
      <li>Fixed forgot password emails not being sent.</li>
    </ul>`
  },
  {
    title: 'Release 14 Septemner 2020',
    content: `
    <ul>
      <li>Major CadeGoose updates based on feedback and testing.</li>
      <li>New entry menu for choosing team, boat, and spawn side.</li>
      <li>Timer is now server side. No more odd behavior when someone disconnects.</li>
      <li>More consistent handling of boat sinks and respawns.</li>
      <li>All boat types are now playable with placeholder images.</li>
      <li>The next update will focus on further improving the CadeGoose UI. Thank you to everyone who has tested and given feedback so far!</li>
    </ul>`
  },
  {
    title: 'Release 05 August 2020',
    content: `
    <ul>
      <li>CadeGoose 1.0 released!</li>
    </ul>`
  },
  {
    title: 'Release 15 January 2020',
    content: `
    <ul>
      <li>Map editor updated to support hex tiles.</li>
      <li>New "Save All" option to save all unsaved tiles in a set.</li>
      <li>Undos and redos are now saved with the map.</li>
    </ul>`
  },
  {
    title: 'Release 05 January 2020',
    content: `
    <ul>
      <li>Added HexaQuack lobby type. Map editor updates for this new map type coming soon!</li>
      <li>Fixed rare lobby crash when a player is kicked.</li>
    </ul>`
  },
  {
    title: 'Release 01 January 2020',
    content: `
    <ul>
      <li>Fix lobby crash when a guest bombs the head.</li>
      <li>Treasure division is now triggered before server reboots.</li>
      <li>Chat input now greys out when it loses focus.</li>
    </ul>`
  },
  {
    title: 'Release 22 August 2019',
    content: `
    <ul>
      <li>Defenducks can now spin on the spot.</li>
      <li>Player ducks no longer teleport when switching type mid turn.</li>
      <li>Fixed several bugs relating to kit switching.</li>
    </ul>`
  },
  {
    title: 'Release 16 August 2019',
    content: `
    <ul>
      <li>Gave the ducks some laxative.</li>
      <li>Player ducks now take over an existing duck rather than spawning a new one.</li>
      <li>Added blinds and timers to spades.</li>
      <li>Fixed several bugs with the lobby list not updating properly.</li>
    </ul>`
  },
  {
    title: 'Release 09 August 2019',
    content: `
    <ul>
      <li>Spades! There will be another update soon to add more features,
      but the base game is working.</li>
      <li>Draggable windows now jump to the top when clicked.</li>
      <li>Fixed a bug that would prevent you from making a lobby.</li>
    </ul>`
  },
  {
    title: 'Release 04 August 2019',
    content: `
    <ul>
      <li>Enable reset password option on failed login.</li>
      <li>Map editor now saves state when you exit. No more lost
      data from accidental navigation.</li>
      <li>Inventories can now be opened via the 4th button on the right side
      of the chat box.</li>
      <li>Prizes! Every entry on a generated map awards coin and prize bags
      which will be openable in an upcoming release for more useful prize
      items.</li>
      <li>Added confirmation popup on logout.</li>
      <li>Bugfixes and bugbreaks.</li>
    </ul>`
  },
];
