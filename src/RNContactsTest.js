import React, { Component, View, Text, Platform, StyleSheet, PropTypes } from 'react-native'

import Button from './Button'
import Contacts from 'react-native-contacts'

export default class RNContactsTest extends Component {
  getAll () {
    Contacts.getAll((err, data) => {
      console.log('getAll:', err, data)
    })
  }

  render () {
    return (
      <View>
        <Button text="get all contacts" onPress={this.getAll} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {}
})
