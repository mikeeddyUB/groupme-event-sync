import axios from 'axios'
import * as fs from 'fs';
import * as moment from 'moment';
import { BASE_GROUPME_URL, GROUPME_TOKEN_PATH } from './constants';

const token = fs.readFileSync(GROUPME_TOKEN_PATH).toString().replace(/\r?\n|\r/g, "");;

export const get = async <T>(url: string, params = {}): Promise<T> => {
	let response;
	// try {
		response = await axios.get<T>(BASE_GROUPME_URL + url, { params: { token, ...params } });
		// console.log(response)
		return response.data.response;
	// } catch (e) {
		// console.log(response);
	// }
}

export const post = async (url: string, payload: Record<string, any>): Promise<any> => {
  const response = await axios.post(BASE_GROUPME_URL + url, payload, { 
		params: { 
			token: token
		}
	});
	return response.data.response;
}

export const getGroups = async (): Promise<any[]> => get('groups');

const colorMap: Record<string, string> = {
  'blk': 'black',
  'char': 'charcoal',
	'gry': 'grey',
	'crl': 'coral',
	'purp': 'purple',
	'pink': 'pink',
  'lt gry': 'light grey'
};

const hasColors = (name: string): boolean => Object.keys(colorMap).some((abrvColor) => name.includes(`(${abrvColor})`))

const extractName = (name: string, calName: string, teamName: string): string => {
	// Ace (Teal) vs. Tracy's #1 Fans! (blk) (Beach Volleyball - Coed 3v3 - Mon - Spring 2 '21)
	// Notorious D.I.G. 2.0 vs. Setsy and we know it (Beach Volleyball - Coed 4v4 - Thurs - Spring 2 '21)
	// 
	let newName =  name.split(`(${calName})`)[0].trim();
	if (!hasColors(newName)) {
	  console.log(`extracted name: [${newName}]`);
		return newName;
	}
	// remove from 'Ace (Teal) vs. Tracy's #1 Fans! (blk)'
	const nameRegExp = new RegExp(`(${teamName} )([(A-Za-z .)]{0,8})`);
	newName = newName.replace(nameRegExp, '$1').replace('  ', ' ');
//	newName = newName.replace(/(Ace )([(A-Za-z)]{0,8})/, '$1').replace('  ', ' ');
  Object.entries(colorMap).forEach(([key, value]) => {
    newName = newName.replace(`(${key})`, `(${value})`);
	});
	console.log(`extracted name: [${newName}]`);
	return newName;
}

const extractDescription = (location) => {
  // The MAC (Beach #1)
  const [,desc] = location.match(/Beach\ \#([0-9]{0,1})/);
	// console.log('new desc: ', desc);
	return `Court ${desc}`;
}

export const postEvent = async (groupId: string, _event) => {
	return post(`conversations/${groupId}/events/create`, {
		location: {
			name: 'MAC Sports & Entertainment (The Mac)',
			address: '8924 Midway West Rd\nRaleigh, NC 27617 \nUnited States',
			lat: 35.90874099731445,
			lng: -78.75588989257812
		},
		is_all_day: false,
		timezone:'America/New_York',
		reminders: [],
		going: [],
		..._event
	});
}

export const getGroupByName = async (name: string) => { 
	const groups = await getGroups();                                                                 
	const group = groups.find((group) => group.name === name);                                        
	if (!group) {                                                                                     
	  throw new Error(`group ${name} does not exist`);                                                
	}                                                                                                 
	return group;                                                                                     
}

export const getGroupmeEvents = async (groupId: string) => {
	const { messages } = await get(`groups/${groupId}/messages`);
	const eventMessages = [];
	for (const message of messages) {
		if (!message.event || !message.event.data.event.id) {
			continue;
		}
		const event = await getEvent(groupId, message.event.data.event.id);
		if (!event.deleted_at) {
		  eventMessages.push(event);
		}
	}
	// console.log('events: ', eventMessages)
	return eventMessages;
}

export const getGroupmeEventByName = async (groupId: string, eventName: string) => {
  const groupmeEvents = await getGroupmeEvents(groupId);
	// return groupmeEvents.find((e) => e.name === eventName);

	return groupmeEvents.find((e) => {
		// console.log(`groupme event: ${e.name} === ${eventName}`);
		return e.name === eventName;
	});
}

export const getEvent = async (groupId: string, eventId: string) => {
	// https://api.groupme.com/v3/conversations/68165878/events/show?event_id=ded340d7c152460f8428f49f0c9b5c29
	const { event } = await get(`conversations/${groupId}/events/show`, { event_id: eventId });
	return event;
}

export const createEventFromCalendar = async (groupId: string, calendarEvent, calName: string, teamName: string) => {
	// first check that the event doesnt already exist
	const name = extractName(calendarEvent.summary, calName, teamName);
	const existingEvent = await getGroupmeEventByName(groupId, name);
	if (existingEvent) {
		console.log(`event "${name}" already exists`);
		return;
	}
	const ev = {
		name,
		description: extractDescription(calendarEvent.location),
		start_at: moment(calendarEvent.start.dateTime).format(),
		// 2021-05-10T22:45:00Z to 
		// 2021-05-10T12:30:00-04:00
		end_at: moment(calendarEvent.end.dateTime).format()
	};

	return postEvent(groupId, ev);
}
// we also need code to cancel/update the event if it changes
