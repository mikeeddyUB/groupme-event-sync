
// [START calendar_quickstart]
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const moment = require('moment');
const {
  createEventFromCalendar,
	get, 
	getGroupByName, 
	postEvent 
} = require('./groupme');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
const CREDENTIAL_PATH = 'credentials.json';

const CAL_4V4_VBALL = `Beach Volleyball - Coed 4v4 - Thurs - Spring 2 '21`;
const CAL_3V3_VBALL = `Beach Volleyball - Coed 3v3 - Mon - Spring 2 '21`;

const GROUPME_3_VBALL = '3s';
const GROUPMY_4_VBALL = '4s volleyball';

const GROUPME_TEST = 'test2';

// Load client secrets from a local file.
// fs.readFile(CREDENTIAL_PATH, (err, content) => {
//   if (err) return console.log('Error loading client secret file:', err);
//   // Authorize a client with credentials, then call the Google Calendar API.
//   authorize(JSON.parse(content), listEvents);
// });

(async () => {
  try {
    const credentialContent = await fs.readFileSync(CREDENTIAL_PATH);
		const creds = JSON.parse(credentialContent);
    const { installed: { client_secret, client_id, redirect_uris } } = creds;
    const client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    const tokenContent = await fs.readFileSync(TOKEN_PATH);
		// if this throws, we need to create a token
    const token = JSON.parse(tokenContent);
    client.setCredentials(token);

		const cal = await getCalendarByName(client, CAL_3V3_VBALL);
		console.log('found calendar: ', cal);
		const now = moment();
    const events = await listEvents2(client, {
			calendarId: cal.id, // 'primary',
		  timeMin: now.toISOString(),
			timeMax: now.add(5, 'd').toISOString(),
		  maxResults: 10,
		  singleEvents: true,
		  orderBy: 'startTime',
		});
    //const events = await listCalendars(client, {});
    console.log('custom list events: ', events);
    const ev = events[0];
		// const getResponse = await get('groups');
		// console.log('get: ', getResponse);

		const group = await getGroupByName(GROUPME_TEST);
		console.log('group: ', group);
		const postResult = await createEventFromCalendar(group.id, ev, CAL_3V3_VBALL);
//		const postResult = await postEvent(group.id, {
//		  name: ev.summary, // regex this to get make it shorter
//			description: 'test desc', // maybe add the court here?
//			// start_at: '2021-05-10T12:30:00-04:00',
//			start_at: moment(ev.start.dateTime).format(),
//			// momentDate.format('YYYY-MM-DDTHH:mm:ss')
//			// momentDate.format()
//			// end_at: '2021-05-10T12:45:00-04:00'
//			end_at: moment(ev.end.dateTime).format()
//		});
		console.log('postResult: ', postResult);
  } catch(e) {
    console.error('SAD: ', e);
  }
})()
// make this a promise
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

const listEvents2 = async (client, listOptions) => {
  return new Promise((res, rej) => {
    const calendar = google.calendar({version: 'v3', auth: client});
    calendar.events.list(listOptions, (err, result) => {
      if (err) {
        rej(err);
        return;
      }
      const events = result.data.items;
      res(events || []);
    });
  });
};

const listCalendars = async (client, options) => {
  return new Promise((res, rej) => {
	  const googleClient = google.calendar({version: 'v3', auth: client});
		googleClient.calendarList.list(options, (err, result) => {
		  if (err) {
        rej(err);
				return;
			}
			// console.log(`cal names: ${JSON.stringify(result.data.items.map(i => i.summary))}`);
			res(result.data.items);
		});
	});
}

const getCalendarByName = async (client, name) => {
  const cals = await listCalendars(client, {});
  const cal = cals.find((cal) => cal.summary === name);
  // const cal = cals.find((cal) => {
	//   console.log(`comparing ${cal.summary} and ${name} === ${cal.summary === name}`);
	// });
	if (!cal) {
    throw new Error(`calendar with summary ${name} does not exist`);
	}
	return cal
}

const respListHandler = (res, rej) => (err, result) => {
  if (err) {
    rej(err);
		return
	}
	res(result.data.items);
}

function listEvents(auth) {
	const now = moment();
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.list({
    calendarId: 'primary',
    timeMin: now.toISOString(),
		timeMax: now.add(5, 'd').toISOString(),
    maxResults: 5,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    if (events.length) {
      console.log('Upcoming 10 events:');
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log('No upcoming events found.');
    }
  });
}

module.exports = {
  SCOPES,
  listEvents,
};
