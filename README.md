
# 91Ninja - Real-Time Developer Chatroom

91Ninja is a real-time chat application built using React and Firebase (Firestore and Authentication). Users can create and join chat rooms instantly, enabling seamless communication among developers and other users.

## Features

- **Real-time messaging**: Messages are updated instantly across all connected clients using Firebase Firestore.
- **User authentication**: Users can sign up and log in using Firebase Authentication.
- **Create and join chat rooms**: Users can create new chat rooms or join existing ones by simply entering the room code.
- **Responsive design**: The app is fully responsive and works on both desktop and mobile devices.
- **Lightweight and fast**: Deployed on Netlify for fast and reliable performance.

## Tech Stack

- **Frontend**: React.js
- **Backend**: Firebase Firestore and Authentication
- **Hosting**: Netlify

## Installation

To run this project locally:

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/91Ninja.git
   ```

2. Navigate to the project directory:

   ```bash
   cd 91Ninja
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and add your Firebase configuration:

   ```env
   REACT_APP_API_KEY=your_api_key
   REACT_APP_AUTH_DOMAIN=your_auth_domain
   REACT_APP_PROJECT_ID=your_project_id
   REACT_APP_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_APP_ID=your_app_id
   ```

5. Start the development server:

   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000`.

## Live Demo

Check out the live demo: [91Ninja](https://91ninja.netlify.app/)

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License.