import React from "react";
import Peer from "peerjs";
import AuthContext from "../../context/auth-context";
import { Navigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import network from "../../helpers/network";
import "./live.css";

export default class Live extends React.Component {
  static contextType = AuthContext;

  state = {
    isLive: false,
    isReady: false,
    connectedCount: 0,
  };

  connectedPeers = [];

  onRecordEntry = (recordEntry) => {
    for (let peer of this.connectedPeers) {
      peer.send({ type: "recordEntry", recordEntry });
    }
  };

  componentDidMount() {
    this.peer = new Peer({
      host: "keyboard-music.yyin.me",
      path: "/myapp",
      secure: true,
    });

    this.peer.on("open", (id) => {
      console.log(id);
      this.setState({ isReady: true });
    });

    this.peer.on("connection", (connection) => {
      this.connectedPeers.push(connection);
      this.setState({ connectedCount: this.connectedPeers.length });

      connection.on("data", (data) => {
        console.log("Possible chat data", data);
      });

      connection.on("close", () => {
        this.connectedPeers = this.connectedPeers.filter(
          (peer) => peer !== connection
        );
        this.setState({ connectedCount: this.connectedPeers.length });
      });
    });

    this.peer.on("error", (e) => {
      console.warn(e);
      this.setState({ isReady: false });
    });
    this.peer.on("close", (e) => {
      console.warn(e);
      this.setState({ isReady: false });
    });
    this.peer.on("disconnected", (e) => {
      console.warn(e);
      this.setState({ isReady: false });
    });
  }

  componentWillUnmount() {
    this.stopLive();
    this.peer.destroy();
  }

  goLive = () => {
    network(
      "mutation",
      `startLiveStream(code: "${this.peer.id}")`,
      `user
      code`,
      this.context.getToken()
    )
      .then((res) => {
        if (res.data) {
          console.log(res.data.startLiveStream);
          this.setState({ isLive: true });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  stopLive = () => {
    network("mutation", `endLiveStream`, `success`, this.context.getToken())
      .then((res) => {
        if (res.data) {
          console.log(res.data);
          this.setState({ isLive: false });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  render() {
    return (
      <div>
        <Button
          disabled={!this.state.isReady}
          onClick={this.state.isLive ? this.stopLive : this.goLive}
          className="goLiveBtn"
        >
          {this.state.isReady
            ? this.state.isLive
              ? "Stop Live"
              : "Go Live"
            : "Preparing"}
        </Button>
        <span>
          {
            this.state.connectedCount > 0 ?
              this.state.connectedCount === 1 ?
                `${this.state.connectedCount} people is listening` :
                `${this.state.connectedCount} people are listening` :
              `No one is listening`
          }
        </span>
      </div>
    );
  }
}
