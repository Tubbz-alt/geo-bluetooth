Geo-Blueotooth

This is a project to test reading GPS data from a Garmin GLO via Bluetooth. It uses Don Coleman's [BluetoothSerial plugin for PhoneGap/Cordova](https://github.com/don/BluetoothSerial).


To install the project:

* Clone this repo

 $ git clone https://github.com/tigoe/geo-bluetooth

* change directories to the repo:

	$ cd geo-bluetooth
	
* Add the Android platform:

	$ cordova platform add android

* Add the Bluetooth plugin:

	$ cordova plugin add com.megster.cordova.bluetoothserial

* Plug in your android device, then compile and run:

	$ cordova run

## To set up CouchDB for use with the app.

* Download and install CouchDB for OSX as described in <http://docs.couchdb.org/en/latest/install/mac.html#installation-using-the-apache-couchdb-native-application>

* Confirm that Couch is running by visiting localhost:5984/_utils in a browser. This is the GUI interface for CouchDB, called *Futon*

* In Futon, choose "Create New Database" and call the new database whatever you like. 

* In OSX System Preferences > Network, find your IP address. It will say something like, *"Wi-Fi is connected to MyAwesomeNetwork and has the IP address 192.168.1.2"*

* Test that the IP address works on your Android by typing it into a browser on your device (assuming your computer and your handheld are on the same network).

* Confirm that CouchDB is available on your Android device: In a mobile browser, type the IP address from above and add the port number, eg., 192.168.1.3:5984. If it works, you'll see a short JSON string, like 

	{"couchdb":"Welcome","uuid":"fec59fb0d1263eb47eea6c05b472c14c","version":"1.5.1","vendor":{"version":"1.5.1","name":"The Apache Software Foundation"}}

* In the geo-bluetooth application, under "Configure CouchDB", set the *Server URL* to http://YOUR_IP_ADDRESS:5984/ as above (http and trailing slash are important) and *Database Name* to the name of the CouchDB database you just created.


