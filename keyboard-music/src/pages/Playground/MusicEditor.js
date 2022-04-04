import React, { useState } from "react";
import "./musicEditor.css";
import * as Tone from "tone";
import { Button } from "react-bootstrap";

const synth = new Tone.PolySynth().toDestination();

const MusicEditor = (props) => {
  const [mode, setMode] = useState("Composing Mode");

  // offset: str "mm:ss.t"
  const translateOffsetTime = (offset) =>
    60 * parseInt(offset.slice(0, 2)) + parseFloat(offset.slice(3));

  const switchMode = () => {
    setMode(mode === "Composing Mode" ? "Performing Mode" : "Composing Mode");
  };

  const save = () => {
    console.log(props.record);
    // TODO
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
