# react-native-contacts-test

An integration test for [react-native-contacts](https://github.com/rt2zz/react-native-contacts).

## Install

- `yarn install`
- If you have issues when running double check installation of react-native-contacts.
- `open ios/reactNativeContactsTest.xcodeproj`
- Add permissions for CameraRoll on ios and link the library. See
  [Adding Camera Roll to an ios project in React Native](https://www.youtube.com/watch?v=e3ReNbQu79c).

## Running

### ios

- `react-native run-ios`

## android

- `react-native run-android`

## Tests

- `yarn test`

## Testing Changes

We use this repo to test changes in [react-native-contacts](https://github.com/rt2zz/react-native-contacts). To test PRs update the dependency in your copy

In `package.json`

```js
"react-native-contacts": "username/react-native-contacts#branch-name"
```

run `npm install`. Then follow regular instructions for installing above.

## wishlist

- TextInput to test `get with options`
- TextInput to test `groups`
- use https://github.com/marak/Faker.js/ to quickly load an emulator with sample contacts.
