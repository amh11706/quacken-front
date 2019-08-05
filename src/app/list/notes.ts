interface note {
  title: string,
  content: string,
}

export const Notes: note[] = [
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
]
