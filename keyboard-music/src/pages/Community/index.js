import React, { Component } from "react";
import { Card, Button, Alert } from 'react-bootstrap';
import network from "../../helpers/network";
import AuthContext from "../../context/auth-context";
import { SuitHeart, SuitHeartFill } from 'react-bootstrap-icons';

import "./index.css";

class CommunityPage extends Component {
  state = {
    records: [],
    page: 1,
    upvotes: [],
    livestreams: [],
    alert_message: ""
  };

  static contextType = AuthContext;

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
        console.log(this.state.livestreams);
      }
    })
  }

  getLiveByUser = (email) => {
    network(
      "query",
      `getLiveByUser(user: "${email}")`,
      `code`,
      this.context.getToken()
    ).then(res => {
      if (res.data) {
        console.log(res.data.getLiveByUser.code);
      }
    })
  }

  componentDidMount = () => {
    this.getPublishedRecords();
    if (this.context.getToken()) {
      this.getUserUpvotes();
    }
  }

  render() {
    return (
    <div>
      {this.state.alert_message && <Alert variant="danger" onClose={() => this.setState({alert_message: ""})}>{this.state.alert_message}</Alert>}
      <div className="me">
        {this.state.records.map((record, index) => {
          return (
            <Card key={index} className="card">
              <Card.Title className="card-title">{record.title}</Card.Title>
              <Card.Text>Author: {record.author}</Card.Text>
              <Button className="btn" variant="dark">Play Music</Button>
              <div className="heart-div">
                {record.upvote}
                {this.state.upvotes.includes(record._id) && <SuitHeartFill className="heart" onClick={() => this.undoUpvote(record._id)} />}
                {!this.state.upvotes.includes(record._id) && <SuitHeart className="heart" onClick={() => this.upvote(record._id)} />}
              </div>
            </Card>
          );
        })}
      </div>
      <Button onClick={this.getLiveStreams}>Get livestreams</Button>
      <Button onClick={() => this.getLiveByUser('minqi0303@gmail.com')}>Get live code of minqi0303@gmail.com</Button>
    </div>
    );
  }
}

export default CommunityPage;
