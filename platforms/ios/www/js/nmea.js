/*
	Utility functions for parsing NMEA sentences (RO)
	uses code borrowed/modified from https://github.com/jamesp/node-nmea
*/
var nmea = {
	// take in sentence string or array of sentence strings
	parse: function(strOrArr){
		if (strOrArr instanceof Array){
			sArr = [];
			for (var i in strOrArr){
				sArr.push(nmea.sentenceToObj(strOrArr[i]));
			}
			return sArr;
		} else if (typeof strOrArr === 'string') {
			return nmea.sentenceToObj(strOrArr);
		}
	},
/* 
	Break up NMEA sentences of certain types into known fields
	Handles: RMC, GSV, GGA
	Other common types, to add: GSA, VTG
*/
	decode: {
		rmc: function(nmeaArr){
			dt = nmea.convertGPSDateTime(nmeaArr[9],nmeaArr[1]); //human-readable datetime
			return {
				sentenceType: nmeaArr[0],
				UTtime: nmeaArr[1],
				status: nmeaArr[2],
				latitude: nmeaArr[3],
				dirNS: nmeaArr[4],
				longitude: nmeaArr[5],
				dirEW: nmeaArr[6],
				speed: nmeaArr[7],
				track: nmeaArr[8],
				UTdate: nmeaArr[9],
				variation: nmeaArr[10],
				EorW: nmeaArr[11],
				checksum: nmeaArr[12],
				UTCdateTime: dt
			};
		},
		gsv: function(nmeaArr) {
			/* 
		  	GSV has a variable number of fields, depending on the number of satellites found
				example: $GPGSV,3,1,12, 05,58,322,36, 02,55,032,, 26,50,173,, 04,31,085, 00*79
			The min number of fields is 4. After that, each satellite has a group of 4 values 
			
		  	*/
			var numFields = (nmeaArr.length - 4) / 4;
			var sats = [];
			for (var i=0; i < numFields; i++) {
				var offset = i * 4 + 4;
				sats.push({id: nmeaArr[offset],
					elevationDeg: +nmeaArr[offset+1],
					azimuthTrue: +nmeaArr[offset+2],
					SNRdB: +nmeaArr[offset+3]});
			}
			var checksum = nmeaArr[(nmeaArr.length - 1)];
			return {
				sentenceType: nmeaArr[0],
				numMsgs: nmeaArr[1],
				msgNum: nmeaArr[2],
				satsInView: nmeaArr[3],
				satellites: sats,
				checksum: checksum
			};
		},
		gga: function(nmeaArr){
			dt = nmea.convertGPSDateTime(false,nmeaArr[1]); //human-readable datetime
			var FIX_TYPE = ['none', 'fix', 'delta'];
			return {
				sentenceType: nmeaArr[0],
				datetime: dt,
				lat: nmeaArr[2],
				latPole: nmeaArr[3],
				lon: nmeaArr[4],
				lonPole: nmeaArr[5],
				fixType: FIX_TYPE[nmeaArr[6]],
				numSat: nmeaArr[7],
				horDilution: nmeaArr[8],
				alt: nmeaArr[9],
				altUnit: nmeaArr[10],
				geoidalSep: nmeaArr[11],
				geoidalSepUnit: nmeaArr[12],
				differentialAge: nmeaArr[13],
				differentialRefStn: nmeaArr[14]
			};
		}
	},
	sentenceToObj: function(nmeaStr){
		// example sentence string: $GPRMC,180826.9,V,4043.79444,N,07359.60944,W,,,160614,013.0,W,N*19
		// make it an array:
		nmeaArr = nmeaStr.split(",");
		
		// find the type
		typeProp = nmeaArr[0].slice(-3).toLowerCase(); //eg: rmc
		// process the sentence if the type is in the nmeaDecode object
		if(typeProp in nmea.decode){
			nmeaObj = nmea.decode[typeProp](nmeaArr);
		} else {
			nmeaObj = {};
			//add the sentence type as a named field
			nmeaObj.sentenceType = nmeaArr[0];
			// everything else is a numeric field
			for (var i=0; i < nmeaArr.length; i++){
				nmeaObj[i] = nmeaArr[i]; 
			}
		}
		// store the whole sentence, regardless of type
		nmeaObj.nmeaSentence = nmeaStr;		
		return nmeaObj;
	},
	/*
	Turn GPS date/time text (eg, date May 23, 2012 is 230512) into JS Date object
	function modified from https://github.com/dmh2000/node-nmea
	@udate in format ddmmyy, 	example: 160614   <-- June 16, 2014
	@utime in format hhmmss.ss, example: 180827.0 <-- 18:08:27.0
	*/
	convertGPSDateTime: function(udate, utime) {
		// if the date or time is not given, use today
		// numbers must be strings first in order to use slice()
		var D, M, Y, h, m, s;
		if (!udate){
			dt = new Date();
			D = this.zeroPad(dt.getDate());
			M = this.zeroPad(dt.getMonth());
			Y = dt.getFullYear();
		} else {
			udate = udate.toString();
			D = parseInt(udate.slice(0, 2), 10);
			M = parseInt(udate.slice(2, 4), 10);
			Y = parseInt(udate.slice(4, 6), 10) + 2000;
		}
		if (!utime){
			dt = new Date();
			h = this.zeroPad(dt.getHours());
			m = this.zeroPad(dt.getMinutes());
			s = this.zeroPad(dt.getSeconds());
		} else {
			utime = utime.toString();
			h = parseInt(utime.slice(0, 2), 10);
			m = parseInt(utime.slice(2, 4), 10);
			s = parseInt(utime.slice(4, 6), 10);
		}
		
		return new Date(Date.UTC(Y, M, D, h, m, s));
	},
	zeroPad: function(num){
		return (num < 10) ? String('0') + num : num; 
	}

};