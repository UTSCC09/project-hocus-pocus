import React, { Component } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";
import LoginPage from "./pages/Login";
import MePage from "./pages/Me";
import PlaygroundPage from "./pages/Playground";
import CommunityPage from "./pages/Community";
import MyRecordsPage from "./pages/MyRecords";
import ViewOnlyPage from "./pages/Playground/ViewOnly";
import Navigation from "./components/Navigation";
import AuthContext from "./context/auth-context";

class App extends Component {
  state = {
    token: null,
    userId: null,
  };

  componentDidMount() {
    if (window.sessionStorage.getItem("token") && window.sessionStorage.getItem("userId")) {
      this.setState({
        token: window.sessionStorage.getItem("token"),
        userId: window.sessionStorage.getItem("userId"),
      })
    }
  }

  login = (userId, token, tokenExpiration) => {
    this.setState({ userId, token });
    window.sessionStorage.setItem("userId", userId);
    window.sessionStorage.setItem("token", token);
  };

  logout = () => {
    this.setState({ userId: null, token: null });
    window.sessionStorage.clear();
  };

  getToken = () => {
    return this.state.token || window.sessionStorage.getItem("token");
  }

  getUserId = () => {
    return this.state.userId || window.sessionStorage.getItem("userId");
  }

  render() {
    return (
      <BrowserRouter>
        <AuthContext.Provider
          value={{
            getToken: this.getToken,
            getUserId: this.getUserId,
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
            <Route path="/my_records" element={<MyRecordsPage />} />
            <Route path="/view" element={<ViewOnlyPage />} />
          </Routes>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  }
}

export default App;
