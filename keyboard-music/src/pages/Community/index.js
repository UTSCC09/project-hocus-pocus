import React, { Component } from "react";
import { Card, Button } from 'react-bootstrap';
import network from "../../helpers/network";

import "./index.css";

class CommunityPage extends Component {
  state = {
    records: [],
    page: 1
  };

  getPublishedRecords = () => {
    network(
      "query",
      `getPublishedRecordsByPage(page: ${this.state.page})`,
      `_id
      title`,
      window.sessionStorage.getItem("token")
    ).then((res) => {
      if (res.data) {
        this.setState({ records: res.data.getPublishedRecordsByPage });
        // console.log(this.state.records);
      }
    })
  }

  componentDidMount = () => {
    this.getPublishedRecords();
  }

  render() {
    return (
    <div className="me">
      {this.state.records.map((record, index) => {
        return (
          <Card key={index} className="card">
            <Card.Title className="card-title">{record.title}</Card.Title>
            <Button>Play</Button>
          </Card>
        );
      })}
    </div>);
  }
}

export default CommunityPage;
