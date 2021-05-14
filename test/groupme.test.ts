import { extractName } from '../src/groupme'

const calendarName = "Beach Volleyball - Coed 3v3 - Mon - Spring 2 '21"
test('extractName -> "Ace" with no color', () => {
  const teamName = 'Ace';
  [
    [`${teamName} vs. Tracy's #1 Fans! (Beach Volleyball - Coed 3v3 - Mon - Spring 2 '21)`, `${teamName} vs. Tracy's #1 Fans!`],
    [`Tracy's #1 Fans! vs. ${teamName} (Beach Volleyball - Coed 3v3 - Mon - Spring 2 '21)`, `${teamName} vs. Tracy's #1 Fans!`]
  ].forEach(([name, expectedName]) => {
    expect(extractName(name, calendarName, teamName)).toBe(expectedName)
  })
})

test('extractName -> "Ace" with color', () => {
  const teamName = 'Ace';
  [
    [`${teamName} (Teal) vs. Tracy's #1 Fans! (blk) (Beach Volleyball - Coed 3v3 - Mon - Spring 2 '21)`, `${teamName} vs. Tracy's #1 Fans! (black)`],
    [`Tracy's #1 Fans! (blk) vs. ${teamName} (Teal) (Beach Volleyball - Coed 3v3 - Mon - Spring 2 '21)`, `${teamName} vs. Tracy's #1 Fans! (black)`]
  ].forEach(([name, expectedName]) => {
    expect(extractName(name, calendarName, teamName)).toBe(expectedName)
  })
})

test('extractName -> "Ace 2.0" with color', () => {
  const teamName = 'Ace 2.0';
  [
    [`${teamName} (Teal) vs. Tracy's #1 Fans! (blk) (Beach Volleyball - Coed 3v3 - Mon - Spring 2 '21)`, `${teamName} vs. Tracy's #1 Fans! (black)`],
    [`Tracy's #1 Fans! (blk) vs. ${teamName} (Teal) (Beach Volleyball - Coed 3v3 - Mon - Spring 2 '21)`, `${teamName} vs. Tracy's #1 Fans! (black)`]
  ].forEach(([name, expectedName]) => {
    expect(extractName(name, calendarName, teamName)).toBe(expectedName)
  })
})

test('extractName -> "Ace 2.0" with no color', () => {
  const teamName = 'Ace 2.0';
  [
    [`${teamName} vs. Tracy's #1 Fans! (Beach Volleyball - Coed 3v3 - Mon - Spring 2 '21)`, `${teamName} vs. Tracy's #1 Fans!`],
    [`Tracy's #1 Fans! vs. ${teamName} (Beach Volleyball - Coed 3v3 - Mon - Spring 2 '21)`, `${teamName} vs. Tracy's #1 Fans!`]
  ].forEach(([name, expectedName]) => {
    expect(extractName(name, calendarName, teamName)).toBe(expectedName)
  })
})