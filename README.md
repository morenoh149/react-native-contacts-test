# react-native-contacts-test

An integration test for [react-native-contacts](https://github.com/rt2zz/react-native-contacts)

## Install
* `$ npm install`
* `$ react-native link react-native-contacts`
* add platform specific permissions configuration. See readme for react-native-contacts.
* add permissions for CameraRoll on ios. See
[CameraRoll permissions](https://facebook.github.io/react-native/docs/cameraroll.html#permissions)
and [Adding Camera Roll to an ios project in React Native](https://www.youtube.com/watch?v=e3ReNbQu79c).

## Running
### ios
* `$ react-native run-ios`

## android
* `$ react-native run-android`

## Testing Changes
We use this repo to test changes to the main project. Update the dependency to
```js
"react-native-contacts": "username/react-native-contacts#branch-name"
```
and `npm install`. Then follow the instructions above for installing.

## wishlist

* TextInput to test `get with options`
* TextInput to test `groups`
