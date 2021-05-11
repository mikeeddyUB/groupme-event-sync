const CAL_4V4_VBALL = `Beach Volleyball - Coed 4v4 - Thurs - Spring 2 '21`;
const CAL_3V3_VBALL = `Beach Volleyball - Coed 3v3 - Mon - Spring 2 '21`;

const GROUPME_3_VBALL = '3s';
const GROUPMY_4_VBALL = '4s volleyball';

const GROUPME_TEST = 'test2';

// Load client secrets from a local file.
// fs.readFile(CREDENTIAL_PATH, (err, content) => {
//   if (err) return console.log('Error loading client secret file:', err);
//   // Authorize a client with credentials, then call the Google Calendar API.
//   authorize(JSON.parse(content), listEventsOld);
// });

// should probably read this in from a file
module.exports = {
  '3s': {
    'googleCalendarName': CAL_3V3_VBALL,
    'teamName': 'Ace',
    'groupmeChannel': GROUPME_3_VBALL
  },
  '4s': {
    'googleCalendarName': CAL_4V4_VBALL,
    'teamName': 'Notorious D.I.G. 2.0',
    'groupmeChannel': GROUPMY_4_VBALL
  },
	'test': {
    'googleCalendarName': CAL_4V4_VBALL,
    'teamName': 'Notorious D.I.G. 2.0',
    'groupmeChannel': GROUPME_TEST
  }
};