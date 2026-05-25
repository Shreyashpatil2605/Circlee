# Circlee 

A real-time, cross-platform social media application built with React Native, inspired by X (formerly Twitter). 

## 🚀 Tech Stack

*   **Frontend:** React Native, Expo, React Navigation
*   **Backend & Database:** Convex (Real-time database, serverless functions)
*   **Authentication:** Clerk
*   **Styling:** Custom styling with Glass-morphism UI elements
*   **Language:** TypeScript

## ✨ Key Features

*   **Secure Authentication:** User onboarding and authentication powered by Clerk.
*   **Real-time Interactions:** Feed updates and real-time messaging powered by Convex WebSockets.
*   **User Profiles:** Edit profiles and manage user data securely.
*   **Cross-Platform:** Works seamlessly on both iOS and Android.
*   **Modern UI:** Features a sleek glass-bottom tab bar and smooth micro-animations.

## 🛠️ Project Structure

This is a monorepo setup containing the following key directories:

*   `/mobile`: Contains the React Native Expo application.
*   `/convex`: Contains the backend database schema, queries, and mutations using Convex.
*   `/backend`: Additional backend services (if applicable).

## 🏃‍♂️ Getting Started

### Prerequisites

*   Node.js installed
*   Expo CLI installed (`npm install -g expo-cli`)
*   A Convex account and Clerk account (for environment variables)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Shreyashpatil2605/Circlee.git
    cd Circlee
    ```

2.  **Set up the mobile app:**
    ```bash
    cd mobile
    npm install
    ```

3.  **Set up Convex:**
    ```bash
    cd ../
    npm install
    npx convex dev
    ```

4.  **Environment Variables:**
    Create a `.env` file in the `mobile` directory and add your Clerk publishable key and Convex URL:
    ```env
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
    EXPO_PUBLIC_CONVEX_URL=your_convex_url
    ```

5.  **Run the App:**
    ```bash
    cd mobile
    npx expo start
    ```
    *Use the Expo Go app on your phone, or an iOS/Android emulator to view the app.*

## 📝 License

This project is licensed under the MIT License.
