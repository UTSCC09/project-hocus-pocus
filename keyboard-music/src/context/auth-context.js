import React from 'react';

export default React.createContext({
  getToken: () => {},
  getUserId: () => {},
  login: (userId, token, tokenExpiration) => {},
  logout: () => {}
});