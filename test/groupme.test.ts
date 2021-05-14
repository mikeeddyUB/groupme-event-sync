import { extractName } from '../src/groupme'

const calendarName = "Beach Volleyball - Coed 3v3 - Mon - Spring 2 '21"
const otherTeam = "Tracy's #1 Fans!"

test('extractName -> "Ace" with no color', () => {
  const teamName = 'Ace';
  [
    [`${teamName} vs. ${otherTeam} (${calendarName})`, `${teamName} vs. ${otherTeam}`],
    [`${otherTeam} vs. ${teamName} (${calendarName})`, `${teamName} vs. ${otherTeam}`]
  ].forEach(([name, expectedName]) => {
    expect(extractName(name, calendarName, teamName)).toBe(expectedName)
  })
})

test('extractName -> "Ace" with color', () => {
  const teamName = 'Ace';
  [
    [`${teamName} (Teal) vs. ${otherTeam} (blk) (${calendarName})`, `${teamName} vs. ${otherTeam} (black)`],
    [`${otherTeam} (blk) vs. ${teamName} (Teal) (${calendarName})`, `${teamName} vs. ${otherTeam} (black)`]
  ].forEach(([name, expectedName]) => {
    expect(extractName(name, calendarName, teamName)).toBe(expectedName)
  })
})

test('extractName -> "Ace 2.0" with color', () => {
  const teamName = 'Ace 2.0';
  [
    [`${teamName} (Teal) vs. ${otherTeam} (blk) (${calendarName})`, `${teamName} vs. ${otherTeam} (black)`],
    [`${otherTeam} (blk) vs. ${teamName} (Teal) (${calendarName})`, `${teamName} vs. ${otherTeam} (black)`]
  ].forEach(([name, expectedName]) => {
    expect(extractName(name, calendarName, teamName)).toBe(expectedName)
  })
})

test('extractName -> "Ace 2.0" with no color', () => {
  const teamName = 'Ace 2.0';
  [
    [`${teamName} vs. ${otherTeam} (${calendarName})`, `${teamName} vs. ${otherTeam}`],
    [`${otherTeam} vs. ${teamName} (${calendarName})`, `${teamName} vs. ${otherTeam}`]
  ].forEach(([name, expectedName]) => {
    expect(extractName(name, calendarName, teamName)).toBe(expectedName)
  })
})