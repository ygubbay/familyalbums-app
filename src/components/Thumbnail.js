import React, { useRef, useState } from "react";
import "./Thumbnail.css";
import { Button, Alert } from "react-bootstrap";


export default function Thumbnail({ upload, viewPhoto, deletePhoto, saveComment }) {

  const [photoText, setPhotoText] = useState('');
  const [editText, setEditText] = useState('');
  const [showText, setShowText] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

   const image_url = "https://ygubbay-photo-albums-thumbnails.s3.eu-west-2.amazonaws.com/public/" + encodeURI(upload.Filename);

  const closeText = () => {

    setEditText('');
    setShowText(false);
  }

   const saveText = () => {

    saveComment(editText);

    setPhotoText(editText);
    setEditText('');
    setShowText(false);
   }

   const cancelDelete = () => {
    
    setConfirmDelete(false);
   }

   const buttons = showText ? 
  <>  
   </>
   :
   <>
      <Button className="tiny-button" onClick={() => viewPhoto()} style={{ width: "40px"}}><span className="glyphicon glyphicon-eye-open" ></span></Button>
      <Button className="tiny-button" onClick={() => setConfirmDelete(true)} style={{ width: "40px"}}><span className="glyphicon glyphicon-remove"></span></Button>
      <Button className="tiny-button" onClick={() => {setShowText(true); setEditText(photoText);}} style={{ width: "40px"}}><span className="glyphicon glyphicon-text-width"></span></Button>
    </>;
    
  return (

    <div className="photo-div1">
          <section className="holdMe">
            <div style={{width: "100%"}}>
              <img src={image_url} alt="html5"/>
            </div>
          </section>
        <div style={{"display": !showText ? "flex": "none" }} className="under-photo" >
          <span  style={{"display": !showText ? "block": "none" }} className="photo-text">{photoText}</span>
          <div className="photo-buttons">{buttons}</div>
        </div>
              { confirmDelete ?  
              <div>
                <Alert key={0} variant={"warning"}>          
                Confirm you want to delete the current photo.<br />  Please choose:<br /> <Button  variant={"primary"}  className="btn-primary" onClick={() => { deletePhoto(); setConfirmDelete(false)}}>Delete</Button> or <Button variant="danger" onClick={() => cancelDelete()}  className="btn-danger">Cancel</Button>
              </Alert>
              </div>: <></> }
        <div style={{"display": showText ? "block": "none" }}>
          <input className="add-text"  type="text" value={editText} onChange={e => setEditText(e.target.value)} />
          <div className="buttons-div">

            <Button className="tiny-button" onClick={() => saveText()}>save</Button>
            <Button className="tiny-button" onClick={() => closeText()}>close</Button>
          </div>
        </div>
    </div>
  );
}