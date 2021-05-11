const { google } = require('googleapis');

const listCalendars = (client, options) => {
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

const listEvents = (client, listOptions) => {
  return new Promise((res, rej) => {
    const calendar = google.calendar({version: 'v3', auth: client});
    calendar.events.list(listOptions, (err, result) => {  
      if (err) {
        rej(err);
		    return;
   	  }
      res(result.data.items || []);
    });
	});
}

const getCalendarByName = async (client, name) => {
	const cals = await listCalendars(client, {});
	const cal = cals.find((cal) => cal.summary === name);
	if (!cal) {
		throw new Error(`calendar with summary ${name} does not exist`);
	}
	return cal;
}

module.exports = {
  listCalendars,
	listEvents,
	getCalendarByName
}
