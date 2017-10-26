var admin = require("firebase-admin");
var serviceAccount = require("./firebase_private_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://affordable-housing-22a06.firebaseio.com"
});


var ref = admin.database().ref('data');
// ref.once("value", function(data) {
//     console.log("something");
//     console.log(data.val());
// });

module.exports.firebaseRef = ref;
