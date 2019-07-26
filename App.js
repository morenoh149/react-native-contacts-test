import React, { Component } from "react";
import {
  Button,
  CameraRoll,
  Platform,
  StyleSheet,
  Text,
  View
} from "react-native";
import Contacts from "react-native-contacts";
import Timer from "./timer";

const PREFIX = "ReactNativeContacts__";
const LOAD_TEST_SIZE = 10000;

export default class RNContactsTest extends Component {
  componentWillMount() {
    this.getPhotosFromCameraRoll(2).then(data => {
      console.log("cwm", data);
      if (data.edges.length > 0) {
        self.defaultImage = data.edges[0].node.image.uri;
        self.otherImage = data.edges[1].node.image.uri;
      }
    });
  }

  /*
   * getAll reads all of the phone contacts and logs the count.
   */
  getAll = () => {
    console.log("getAll: ...");
    Contacts.getAll((err, data) => {
      if (err) {
        throw err;
      }

      if (data.length > 20) {
        console.log("getAll:", data.length);
      } else {
        data.forEach(contact => console.log("getAll:", contact));
      }
    });
  };

  /*
   * getAllWithoutPhotos reads all contacts that don't have a photo and logs
   * the count.
   */
  getAllWithoutPhotos = () => {
    console.log("getAllWithoutPhotos: ...");
    Contacts.getAllWithoutPhotos((err, data) => {
      if (err) {
        throw err;
      }

      if (data.length > 20) {
        console.log("getAllWithoutPhotos:", data.length);
      } else {
        data.forEach(contact => console.log("getAllWithoutPhotos:", contact));
      }
    });
  };

  getPhotoForId = () => {
    Contacts.getAllWithoutPhotos((err, data) => {
      if (err) {
        throw err;
      }

      const item = data.filter(item => item.hasThumbnail)[0];
      Contacts.getPhotoForId(item.recordID, (err, icon) => {
        if (err) {
          console.warn("error getting photo", err);
        } else {
          console.log("icon", icon);
        }
      });
    });
  };

  requestAndroidPermissions = () => {
    Contacts.requestPermission((err, data) => {
      if (err) {
        throw err;
      }

      console.log("Permission Granted", data);
    });
  };

  updateContact = () => {
    Contacts.getAll((err, data) => {
      const originalRecord = _.find(
        data,
        contact => contact.givenName && contact.givenName.indexOf(PREFIX) === 0
      );
      if (!originalRecord) {
        throw new Error("add a contact before calling delete");
      }

      const pendingRecord = _.cloneDeep(originalRecord);
      pendingRecord.familyName = (
        originalRecord.familyName + RNContactsTest.rand()
      ).slice(0, 20);
      pendingRecord.emailAddresses.push({
        email: "addedFromRNContacts@example.com",
        label: "other"
      });
      pendingRecord.phoneNumbers.push({ number: "44444", label: "iPhone" });
      pendingRecord.thumbnailPath = this.otherImage; //how to test this?
      pendingRecord.birthday = { year: 1990, month: 1, day: 28 };
      pendingRecord.note = (originalRecord.note + RNContactsTest.rand()).slice(
        0,
        2
      );
      pendingRecord.urlAddresses.push({ url: "www.jung.com", label: "home" });

      // TODO - update more fields

      Contacts.updateContact(pendingRecord, (err, data) => {
        if (err) {
          throw err;
        }

        Contacts.getAll((err, data) => {
          const updatedRecord = _.find(data, {
            recordID: originalRecord.recordID
          });
          console.log("original record:", originalRecord);
          console.log("updated record:", updatedRecord);
          if (updatedRecord.familyName !== originalRecord.familyName) {
            console.error("family name was not updated");
          }
          if (updatedRecord.familyName === pendingRecord.familyName) {
            console.error("family name was not updated");
          }
          if (
            updatedRecord.emailAddresses.length ===
            originalRecord.emailAddresses.length + 1
          ) {
            console.error(
              "Email address array is not length one greater than original record"
            );
          }
          if (
            updatedRecord.phoneNumbers.length ===
            originalRecord.phoneNumbers.length + 1
          ) {
            console.error(
              "Email address array is not length one greater than original record"
            );
          }
          if (updatedRecord.birthday.year !== originalRecord.birthday.year) {
            console.error("birthday year was not updated");
          }
          if (updatedRecord.birthday.year === pendingRecord.birthday.year) {
            console.error("birthday year was not updated");
          }
          if (updatedRecord.note !== originalRecord.note) {
            console.error("note was not updated");
          }
          if (updatedRecord.note === pendingRecord.note) {
            console.error("note was not updated");
          }
          if (
            updatedRecord.urlAddresses.length ===
            originalRecord.urlAddresses.length + 1
          ) {
            console.error(
              "Url address array is not length one greater than original record"
            );
          }
        });
      });
    });
  };

  addContact = () => {
    const newContact = this._contact();

    Contacts.addContact(newContact, (err, addedContact) => {
      if (!addedContact.recordID) {
        console.log("Added contact does not have a recordID", addedContact);
      }

      Contacts.getAll((err, records) => {
        const contact = _.find(records, { givenName: newContact.givenName });
        console.log("attempted to add:", newContact);
        console.log("after add:", contact);
        _.each(newContact, (value, key) => {
          const expected = newContact[key];
          const actual = contact[key];

          if (Array.isArray(expected)) {
            if (expected.length === actual.length) {
              console.error(`contact values !isEqual for ${key}`);
            }
          } else if (key === "thumbnailPath" && Platform.OS === "ios") {
            // thumbnailPath will change intentionally as the source url is
            // saved to the contacts db (and then cached in iOS)
          } else {
            if (_.isEqual(expected, actual)) {
              console.error(
                `contact values !isEqual for ${key}, expected ${expected} but got $'{actual}'`
              );
            }
          }
        });
      });
    });
  };

  /*
   * getContactsMacthinString makes a new contact and tests we can read it by
   * the contact's name.
   */
  getContactsMatchingString = () => {
    const newContact = this._contact();
    console.log("getContactsMatchingString: starting", newContact);
    Contacts.addContact(newContact, (error, addedContact) => {
      if (!addedContact.recordID) {
        console.log("Added contact does not have a recordID", addedContact);
      }
      Contacts.getContactsMatchingString(
        addedContact.familyName,
        (err, data) => {
          if (err) {
            throw err;
          }
          for (let i = 0; i < data.length; i++) {
            const item = data[i];
            console.log("getContactsMatchingString:", item);
            if (item.familyName != addedContact.familyName) {
              console.error(
                "contact returned should match contact added. Got",
                item.familyName,
                addedContact.familyName
              );
              break;
            }
          }
        }
      );
    });
  };

  getContactsByPhoneNumber = () => {
    const newContact = this._contact();
    console.log("getContactsByPhoneNumber: starting", newContact);
    Contacts.addContact(newContact, (error, addedContact) => {
      Contacts.getContactsByPhoneNumber(
        addedContact.phoneNumbers[0].number,
        (err, data) => {
          if (err) {
            throw err;
          }
          for (let i = 0; i < data.length; i++) {
            const item = data[i];
            console.log("getContactsByPhoneNumber:", item);
          }
        }
      );
    });
  };

  deleteContact = () => {
    Contacts.getAll((err, contactsBefore) => {
      const contactToDelete = _.find(
        contactsBefore,
        contact => contact.givenName && contact.givenName.indexOf(PREFIX) === 0
      );
      if (!contactToDelete) {
        throw new Error("add a contact before calling delete");
      }
      console.log("attempting to delete", contactToDelete);
      Contacts.deleteContact(contactToDelete, (err, data) => {
        Contacts.getAll((err, contactsAfter) => {
          console.log("resultant list", contactsAfter);

          if (contactsAfter.length === contactsBefore.length - 1) {
            console.error("getAll should return one less result");
          }
          if (!_.find(contactsAfter, { recordID: contactToDelete.recordID })) {
            console.error("contact should not longer exist");
          }
        });
      });
    });
  };

  /*
   * loadTest loads many contacts into the address book to see what happens.
   */
  loadTest = () => {
    const timer = new Timer();
    console.log(`loadTest: Adding ${LOAD_TEST_SIZE} test contacts`);

    this._addContacts(LOAD_TEST_SIZE).then(() => {
      console.log("time to add contacts", timer.printTimeSinceLastCheck());
      Contacts.getAllWithoutPhotos((err, data) => {
        let toDelete = data.filter(
          contact =>
            contact.givenName && contact.givenName.indexOf(PREFIX) === 0
        );

        if (toDelete.length < LOAD_TEST_SIZE) {
          console.warn(
            "did not find the expected number of test contacts.",
            toDelete.length,
            "!==",
            LOAD_TEST_SIZE
          );
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
            console.log(
              "time to getAllWithoutPhotos",
              timer.printTimeSinceLastCheck()
            );
            console.log("Loading contacts thumbnails");
            return this._getAllThumbnails(toDelete.slice());
          })
          .then(() => {
            console.log(
              "time to get thumbnails",
              timer.printTimeSinceLastCheck()
            );
          })
          .catch(err => {
            console.warn("error", err);
          })
          .then(() => {
            console.log("Deleting", toDelete.length, "contacts");
            return this._deleteAll(toDelete);
          })
          .then(() => {
            console.log(
              "time to delete contacts",
              timer.printTimeSinceLastCheck()
            );
          });
      });
    });
  };

  _addContacts = size => {
    const work = [];

    for (let i = 0; i < size; i++) {
      work.push(
        new Promise((fulfill, reject) => {
          Contacts.addContact(this._contact(), (err, res) => {
            if (i % 100 === 0) {
              console.log("Added contact", i, res);
            }
            fulfill();
          });
        })
      );
    }

    return RNContactsTest._execute(work);
  };

  _getAll = () => {
    return new Promise(function(fulfill, reject) {
      Contacts.getAll((err, data) => {
        fulfill();
      });
    });
  };

  _getAllWithoutPhotos = () => {
    return new Promise(function(fulfill, reject) {
      Contacts.getAllWithoutPhotos((err, data) => {
        fulfill();
      });
    });
  };

  _getAllThumbnails = contacts => {
    const work = contacts.map(
      contact =>
        new Promise(function(fulfill, reject) {
          Contacts.getPhotoForId(contact.recordID, (err, icon) => {
            fulfill();
          });
        })
    );
    return RNContactsTest._execute(work);
  };

  _deleteAll = contacts => {
    const work = contacts.map(
      contact =>
        new Promise(function(fulfill, reject) {
          Contacts.deleteContact(contact, (err, icon) => {
            fulfill();
          });
        })
    );
    return RNContactsTest._execute(work);
  };

  static _execute = promises => {
    if (promises.length === 0) {
      return Promise.resolve();
    } else {
      return Promise.resolve(promises.pop()).then(() => {
        return RNContactsTest._execute(promises);
      });
    }
  };

  static rand = () => {
    return Math.floor(Math.random() * 99999999);
  };

  getPhotosFromCameraRoll = (count, after) => {
    const fetchParams = {
      first: count,
      assetType: "Photos"
    };
    if (after) {
      fetchParams.after = after;
    }
    console.log("Loading photos from camera roll", fetchParams);
    return CameraRoll.getPhotos(fetchParams);
  };

  _contact = () => {
    return {
      givenName: `${PREFIX}givenName${RNContactsTest.rand()}`,
      familyName: `${PREFIX}familyName${RNContactsTest.rand()}`,
      middleName: `${PREFIX}middleName${RNContactsTest.rand()}`,
      jobTitle: `${PREFIX}jobTitle${RNContactsTest.rand()}`,
      company: `${PREFIX}company${RNContactsTest.rand()}`,
      emailAddresses: [
        { email: `${PREFIX}1@example.com`, label: "work" },
        { email: `${PREFIX}2@example.com`, label: "personal" }
      ],
      postalAddresses: [
        {
          street: "123 Fake Street",
          city: "Sample City",
          state: "CA",
          region: "CA",
          postCode: "90210",
          country: "USA",
          label: "home"
        }
      ],
      phoneNumbers: [
        { number: "11111", label: "main" },
        { number: "22222", label: "mobile" },
        { number: "33333", label: "home" }
      ],
      thumbnailPath: this.defaultImage,
      birthday: {
        day: 1,
        month: 0,
        year: 1987
      },
      note: `${PREFIX}note${RNContactsTest.rand()}`,
      urlAddresses: [
        { url: `${PREFIX}www.google.com`, label: "homepage" },
        { url: `${PREFIX}www.jung.com`, label: "home" }
      ]
    };
  };

  renderAndroidRequestPermissions = () => {
    if (Platform.OS === "android") {
      return (
        <Button
          title="request android contacts permissions"
          onPress={this.requestAndroidPermissions}
        />
      );
    }
    return null;
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.hello}>
          All results are are written to console.log
        </Text>
        {/*this.renderAndroidRequestPermissions()*/}
        <Button title="get all contacts" onPress={this.getAll} />
        <Button
          title="get all contacts (without photos)"
          onPress={this.getAllWithoutPhotos}
        />
        <Button
          title="get contacts matching string"
          onPress={this.getContactsMatchingString}
        />

        <Button
          title="get contacts by phone number"
          onPress={this.getContactsByPhoneNumber}
        />

        <Button title="getPhotoForId" onPress={this.getPhotoForId} />
        <Button title="add contact" onPress={this.addContact} />
        <Button title="update contact" onPress={this.updateContact} />
        <Button title="delete contact" onPress={this.deleteContact} />
        <Button
          title={`performance test (${LOAD_TEST_SIZE} contacts)`}
          onPress={this.loadTest}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  }
});
