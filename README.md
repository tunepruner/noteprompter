# NotePrompter

An app which provides prompts (note names, chord names, scale names, etc) for use in musical training of any kind. 

See the figma design [here](https://www.figma.com/file/2IR1FbthGus1OufkmFWkGW/Untitled?type=design&node-id=0%3A1&mode=dev&t=Y9OVKelz22WWL2ex-1)

Here is the [current state of the app](https://drive.google.com/file/d/1iM9s4scZdZpwwpKqh8qIgQxX_xj8W2Cn/view?usp=drive_link)

# Running the app

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.