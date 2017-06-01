"use strict";

import React, {Component} from "react";
import {View, Text, Platform, StyleSheet, CameraRoll} from "react-native";
import Button from "./Button";
import invariant from "invariant";
import _ from "lodash";
import Contacts from "react-native-contacts";
import Timer from "./timer";

const PREFIX = 'ReactNativeContacts__';
const LOAD_TEST_SIZE = 4000;

export default class RNContactsTest extends Component {

  constructor(props) {
    super(props);

    this.addContact = this.addContact.bind(this);
    this.getContactsMatchingString = this.getContactsMatchingString.bind(this);
    this.updateContact = this.updateContact.bind(this);
    this.loadTest = this.loadTest.bind(this);
  }

  //todo: add / update addresses
  //todo: load test

  componentWillMount() {
    const self = this;

    RNContactsTest.getPhotosFromCameraRoll(2)
      .then((data) => {
        self.defaultImage = data.edges[0].node.image.uri;
        self.otherImage = data.edges[1].node.image.uri;
      });
  }

  getAll() {
    Contacts.getAll((err, data) => {
      if (err)
        throw err;

      for (let item of data) {
        console.log('getAll:', item)
      }
    })
  }

  getAllWithoutPhotos() {
    Contacts.getAllWithoutPhotos((err, data) => {
      if (err)
        throw err;

      for (let item of data) {
        console.log('getAllWithoutPhotos:', item)
      }
    })
  }

  getPhotoForId() {
    Contacts.getAllWithoutPhotos((err, data) => {
      if (err)
        throw err;

      const item = data.filter((item) => item.hasThumbnail)[0];

      Contacts.getPhotoForId(item.recordID, (err, icon) => {
        if (err) {
          console.warn("error getting photo", err);
        } else {
          console.log("icon", icon);
        }
      })
    })
  }

  updateContact() {
    Contacts.getAll((err, data) => {
      const originalRecord = _.find(data, (contact) => contact.givenName && contact.givenName.indexOf(PREFIX) === 0);
      if (!originalRecord)
        throw new Error("add a contact before calling delete");

      const pendingRecord = _.cloneDeep(originalRecord);
      pendingRecord.familyName = (originalRecord.familyName + RNContactsTest.rand()).slice(0, 20);
      pendingRecord.emailAddresses.push({email: 'addedFromRNContacts@example.com', label: 'other'});
      pendingRecord.phoneNumbers.push({number: "44444", label: 'iPhone'});
      pendingRecord.thumbnailPath = this.otherImage;//how to test this?

      //todo - update more fields

      Contacts.updateContact(pendingRecord, (err, data) => {
        if (err) throw err;

        Contacts.getAll((err, data) => {
          const updatedRecord = _.find(data, {recordID: originalRecord.recordID});

          console.log('original record:', originalRecord);
          console.log('updated record:', updatedRecord);

          invariant(updatedRecord.familyName !== originalRecord.familyName, 'family name was not updated');
          invariant(updatedRecord.familyName === pendingRecord.familyName, 'family name was not updated');
          invariant(updatedRecord.emailAddresses.length === originalRecord.emailAddresses.length + 1, 'Email address array is not length one greater than original record');
          invariant(updatedRecord.phoneNumbers.length === originalRecord.phoneNumbers.length + 1, 'Email address array is not length one greater than original record');
        })
      })
    })
  }

  addContact() {
    const newContact = this._contact();

    Contacts.addContact(newContact, (err, addedContact) => {
      if(!addedContact.recordID) {
        console.log("Added contact does not have a recordID", addedContact);
      }

      Contacts.getAll((err, records) => {
        const contact = _.find(records, {givenName: newContact.givenName});

        console.log('attempted to add:', newContact);
        console.log('after add:', contact);

        _.each(newContact, (value, key) => {

          const expected = newContact[key];
          const actual = contact[key];

          if (Array.isArray(expected))
            invariant(expected.length === actual.length, 'contact values !isEqual for ' + key);
          else if (key === 'thumbnailPath' && Platform.OS === 'ios') {
            // thumbnailPath will change intentionally as the source url is saved to the contacts db (and then cached in iOS)
          } else {
            invariant(_.isEqual(expected, actual), 'contact values !isEqual for ' + key + ", expected '" + expected + "' but got '" + actual + "'")
          }
        })
      })
    })
  }

  getContactsMatchingString() {
    const newContact = this._contact();
    console.log('getContactsMatchingString: starting', newContact);
    Contacts.addContact(newContact, (error, addedContact) => {
      if(!addedContact.recordID) {
        console.log("Added contact does not have a recordID", addedContact);
      }
      Contacts.getContactsMatchingString(addedContact.familyName, (err, data) => {
        if (err)
          throw err;
        for (let item of data) {
          console.log('getContactsMatchingString:', item);
          if (item.familyName === addedContact.familyName) {
            invariant(_.isEqual(item.familyName, addedContact.familyName), 'contact returned should match contact added');
            console.log('getContactsMatchingString:', item);
            break;
          }
        }
      })
    })
  }

  deleteContact() {
    Contacts.getAll((err, contactsBefore) => {
      const contactToDelete = _.find(contactsBefore, (contact) => contact.givenName && contact.givenName.indexOf(PREFIX) === 0);
      if (!contactToDelete)
        throw new Error("add a contact before calling delete");

      console.log('attempting to delete', contactToDelete);

      Contacts.deleteContact(contactToDelete, (err, data) => {
        Contacts.getAll((err, contactsAfter) => {
          console.log('resultant list', contactsAfter);

          invariant(contactsAfter.length === contactsBefore.length - 1, 'getAll should return one less result');
          invariant(!_.find(contactsAfter, {recordID: contactToDelete.recordID}), 'contact should not longer exist')
        })
      })
    })
  }

  loadTest() {
    console.log("Running load test, please wait...",);

    const timer = new Timer();

    console.log("Adding", LOAD_TEST_SIZE, "test contacts");

    this._addContacts(LOAD_TEST_SIZE)
      .then(() => {
        console.log("time to add contacts", timer.printTimeSinceLastCheck());

        Contacts.getAllWithoutPhotos((err, data) => {
          let toDelete = data.filter((contact) => contact.givenName && contact.givenName.indexOf(PREFIX) === 0);

          if(toDelete.length < LOAD_TEST_SIZE) {
            console.warn("did not find the expected number of test contacts", toDelete.length, "!==", LOAD_TEST_SIZE);
          }

          console.log("Found", toDelete.length, "test contacts");

          console.log("Loading", toDelete.length, "contacts");

          this._getAll()
            .then(() => {
              console.log("time to getAll", timer.printTimeSinceLastCheck());

              console.log("Loading contacts without photos");

              return this._getAllWithoutPhotos();
            })
            .then(() => {
              console.log("time to getAllWithoutPhotos", timer.printTimeSinceLastCheck());

              console.log("Loading contacts thumbnails");

              return this._getAllThumbnails(toDelete.slice());
            })
            .then(() => {
              console.log("time to get thumbnails", timer.printTimeSinceLastCheck());
            })
            .catch((err) => {
              console.warn("error", err);
            })
            .then(() => {
              console.log("Deleting", toDelete.length, "contacts");

              return this._deleteAll(toDelete);
            })
            .then(() => {
              console.log("time to delete contacts", timer.printTimeSinceLastCheck());
            });
        });
      })
  }

  _addContacts(size) {
    const self = this;

    const work = [];

    for (let i = 0; i < size; i++) {
      work.push(new Promise(function (fulfill, reject) {
        Contacts.addContact(self._contact(), (err, res) => {
          console.log("Added contact", i, res);
          fulfill();
        })
      }));
    }

    return RNContactsTest._execute(work);
  }

  _getAll() {
    return new Promise(function (fulfill, reject) {
      Contacts.getAll((err, data) => {
        fulfill();
      });
    });
  }

  _getAllWithoutPhotos() {
    return new Promise(function (fulfill, reject) {
      Contacts.getAllWithoutPhotos((err, data) => {
        fulfill();
      });
    });
  }

  _getAllThumbnails(contacts) {
    const work = contacts.map((contact) => new Promise(function (fulfill, reject) {
      Contacts.getPhotoForId(contact.recordID, (err, icon) => {
        fulfill();
      });
    }));

    return RNContactsTest._execute(work);
  }

  _deleteAll(contacts) {
    const work = contacts.map((contact) => new Promise(function (fulfill, reject) {
      Contacts.deleteContact(contact, (err, icon) => {
        fulfill();
      });
    }));

    return RNContactsTest._execute(work);
  }

  static _execute(promises) {
    if (promises.length === 0) {
      return Promise.resolve();
    } else {
      return Promise.resolve(promises.pop())
        .then(() => {
          return RNContactsTest._execute(promises);
        });
    }
  }

  static rand() {
    return Math.floor(Math.random() * 99999999);
  }

  static getPhotosFromCameraRoll(count, after) {
    const fetchParams = {
      first: count,
      groupTypes: "SavedPhotos",
      assetType: "Photos"
    };

    if (after) {
      fetchParams.after = after;
    }

    if (Platform.OS === "android") {
      // not supported in android
      delete fetchParams.groupTypes;
    }

    console.log("Loading photos from camera roll", count);

    return CameraRoll.getPhotos(fetchParams);
  }

  _contact() {
    return {
      givenName: PREFIX + "givenName" + RNContactsTest.rand(),
      familyName: PREFIX + "familyName" + RNContactsTest.rand(),
      middleName: PREFIX + "middleName" + RNContactsTest.rand(),
      jobTitle: PREFIX + "jobTitle" + RNContactsTest.rand(),
      company: PREFIX + "company" + RNContactsTest.rand(),
      emailAddresses: [
        {email: PREFIX + '1@example.com', label: 'work'},
        {email: PREFIX + '2@example.com', label: 'personal'}
      ],
      phoneNumbers: [
        {number: "11111", label: 'main'},
        {number: "22222", label: 'mobile'},
        {number: "33333", label: 'home'},
      ],
      thumbnailPath: this.defaultImage
    };
  }

  render() {
    return (
      <View>
        <Text style={styles.hello}>All results are console.log'ed</Text>
        <Button text="get all contacts" onPress={this.getAll}/>
        <Button text="get all contacts (without photos)" onPress={this.getAllWithoutPhotos}/>
        <Button text="get contacts matching string" onPress={this.getContactsMatchingString}/>
        <Button text="getPhotoForId" onPress={this.getPhotoForId}/>
        <Button text="add contact" onPress={this.addContact}/>
        <Button text="update contact" onPress={this.updateContact}/>
        <Button text="delete contact" onPress={this.deleteContact}/>
        <Button text={"performance test (" + LOAD_TEST_SIZE + " contacts)"} onPress={this.loadTest}/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {},
  hello: {padding: 15},
});
