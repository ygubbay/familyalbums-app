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

export default function AddPictures() {
  const file = useRef(null);
  const history = useHistory();
  const [album, setAlbum] = useState([]);
  const [photos, setPhotos] = useState({});
  const [photoRows, setPhotoRows] = useState([]);
  const [isAddPictures, setIsAddPictures] = useState(false);
    

  
  const [isLoading, setIsLoading] = useState(false);
  const { userEmail } = useAppContext();

  let { id } = useParams();

  async function s3Upload(key_prefix, file) {

    const date_prefix = new Date().YYYYMMDDHHMMSS();
    const filename = `${date_prefix}_${file.name}`;
    const stored = await Storage.put(key_prefix + "/" + filename, file, {
      level: 'public',
      contentType: file.type,
    });
  
    return stored.key;
  }
 
  function getAlbum(partition_key) 
   {
        
        return API.get("albums", "/album/" + partition_key, {
            headers: { "Content-Type": "application/x-www-form-urlencoded", 
            Accept: "application/json"
            }
        });
   }

   function getPhotos(partition_key) 
   {
        return API.get("albums", "/uploads/" + partition_key, {
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

          await getAlbum(id)
          .then( (response) =>
          {
              console.log('getalbum response');
              console.log(JSON.stringify(response));
              
              setAlbum(response);

          })
          .catch(err => console.log(err));
      
          await  getPhotos(id)
          .then( (response) =>
          {
              console.log('getphotos response now');
              console.log(JSON.stringify(response));
              
              setPhotos(response);

              var photoCOLs = [];
              response.map((p, ind) => {

                photoCOLs.push(<tr key={'photo' + ind}>
                                <td><img src={'https://ygubbay-photo-albums-thumbnails.s3.eu-west-2.amazonaws.com/public/' + p.Filename} /></td>
                                <td>{p.PartitionKey}</td>
                                </tr>);

            });

            setPhotoRows(photoCOLs);
          })
          .catch(err => console.log(err));

          
          setIsLoading(false);

    }
    catch(e) {
      if (e !== 'No current user') {
        onError(e);
      }
    }
  
    
  }
  

  function addUpload(uploaded_file)
  {
    return API.post("albums", "/uploads", {
      headers: { "Content-Type": "application/x-www-form-urlencoded", 
      Accept: "application/json"
      },
      body: uploaded_file
    });
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

        const album_prefix = id.substring(0, 4) + "/" + id.substring(5);
        
        s3Upload(album_prefix, current_file)
        .then((response) => {

          console.log('uploaded', current_file, response);
          
          let upload = { OriginalFilename: current_file.name, 
                          Filename: response, 
                          AlbumKey: id,
                          LastModifiedDate: current_file.lastModifiedDate,
                          Size: current_file.size,
                          Type: current_file.type  };

          return upload;
        })
        .then((upload) => {

          console.log("upload info to aws");
          return addUpload(upload)
        })
        .then((upload_response) => {

          console.log("Upload info saved");
        });
    
        
        
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
      <div>Photos total: {photos.length}</div>

    </div>
    <hr />

    <Table striped bordered hover>
        <thead>
            <tr>
            <th>File</th>
            <th>PartitionKey</th>
            </tr>
        </thead>
        <tbody>
            {photoRows}
            
        </tbody>
        </Table>

     {addPictures}


      
    </div>
  );
}