import React from "react";
import { Button } from "react-bootstrap";
import "./timer.css";

const Timer = (props) => {
  return (
    <div className="Timer">
      {props.time}
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

export default Timer;
