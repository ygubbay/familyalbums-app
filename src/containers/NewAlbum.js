import React, { useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../libs/errorLib";
import "./NewAlbum.css";
import { API } from "aws-amplify";
import { useAppContext } from "../libs/contextLib";

export default function NewNote() {
  const file = useRef(null);
  const history = useHistory();
  const [album_name, setAlbumName] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const { userEmail } = useAppContext();

  var currentYear = new Date().getFullYear(), years = [];
  var startYear = currentYear;  
  while ( startYear > currentYear - 90 ) {
      years.push(startYear--);
  } 
  const [album_year, setAlbumYear] = useState(currentYear);
  const listItems = years.map((number) => 

<option value={number} key={number}>{number}</option>
  );

  function validateForm() {
    return album_name.length > 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
  
    
  
    setIsLoading(true);
  
    try {

      var album = { Name: album_name, Year: album_year, Owner: userEmail };  
      await createAlbum(album);
      history.push("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }
  
  function createAlbum(album) {
    return API.post("albums", "/albums", {
      headers: { "Content-Type": "application/x-www-form-urlencoded", 
      Accept: "application/json"
      },
      body: album
    });
  }

  return (
    <div className="NewNote">
      <h2>New Album</h2>
      <form onSubmit={handleSubmit}>
        <FormGroup controlId="album_name">
          <FormControl
            value={album_name}
            componentClass="input"
            placeholder="Album name"
            onChange={e => setAlbumName(e.target.value)}
          />
        </FormGroup>
        <FormGroup controlId="album_year">
          <FormControl
            value={album_year}
            componentClass="select"
            placeholder="Album year"
            onChange={e => setAlbumYear(e.target.value)}
            onSelect={e => setAlbumYear(e.target.value)}
          >
              {listItems}
          </FormControl>
        </FormGroup>
        <LoaderButton
          block
          type="submit"
          bsSize="large"
          bsStyle="primary"
          isLoading={isLoading}
          disabled={!validateForm()}
        >
          Create
        </LoaderButton>
      </form>
    </div>
  );
}