
## Vending Machine
This backend APP is a simple platform powered by Node.js and Express, offering a straightforward experience for buyers and sellers. With practical API endpoints, it manages user authentication, product actions, and transactions. Utilizing MongoDB for data storage and JWT tokens for security, it's as straightforward as operating a vending machine.

## Key Features:
 - User Management: Create accounts, log in securely, and manage deposits.
 - Product Operations: Add, update, and delete products with role-based access control.
 - Transaction Processing: Buy products, ensuring stock availability and managing user credits.
 - Flexible and Secure: JWT-based authentication, and error handling for a reliable experience.

Make sure you have the following installed before running the app:
- Node.js (https://nodejs.org/en) - Version 20 is recommended.
- MongoDB (https://www.mongodb.com/try/download) - Make sure MongoDB server is running.

## Getting Started

## 🔗 1. Clone the Repository

- git clone < repository-url >
- cd < project-folder >

## 💻 2. Install Dependencies

npm install

## 🔑 3. Set Up Environment Variables
Duplicate the .env.example file and rename it to .env. Update the values for MongoDB connection.

 - DEVELOP_DATABASE=mongodb+srv://<username>:<password>@beyondthebasics.abcde.mongodb.net/test
 - JWT_KEY=your_top_secret_token


## 🚀 4. Run the Application

 - npm start
   
The server will run on http://localhost:5001

## 🗂 Project Structure

The project structure is organized as follows:

- **server.ts**: Entry point of the application.

- **/controllers**: Handles the application logic.

- **/middleware**: Custom middleware functions

- **/models**: Defines MongoDB data models.

- **/routes**: Defines API routes.

- **/utils**: Utility functions.

- **/tests**: Contains test files.

## 🚦 API Endpoints:

### User Operations:

- **POST /user/signup**: Create a new user
  - Request Body: `{ "username": string, "password": string, "role": "buyer" || "seller" }`

- **POST /user/login**: Login to the app
  - Request Body: `{ "username": string, "password": string }`

- **POST /user/deposit**: Deposit money to account (Requires "buyer" role and a 'Bearer token' in headers)
  - Request Body: `{ "amount": number }`

- **GET /user/reset**: Reset your deposit amount (Requires "buyer" role and a 'Bearer token' in headers)

### Product Operations:

- **GET /products**: Get all products from the database (No authentication required)

- **POST /products/add**: Add a new product (Requires "seller" role and a 'Bearer token' in headers)
  - Request Body: `{ "cost": number, "amountAvailable": number, "productName": string }`

- **PATCH /products/update/:productId**: Update a product (Requires product owner and a 'Bearer token' in headers)
  - Request Body (any of): `{ "cost": number, "amountAvailable": number, "productName": string }`

- **DELETE /products/delete/:productId**: Delete a product (Requires product owner and a 'Bearer token' in headers)

- **POST /products/buy**: Buy a product (Requires "buyer" role and a 'Bearer token' in headers)
  - Request Body: `{ "productId": string, "amount": number }`


## 🧪 Testing
To run tests:

npm test
