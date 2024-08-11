This is the compilation server that takes input from backend to process c++ and java codes and also match testcases.

dependencies: npm i

running in development mode: npm run dev
running in production mode: npm start

## Dependencies

This project relies on the following npm packages:

- **[codemon](#)**: Local package for handling code compilation and execution.
- **[cors](https://www.npmjs.com/package/cors)**: Middleware for enabling Cross-Origin Resource Sharing (CORS).
- **[dotenv](https://www.npmjs.com/package/dotenv)**: Module for loading environment variables from a `.env` file.
- **[express](https://www.npmjs.com/package/express)**: Web framework for Node.js.
- **[express-rate-limit](https://www.npmjs.com/package/express-rate-limit)**: Middleware for rate-limiting requests to APIs.
- **[nodemon](https://www.npmjs.com/package/nodemon)**: Tool for automatically restarting the server during development.

Make sure to install these dependencies by running:

```bash
npm install