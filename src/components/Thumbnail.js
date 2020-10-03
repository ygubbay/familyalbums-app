import React from "react";
import "./Thumbnail.css";
import { API } from "aws-amplify";

export default function Thumbnail({ upload, viewPhoto, deletePhoto }) {

   const image_url = "url(https://ygubbay-photo-albums-thumbnails.s3.eu-west-2.amazonaws.com/public/" + encodeURI(upload.Filename);


   
    
  return (

    <div className="photo-div1">
        <div className="photo-div2" style={{backgroundImage: image_url + ")"}}></div>
        <div className="buttons-div">
            <button className="tiny-button" onClick={() => viewPhoto()}>view</button>
            <button className="tiny-button" onClick={() => deletePhoto()}>delete</button>
        </div>
    </div>
  );
}