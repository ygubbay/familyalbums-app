import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./containers/Home";
import NotFound from "./containers/NotFound";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import NewNote from "./containers/NewAlbum";
import ViewAlbums from "./containers/ViewAlbums";
import AddPictures from "./containers/AddPictures";
import ArchivePage from "./containers/ArchivePage";

export default function Routes() {
  return (
    <Switch>
      <Route exact path="/">
        <ViewAlbums />
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
        <ViewAlbums />
      </Route>
      <Route exact path="/albums/archive">
        <ArchivePage />
      </Route>
      <Route path="/albums/:id" >
        <AddPictures />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}