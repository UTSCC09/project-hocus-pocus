import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";

import AuthContext from "../../context/auth-context";

const Navigation = (props) => {
  const context = React.useContext(AuthContext);

  return (
    <header>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="/">Keyboard Music</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/test">Test</Nav.Link>
          </Nav>
          <Nav>
            {!context.token && (
              <Nav.Link href="/auth">Login / Register</Nav.Link>
            )}
            {context.token && (
              <Nav.Link href="/auth" onClick={context.logout}>
                Logout
              </Nav.Link>
            )}
          </Nav>
        </Container>
      </Navbar>
    </header>
  );
};

export default Navigation;
