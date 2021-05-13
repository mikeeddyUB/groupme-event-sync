import { calendar_v3, google } from 'googleapis';

export const listCalendars = async (client, options): Promise<calendar_v3.Schema$CalendarListEntry[]> => {
		const googleClient = google.calendar({version: 'v3', auth: client});
		const result = await googleClient.calendarList.list(options)
		return result.data.items || [];
}

export const listEvents = async (client, listOptions): Promise<calendar_v3.Schema$Event[]> => {
    const calendar = google.calendar({version: 'v3', auth: client});
    const result = await calendar.events.list(listOptions);
    return result.data.items || [];
}

export const getCalendarByName = async (client, name): Promise<calendar_v3.Schema$CalendarListEntry> => {
	const cals = await listCalendars(client, {});
	const cal = cals.find((cal) => cal.summary === name);
	if (!cal) {
		throw new Error(`calendar with summary ${name} does not exist`);
	}
	return cal;
}
