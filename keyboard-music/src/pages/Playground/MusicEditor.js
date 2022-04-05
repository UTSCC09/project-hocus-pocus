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

  // offset: str "mm:ss.t"
  const translateOffsetTime = (offset) =>
    60 * parseInt(offset.slice(0, 2)) + parseFloat(offset.slice(3));

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
        translateOffsetTime(r.offset),
        startTime + translateOffsetTime(r.offset)
      );
      if (r.action === "start") {
        synth.triggerAttack(
          r.sound.note,
          startTime + translateOffsetTime(r.offset)
        );
      } else if (r.action === "end") {
        synth.triggerRelease(
          r.sound.note,
          startTime + translateOffsetTime(r.offset)
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
      <div className="editor">{/* render records */}</div>
    </div>
  );
};

export default MusicEditor;
