import React, { Component } from "react";
import { Card, Button } from 'react-bootstrap';
import network from "../../helpers/network";
import AuthContext from "../../context/auth-context";
import "./index.css";
import { Navigate } from "react-router-dom";

class MyRecordsPage extends Component {
  state = {
    records: [],
    redirect: '',
    redirect_id: '',
  };

  static contextType = AuthContext;

  getCurrentUserRecord = () => {
    network(
      "query",
      "getRecordsByAuthor",
      `_id
      title
      published`,
      window.sessionStorage.getItem("token")
    ).then((res) => {
      if (res.data) {
        this.setState({ records: res.data.getRecordsByAuthor });
        // console.log(this.state.records);
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
    if (this.state.redirect) {
      return <Navigate to={this.state.redirect} state={{recordId: this.state.redirect_id}} />
    }

    return (
      <div className="my-records-page">
        {this.state.records.map((value, index) => {
          return (
            <Card key={index} className="card">
              <Card.Body>
                <Card.Title className="card-title">{value.title}</Card.Title>

                {value.published && <Card.Text>This record is published!</Card.Text>}
                {!value.published && <Card.Text>This record is not published.</Card.Text>}

                <div className="button-group">
                  <Button 
                    variant="warning" 
                    onClick={() => this.setState({ redirect: '/playground', redirect_id: value._id })}
                  >
                      Modify
                  </Button>
                  <Button>Play</Button>
                </div>

                <div className="button-group">
                  <Button 
                    variant="success" 
                    onClick={() => {value.published ? this.unpublishRecord(value._id) : this.publishRecord(value._id)}}
                  >
                    { value.published ? 'Unpublish' : 'Publish' }
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => this.deleteRecord(value._id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          );
        })}
      </div>
    );
  }
}

export default MyRecordsPage;