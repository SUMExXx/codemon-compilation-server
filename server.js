const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cppRoutes = require('./routes/cppRoutes')
const javaRoutes = require('./routes/javaRoutes')
const arenaCppRoutes = require('./routes/arenaCppRoutes')
const { exec } = require('child_process');
require('dotenv').config()

const containerModule = require('./cpp_containers');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 100 requests per windowMs
});

var app = express()

// app.use(limiter);

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.set('trust proxy', 1);

// app.use((err, req, res, next) => {
//   if (err instanceof RateLimitError) {
//     res.status(429).json({ error: 'Rate limit exceeded' });
//   } else {
//     next();
//   }
// });

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specified headers
  res.setHeader('Access-Control-Allow-Credentials', true); // Allow credentials
  next();
});

const port = process.env.PORT || 8080;

app.use('/cpp', cppRoutes);

app.use('/java', javaRoutes);

app.use('/arenaCpp', arenaCppRoutes);

containerModule.initializeCPPContainers()

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

function cleanup() {
    console.log('Cleaning up...');
    exec(`docker stop $(docker ps -q)`, (error, stdout) => {
        console.log(error);
        if(error == null){
            console.log(`docker containers closed`)
        }
    })
  }
  
// Handle process termination signals
process.on('SIGINT', () => {
console.log('SIGINT signal received.');
server.close(() => {
    console.log('Server closed.');
    cleanup();
    process.exit(0);
});
});

process.on('SIGTERM', () => {
console.log('SIGTERM signal received.');
server.close(() => {
    console.log('Server closed.');
    cleanup();
    process.exit(0);
});
});

// Optionally handle uncaught exceptions or unhandled rejections
process.on('uncaughtException', (err) => {
console.error('Uncaught Exception:', err);
cleanup();
process.exit(1);
});

process.on('unhandledRejection', (err) => {
console.error('Unhandled Rejection:', err);
cleanup();
process.exit(1);
});