import { calendar_v3, google } from 'googleapis'
import type { OAuth2Client } from 'googleapis-common'

export const listCalendars = async (
  client: OAuth2Client,
  options: calendar_v3.Params$Resource$Calendarlist$List
): Promise<calendar_v3.Schema$CalendarListEntry[]> => {
  const googleClient = google.calendar({ version: 'v3', auth: client })
  const result = await googleClient.calendarList.list(options)
  return result.data.items || []
}

export const listEvents = async (
  client: OAuth2Client,
  listOptions: calendar_v3.Params$Resource$Events$List
): Promise<calendar_v3.Schema$Event[]> => {
  const calendar = google.calendar({ version: 'v3', auth: client })
  const result = await calendar.events.list(listOptions)
  return result.data.items || []
}

export const getCalendarByName = async (
  client: OAuth2Client,
  name: string
): Promise<calendar_v3.Schema$CalendarListEntry> => {
  const cals = await listCalendars(client, {})
  const calendar = cals.find((cal) => cal.summary === name)
  if (!calendar) {
    throw new Error(`calendar with summary ${name} does not exist`)
  }
  return calendar
}
