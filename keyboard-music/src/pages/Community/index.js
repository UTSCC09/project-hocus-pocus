import React, { Component } from "react";
import { Card, Button, Alert } from 'react-bootstrap';
import network from "../../helpers/network";
import AuthContext from "../../context/auth-context";
import { SuitHeart, SuitHeartFill } from 'react-bootstrap-icons';

import "./index.css";
import withRouter from "../../helpers/withRouter";
import { Navigate } from "react-router-dom";

class CommunityPage extends Component {
  static contextType = AuthContext;
  state = {
    records: [],
    page: 1,
    upvotes: [],
    livestreams: [],
    alert_message: ""
  };

  componentDidMount = () => {
    this.getPublishedRecords();
    if (this.context.getToken()) {
      this.getUserUpvotes();
    }

    this.getLiveStreams();
    setInterval(this.getLiveStreams, 5000);
  }

  componentWillUnmount = () => {
    clearInterval(this.getLiveStreams);
  }

  getPublishedRecords = () => {
    network(
      "query",
      `getPublishedRecordsByPage(page: ${this.state.page})`,
      `_id
      title
      author
      upvote`,
      this.context.getToken()
    ).then((res) => {
      if (res.data) {
        this.setState({ records: res.data.getPublishedRecordsByPage });
      }
    })
  }

  getUserUpvotes = () => {
    network(
      "query",
      "getUpvotesByUser",
      `recordId`,
      this.context.getToken()
    ).then((res) => {
      if (res.data) {
        const ids = res.data.getUpvotesByUser.map(e => e.recordId);
        this.setState({ upvotes: ids });
      }
    })
  }

  upvote = (recordId) => {
    if (!this.context.getToken()) {
      this.setState({ alert_message: 'You must login to do this operation!' });
      return;
    }
    network(
      "mutation",
      `upvoteRecord(recordId: "${recordId}")`,
      "success",
      this.context.getToken()
    ).then(res => {
      if (res.data) {
        this.getPublishedRecords();
        this.getUserUpvotes();
      }
    })
  }

  undoUpvote = (recordId) => {
    if (!this.context.getToken()) {
      this.setState({ alert_message: 'You must login to do this operation!' });
      return;
    }
    network(
      "mutation",
      `undoUpvoteRecord(recordId: "${recordId}")`,
      "success",
      this.context.getToken()
    ).then(res => {
      if (res.data) {
        this.getPublishedRecords();
        this.getUserUpvotes();
      }
    })
  }

  getLiveStreams = () => {
    network(
      "query",
      "getLiveStreams",
      `user
      code`,
      this.context.getToken()
    ).then(res => {
      if (res.data) {
        this.setState({ livestreams: res.data.getLiveStreams });
      }
    })
  }

  render() {
    if (this.state.redirectUser) {
      return (
        <Navigate
          to="/view"
          state={{ liveAuthorId: this.state.redirectUser }}
        />
      );
    }

    if (this.state.redirectRecord) {
      return (
        <Navigate
          to="/view"
          state={{ recordId: this.state.redirectRecord }}
        />
      );
    }

    return (
      <div>
        {this.state.alert_message && <Alert variant="danger" onClose={() => this.setState({ alert_message: "" })}>{this.state.alert_message}</Alert>}
        <div className="me">
          {this.state.records.map((record, index) => {
            return (
              <Card key={index} className="card">
                <Card.Title className="card-title">{record.title}</Card.Title>
                <Card.Text>Author: {record.author}</Card.Text>
                <Button className="btn" variant="dark" onClick={() => { this.setState({ redirectRecord: record._id }) }}>Play Music</Button>
                <div className="heart-div">
                  {record.upvote}
                  {this.state.upvotes.includes(record._id) && <SuitHeartFill className="heart" onClick={() => this.undoUpvote(record._id)} />}
                  {!this.state.upvotes.includes(record._id) && <SuitHeart className="heart" onClick={() => this.upvote(record._id)} />}
                </div>
              </Card>
            );
          })}
        </div>
        {this.state.livestreams.map((livestream, index) => (
          <Button key={index} onClick={() => this.setState({ redirectUser: livestream.user })}>
            <h4>{livestream.user}</h4>
          </Button>
        ))
        }
      </div >
    );
  }
}

export default withRouter(CommunityPage);
