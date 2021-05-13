const axios = require('axios');

const headers = [
  'BEGIN', 
	'DTSTAMP', 
	'DTSTART', 
	'DTEND', 
	'SUMMARY', 
	'UID', 
	'LOCATION', 
	'DESCRIPTION', 
	'END', 
	'VERSION', 
	'PRODID', 
	'REFRESH-INTERVAL', 
	'X-WR-CALNAME', 
	'X-PUBLISHED-TTL'
];

const parseLine = (line) => {

}

(async () => {
  const { data } = await axios.get('http://trisports.leagueapps.com/ajax/loadSchedule?origin=site&scope=team&publishedOnly=0&itemType=games_events&teamId=3929245&programId=2212624&iCalExport=true&userId=11928577&cb=1619710155944')

	// const { data } = await axios.get('http://trisports.leagueapps.com/ajax/loadSchedule?origin=site&scope=team&publishedOnly=0&itemType=games_events&teamId=3929245&programId=2212624&userId=11928577&cb=1619710155944')

  // console.log('data: ', data);

	const newLines = [];
	const lines = data.replace(/\t/g, '').split('\r\n');
	console.log('lines: ', lines);

	let curLine = '';
	lines.forEach((line) => {
		console.log(`checking line ${line}`);
    const header = headers.find((header) => lines.includes(`${header}:`));
		const headerText = `${header}:`;
		if (header) {
			console.log(`header ${header} found`);
			if (curLine !== '') {
				console.log(`pushing ${curLine} as a full line`);
        newLines.push(curLine);
			}
      curLine = line.split(headerText)[1];
			console.log(`curLine: ${curLine}`)
		} else {
			console.log('appending to curLine because no header was found');
      curLine += line;
		}
	});

	console.log('newLines: ', newLines);

  // throw out all lines until we find 'BEGIN:VCALENDAR'
	// throw out all lines until we find 'BEGIN:VEVENT'

	// starts with BEGIN:VCALENDAR\r\n
	//
	// starts with BEGIN:VEVENT\r\n
})()



// BEGIN:VEVENT
// DTSTAMP:20210511T174826Z
// DTSTART:20210610T230000Z
// DTEND:20210611T000000Z
// SUMMARY:Notorious D.I.G. 2.0 vs. Doesn't Matter Had Sets (Beach Volleyball 
//	- Coed 4v4 - Thurs - Spring 2 '21)
//	UID:11376501
//	LOCATION:The MAC (Beach #4)
//	DESCRIPTION:RSVP Here: http://trisports.leagueapps.com/leagues/2212624/sche
//		dule/game/11376501#rsvp\\nGet Directions: http://trisports.leagueapps.com/
//			location/33249
//			END:VEVENT
//
