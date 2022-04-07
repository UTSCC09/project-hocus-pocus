import React, { useEffect, useState, useCallback } from "react";
import Split from "react-split";
import * as Tone from "tone";
import "./index.css";
import Keyboard from "./Keyboard";
import Timer from "./Timer";
import MusicEditor from "./MusicEditor";
import keyMap from "../../static/defaultKeyBoardMapping";
import Peer from "peerjs";
import { Form } from "react-bootstrap";

const synth = new Tone.PolySynth().toDestination();

export default class PlaygroundPage extends React.Component {
  state = {
    SPN: 4,
  }

  componentDidMount() {
    document.addEventListener("keyup", (e) => this.handleKeyUpOrDown('up', e));
    document.addEventListener("keydown", (e) => this.handleKeyUpOrDown('down', e));
  }

  handleKeyUpOrDown = (upOrDown, e) => {
    if (e.repeat) return;

    const keyCode = e.code;
    const assignedKeyFunction = keyMap[keyCode]?.function;

    if (/^SPN\d$/.test(assignedKeyFunction)) {
      this.setState({ SPN: parseInt(assignedKeyFunction.slice(-1)) });
    }

    const action = checkAndStandardizeMusicKeyFunctionName(assignedKeyFunction, this.state.SPN);
    if (!action) {
      console.log('Ignoring keydown event for key:', e.code);
    }

    if (upOrDown === "down") {
      playKeyPressedAnimation(keyCode);
      action && synth.triggerAttack(action, Tone.now());
    } else if (upOrDown === "up") {
      removeKeyPressedAnimation(keyCode);
      action && synth.triggerRelease(action, Tone.now());
    } else {
      console.error('Unknown upOrDown:', upOrDown);
    }
  };

  render() {
    return (<>
      <Keyboard SPN={this.state.SPN} />
      {/* <MusicEditor record={record} isRecording={isRecording} title={title} /> */}
    </>);
  }
}


function playKeyPressedAnimation(code) {
  const pressedKey = document.querySelector("." + code);
  if (!pressedKey) return;
  pressedKey.classList.add("keyPressed");
}

function removeKeyPressedAnimation(code) {
  const pressedKey = document.querySelector("." + code);
  if (!pressedKey) return;
  pressedKey.classList.remove("keyPressed");
}

function checkAndStandardizeMusicKeyFunctionName(func, SPN) {
  if (/^[A-G]b?$/.test(func)) {
    return func + SPN;
  } else if (/^[A-G]b?\d$/.test(func)) {
    return func;
  } else {
    return null;
  }
}
