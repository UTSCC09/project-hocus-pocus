import React, { Component } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import network from "../../helpers/network";
import AuthContext from "../../context/auth-context";
import "./index.css";
import { Navigate } from "react-router-dom";
import { SuitHeartFill } from "react-bootstrap-icons";

class MyRecordsPage extends Component {
  state = {
    records: [],
    redirect: "",
    redirect_id: "",
  };

  static contextType = AuthContext;

  getCurrentUserRecord = () => {
    network(
      "query",
      "getRecordsByAuthor",
      `_id
      title
      published
      upvote`,
      this.context.getToken()
    ).then((res) => {
      if (res.data) {
        this.setState({ records: res.data.getRecordsByAuthor });
      }
    });
  };

  publishRecord = (recordId) => {
    network(
      "mutation",
      `publishRecord(recordId: "${recordId}")`,
      "success",
      this.context.getToken()
    ).then((res) => {
      if (res.data) {
        this.getCurrentUserRecord();
      }
    });
  };

  unpublishRecord = (recordId) => {
    network(
      "mutation",
      `unpublishRecord(recordId: "${recordId}")`,
      "success",
      this.context.getToken()
    ).then((res) => {
      if (res.data) {
        this.getCurrentUserRecord();
      }
    });
  };

  deleteRecord = (recordId) => {
    network(
      "mutation",
      `deleteRecord(recordId: "${recordId}")`,
      "success",
      this.context.getToken()
    ).then((res) => {
      if (res.data) {
        this.getCurrentUserRecord();
      }
    });
  };

  checkRecord = (recordId) => {
    this.setState({
      redirect: "/playground",
      redirect_id: recordId,
    });
  };

  componentDidMount = () => {
    if (!this.context.getToken()) {
      this.setState({ redirect: "/auth" });
      return;
    }
    this.getCurrentUserRecord();
  };

  render() {
    if (this.state.redirect) {
      return (
        <Navigate
          to={this.state.redirect}
          state={{ recordId: this.state.redirect_id }}
        />
      );
    }

    if (this.state.redirectView) {
      return (
        <Navigate
          to="/view"
          state={{ recordId: this.state.redirectView }}
        />
      );
    }

    return (
      <div className="my-records-page">
        {
          this.state.records.length === 0 ?
            (
              <Alert variant="info">
                You have no music records.
              </Alert>
            ) : null
        }
        {this.state.records.map((value, index) => {
          return (
            <Card key={index} className="card">
              <Card.Title className="card-title">{value.title}</Card.Title>
              <Card.Body>
                {value.published && (
                  <Card.Text>This record is published!</Card.Text>
                )}
                {!value.published && (
                  <Card.Text>This record is not published.</Card.Text>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <Button variant="dark" onClick={() => { this.checkRecord(value._id) }}>
                    Edit
                  </Button>
                  <Button variant="dark" onClick={() => { this.setState({ redirectView: value._id }) }}>
                    View
                  </Button>

                  <Button
                    variant="dark"
                    onClick={() => {
                      value.published
                        ? this.unpublishRecord(value._id)
                        : this.publishRecord(value._id);
                    }}
                  >
                    {value.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => this.deleteRecord(value._id)}
                  >
                    Delete
                  </Button>
                </div>

                <div className="heart-container">
                  {value.upvote}
                  <SuitHeartFill className="heart" />
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
