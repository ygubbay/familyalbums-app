import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./containers/Home";
import NotFound from "./containers/NotFound";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import NewNote from "./containers/NewAlbum";
import ViewAlbum from "./containers/ViewAlbum";
import AddPictures from "./containers/AddPictures";

export default function Routes() {
  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/login">
        <Login />
      </Route>
      <Route exact path="/signup">
        <Signup />
      </Route>
      <Route exact path="/albums/new">
        <NewNote />
      </Route>
      <Route exact path="/albums/view">
        <ViewAlbum />
      </Route>
      <Route exact path="/albums/addpictures">
        <AddPictures />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}