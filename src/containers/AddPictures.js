import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import { onError } from "../libs/errorLib";
import "./NewAlbum.css";
import { useAppContext } from "../libs/contextLib";
import { Storage } from "aws-amplify";


Object.defineProperty(Date.prototype, 'YYYYMMDDHHMMSS', {
  value: function() {
      function pad2(n) {  // always returns a string
          return (n < 10 ? '0' : '') + n;
      }

      return this.getFullYear() +
             pad2(this.getMonth() + 1) + 
             pad2(this.getDate()) +
             pad2(this.getHours()) +
             pad2(this.getMinutes()) +
             pad2(this.getSeconds());
  }
});
export async function s3Upload(file) {

  const date_prefix = new Date().YYYYMMDDHHMMSS();
  const filename = `${date_prefix}_${file.name}`;
  const stored = await Storage.vault.put(filename, file, {
    contentType: file.type,
  });

  return stored.key;
}

export default function AddPictures() {
  const file = useRef(null);
  const history = useHistory();
  const [album_name, setAlbumName] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const { userEmail } = useAppContext();

  let { id } = useParams();

  function validateForm() {
    return album_name.length > 0;
  }

  
  
  async function onFileChange(event) {
    console.log(event.target.files)

    if (event.target.files.length == 0)
        return;

    console.log('# files to upload:', event.target.files.length);
    //
    // synchronouse file upload -> need to make this run in parallel
    //
    for (var i=0; i< event.target.files.length; i++)
    {
    
      const current_file = event.target.files[i];

      console.log('uploading: ', current_file);
      try {
        s3Upload(current_file).then((response) => {
          console.log('uploaded', current_file, response);
        })
    
        
        
      } catch (e) {
        onError(e);
        setIsLoading(false);
      }

    }
    


  }

  return (
    <div className="NewNote">
      <h2>Add Pictures</h2>
      
      <div>
      <h3>ID: {id}</h3>
    </div>
      <p className="note">Note : your browser will process the zip file, don't choose a file too big !</p>
        <input type="file" id="file" name="file" multiple onChange={onFileChange} /><br />

        <div id="result_block" className="hidden">
        <h3>Content :</h3>
        <div id="result"></div>
        </div>
    </div>
  );
}