import React, { useState } from "react";
import "./musicEditor.css";
import * as Tone from "tone";
import { Button } from "react-bootstrap";
import network from "../../helpers/network";
import AuthContext from "../../context/auth-context";
import Record from "../../components/Record";

const synth = new Tone.PolySynth().toDestination();

const MusicEditor = (props) => {
  const [mode, setMode] = useState("Composing Mode");
  const context = React.useContext(AuthContext);

  const [currentTime, setCurrentTime] = useState(null);

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
    const startTime = Date.now();
    for (const r of props.record) {
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

    const update = setInterval(() => {
      setCurrentTime(Tone.now() - startTime);
    }, 90);

    // To be tested
    setTimeout(() => {
      clearInterval(update);
      setCurrentTime(null);
    }, props.record.reduce((acc, r) => Math.max(acc, r.offset + (r.duration ?? 0)), 0));
  };

  return (
    <div className="musicEditor">
      <div className="toolkit">
        <Button onClick={switchMode}>{mode}</Button>
        <Button onClick={save}>Save</Button>
        <Button onClick={replay}>Replay</Button>
      </div>
      <div className="editor">

        <Record record={props.record} currentTime={1} />

        <pre>
          {JSON.stringify(props.record, null, 4)}
        </pre>
      </div>
    </div>
  );
};

export default MusicEditor;
