import React from "react";
import { Button, Glyphicon } from "react-bootstrap";
import "./ViewPhoto.css";


export default function ViewPhoto({ upload, prev_click, next_click, thumbnail_click, index, album_count }) {

  const image2 = "https://ygubbay-photo-albums.s3.eu-west-2.amazonaws.com/public/" + encodeURI(upload.Filename);

    function view() {}
    function deleteFile() {}
    
  return (

    <div className="view-photo-env">
        
        <img className="view-photo-img" src={image2} ></img>
       
        <div style={{textAlign: "center", marginTop: "3px"}}>
            <div style={{display: "inline"}}>{index} of {album_count}</div>&nbsp;
            <Button onClick={prev_click}>PREV</Button>&nbsp;
            <Button onClick={next_click}>NEXT</Button>
            <Button onClick={thumbnail_click}><span className="glyphicon glyphicon-open" ></span></Button>
        </div>
    </div>
  );
}