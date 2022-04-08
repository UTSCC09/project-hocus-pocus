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
import { Navigate } from "react-router-dom";
import AuthContext from "../../context/auth-context";
import network from "../../helpers/network";

import {
  Button,
  Dropdown,
  DropdownButton,
  FormControl,
  InputGroup,
} from "react-bootstrap";
import withRouter from "../../helpers/withRouter";
import Live from './Live';

class PlaygroundPage extends React.Component {
  static contextType = AuthContext;
  state = {
    isFromLive: false,
  };
  musicEditor = null;

  componentDidMount() {
    if (this.props.router.location.state) {
      // Coming from view
      fetchRecord(
        this.props.router.location.state.recordId,
        this.context.getToken(),
        (record) => { this.musicEditor.setRecord(record) },
        console.error
      );
    } else {
      // Coming from Live
      const authorId = 'a@example.com' // this.props.router.location.state.liveAuthorId;
      this.setState({
        isFromLive: true,
        connectWith: authorId,
        connectionStatus: 'connecting to server',
      });

      this.peer = new Peer({
        host: "keyboard-music.yyin.me",
        path: "/myapp",
        secure: true,
      });

      this.peer.on('open', (id) => {
        this.setState({ connectionStatus: 'looking for stream' });
        this.lookForStream(authorId);
      });
    }
  }

  componentWillUnmount() {
    if (this.peer) {
      this.peer.destroy();
    }
  }

  lookForStream = async (authorId) => {
    const liveToken = await getLiveByUser(authorId, this.context.getToken());
    if (!liveToken) {
      this.setState({ connectionStatus: 'no live found' });
      return;
    }

    this.setState({ connectionStatus: 'connecting to stream' });
    this.peer.on('connection', (conn) => {
      this.setState({ connectionStatus: 'connected' });
      conn.on('data', (data) => {
        console.log(data);
      });

      conn.on('close', () => {
        this.setState({ connectionStatus: 'disconnected' });
      });
    });

    this.peer.connect(liveToken);
  };


  render() {
    return (
      <div style={{ margin: '200px 30px' }}>
        {!this.state.isFromLive ? null :
          <>{this.state.connectionStatus}</>
        }

        <MusicEditor
          enableEditing={false}
          ref={(ref) => (this.musicEditor = ref)}
        />
      </div>
    );
  }
}

async function getLiveByUser(email, token) {
  const res = await network(
    "query",
    `getLiveByUser(user: "${email}")`,
    `code`,
    token,
  );

  if (!res) return null;
  return res.data.getLiveByUser.code;
}


function fetchRecord(id, token, onSuccess, onError) {
  network(
    "query",
    `getRecordById(recordId: "${id}")`,
    `_id
    title
    published
    upvote
    record {
      offset,
      sound
      {
        note,
        instrument
      },
      action
    }`,
    token
  ).then((res) => {
    onSuccess(res.data.getRecordById.record);
  }).catch((err) => {
    onError(err);
  });
}

export default withRouter(PlaygroundPage);
