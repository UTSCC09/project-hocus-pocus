import React from "react";
import "./keyboard.css";
import keyMap from "../../static/defaultKeyBoardMapping";

const Keyboard = (props) => {
  const keys = Object.keys(keyMap).map((key) => {
    const keyName = keyMap[key]["name"];
    const keyFunction = keyMap[key]["function"];
    let keyClassName = "key";
    if (["tab", "backslash"].includes(key)) {
      keyClassName += " size3";
    } else if (["delete", "capslock", "return"].includes(key)) {
      keyClassName += " size4";
    } else if (["leftshift", "rightshift"].includes(key)) {
      keyClassName += " size5";
    } else if (key === "space") {
      keyClassName += " space";
    }
    if (!keyMap[key]["function"]) {
      keyClassName += " disabled";
    }
    return (
      <div key={key} className={keyClassName}>
        <div className="keyName">{keyName}</div>
        <div className="keyFunction">{keyFunction}</div>
      </div>
    );
  });
  return <div className="keyboard">{keys}</div>;
};

export default Keyboard;
