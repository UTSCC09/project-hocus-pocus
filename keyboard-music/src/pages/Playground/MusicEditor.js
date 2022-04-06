import React, { useState } from "react";
import "./musicEditor.css";
import * as Tone from "tone";
import { Button } from "react-bootstrap";
import network from "../../helpers/network";
import AuthContext from "../../context/auth-context";

const synth = new Tone.PolySynth().toDestination();

const MusicEditor = (props) => {
  const [mode, setMode] = useState("Composing Mode");
  const context = React.useContext(AuthContext);

  const switchMode = () => {
    setMode(mode === "Composing Mode" ? "Performing Mode" : "Composing Mode");
  };

  const save = () => {
    network(
      "mutation",
      `createRecord(record: ${JSON.stringify(props.record)})`
        .replace(/"offset"/g, "offset")
        .replace(/"sound"/g, "sound")
        .replace(/"instrument"/g, "instrument")
        .replace(/"note"/g, "note")
        .replace(/"action"/g, "action"),
      `_id
      author
      published`,
      context.token
    ).then((res) => {
      if (res.data) {
        console.log(res.data);
      } else {
        // TODO: handle error
      }
    })
  };
  const replay = () => {
    const startTime = Tone.now();
    for (const r of props.record) {
      console.log(
        r.sound.note,
        r.action,
        r.offset,
        startTime + r.offset,
      );
      if (r.action === "start") {
        synth.triggerAttack(
          r.sound.note,
          startTime + r.offset,
        );
      } else if (r.action === "end") {
        synth.triggerRelease(
          r.sound.note,
          startTime + r.offset,
        );
      }
    }
  };
  return (
    <div className="musicEditor">
      <div className="toolkit">
        <Button onClick={switchMode}>{mode}</Button>
        <Button onClick={save}>Save</Button>
        <Button onClick={replay}>Replay</Button>
      </div>
      <div className="editor">

        <div style={{ position: 'relative', left: 0, top: 0, height: 200, overflow: 'scroll', border: '1px solid red' }}>
          {
            props.record.map(({ offset, sound, action }, index) => (
              <div key={index} style={{ position: 'absolute', top: 0, left: offset, height: 50, width: 50, backgroundColor: 'gray' }}>
                {sound.instrument} {sound.note} {action}
              </div>
            ))
          }
        </div>

        <div style={{ position: 'relative', left: 0, top: 0, height: 200, overflow: 'scroll', border: '1px solid red' }}>
          {
            convertRecordToTracks(props.record).map((track, i) => (
              <div key={i} style={{ position: 'absolute', top: i * 50 }}>
                <span>1</span>
                {
                  track.map(({ start, duration, sound }, index) => (
                    <div key={index} style={{ position: 'absolute', top: 0, left: start, height: 50, width: duration, backgroundColor: 'gray' }}>
                      {sound.instrument} {sound.note}
                    </div>
                  ))
                }
              </div>
            ))
          }
        </div>

        <pre>
          {JSON.stringify(props.record, null, 4)}
        </pre>
      </div>
    </div>
  );
};

function convertRecordToTracks(records = []) {
  // Convert record to a format that's easier to work with
  const sounds = [];
  records = Array.from(records);
  while (records.length > 0) {
    const record = records.shift();
    if (record.action === "start") {
      // Find the end of this note
      const endIndex = records.findIndex((r) => r.action === "end" && JSON.stringify(r.sound) === JSON.stringify(record.sound));
      sounds.push({
        sound: record.sound,
        start: record.offset,
        duration: endIndex === -1 ?
          null : // The key is still down
          records[endIndex].offset - record.offset,
      });
      if (endIndex !== -1) records.splice(endIndex, 1);

    } else {
      throw new Error(`Unexpected action: ${record.action}`);
    }
  }

  // Sounds should be sorted by start time already, but just in case
  sounds.sort((a, b) => a.start - b.start);

  // Put them onto non-overlapping tracks
  const tracks = [];
  for (const sound of sounds) {
    // Find the first track that doesn't overlap
    const track = tracks.find((t) => t.at(-1).start + (t.at(-1).duration ?? 9999) <= sound.start);
    if (track) {
      track.push(sound);
    } else {
      tracks.push([sound]);
    }
  }
  console.log(tracks);

  return tracks;
}


export default MusicEditor;
