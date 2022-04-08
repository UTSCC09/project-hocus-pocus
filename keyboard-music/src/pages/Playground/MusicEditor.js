import React, { useState } from "react";
import "./musicEditor.css";
import * as Tone from "tone";
import { Button } from "react-bootstrap";
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
  }

  reset = () => {
    this.setState({
      isRecording: false,
      currentTime: 0,
      currentRecord: [],
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
    const { currentRecord } = this.state;

  }

  render() {
    return (
      <div className="musicEditor">
        <div className="toolkit">
          <Button onClick={this.startRecording}>Start Recording</Button>
          <Button onClick={this.stopRecording}>Stop Recording</Button>
          <Button onClick={this.reset}>Reset</Button>
          <Button onClick={this.play}>Play</Button>
          <span>{formatTime(this.state.currentTime)}</span>
        </div>
        <div className="editor">
          <Record
            record={this.state.currentRecord}
            currentTime={this.state.currentTime}
            scrollToCurrentTime={this.state.isRecording}
            onClickOnTime={(currentTime) => this.setState({ currentTime })}
          />
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
