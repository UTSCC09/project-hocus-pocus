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

const synth = new Tone.PolySynth().toDestination();

const PlaygroundPage = (props) => {
  const [SPN, setSPN] = useState(4);
  const [simpleRecord, setSimpleRecord] = useState([]); // e.g. ["A1"]
  const [startTime, setStartTime] = useState(null);
  const [isRecording, setIsRecording] = useState(false); // for record only, NOT for simpleRecord
  const [record, setRecord] = useState([]); // e.g. [{ offset: 00:02.5, sound: { instrument: "piano", note: "C4" }, action: "start" }]
  const [title, setTitle] = useState("");
  const [peerRef] = useState(
    new Peer({
      host: "keyboard-music.yyin.me",
      path: "/myapp",
      secure: true,
    })
  );

  const [connectionRef, setConnectionRef] = useState(null);

  const startTimer = () => {
    setStartTime(Date.now());
    setIsRecording(true);
  };

  const pauseTimer = () => {
    setStartTime(null);
    setIsRecording(false);
  };

  const resetTimer = () => {
    setStartTime(null);
    setIsRecording(false);
    setRecord([]);
  };

  // KEYBOARD FOR PLAYING MUSIC
  const checkAndStandardizeMusicKeyFunctionName = useCallback(
    (func) => {
      if (/^[A-G]b?$/.test(func)) {
        return func + SPN;
      } else if (/^[A-G]b?\d$/.test(func)) {
        return func;
      } else {
        return null;
      }
    },
    [SPN]
  );

  function playKeyPressedAnimation(code) {
    const pressedKey = document.querySelector("." + code);
    pressedKey.classList.add("keyPressed");
  }

  function removeKeyPressedAnimation(code) {
    const pressedKey = document.querySelector("." + code);
    pressedKey.classList.remove("keyPressed");
  }

  const transmitKeyDown = useCallback(
    (keyCode) => {
      if (connectionRef) {
        connectionRef.send(keyCode);
      }
    },
    [connectionRef]
  );

  const keyDownFunction = useCallback(
    (func) => {
      if (/^SPN\d$/.test(func)) {
        synth.releaseAll(Tone.now());
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
          const now = Tone.now();
          const standardizedFunc =
            checkAndStandardizeMusicKeyFunctionName(func);
          console.log(standardizedFunc);
          if (standardizedFunc) {
            synth.triggerAttack(standardizedFunc, now);
            setSimpleRecord(simpleRecord.concat([standardizedFunc]));
          } else {
            console.warn("unknown function");
          }
      }
    },
    [checkAndStandardizeMusicKeyFunctionName, simpleRecord]
  );

  const keyUpFunction = useCallback(
    (func) => {
      const now = Tone.now();
      const standardizedFunc = checkAndStandardizeMusicKeyFunctionName(func);
      if (standardizedFunc) {
        synth.triggerRelease(standardizedFunc, now);
      }
    },
    [checkAndStandardizeMusicKeyFunctionName]
  );

  const simulateKeyPress = useCallback(
    (keyCode) => {
      playKeyPressedAnimation(keyCode);
      keyDownFunction(keyMap[keyCode].function);
    },
    [keyDownFunction]
  );

  const simulateKeyUp = useCallback(
    (keyCode) => {
      removeKeyPressedAnimation(keyCode);
      keyUpFunction(keyMap[keyCode].function);
    },
    [keyUpFunction]
  );

  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.repeat) {
        return;
      }
      if (isRecording) {
        const newRecord = {
          offset: Date.now() - startTime,
          sound: {
            instrument: "piano",
            note: checkAndStandardizeMusicKeyFunctionName(
              keyMap[e.code].function
            ),
          },
          action: "start",
        };
        setRecord(record.concat([newRecord]));
      }
      simulateKeyPress(e.code);
      transmitKeyDown(e.code);
    };
    document.addEventListener("keydown", handleKeydown);

    const handleKeyup = (e) => {
      if (isRecording) {
        const newRecord = {
          offset: Date.now() - startTime,
          sound: {
            instrument: "piano",
            note: checkAndStandardizeMusicKeyFunctionName(
              keyMap[e.code].function
            ),
          },
          action: "end",
        };
        setRecord(record.concat([newRecord]));
      }
      simulateKeyUp(e.code);
    };

    document.addEventListener("keyup", handleKeyup);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("keyup", handleKeyup);
    };

  }, [checkAndStandardizeMusicKeyFunctionName, isRecording, keyDownFunction, record, simpleRecord, simulateKeyPress, simulateKeyUp, startTime, transmitKeyDown]);

  useEffect(() => {
    peerRef.on("open", (id) => {
      console.log(id);
    });

    peerRef.on("connection", (conn) => {
      console.log("passive connected");
      conn.on("data", (data) => {
        console.log("passive", data);
        const func = keyMap[data].function;
        playKeyPressedAnimation(data);
        keyDownFunction(func);
      });
    });

    peerRef.on("error", console.log);
    peerRef.on("close", console.log);
    peerRef.on("disconnected", console.log);
  }, [keyDownFunction, peerRef]);

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
        <div>{simpleRecord}</div>
        <Timer
          time={isRecording ? startTime : null}
          start={startTimer}
          pause={pauseTimer}
          reset={resetTimer}
        />
        <Keyboard SPN={SPN} />
      </div>
      <div>
        {/* <input
          onKeyPress={(e) => {
            if (e.code === "Enter") {
              const connection = peerRef.connect(e.target.value);
              setConnectionRef(connection);
              connection.on("data", (data) => {
                console.log("active", data);
                simulateKeyPress(data);
              });
            }
          }}
          placeholder="Connect to peer"
          width={30}
        /> */}
        <Form.Control
          type="text"
          placeholder="Please enter the title for your record"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
        />
        <MusicEditor record={record} isRecording={isRecording} title={title} />
      </div>
    </Split>
  );
};

export default PlaygroundPage;
