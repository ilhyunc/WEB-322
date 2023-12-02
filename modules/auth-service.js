require('dotenv').config();
const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let userSchema = new Schema({
  userName: { type: String, unique: true },
  password: String,
  email: String,
  loginHistory: [{
    dateTime: Date,
    userAgent: String
  }]
});

let User; // to be defined on new connection (see initialize)

// Exported Functions
function initialize() {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGODB);

    db.on('error', (err) => {
      reject(err); // reject the promise with the provided error
    });
    db.once('open', () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
}

function registerUser(userData) {
  return new Promise((resolve, reject) => {
    // Check if passwords match
    if (userData.password !== userData.password2) {
      reject('Passwords do not match');
    } else {
      // Create a new User object
      let newUser = new User(userData);

      // Save the new user to the database
      newUser.save()
        .then(() => {
          resolve(); // Resolve the promise if user creation is successful
        })
        .catch(err => {
          if (err.code === 11000) {
            reject('User Name already taken');
          } else {
            reject(`There was an error creating the user: ${err}`); // Reject with error message
          }
        });
    }
  });
}

function checkUser(userData) {
  return new Promise((resolve, reject) => {
    User.find({ userName: userData.userName })
      .then(users => {
        if (users.length === 0) {
          reject(`Unable to find user: ${userData.userName}`);
        } 
        else if (users[0].password !== userData.password) {
          reject(`Incorrect Password for user: ${userData.userName}`);
        } 
        else {
          // Successful authentication
          const user = users[0];
          if (user.loginHistory.length === 8) {
            user.loginHistory.pop();
          }
          user.loginHistory.unshift({ dateTime: new Date().toString(), userAgent: userData.userAgent });

          // Update login history in the database
          User.updateOne({ userName: user.userName }, { $set: { loginHistory: user.loginHistory } })
            .then(() => {
                resolve(user);
                reject(`There was an error updating login history for user: ${userData.userName}`);
            })
            .catch(err => {
              reject(`There was an error updating login history for user: ${userData.userName} - ${err}`);
            });
        }
      })
      .catch(err => {
        reject(`Unable to find user: ${userData.userName}`);
      });
  });
}


module.exports = { initialize, registerUser, checkUser };
