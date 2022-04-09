import React from "react";
import "./musicEditor.css";
import * as Tone from "tone";
import { Button, FormControl, InputGroup, ButtonGroup } from "react-bootstrap";
import network from "../../helpers/network";
import AuthContext from "../../context/auth-context";
import Record from "../../components/Record";

const synth = new Tone.PolySynth().toDestination();
const UPDATE_INTERVAL_MS = 1;

export default class MusicEditor extends React.Component {
  static contextType = AuthContext;

  state = {
    isPlaying: false,
    isRecording: false,
    currentTime: 0,
    currentRecord: [],
    selectedSoundIndex: null,
    zoomFactor: 0.5,
  };

  triggeredForPlay = new Set();
  triggeredForRecord = new Set();
  noteEditor = null;

  setRecord = (record) => {
    this.setState({
      currentRecord: record,
      currentTime: 0,
      selectedSoundIndex: null,
    });
  };

  setRecordName = (recordName) => {
    this.setState({ recordName });
  }

  reset = () => {
    this.triggeredForPlay = new Set();
    this.triggeredForRecord = new Set();

    this.setState({
      isPlaying: false,
      isRecording: false,
      currentTime: 0,
      currentRecord: [],
      selectedSoundIndex: null,
    });
  };

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
  };

  stopRecording = () => {
    this.setState({
      isRecording: false,
    });

    this.onReleaseAll();

    clearInterval(this.clock);
  };

  onNewNote = (note) => {
    if (!this.state.isRecording) return;

    note.offset = this.state.currentTime;

    if (note.action === "start") {
      this.triggeredForRecord.add(note);
    } else {
      this.triggeredForRecord.delete(note);
    }

    this.setState({
      currentRecord: [...this.state.currentRecord, note],
    });
  };

  onReleaseAll = () => {
    this.triggeredForRecord.forEach((note) => {
      this.onNewNote({
        ...note,
        offset: this.state.currentTime,
        action: "end",
      });
    });
    this.triggeredForRecord.clear();
  };

  play = () => {
    this.setState({ isPlaying: true });

    this.prevTime = Date.now();

    this.clock = setInterval(() => {
      const currentTimestamp = Date.now();
      const actualTimeElapsed = currentTimestamp - this.prevTime;
      this.state.currentRecord.forEach((record) => {
        if (
          this.state.currentTime <= record.offset &&
          record.offset < this.state.currentTime + actualTimeElapsed
        ) {
          if (record.action === "start") {
            this.triggeredForPlay.add(record.sound.note);
            synth.triggerAttack(record.sound.note);
          } else if (record.action === "end") {
            this.triggeredForPlay.delete(record.sound.note);
            synth.triggerRelease(record.sound.note);
          }
        }
      });
      this.prevTime = currentTimestamp;
      this.setState({
        currentTime: this.state.currentTime + actualTimeElapsed,
      });
    }, UPDATE_INTERVAL_MS);
  };

  pause = () => {
    this.setState({ isPlaying: false });
    synth.triggerRelease(Array.from(this.triggeredForPlay));
    this.triggeredForPlay.clear();
    clearInterval(this.clock);
  };

  onSelectSound = (soundIndex) => {
    if (soundIndex === null) {
      this.setState({
        selectedSoundIndex: soundIndex,
        soundEditorValues: {},
      });
      if (this.noteEditor) this.noteEditor.onSelect(null);
      return;
    }

    const sound = this.state.currentRecord[soundIndex];
    const endSound = this.state.currentRecord.find(
      (record) =>
        record.action === "end" &&
        record.sound.note === sound.sound.note &&
        record.offset >= sound.offset
    );
    const duration = endSound ? endSound.offset - sound.offset : 0;
    const soundEditorValues = {
      note: sound.sound.note,
      start: sound.offset,
      duration,
    };

    if (this.noteEditor) this.noteEditor.onSelect(soundEditorValues);

    this.setState({
      selectedSoundIndex: soundIndex,
    });
  };

  save = () => {
    if (!this.state.recordName) {
      alert("Please enter a name for the record");
      return;
    }

    saveRecord(
      this.state.currentRecord,
      this.state.recordName,
      this.context.getToken()
    );
  };

  onUpdate = (newValues) => {
    const oldValue = this.state.currentRecord[this.state.selectedSoundIndex];
    const endRecordIndex = this.state.currentRecord.findIndex(
      (record) =>
        record.action === "end" &&
        record.sound.note === oldValue.sound.note &&
        record.offset >= oldValue.offset
    );

    const newRecord = this.state.currentRecord.map((record, index) =>
      index === this.state.selectedSoundIndex
        ? {
          offset: newValues.start,
          sound: {
            instrument: record.sound.instrument,
            note: newValues.note,
          },
          action: "start",
        }
        : index === endRecordIndex
          ? {
            offset: newValues.start + newValues.duration,
            sound: {
              instrument: record.sound.instrument,
              note: newValues.note,
            },
            action: "end",
          }
          : record
    );

    this.setState({ currentRecord: newRecord });
    if (this.noteEditor) this.noteEditor.onSelect(newValues);
  };

  onDelete = () => {
    const newRecord = this.state.currentRecord.filter(
      (record, index) => index !== this.state.selectedSoundIndex
    );

    this.setState({ currentRecord: newRecord });
    if (this.noteEditor) this.noteEditor.onSelect(null);
  };

  onCreate = (newValues) => {
    const newRecords = [
      {
        offset: newValues.start,
        sound: {
          instrument: "piano",
          note: newValues.note,
        },
        action: "start",
      },
      {
        offset: newValues.start + newValues.duration,
        sound: {
          instrument: "piano",
          note: newValues.note,
        },
        action: "end",
      },
    ];

    this.setState({
      currentRecord: [...this.state.currentRecord, ...newRecords],
    });
    if (this.noteEditor) this.noteEditor.onSelect(null);
  };

  zoom = (diff) => {
    this.setState({
      zoomFactor: Math.max(0.2, Math.min(2.0, this.state.zoomFactor + diff)),
    });
  };

  render() {
    return (
      <div className="musicEditor">
        <div className="toolkit">
          <ButtonGroup className="recordingTools">
            {this.props.enableEditing ? (
              <>
                <Button
                  disabled={this.state.isPlaying}
                  onClick={
                    this.state.isRecording
                      ? this.stopRecording
                      : this.startRecording
                  }
                >
                  {this.state.isRecording
                    ? "Stop Recording"
                    : "Start Recording"}
                </Button>
              </>
            ) : null}
            <Button
              variant="success"
              disabled={this.state.isRecording}
              onClick={this.state.isPlaying ? this.pause : this.play}
            >
              {this.state.isPlaying ? "Pause" : "Play"}
            </Button>
            <Button onClick={() => this.zoom(+0.1)}>Zoom In</Button>
            <Button onClick={() => this.zoom(-0.1)}>Zoom Out</Button>
          </ButtonGroup>
          <div className="timeDisplayer">
            {formatTime(this.state.currentTime)}
          </div>
          <div className="generalTools">
            {this.props.enableEditing ?
              <>
                <InputGroup>
                  <InputGroup.Text>Record Name</InputGroup.Text>
                  <FormControl
                    aria-label="Record Name"
                    value={this.state.recordName}
                    placeholder="Untitled"
                    onChange={(e) => {
                      this.setState({ recordName: e.target.value });
                    }}
                  />
                  <Button
                    onClick={this.save}
                    disabled={this.state.isRecording || this.state.isPlaying}
                    variant="success"
                  >
                    Save
                  </Button>
                </InputGroup>
              </>
              : null}
          </div>
        </div>
        <div className="editor">
          <Record
            record={this.state.currentRecord}
            currentTime={this.state.currentTime}
            scrollToCurrentTime={this.state.isRecording}
            onClickOnTime={(currentTime) => this.setState({ currentTime })}
            selectedSoundIndex={this.state.selectedSoundIndex}
            onSelectSound={(soundIndex) => this.onSelectSound(soundIndex)}
            zoomFactor={this.state.zoomFactor}
          />
        </div>
        <div>
          {this.props.enableEditing ? (
            <NoteEditor
              ref={(ref) => (this.noteEditor = ref)}
              onUpdate={this.onUpdate}
              onCreate={this.onCreate}
              onDelete={this.onDelete}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

class NoteEditor extends React.Component {
  state = {
    creating: true,
    note: "",
    start: 0,
    duration: 0,
  };

  reset = () => {
    this.setState({
      creating: true,
      note: "",
      start: 0,
      duration: 0,
    });
  };

  onSelect = (details) => {
    if (details === null) {
      this.reset();
      return;
    }
    const { note, start, duration } = details;
    this.setState({ note, start, duration, creating: false });
  };

  validateAndSubmit = () => {
    const { note, start, duration } = this.state;
    // TODO: Validate note
    if (this.state.creating) {
      this.props.onCreate({ note, start, duration });
    } else {
      this.props.onUpdate({ note, start, duration });
    }
  };

  delete = () => {
    this.props.onDelete();
  };

  render() {
    return (
      <InputGroup>
        <InputGroup.Text>Note</InputGroup.Text>
        <FormControl
          aria-label="Note"
          value={this.state.note}
          onChange={(e) => this.setState({ note: e.target.value })}
        />
        <InputGroup.Text>Start Time</InputGroup.Text>
        <FormControl
          aria-label="Start"
          type="number"
          min={0}
          step={100}
          value={this.state.start}
          onChange={(e) => this.setState({ start: parseInt(e.target.value) })}
        />
        <InputGroup.Text>Duration</InputGroup.Text>
        <FormControl
          aria-label="Duration"
          type="number"
          min={0}
          step={100}
          value={this.state.duration}
          onChange={(e) =>
            this.setState({ duration: parseInt(e.target.value) })
          }
        />
        <Button variant="primary" onClick={() => this.validateAndSubmit()}>
          {this.state.creating ? "Create" : "Save"}
        </Button>
        <Button variant="danger" onClick={() => this.delete()}>
          Delete
        </Button>
      </InputGroup>
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
  });
}
