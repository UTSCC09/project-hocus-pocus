import React, { Component } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";
import LoginPage from "./pages/Login";
import MePage from "./pages/Me";
import PlaygroundPage from "./pages/Playground";
import CommunityPage from "./pages/Community";
import Navigation from "./components/Navigation";
import AuthContext from "./context/auth-context";
class App extends Component {
  state = {
    token: null,
    userId: null,
  };

  login = (userId, token, tokenExpiration) => {
    this.setState({ userId, token });
  };

  logout = () => {
    this.setState({ userId: null, token: null });
  };

  render() {
    return (
      <BrowserRouter>
        <AuthContext.Provider
          value={{
            token: this.state.token,
            userId: this.state.userId,
            login: this.login,
            logout: this.logout,
          }}
        >
          <Navigation />
          <Routes>
            <Route path="/" element={<CommunityPage />} exact />
            <Route path="/auth" element={<LoginPage />} />
            <Route path="/me" element={<MePage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/community" element={<CommunityPage />} />
          </Routes>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  }
}

export default App;
