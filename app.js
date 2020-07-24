// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START appengine_websockets_app]
const app = require('express')();

const server = require('http').Server(app);
const io = require('socket.io')(server);
const { connect } = require('mongoose')
const { DB, PORT } = require('./config')
const { success, error } = require('consola')
const formatMessage = require('./utils/messages');
const Chat = require('./models/message')
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');


app.get('/', (req, res) => {
  res.status(200).json({ message: "Done" })
})



// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room, role }) => {
    const user = userJoin(socket.id, username, room, role);

    socket.join(user.room);



    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg, user.role));
    // Broadcast when a user connects
    connect.then(async db => {
      console.log("connected correctly to the server");

      let chatMessage = new Chat({ username: user.username, text: user.text, role: user.role, time: moment().format('MMMM Do YYYY, h:mm:ss a') });
       await chatMessage.save();
    });
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage('', `${user.username} has left the class`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const startSocket = async () => {
  
  try {
    if (module === require.main) {
      await connect(DB, {
        useFindAndModify: true,
        useUnifiedTopology: true,
        useNewUrlParser: true
      });
      success({
        message: `Successfully connected with the Database \n${DB}`,
        badge: true
      });

      const PORT = process.env.PORT || 8080;
      server.listen(PORT, () => {
        console.log(`App listening on port ${PORT}`);
        console.log('Press Ctrl+C to quit.');
      });
    }
  } catch (err) {
     error({
      message: `Unable to connect with Database \n${err}`,
      badge: true
    });
    startSocket();
  }
 
}
startSocket();
// [END appengine_websockets_app]
