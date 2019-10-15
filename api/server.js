const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const sessions = require('express-session');
const KnexSessionStore = require('connect-session-knex')(sessions); // <<<< for storing sessions in db

const authRouter = require('../auth/auth-router.js');
const usersRouter = require('../users/users-router.js');
const knexConfig = require('../database/dbConfig.js');

const server = express();

const sessionConfiguration = {
  name: 'ohfosho', //default would be "sid" but is not secure
  secret: 'keep it secret, keep it safe!', //should be a secret enviornment variable (anything that changes for production should be in enviornment)
  cookie: {
    httpOnly: true, //js cannot access cookie
    maxAge: 1000 * 60 *60, //expiration time in milliseconds
    secure: false //process.env.NODE_ENV === production ? true : false //use cookie over https only. should be true in production
  },
  resave: false,
  saveUninitialized: true, //GDPR complicance (should be false but is true for the purpose of this exersize)

  // change to use our database instead of memory to save the sessions
  store: new KnexSessionStore({
    knex: knexConfig,
    createtable: true, // automatically create the sessions table
    clearInterval: 1000 * 60 * 30, // delete expired sessions every 30
  }),
};

server.use(sessions(sessionConfiguration));
server.use(helmet());
server.use(express.json());
server.use(cors());

server.use('/api/auth', authRouter);
server.use('/api/users', usersRouter);

server.get('/', (req, res) => {
  res.json({ api: 'up' });
});

module.exports = server;
