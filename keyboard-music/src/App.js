import React, { Component } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";
import LoginPage from "./pages/Login";
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
            {/* <Route path="/" exact /> */}
            <Route path="/auth" element={<LoginPage />} />
          </Routes>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  }
}

export default App;
