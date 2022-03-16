import React, { Component } from "react";
import Split from "react-split";
import "./index.css";
import Keyboard from "./Keyboard";
import MusicEditor from "./MusicEditor";

const instrumentPath = "../../static/music/instrument";
const beatPath = "../../static/music/beat";

class PlaygroundPage extends Component {
  componentDidMount() {
    document.addEventListener("keydown", (e) => {});
  }
  render() {
    return (
      <Split
        style={{ height: "calc(100vh - 3rem)" }}
        sizes={[90, 10]}
        minSize={[0, 0]}
        expandToMin={true}
        gutterSize={10}
        gutterAlign="center"
        // gutterStyle={(dimension, gutterSize, index) => {
        //   return { zIndex: 10, height: "10px" };
        // }}
        direction="vertical"
        className="playground"
      >
        <div className="playArea">
          <Keyboard />
        </div>
        <MusicEditor />
        {/* <div className="sound">
          <audio data-key="65" src="./pianoNotes/g+.wav"></audio>
          <audio data-key="87" src="./pianoNotes/a.wav"></audio>
          <audio data-key="69" src="./pianoNotes/b.wav"></audio>
          <audio data-key="82" src="./pianoNotes/c.wav"></audio>
          <audio data-key="84" src="./pianoNotes/d.wav"></audio>
          <audio data-key="89" src="./pianoNotes/e.wav"></audio>
          <audio data-key="85" src="./pianoNotes/f.wav"></audio>

          <audio data-key="68" src="./pianoNotes/bb.wav"></audio>
          <audio data-key="70" src="./pianoNotes/c+.wav"></audio>
          <audio data-key="72" src="./pianoNotes/eb.wav"></audio>
          <audio data-key="74" src="./pianoNotes/f+.wav"></audio>
          <audio data-key="73" src="./pianoNotes/g.wav"></audio>

          <audio data-key="66" src="./pianoNotes/beat.wav"></audio>
        </div> */}
      </Split>
    );
  }
}

export default PlaygroundPage;
