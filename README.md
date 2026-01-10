# Huggle Buyer App

The Huggle Buyer App is a mobile application built for the Huggle platform, designed to help customers browse products, find stores, manage orders, and chat with merchants. It is built using **Expo** and **React Native**.

## Features

- **Store Discovery**: Find popular stores and products nearby using Google Maps integration.
- **Product Browsing**: View trending products, bundles, and detailed product information.
- **Shopping Cart & Checkout**: Manage cart items and place orders.
- **Chat**: Real-time messaging with stores powered by [Stream Chat](https://getstream.io/).
- **User Authentication**: Secure login and registration using [Clerk](https://clerk.com/).
- **Order Management**: Track order status and view history.
- **Social Feed**: View posts from followed stores.

## Architecture

The project follows a standard Expo/React Native directory structure:

- **`app/`**: Contains the Expo Router file-based routing.
    - `(tabs)`: Main tab navigation (Home, Search, Orders, Profile).
    - `(screens)`: Modal and stack screens.
- **`components/`**: Reusable UI components.
- **`constants/`**: Configuration constants, theme settings, and API endpoints.
- **`context/`**: React Context providers for global state (Auth, Chat, Location, Cart).
- **`hooks/`**: Custom React hooks.
- **`services/`**: API service layers for interacting with the backend.
- **`types/`**: TypeScript type definitions.
- **`utils/`**: Helper functions.

## Tech Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 50+)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React Native](https://reactnative.dev/), [React Native Paper](https://callstack.github.io/react-native-paper/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Maps**: [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- **Chat**: [Stream Chat](https://getstream.io/chat/docs/react-native/)
- **Networking**: [Axios](https://axios-http.com/)

## Prerequisites

Before you begin, ensure you have the implementation environment set up:

- **Node.js**: (LTS version recommended)
- **npm** or **yarn**
- **Expo Go** app on your mobile device (Android/iOS) OR an Android/iOS emulator.

## Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd huggle-buyer-app
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Variables:**

    Create a `.env` file in the root directory and add the following keys:

    ```env
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
    EXPO_PUBLIC_STREAM_API_KEY=your_stream_api_key
    ```
    
    *Note: Contact the team lead for development keys.*

## Running the App

Start the development server:

```bash
npm start
# or
npx expo start
```

- **Run on Android**: Press `a` in the terminal (requires Android Studio/Emulator).
- **Run on iOS**: Press `i` in the terminal (requires Xcode/Simulator - macOS only).
- **Run on Web**: Press `w` in the terminal.
- **Run on Device**: Scan the QR code with the Expo Go app (Android) or Camera app (iOS).

## Scripts

- `npm start`: Starts the Expo development server.
- `npm run android`: Runs the app on an Android emulator/device.
- `npm run ios`: Runs the app on an iOS simulator/device.
- `npm run lint`: Lints the codebase using ESLint.

## Contributing

1.  Create a new branch for your feature or fix.
2.  Commit your changes with clear messages.
3.  Push your branch and submit a Pull Request.

## License

[License Name]
