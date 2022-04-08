import React from "react";
import Peer from "peerjs";


export default class Live extends React.Component {
  state = {
    isLive: false,
  }

  componentDidMount() {
    this.peer = new Peer({
      host: "keyboard-music.yyin.me",
      path: "/myapp",
      secure: true,
    });

    this.peer.on("open", (id) => {
      console.log(id);
    });

    this.peer.on("error", console.log);
    this.peer.on("close", console.log);
    this.peer.on("disconnected", console.log);
  }

  componentWillUnmount() {
    this.peer.destroy();
  }

  goLive = () => {

  }

  stopLive = () => {

  }

  render() {
    return <div>Go Live</div>;
  }
}
