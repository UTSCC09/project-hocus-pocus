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
import { Navigate } from "react-router-dom";
import AuthContext from "../../context/auth-context";
import {
  Button,
  Dropdown,
  DropdownButton,
  FormControl,
  InputGroup,
} from "react-bootstrap";
import beatFile from "../../static/music/beat/beat1.wav";

const beatSound = new Audio(beatFile);
const synth = new Tone.PolySynth().toDestination();

export default class PlaygroundPage extends React.Component {
  state = {
    SPN: 4,
    isBeating: false,
    BPM: 60,
  };

  musicEditor = null;

  handleKeyUp = (e) => this.handleKeyUpOrDown("up", e);
  handleKeyDown = (e) => this.handleKeyUpOrDown("down", e);

  componentDidMount() {
    document.addEventListener("keyup", this.handleKeyUp);
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keyup", this.handleKeyUp);
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyUpOrDown = (upOrDown, e) => {
    if (e.repeat) return;

    const keyCode = e.code;
    const assignedKeyFunction = keyMap[keyCode]?.function;
    const note = checkAndStandardizeMusicKeyFunctionName(
      assignedKeyFunction,
      this.state.SPN
    );

    if (upOrDown === "down") {
      // FUNCTIONS OTHER THAN MUSIC NOTES
      if (/^SPN\d$/.test(assignedKeyFunction)) {
        this.setState({ SPN: parseInt(assignedKeyFunction.slice(-1)) });
        this.musicEditor.onReleaseAll();
        return;
      }

      if (/^beat$/.test(assignedKeyFunction)) {
        const beatInterval = (1000 * 60) / this.state.BPM;
        console.log(this.state.isBeating);
        if (!this.state.isBeating) {
          this.clock = setInterval(() => {
            playKeyPressedAnimation(keyCode);
            beatSound.play();
            setTimeout(() => {
              removeKeyPressedAnimation(keyCode);
            }, 0.5 * beatInterval);
          }, beatInterval);
          this.setState({ isBeating: true });
        } else {
          clearInterval(this.clock);
          this.setState({ isBeating: false });
        }
        return;
      }

      // MUSIC NOTES
      playKeyPressedAnimation(keyCode);

      if (!note) {
        console.log("Ignoring key event for key:", e.code);
      } else {
        synth.triggerAttack(note, Tone.now());
        this.musicEditor.onNewNote(recordEntry(note, "start"));
      }
    } else if (upOrDown === "up") {
      if (/^beat$/.test(assignedKeyFunction)) {
        return;
      }
      removeKeyPressedAnimation(keyCode);
      if (!note) {
        console.log("Ignoring key event for key:", e.code);
      } else {
        synth.triggerRelease(note, Tone.now());
        this.musicEditor.onNewNote(recordEntry(note, "end"));
      }
    } else {
      console.error("Unknown upOrDown:", upOrDown);
    }
  };

  render() {
    return (
      <div className="playArea">
        <MusicEditor ref={(ref) => (this.musicEditor = ref)} />
        <div>
          <InputGroup className="beater w-25">
            <InputGroup.Text>BPM</InputGroup.Text>
            <FormControl
              aria-label="BPM"
              value={this.state.BPM}
              onChange={(e) => {
                this.setState({ BPM: e.target.value });
              }}
            />
          </InputGroup>
        </div>
        <Keyboard SPN={this.state.SPN} />
      </div>
    );
  }
}

function recordEntry(note, action) {
  return {
    sound: {
      instrument: "piano",
      note,
    },
    action,
  };
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
