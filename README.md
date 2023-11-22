# Node/Express-MongoDB REST API

This project is a Node.js/Express backend application that uses MongoDB as its database for a REST API.

Make sure you have the following installed before running the app:
- Node.js (https://nodejs.org/en) - Version 20 is recommended.
- MongoDB (https://www.mongodb.com/try/download) - Make sure MongoDB server is running.

## Getting Started

🔗 1. Clone the Repository

git clone <repository-url>
cd <project-folder>

💻 2. Install Dependencies

npm install

🔑 3. Set Up Environment Variables
Duplicate the .env.example file and rename it to .env. Update the values for MongoDB connection.

DEVELOP_DATABASE=mongodb+srv://<username>:<password>@beyondthebasics.abcde.mongodb.net/test
JWT_KEY=your_top_secret_token


 🚀 4. Run the Application

npm start
The server will run on http://localhost:5001/

🗂 Project Structure
The project structure is organized as follows:

server.ts: Entry point of the application.
/controllers: Handles the application logic.
/middleware: Custom middleware functions - Auth. 
/models: Defines MongoDB data models.
/routes: Defines API routes.
/utils: Utility functions.
/tests: Contains test files.

🚦API Endpoints:

POST /user/signup : Create a new user ({username: string, password: string, role: "buyer" || "seller"}).
POST /user/login : Login to the app ({username: string, password: string}).
POST /user/deposit : Deposit money to account. (You need to have a "buyer" role and to provide a 'Bearer token' in headers.) ({amount: number})
GET /user/reset : Reset your deposit amount. (You need to have a "buyer" role and to provide a 'Bearer token' in headers.)

GET /products : Get all the products from the database. (No need for authentication)
POST /add : Add a new product. (You need to have a "seller" role and to provide a 'Bearer token' in headers.) ({cost: number, amountAvailable: number, productName: string})
PATCH /update/:productId : Updates a product. (You need to be the product owner and and to provide a 'Bearer token' in headers.)(any of: {cost: number, amountAvailable: number, productName: string})
DELETE /delete/:productId : Deletes a product. (You need to be the product owner and and to provide a 'Bearer token' in headers.)
POST /buy : Buy a product (You need to have a "buyer" role and to provide a 'Bearer token' in headers.) ({productId: string, amount: number})

🧪 Testing
To run tests:

npm test
