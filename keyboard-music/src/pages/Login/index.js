import React, { Component } from "react";
import { Button, Form } from "react-bootstrap";
import "./index.css";
import AuthContext from "../../context/auth-context";

class LoginPage extends Component {
  state = {
    email: "",
    password: "",
  };

  static contextType = AuthContext;

  signUp = (e) => {
    e.preventDefault();

    const requestBody = {
      query: `
        mutation {
          createUser(userInput: { email: "${this.state.email}", password: "${this.state.password}" }) {
            _id
            email
          }
        }
      `,
    };

    fetch("http://localhost:8000/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Failed to sign up");
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  signIn = (e) => {
    e.preventDefault();

    const requestBody = {
      query: `
        query {
          login(email: "${this.state.email}", password: "${this.state.password}") {
            userId
            token
            tokenExpiration
          }
        }
      `,
    };

    fetch("http://localhost:8000/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Failed to sign in");
        }
        return res.json();
      })
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
        console.log(err);
      });
  };

  render() {
    return (
      <div className="login-page">
        <h1>Sign In / Sign Up</h1>
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
