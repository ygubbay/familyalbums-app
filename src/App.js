import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./App.css";
import Routes from "./Routes";
import { AppContext } from "./libs/contextLib";
import { Auth } from "aws-amplify";
import { onError } from "./libs/errorLib";

function App() {

  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    onLoad();
  }, []);
  
  async function onLoad() {
    try {

      console.log(isAuthenticated);
      await Auth.currentSession()
      .then(data => {
        console.log("currentSession", data);
        setUserInfo(data.idToken.payload);
        console.log("AppLoad: userInfo", userInfo);
        userHasAuthenticated(true);
      })
      .catch(err => console.log(err));
      
    }
    catch(e) {
      if (e !== 'No current user') {
        onError(e);
      }
    }
  
    console.log("App: userInfo", userInfo);
    setIsAuthenticating(false);
  }
  
  async function handleLogout() {
    setUserInfo({});
    await Auth.signOut();
  
    userHasAuthenticated(false);
    history.push("/login");
  }

  return (
    !isAuthenticating &&
    <div className="App container">
      <Navbar fluid collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">Family Albums App</Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
            {isAuthenticated
              ? <><LinkContainer to="/albums/new">
                    <NavItem>New album</NavItem>
                  </LinkContainer>
                  <LinkContainer to="/albums/view">
                    <NavItem>View albums</NavItem>
                  </LinkContainer>
                  <LinkContainer to="/albums/archive">
                    <NavItem>Archive</NavItem>
                  </LinkContainer>
                  <NavItem onClick={handleLogout}>Logout</NavItem>
                </>
              : <>
                  <LinkContainer to="/login">
                    <NavItem>Login</NavItem>
                  </LinkContainer>
                </>
            }
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      {isAuthenticated
              ? <div className="user-info">{userInfo.given_name + ' ' + userInfo.family_name}</div>:<></>}
      <AppContext.Provider
        value={{ isAuthenticated, userHasAuthenticated, userInfo, setUserInfo }} >
        <Routes />
      </AppContext.Provider>
    </div>
  );
}

export default App;