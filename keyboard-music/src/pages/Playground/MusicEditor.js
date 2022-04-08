import React from "react";
import "./musicEditor.css";
import * as Tone from "tone";
import { Button, ButtonGroup, Dropdown, DropdownButton, FormControl, InputGroup } from "react-bootstrap";
import network from "../../helpers/network";
import AuthContext from "../../context/auth-context";
import Record from "../../components/Record";

const synth = new Tone.PolySynth().toDestination();
const UPDATE_INTERVAL_MS = 1;

export default class MusicEditor extends React.Component {
  state = {
    isRecording: false,
    currentTime: 0,
    currentRecord: [],
    selectedSound: null,
  }

  triggered = new Set();

  reset = () => {
    this.setState({
      isRecording: false,
      currentTime: 0,
      currentRecord: [],
      selectedSound: null,
    });
  }

  startRecording = () => {
    this.setState({
      isRecording: true,
    });

    this.prevTime = Date.now();

    this.clock = setInterval(() => {
      const actualTimeElapsed = Date.now() - this.prevTime;
      this.prevTime = Date.now();
      this.setState({
        currentTime: this.state.currentTime + actualTimeElapsed,
      });
    }, UPDATE_INTERVAL_MS);
  }

  stopRecording = () => {
    this.setState({
      isRecording: false,
    });

    clearInterval(this.clock);
  }

  onNewNote = (note) => {
    if (!this.state.isRecording) return;

    note.offset = this.state.currentTime;

    this.setState({
      currentRecord: [...this.state.currentRecord, note],
    });
  }

  play = () => {
    this.prevTime = Date.now();

    this.clock = setInterval(() => {
      const currentTimestamp = Date.now();
      const actualTimeElapsed = currentTimestamp - this.prevTime;
      this.state.currentRecord.forEach(record => {
        if (this.state.currentTime <= record.offset && record.offset < this.state.currentTime + actualTimeElapsed) {
          if (record.action === 'start') {
            this.triggered.add(record.sound.note);
            synth.triggerAttack(record.sound.note);
          } else if (record.action === 'end') {
            this.triggered.delete(record.sound.note);
            synth.triggerRelease(record.sound.note);
          }
        }
      })
      this.prevTime = currentTimestamp;
      this.setState({ currentTime: this.state.currentTime + actualTimeElapsed });
    }, UPDATE_INTERVAL_MS);
  }

  pause = () => {
    synth.triggerRelease(Array.from(this.triggered));
    this.triggered.clear();
    clearInterval(this.clock);
  }

  get selectedSoundDetails() {
    if (this.state.selectedSound === null) return null;
    const { sound, start } = this.state.selectedSound;
    const soundDetails = this.state.currentRecord.find(note =>
      JSON.stringify(note.sound) === JSON.stringify(sound) &&
      note.offset === start &&
      note.action === 'start'
    );
    if (!soundDetails) return null;
    return soundDetails;
  }

  render() {
    return (
      <div className="musicEditor">
        <div className="toolkit">
          <Button onClick={this.startRecording}>Start Recording</Button>
          <Button onClick={this.stopRecording}>Stop Recording</Button>
          <Button onClick={this.reset}>Reset</Button>
          <Button onClick={this.pause}>Pause</Button>
          <Button onClick={this.play}>Play</Button>
          <span>{formatTime(this.state.currentTime)}</span>
        </div>
        <div className="editor">
          <Record
            record={this.state.currentRecord}
            currentTime={this.state.currentTime}
            scrollToCurrentTime={this.state.isRecording}
            onClickOnTime={(currentTime) => this.setState({ currentTime })}
            selectedSound={this.state.selectedSound}
            onSelectSound={(sound) => this.setState({ selectedSound: sound })}
          />
        </div>
        <div>
          {
            // TODO: Remove this
            null && (
              <InputGroup>
                <InputGroup.Text>Note</InputGroup.Text>
                <DropdownButton title={'Note: ' + this.selectedSoundDetails.sound.note}>
                  <Dropdown.Item href="#">Action</Dropdown.Item>
                  <Dropdown.Item href="#">Another action</Dropdown.Item>
                  <Dropdown.Item href="#">Something else here</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item href="#">Separated link</Dropdown.Item>
                </DropdownButton>
                <InputGroup.Text>Start Time</InputGroup.Text>
                <FormControl aria-label="Start" value={this.selectedSoundDetails.start} />
                <InputGroup.Text>Duration</InputGroup.Text>
                <FormControl aria-label="Duration" />
                <Button variant="primary">Save</Button>
                <Button variant="warning">Delete</Button>
              </InputGroup>
            )
          }
        </div>
      </div>
    );
  }
}


function formatTime(ms) {
  // mm:ss.t
  if (!Number.isFinite(ms)) {
    return "error";
  }
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const tenths = Math.floor((ms % 1000) / 100);
  return `${pad2(minutes)}:${pad2(seconds)}.${tenths}`;

  function pad2(n) {
    return n < 10 ? `0${n}` : n;
  }
}


function saveRecord(record, title, token) {
  network(
    "mutation",
    `createRecord(record: ${JSON.stringify(record)}, title: "${title}")`
      .replace(/"offset"/g, "offset")
      .replace(/"sound"/g, "sound")
      .replace(/"instrument"/g, "instrument")
      .replace(/"note"/g, "note")
      .replace(/"action"/g, "action"),
    `_id
    author
    published`,
    token
  ).then((res) => {
    if (res.data) {
      console.log(res.data);
    } else {
      // TODO: handle error
    }
  })
}
