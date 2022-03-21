import React, { Component } from "react";
import { Button, Form, Alert } from "react-bootstrap";
import { Navigate } from "react-router-dom";

import "./index.css";
import AuthContext from "../../context/auth-context";
import network from "../../helpers/network";

class LoginPage extends Component {
  state = {
    email: "",
    password: "",
    alertMessage: "",
    variant: "",
    redirect: null,
  };

  static contextType = AuthContext;

  signUp = (e) => {
    e.preventDefault();

    if (!this.state.email.trim() || !this.state.password.trim()) {
      return;
    }

    network(
      "mutation",
      `createUser(userInput: { email: "${this.state.email}", password: "${this.state.password}" })`,
      `_id
      email`
    ).then((res) => {
      this.setState({
        email: res.data ? "" : this.state.email,
        password: res.data ? "" : this.state.password,
        variant: res.data ? "success" : "danger",
        alertMessage: res.data
          ? `Success! You can use ${res.data.createUser.email} to sign in now.`
          : res.errors[0].message,
      });
    });
  };

  signIn = (e) => {
    e.preventDefault();

    if (!this.state.email.trim() || !this.state.password.trim()) {
      return;
    }

    network(
      "query",
      `login(email: "${this.state.email}", password: "${this.state.password}")`,
      `userId
      token
      tokenExpiration`
    ).then((res) => {
      if (res.data) {
        let data = res.data.login;
        if (data.token) {
          this.context.login(data.userId, data.token, data.tokenExpiration);
          this.setState({
            email: "",
            password: "",
            variant: "",
            alertMessage: "",
            redirect: "/community",
          });
        }
      } else {
        this.setState({
          variant: "danger",
          alertMessage: res.errors[0].message,
        });
      }
    });
  };

  render() {
    if (this.state.redirect) {
      return <Navigate to={this.state.redirect} />
    }

    return (
      <div className="login-page">
        <Alert variant={this.state.variant}>{this.state.alertMessage}</Alert>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="label">Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={this.state.email}
              onChange={(e) => this.setState({ email: e.target.value })}
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="label">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={this.state.password}
              onChange={(e) => this.setState({ password: e.target.value })}
            />
          </Form.Group>

          <Button
            className="btn"
            variant="primary"
            type="submit"
            onClick={this.signUp}
          >
            Sign Up
          </Button>
          <Button
            className="btn"
            variant="primary"
            type="submit"
            onClick={this.signIn}
          >
            Sign In
          </Button>
        </Form>
      </div>
    );
  }
}

export default LoginPage;
