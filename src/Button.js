import React, { Component, View, Text, TouchableOpacity, StyleSheet, PropTypes } from 'react-native'

export default class Button extends Component {

  render () {
    return (
      <TouchableOpacity style={styles.container} onPress={this.props.onPress}>
        <Text style={styles.text}>{this.props.text}</Text>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#444',
    padding: 20,
    left: 10,
    right: 10,
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    color: 'white',
  },
})
