import React from "react";
import * as Tone from "tone";
import "./index.css";
import MusicEditor from "./MusicEditor";
import Peer from "peerjs";
import { ButtonGroup, Button } from "react-bootstrap";
import AuthContext from "../../context/auth-context";
import network from "../../helpers/network";

import withRouter from "../../helpers/withRouter";

const synth = new Tone.PolySynth().toDestination();


class PlaygroundPage extends React.Component {
  static contextType = AuthContext;
  state = {
    isFromLive: false,
  };
  musicEditor = null;

  componentDidMount() {
    if (this.props.router.location.state?.recordId) {
      // Coming from view
      fetchRecord(
        this.props.router.location.state.recordId,
        this.context.getToken(),
        (record) => { this.musicEditor.setRecord(record) },
        console.error
      );
    } else {
      // Coming from Live
      const authorId = this.props.router.location.state.liveAuthorId;
      this.authorId = authorId;
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
    const connection = this.peer.connect(liveToken);
    this.connection = connection;

    connection.on('open', () => {
      this.setState({ connectionStatus: 'connected' });
      this.musicEditor.reset();
      this.musicEditor.startRecording();
    });

    connection.on('data', (data) => {
      if (data.type === 'recordEntry') {
        if (data.recordEntry.action === "start") {
          synth.triggerAttack(data.recordEntry.sound.note);
        } else if (data.recordEntry.action === "end") {
          synth.triggerRelease(data.recordEntry.sound.note);
        }
        this.musicEditor.onNewNote(data.recordEntry);
        if (this.musicEditor.state.currentTime > 20000) {
          this.musicEditor.startRecording();
          this.musicEditor.stopRecording();
          this.musicEditor.reset();
        }
      }
    });

    connection.on('close', () => {
      this.setState({ connectionStatus: 'disconnected' });
      synth.releaseAll();
      this.musicEditor.stopRecording();
    });
  };

  render() {
    return (
      <div style={{ margin: '200px 0' }}>
        {!this.state.isFromLive ? null :
          <div>
            <ButtonGroup>
              <Button
                onClick={() =>
                  this.state.connectionStatus !== 'connected' ?
                    this.lookForStream(this.authorId) :
                    this.connection.close()
                }
              >{this.state.connectionStatus === 'connected' ? 'Disconnect' : this.state.connectionStatus === 'disconnected' ? 'Reconnect' : 'Retry'}</Button>
            </ButtonGroup>
            {this.state.connectionStatus}
          </div>
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
  try {
    const res = await network(
      "query",
      `getLiveByUser(user: "${email}")`,
      `code`,
      token,
    );
    return res?.data?.getLiveByUser?.code ?? null;
  } catch {
    return null;
  }
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
