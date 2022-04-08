import React, { Component } from "react";
import { Card, Button } from 'react-bootstrap';
import network from "../../helpers/network";
import AuthContext from "../../context/auth-context";
import { SuitHeart, SuitHeartFill } from 'react-bootstrap-icons';

import "./index.css";

class CommunityPage extends Component {
  state = {
    records: [],
    page: 1,
    upvotes: [],
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

  componentDidMount = () => {
    this.getPublishedRecords();
    this.getUserUpvotes();
  }

  render() {
    return (
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
    </div>);
  }
}

export default CommunityPage;
