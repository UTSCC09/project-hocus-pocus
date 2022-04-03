import React, { useEffect, useState, useCallback } from "react";
import Split from "react-split";
import useTimer from "easytimer-react-hook";
import * as Tone from "tone";
import "./index.css";
import Keyboard from "./Keyboard";
import Timer from "./Timer";
import MusicEditor from "./MusicEditor";
import keyMap from "../../static/defaultKeyBoardMapping";
import Peer from "peerjs";

const synth = new Tone.PolySynth().toDestination();

const PlaygroundPage = (props) => {
  const [SPN, setSPN] = useState(4);
  const [simpleRecord, setSimpleRecord] = useState([]); // e.g. ["A1"]
  const [isRecording, setIsRecording] = useState(false); // for record only, NOT for simpleRecord
  const [record, setRecord] = useState([]); // e.g. [{ offset: 00:02:15, sound: { instrument: "piano", note: "c" }, action: "start" }]
  const [peerRef] = useState(new Peer());
  const [connectionRef, setConnectionRef] = useState(null);

  // TIMER FOR RECORDING
  const [timer] = useTimer({
    precision: "secondTenths",
    target: { hours: 1 },
  });

  const toTwoDigits = (num) => {
    return (num < 10 ? "0" : "") + num;
  };
  const getTime = useCallback(() => {
    const { minutes, seconds, secondTenths } = timer.getTimeValues();
    return `${toTwoDigits(minutes)}:${toTwoDigits(seconds)}:${toTwoDigits(
      secondTenths
    )}`;
  }, [timer]);

  const startTimer = () => {
    timer.start();
    setIsRecording(true);
  };

  const pauseTimer = () => {
    timer.pause();
    setIsRecording(false);
  };

  const resetTimer = () => {
    timer.reset();
    timer.pause();
    setIsRecording(false);
    setRecord([]);
  };

  // KEYBOARD FOR PLAYING MUSIC
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
          if (/^[A-G]b?$/.test(func)) {
            synth.triggerAttack(func + SPN, now);
            setSimpleRecord(simpleRecord.concat([func + SPN]));
          } else if (/^[A-G]b?\d$/.test(func)) {
            synth.triggerAttack(func, now);
            synth.triggerRelease(func + SPN, now + 1);
            setSimpleRecord(simpleRecord.concat([func]));
          } else {
            console.warn("unknown function");
          }
      }
    },
    [SPN, simpleRecord]
  );

  const keyUpFunction = useCallback(
    (func) => {
      const now = Tone.now();
      if (/^[A-G]b?$/.test(func)) {
        synth.triggerRelease(func + SPN, now);
      } else if (/^[A-G]b?\d$/.test(func)) {
        synth.triggerRelease(func, now);
      }
    },
    [SPN]
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
          offset: getTime(),
          sound: { instrument: "piano", note: keyMap[e.code] },
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
          offset: getTime(),
          sound: { instrument: "piano", note: keyMap[e.code] },
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
  }, [
    getTime,
    isRecording,
    keyDownFunction,
    record,
    simpleRecord,
    simulateKeyPress,
    simulateKeyUp,
    timer,
    transmitKeyDown,
  ]);

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
          time={getTime()}
          start={startTimer}
          pause={pauseTimer}
          reset={resetTimer}
        />
        <Keyboard SPN={SPN} />
      </div>
      <div>
        <input
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
        />
        <MusicEditor />
      </div>
    </Split>
  );
};

export default PlaygroundPage;
