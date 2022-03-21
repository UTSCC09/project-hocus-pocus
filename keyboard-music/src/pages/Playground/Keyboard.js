import React from "react";
import "./keyboard.css";
import keyMap from "../../static/defaultKeyBoardMapping";

const Keyboard = (props) => {
  const keys = Object.keys(keyMap).map((key) => {
    const keySymbol = keyMap[key]["symbol"];
    const keyFunction = keyMap[key]["function"];
    let keyClassName = "key ";
    keyClassName += key;
    if (!keyMap[key]["function"]) {
      keyClassName += " disabled";
    }
    return (
      <div key={key} className={keyClassName}>
        <div className="keyName">{keySymbol}</div>
        <div className="keyFunction">
          {/^[A-G]b?$/.test(keyFunction)
            ? keyFunction + props.SPN
            : keyFunction}
        </div>
      </div>
    );
  });

  return <div className="keyboard">{keys}</div>;
};

export default Keyboard;
