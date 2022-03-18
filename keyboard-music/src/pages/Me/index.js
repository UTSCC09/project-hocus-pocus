import React, { Component } from "react";
import Peer from 'peerjs';

class MePage extends Component {
  peer = new Peer();
  // connection = null;

  state = {
    connectionStatus: 'not connected',
    peerId: null,
    received: '',
  }

  componentDidMount() {
    this.peer.on('open', (id) => {
      console.log(id);
      this.setState({
        peerId: id,
        connectionStatus: 'connected',
      });
    });

    this.peer.on('closed', () => {
      this.setState({
        peerId: null,
        connectionStatus: 'closed',
      });
    });

    this.peer.on('disconnected', () => {
      this.setState({
        peerId: null,
        connectionStatus: 'disconnected',
      });
    });

    this.peer.on('error', (err) => {
      console.warn(err);
      this.setState({
        connectionStatus: 'error',
      });
    });

    this.peer.on('data', (data) => {
      console.log(data);
      this.setState({
        received: this.state.received + '\n' + data,
      });
    });

    this.peer.on('connection', (conn) => {
      this.connection = conn;
      this.setState({ connectionStatus: 'connected with ' + conn.peer });
      this.connection.on('data', (data) => {
        console.log(data);
        this.setState({
          received: this.state.received + '\n' + data,
        });
      });
    })

  }

  render() {
    return (
      <div>
        <h1>Me</h1>
        <div>{this.state.connectionStatus}</div>
        <div>{this.state.peerId}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <textarea value={this.state.received} readOnly />
          <input onKeyPress={(e) => {
            if (e.code === 'Enter') {
              this.connection.send(e.target.value)
              e.target.value = ''
            }
          }} placeholder="Message" />
          <input onKeyPress={(e) => {
            if (e.code === 'Enter') {
              this.connection = this.peer.connect(e.target.value)
              this.connection.on('data', (data) => {
                console.log(data);
                this.setState({
                  received: this.state.received + '\n' + data,
                });
              });
            }
          }} placeholder="Connect to peer" />
        </div>
      </div>
    );
  }
}

export default MePage;
