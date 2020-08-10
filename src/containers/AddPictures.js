import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import { onError } from "../libs/errorLib";
import "./NewAlbum.css";
import { useAppContext } from "../libs/contextLib";
import { Storage } from "aws-amplify";
import { API } from "aws-amplify";
import { Table, Button } from "react-bootstrap";


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
  const [album, setAlbum] = useState([]);
  const [isAddPictures, setIsAddPictures] = useState(false);
    

  
  const [isLoading, setIsLoading] = useState(false);
  const { userEmail } = useAppContext();

  let { id } = useParams();

  function validateForm() {
    return album_name.length > 0;
  }

  function getAlbum(partition_key) 
   {
        var path = "/album/${partition_key}";

        return API.get("albums", "/album/" + partition_key, {
            headers: { "Content-Type": "application/x-www-form-urlencoded", 
            Accept: "application/json"
            }
        });
   }

  useEffect(() => {
    onLoad();
  }, []);
  
  async function onLoad() {
    try {
        console.log('onLoad');
      await  getAlbum(id).then( (response) =>
        {
            console.log('response now');
            console.log(JSON.stringify(response));
            
            setAlbum(response);

            setIsLoading(false);
        })
        .catch(err => console.log(err));
      
    }
    catch(e) {
      if (e !== 'No current user') {
        onError(e);
      }
    }
  
    
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

  var addPictures = !isAddPictures ? <Button onClick={() => setIsAddPictures(true)} variant="outline-primary">Add pictures</Button>: 
      <div>
        <h3>Add pictures</h3>

        <Button onClick={() => setIsAddPictures(false)} variant="outline-primary">Close</Button>
        <p className="note">Note : your browser will process the zip file, don't choose a file too big !</p>
          <input type="file" id="file" name="file" multiple onChange={onFileChange} /><br />

          <div id="result_block" className="hidden">
            <h3>Content :</h3>
            <div id="result"></div>
          </div>
        </div>;

  return (
    <div className="NewNote">
      <h2>Album - {album.Name}</h2>
      
      <div>
      <div>Year: {album.Year}</div>
      <div>Owner: {album.Owner}</div>
      <div>Date created: {album.DateCreated}</div>

    </div>
    <hr />

     {addPictures}


      
    </div>
  );
}