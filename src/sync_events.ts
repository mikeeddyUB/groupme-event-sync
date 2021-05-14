import * as fs from 'fs'
// import * as readline from 'readline';
import * as moment from 'moment'
import { google } from 'googleapis'

import { createEventFromCalendar, getGroupByName } from './groupme'
import { listEvents, getCalendarByName } from './google'
import config from './config'
import * as constants from './constants'

// TO ADD:
// - handle modifying an event if the time or team is different
// - handle cancelled events

// - dont auth with google, just look up the calendar
//   - possible, but kind of a pain since its not in a well known format

const args = process.argv
let configToUse
if (args.length === 3) {
  configToUse = args[2]
}

const main = async (): Promise<void> => {
  try {
    if (!configToUse) {
      console.log('missing config argument, expected one of: ', Object.keys(config).join(', '))
      return
    }
    if (!config) {
      console.log('missing config')
      return
    }
    const options = config[configToUse]
    if (!options) {
      console.log('invalid config, expected one of: ', Object.keys(config).join(', '))
      return
    }

    console.log('Using config: ', configToUse)
    const credentialContent: Buffer = await fs.readFileSync(constants.GOOGLE_CREDENTIAL_PATH)
    const creds = JSON.parse(credentialContent.toString())
    const {
      installed: {
        client_secret,
        client_id,
        redirect_uris: [redirectUri]
      }
    } = creds
    const client = new google.auth.OAuth2(client_id, client_secret, redirectUri)
    const tokenContent: Buffer = await fs.readFileSync(constants.GOOGLE_TOKEN_PATH)
    // if this throws, we need to create a token
    const token = JSON.parse(tokenContent.toString())
    client.setCredentials(token)

    const cal = await getCalendarByName(client, options.googleCalendarName)

    const now = moment()
    const events = await listEvents(client, {
      calendarId: cal.id,
      timeMin: now.toISOString(),
      timeMax: now.add(5, 'd').toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    })
    // const events = await listCalendars(client, {});
    // console.log('custom list events: ', events);
    const group = await getGroupByName(options.groupmeChannel)
    // console.log('group: ', group.name);
    // console.log('events: ', events.length);
    await Promise.all(
      events.map(async (ev) => {
        const postResult = await createEventFromCalendar(group.id, ev, options.googleCalendarName, options.teamName)
        if (postResult) {
          console.log('postResult: ', postResult)
        }
      })
    )
  } catch (e) {
    console.error('SAD: ', e)
  }
}
main()

// make this a promise
// function authorize(credentials, callback) {
//   const { client_secret, client_id, redirect_uris } = credentials.installed;
//   const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//   // Check if we have previously stored a token.
//   fs.readFile(constants.GOOGLE_TOKEN_PATH, (err, token) => {
//     if (err) return getAccessToken(oAuth2Client, callback);
//     oAuth2Client.setCredentials(JSON.parse(token.toString()));
//     callback(oAuth2Client);
//   });
// }

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
// function getAccessToken(oAuth2Client, callback) {
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: constants.SCOPES,
//   });
//   console.log('Authorize this app by visiting this url:', authUrl);
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   rl.question('Enter the code from that page here: ', (code) => {
//     rl.close();
//     oAuth2Client.getToken(code, (err, token) => {
//       if (err) return console.error('Error retrieving access token', err);
//       oAuth2Client.setCredentials(token);
//       // Store the token to disk for later program executions
//       fs.writeFile(constants.GOOGLE_TOKEN_PATH, JSON.stringify(token), (err) => {
//         if (err) return console.error(err);
//         console.log('Token stored to', constants.GOOGLE_TOKEN_PATH);
//       });
//       callback(oAuth2Client);
//     });
//   });
// }

// function listEventsOld(auth) {
//   const now = moment();
//   const calendar = google.calendar({ version: 'v3', auth });
//   calendar.events.list(
//     {
//       calendarId: 'primary',
//       timeMin: now.toISOString(),
//       timeMax: now.add(5, 'd').toISOString(),
//       maxResults: 5,
//       singleEvents: true,
//       orderBy: 'startTime',
//     },
//     (err, res) => {
//       if (err) return console.log(`The API returned an error: ${err}`);
//       const events = res.data.items;
//       if (events.length) {
//         console.log('Upcoming 10 events:');
//         events.map((event, i) => {
//           const start = event.start.dateTime || event.start.date;
//           console.log(`${start} - ${event.summary}`);
//         });
//       } else {
//         console.log('No upcoming events found.');
//       }
//     },
//   );
// }
