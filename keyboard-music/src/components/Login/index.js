import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import "./index.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUp = () => {
    console.log("Signed up with", email, password);
  };

  const signIn = () => {
    console.log("Signed in with", email, password);
  };

  return (
    <div className="login-form">
      <h1>Sign In / Sign Up</h1>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label className="label">Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="label">Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button
          className="btn"
          variant="primary"
          type="submit"
          onClick={signUp}
        >
          Sign Up
        </Button>
        <Button
          className="btn"
          variant="primary"
          type="submit"
          onClick={signIn}
        >
          Sign In
        </Button>
      </Form>
    </div>
  );
}

export default Login;
