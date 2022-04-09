import React from "react";
import * as Tone from "tone";
import "./index.css";
import Keyboard from "./Keyboard";
import MusicEditor from "./MusicEditor";
import keyMap from "../../static/defaultKeyBoardMapping";
import AuthContext from "../../context/auth-context";
import network from "../../helpers/network";

import {
  FormControl,
  InputGroup,
} from "react-bootstrap";
import beatFile from "../../static/music/beat/beat1.wav";
import withRouter from "../../helpers/withRouter";
import Live from './Live';

const beatSound = new Audio(beatFile);
const synth = new Tone.PolySynth().toDestination();

class PlaygroundPage extends React.Component {
  state = {
    SPN: 4,
    isBeating: false,
    BPM: 60,
    introducedRecord: [],
  };

  static contextType = AuthContext;

  musicEditor = null;
  live = null;

  handleKeyUp = (e) => this.handleKeyUpOrDown("up", e);
  handleKeyDown = (e) => this.handleKeyUpOrDown("down", e);

  componentDidMount() {
    if (this.props.router.location.state) {
      network(
        "query",
        `getRecordById(recordId: "${this.props.router.location.state.recordId}")`,
        `title
        record { offset, sound { note, instrument }, action }`,
        this.context.getToken()
      ).then((res) => {
        this.musicEditor.setRecord(res.data.getRecordById.record);
        this.musicEditor.setRecordName(res.data.getRecordById.title);
      });
    }
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
        // Ignoring key event for key
      } else {
        synth.triggerAttack(note, Tone.now());
        this.musicEditor.onNewNote(recordEntry(note, "start"));
        this.live.onRecordEntry(recordEntry(note, "start"));
      }
    } else if (upOrDown === "up") {
      if (/^beat$/.test(assignedKeyFunction)) {
        return;
      }
      removeKeyPressedAnimation(keyCode);
      if (!note) {
        // Ignoring key event for key
      } else {
        synth.triggerRelease(note, Tone.now());
        this.musicEditor.onNewNote(recordEntry(note, "end"));
        this.live.onRecordEntry(recordEntry(note, "end"));
      }
    } else {
      console.error("Unknown upOrDown:", upOrDown);
    }
  };

  render() {
    return (
      <div className="playArea">
        <Live ref={(ref) => (this.live = ref)} />
        <MusicEditor
          enableEditing={true}
          ref={(ref) => (this.musicEditor = ref)}
        />
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

export default withRouter(PlaygroundPage);
