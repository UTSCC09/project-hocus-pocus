import React from "react";
import { Navbar, Nav, Container, Alert } from "react-bootstrap";

import AuthContext from "../../context/auth-context";

const Navigation = (props) => {
  const context = React.useContext(AuthContext);
  const currentURL = window.location.pathname;

  return (
    <header>
      <Navbar bg="dark" variant="dark" style={{ zIndex: 10 }}>
        <Container>
          <Navbar.Brand href="/">Keyboard Music</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Nav className="me-auto">
            {/* community */}
            <Nav.Link href="/community" eventKey="community" active={currentURL === '/community'}>
              Community
            </Nav.Link>
            {/* account related info */}
            <Nav.Link href="/me" eventKey="me" active={currentURL === '/me'}>
              Me
            </Nav.Link>
            {/* perform and create music */}
            <Nav.Link href="/playground" eventKey="playground" active={currentURL === '/playground'}>
              Playground
            </Nav.Link>
            <Nav.Link href="/test" eventKey="test" active={currentURL === '/test'}>
              Test
            </Nav.Link>
          </Nav>
          <Nav>
            {!context.token && (
              <Nav.Link href="/auth" active={currentURL === '/auth'}>
                Login / Register
              </Nav.Link>
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
