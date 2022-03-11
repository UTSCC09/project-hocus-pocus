import React, { Component } from "react";
import { Button, Form } from "react-bootstrap";
import "./index.css";
import AuthContext from "../../context/auth-context";
import network from "../../helpers/network";

class LoginPage extends Component {
  state = {
    email: "",
    password: "",
  };

  static contextType = AuthContext;

  signUp = (e) => {
    e.preventDefault();

    network(
      "mutation",
      `createUser(userInput: { email: "${this.state.email}", password: "${this.state.password}" })`,
      `_id
      email`
    )
      .then((resData) => {
        console.log(resData);
      })
      .catch((err) => {
        console.warn(err);
      });
  };

  signIn = (e) => {
    e.preventDefault();

    network(
      "query",
      `login(email: "${this.state.email}", password: "${this.state.password}")`,
      `userId
      token
      tokenExpiration`
    )
      .then((resData) => {
        if (resData.data.login.token) {
          this.context.login(
            resData.data.login.userId,
            resData.data.login.token,
            resData.data.login.tokenExpiration
          );
        }
      })
      .catch((err) => {
        console.warn(err);
      });
  };

  render() {
    return (
      <div className="login-page">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="label">Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={this.email}
              onChange={(e) => this.setState({ email: e.target.value })}
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="label">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={this.password}
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
