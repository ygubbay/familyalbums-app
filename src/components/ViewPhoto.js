import React from "react";
import { Button, Glyphicon } from "react-bootstrap";
import "./ViewPhoto.css";


export default function ViewPhoto({ upload, prev_click, next_click }) {

  const image2 = "https://ygubbay-photo-albums.s3.eu-west-2.amazonaws.com/public/" + encodeURI(upload.Filename);

    function view() {}
    function deleteFile() {}
    
  return (

    <div className="view-photo-env">
        
        <img className="view-photo-img" src={image2} ></img>
       
        <div style={{textAlign: "center"}}>
            <button className="tiny-button" onClick={prev_click}>PREV</button>
            <button className="tiny-button" onClick={next_click}>NEXT</button>
        </div>
    </div>
  );
}