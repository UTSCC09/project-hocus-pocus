import React, { useEffect } from "react";
import { Button } from "react-bootstrap";
import "./timer.css";

const Timer = (props) => {
  const [relativeTime, setRelativeTime] = React.useState(0);
  useEffect(() => {
    if (props.time === null) {
      setRelativeTime(0);
      return;
    }

    const interval = setInterval(() => setRelativeTime(Date.now() - props.time), 100);

    return () => {
      setRelativeTime(0);
      clearInterval(interval);
    };
  }, [props.time]);

  return (
    <div className="Timer">
      {formatTime(relativeTime)}
      <Button onClick={props.start}>Start</Button>
      <Button variant="warning" onClick={props.pause}>
        Pause
      </Button>
      <Button variant="danger" onClick={props.reset}>
        Reset
      </Button>
    </div>
  );
};

function formatTime(ms) {
  // mm:ss.t
  if (!Number.isFinite(ms)) {
    return "error";
  }
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const tenths = Math.floor((ms % 1000) / 100);
  return `${pad2(minutes)}:${pad2(seconds)}.${tenths}`;
}

function pad2(n) {
  return n < 10 ? `0${n}` : n;
}

export default Timer;
