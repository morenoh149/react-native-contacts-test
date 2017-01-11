"use strict";

import React, {Component} from "react";
import {View, Text, Platform, StyleSheet} from "react-native";
import Button from "./Button";
import invariant from "invariant";
import _ from "lodash";
import Contacts from "react-native-contacts";

const PREFIX = 'ReactNativeContacts__';

export default class RNContactsTest extends Component {

  //todo: test getAllWithoutPhotos
  //todo: test getPhotoById
  //todo: add / update addresses
  //todo: add / update photo
  //todo: load test

  getAll() {
    Contacts.getAll((err, data) => {
      if (err)
        throw err;

      for(let item of data) {
        console.log('getAll:', item)
      }
    })
  }

  updateContact() {
    Contacts.getAll((err, data) => {
      const originalRecord = _.cloneDeep(data[0]);

      const pendingRecord = _.cloneDeep(data[0]);
      pendingRecord.familyName = (originalRecord.familyName + RNContactsTest.rand()).slice(0, 20);
      pendingRecord.emailAddresses.push({email: 'addedFromRNContacts@example.com', type: 'work'});

      //todo - update more fields

      Contacts.updateContact(pendingRecord, (err, data) => {
        if (err) throw err;

        Contacts.getAll((err, data) => {
          const updatedRecord = _.find(data, {recordID: originalRecord.recordID});

          console.log('original record:', originalRecord);
          console.log('updated record:', updatedRecord);

          invariant(updatedRecord.emailAddresses.length === originalRecord.emailAddresses.length + 1, 'Email address array is not length one greater than original record');
          invariant(updatedRecord.familyName === pendingRecord.familyName, 'family name was not updated')
        })
      })
    })
  }

  addContact() {
    const newContact = {
      givenName: PREFIX + "givenName" + RNContactsTest.rand(),
      familyName: PREFIX + "familyName" + RNContactsTest.rand(),
      middleName: PREFIX + "middleName" + RNContactsTest.rand(),
      jobTitle: PREFIX + "jobTitle" + RNContactsTest.rand(),
      company: PREFIX + "company" + RNContactsTest.rand(),
      emailAddresses: [
        {email: PREFIX + '1@example.com', type: 'work'},
        {email: PREFIX + '2@example.com', type: 'personal'}
      ],
      phoneNumbers: [
        {number: "11111", label: 'main'},
        {number: "22222", label: 'mobile'},
      ]
    };

    Contacts.addContact(newContact, (err, data) => {
      Contacts.getAll((err, records) => {
        const contact = _.find(records, {givenName: newContact.givenName});

        console.log('attempted to add:', newContact);
        console.log('after add:', contact);

        _.each(newContact, (value, key) => {
          if (Array.isArray(newContact[key]))
            invariant(contact[key].length === newContact[key].length, 'contact values !isEqual for ' + key);
          else
            invariant(_.isEqual(contact[key], newContact[key]), 'contact values !isEqual for ' + key)
        })
      })
    })
  }

  deleteContact() {
    Contacts.getAll((err, contactsBefore) => {
      let contactToDelete = _.find(contactsBefore, (contact) => contact.givenName && contact.givenName.indexOf(PREFIX) === 0);
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

  static rand() {
    return Math.floor(Math.random() * 99999999);
  }

  render() {
    return (
      <View>
        <Text style={styles.hello}>All results are console.log'ed</Text>
        <Button text="get all contacts" onPress={this.getAll}/>
        <Button text="update contact" onPress={this.updateContact}/>
        <Button text="add contact" onPress={this.addContact}/>
        <Button text="delete contact" onPress={this.deleteContact}/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {},
  hello: {padding: 15},
});
