import React, { useEffect, useState, useCallback } from "react";
import Split from "react-split";
import * as Tone from "tone";
import "./index.css";
import Keyboard from "./Keyboard";
import MusicEditor from "./MusicEditor";
import keyMap from "../../static/defaultKeyBoardMapping";

const synth = new Tone.Synth().toDestination();

const PlaygroundPage = (props) => {
  const [SPN, setSPN] = useState(4);
  const [simpleRecord, setSimpleRecord] = useState([]); // e.g. ["A1"]
  const [record, setRecord] = useState([]); // e.g. [{ offset: 0.15, sound: { instrument: "piano", note: "c" }, action: "start" }]

  function playKeyPressedAnimation(e) {
    const pressedKey = document.querySelector("." + e.code);
    pressedKey.classList.add("keyPressed");
  }

  const keyDoFunction = useCallback(
    (func) => {
      if (/^SPN\d$/.test(func)) {
        return setSPN(parseInt(func.slice(-1)));
      }
      switch (func) {
        case "delete":
          setSimpleRecord(simpleRecord.slice(0, -1));
          break;
        case "newline":
          setSimpleRecord(simpleRecord.concat(["\n"]));
          break;
        case "beat":
          break;
        default:
          if (/^[A-G]b?$/.test(func)) {
            synth.triggerAttackRelease(func + SPN, "8n");
            setSimpleRecord(simpleRecord.concat([func + SPN]));
          } else if (/^[A-G]b?\d$/.test(func)) {
            synth.triggerAttackRelease(func, "8n");
            setSimpleRecord(simpleRecord.concat([func]));
          } else {
            console.warn("unknown function");
          }
      }
    },
    [SPN, simpleRecord]
  );

  useEffect(() => {
    const keys = Array.from(document.querySelectorAll(".key"));
    keys.forEach((key) =>
      key.addEventListener("transitionend", (e) => {
        if (e.propertyName !== "transform") return;
        e.target.classList.remove("keyPressed");
      })
    );

    const handleKeydown = (e) => {
      const func = keyMap[e.code].function;
      playKeyPressedAnimation(e);
      keyDoFunction(func);
    };
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [keyDoFunction, simpleRecord]);

  return (
    <Split
      style={{ height: "calc(100vh - 3rem)" }}
      sizes={[90, 10]}
      minSize={[0, 0]}
      expandToMin={true}
      gutterSize={10}
      gutterAlign="center"
      direction="vertical"
      className="playground"
    >
      <div className="playArea">
        {simpleRecord}
        <Keyboard SPN={SPN} />
      </div>
      <MusicEditor />
    </Split>
  );
};

export default PlaygroundPage;
