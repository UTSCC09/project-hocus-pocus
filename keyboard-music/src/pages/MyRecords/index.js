import React, { Component } from "react";
import { Card, Button } from 'react-bootstrap';
import network from "../../helpers/network";
import AuthContext from "../../context/auth-context";
import "./index.css";

class MyRecordsPage extends Component {
  state = {
    records: []
  };

  static contextType = AuthContext;

  getCurrentUserRecord = () => {
    network(
      "query",
      "getRecordsByAuthor",
      `_id
      published`,
      window.sessionStorage.getItem("token")
    ).then((res) => {
      if (res.data) {
        this.setState({ records: res.data.getRecordsByAuthor });
        console.log(this.state.records);
      }
    });
  }

  publishRecord = (recordId) => {
    network(
      "mutation",
      `publishRecord(recordId: "${recordId}")`,
      "success",
      this.context.token
    ).then(res => {
      if (res.data) {
        this.getCurrentUserRecord();
      }
    })
  }

  unpublishRecord = (recordId) => {
    network(
      "mutation",
      `unpublishRecord(recordId: "${recordId}")`,
      "success",
      this.context.token
    ).then(res => {
      if (res.data) {
        this.getCurrentUserRecord();
      }
    })
  }

  deleteRecord = (recordId) => {
    network(
      "mutation",
      `deleteRecord(recordId: "${recordId}")`,
      "success",
      this.context.token
    ).then(res => {
      if (res.data) {
        this.getCurrentUserRecord();
      }
    })
  }

  componentDidMount = () => {
    this.getCurrentUserRecord();
  }

  render() {
    return (
      <div>
        {this.state.records.map((value, index) => {
          return (
            <Card key={index} className="card">
              <Card.Body>
                <Card.Title className="card-title">{value._id}</Card.Title>
                {value.published && <Card.Text>published</Card.Text>}
                {!value.published && <Card.Text>not published</Card.Text>}
                <Button onClick={() => {value.published ? this.unpublishRecord(value._id) : this.publishRecord(value._id)}}>
                  { value.published ? 'Unpublish' : 'Publish' }
                </Button>
                <Button onClick={() => this.deleteRecord(value._id)}>Delete</Button>
              </Card.Body>
            </Card>
          );
        })}
      </div>
    );
  }
}

export default MyRecordsPage;