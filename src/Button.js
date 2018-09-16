"use strict";

import React, {Component} from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";

export default class Button extends Component {
  render() {
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
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    margin: 5,
  },
  text: {
    textAlign: 'center',
    color: 'white',
  }
});
