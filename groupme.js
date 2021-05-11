const axios = require('axios');
const fs = require('fs');
const moment = require('moment');

const GROUPME_TOKEN_PATH = 'groupme_token';

const token = fs.readFileSync(GROUPME_TOKEN_PATH).toString().replace(/\r?\n|\r/g, "");;
const version = 'v3';
const BASE_URL = `https://api.groupme.com/${version}/`;

const get = async (url) => {
  const response = await axios.get(BASE_URL + url, { params: { token } });
  return response.data.response;
}

const post = async (url, payload) => {
  const response = await axios.post(BASE_URL + url, payload, { 
		params: { 
			token: token
		}
	});
	return response.data.response;
}

const getGroups = async () => get('groups');

const colorMap = {
  'blk': 'black',
  'char': 'charcoal',
	'gry': 'grey',
	'crl': 'coral',
	'purp': 'purple',
	'pink': 'pink',
  'lt gry': 'light grey'
};

const extractName = (name, calName, teamName) => {
  // Ace (Teal) vs. Tracy's #1 Fans! (blk) (Beach Volleyball - Coed 3v3 - Mon - Spring 2 '21)
	let newName =  name.split(`(${calName}`)[0].trim();
	// remove from 'Ace (Teal) vs. Tracy's #1 Fans! (blk)'
	const nameRegExp = new RegExp(`(${teamName} )([(A-Za-z)]{0,8})`);
	newName = newName.replace(nameRegExp, '$1').replace('  ', ' ');
//	newName = newName.replace(/(Ace )([(A-Za-z)]{0,8})/, '$1').replace('  ', ' ');
  Object.entries(colorMap).forEach(([key, value]) => {
    newName = newName.replace(`(${key})`, `(${value})`);
	});
	console.log('extracted name: ', newName);
	return newName;
}

const extractDescription = (location) => {
  // The MAC (Beach #1)
  const [,desc] = location.match(/Beach\ \#([0-9]{0,1})/)
	console.log('new desc: ', desc);
	return `Court ${desc}`;
}

const postEvent = async (groupId, _event) => {
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
		..._event
	});
}

const getGroupByName = async (name) => { 
	const groups = await getGroups();                                                                 
	const group = groups.find((group) => group.name === name);                                        
	if (!group) {                                                                                     
	  throw new Error(`group ${name} does not exist`);                                                
	}                                                                                                 
	return group;                                                                                     
}

// gets active events only
const getGroupmeEvents = async (groupId) => {
  const messages = await get(`groups/${groupId}/messages`);
  return messages.filter((message) => {
		// make sure it has an event field AND isn't cancelled
    return message.event && message.event.type !== 'calendar.event.cancelled'; // cancelled, created, user.notgoing
	}).map((message) => {
    return message.event.data.event;
	});
}

const getGroupmeEventByName = async (groupId, eventName) => {
  const groupmeEvents = await getGroupmeEvents(groupId);
	return groupmeEvents.find((e) => e.name === eventName);
}

module.exports = {
	get,
	post,
	getGroups,
	getGroupByName,
	getGroupmeEvents,
	getGroupmeEventByName,
	postEvent,
	createEventFromCalendar: async (groupId, calendarEvent, calName, teamName) => {
		// first check that the event doesnt already exist
		const name = extractName(calendarEvent.summary, calName, teamName);
		const existingEvent = await getGroupmeEventByName(groupId);
		if (existingEvent) {
      console.log(`event ${name} already exists`);
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

    return postEvent123(groupId, ev);
	}
	// we also need code to cancel/update the event if it changes
}

