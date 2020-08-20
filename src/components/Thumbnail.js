import React from "react";
import { Button, Glyphicon } from "react-bootstrap";


export default function Thumbnail({ upload }) {

  const image_url = "url(https://ygubbay-photo-albums-thumbnails.s3.eu-west-2.amazonaws.com/public/" + encodeURI(upload.Filename);

    function view() {}
    function deleteFile() {}
  return (

    <div className="photo-div1">
        <div className="photo-div2" style={{backgroundImage: image_url + ")"}}></div>
        <div style={{textAlign: "center"}}>
            <button className="tiny-button" onClick={view}>view</button>
            <button className="tiny-button" onClick={deleteFile}>delete</button>
        </div>
    </div>
  );
}