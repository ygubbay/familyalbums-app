import React from "react";
import "./Thumbnail.css";

import { Button, Glyphicon } from "react-bootstrap";


export default function Thumbnail({ upload, viewPhoto }) {

   const image_url = "url(https://ygubbay-photo-albums-thumbnails.s3.eu-west-2.amazonaws.com/public/" + encodeURI(upload.Filename);


    
    function deleteFile() {}
  return (

    <div className="photo-div1">
        <div className="photo-div2" style={{backgroundImage: image_url + ")"}}></div>
        <div className="buttons-div">
            <button className="tiny-button" onClick={() => viewPhoto()}>view</button>
            <button className="tiny-button" onClick={deleteFile}>delete</button>
        </div>
    </div>
  );
}