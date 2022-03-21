import React from "react";
import { Navbar, Nav, Container, Alert } from "react-bootstrap";

import AuthContext from "../../context/auth-context";

const Navigation = (props) => {
  const context = React.useContext(AuthContext);

  return (
    <header>
      <Navbar bg="dark" variant="dark" style={{ zIndex: 10 }}>
        <Container>
          <Navbar.Brand href="/">Keyboard Music</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Nav className="me-auto">
            {/* community */}
            <Nav.Link href="/community" eventKey="community" active="false">
              Community
            </Nav.Link>
            {/* account related info */}
            <Nav.Link href="/me" eventKey="me">
              Me
            </Nav.Link>
            {/* perform and create music */}
            <Nav.Link href="/playground" eventKey="playground">
              Playground
            </Nav.Link>
            <Nav.Link href="/test" eventKey="test">
              Test
            </Nav.Link>
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
