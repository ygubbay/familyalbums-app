import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { onError } from "../libs/errorLib";
import { useAppContext } from "../libs/contextLib";
import { Storage } from "aws-amplify";
import { API } from "aws-amplify";
import { Table, Button } from "react-bootstrap";
import Thumbnail from "../components/Thumbnail";
import ViewPhoto from "../components/ViewPhoto";


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
  const [thumbnailRows, setThumbnailRows] = useState([]);
  const [isAddPictures, setIsAddPictures] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [uploadRows, setUploadRows] = useState([]);
  const [viewPhoto, setViewPhoto] = useState(null);
  

  
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

  function viewPhotoPrev()
  {
    if (viewPhoto > 0)
      setViewPhoto(viewPhoto-1);

  }

  function viewPhotoNext()
  {
    if (viewPhoto < photos.length - 1)
      setViewPhoto(viewPhoto+1);
  }
 
  function getAlbum(partition_key) 
   {
        
        return API.get("albums", "/album/" + partition_key, {
            headers: { "Content-Type": "application/x-www-form-urlencoded", 
            Accept: "application/json"
            }
        });
   }

   function setPhoto(photo_index)
   {
      setViewPhoto(photo_index);
   }


   function getPhotos(partition_key) 
   {
        API.get("albums", "/uploads/" + partition_key, {
            headers: { "Content-Type": "application/x-www-form-urlencoded", 
            Accept: "application/json"
            }
        })
        .then( (response) =>
          {
              console.log('getphotos response now');
              console.log(JSON.stringify(response));
              
              setPhotos(response);

              var photoCOLs = [];
              response.map((p, ind) => {

                // this is not matching Aws conversion " " -> +, 
                console.log("photo-div:", p.Filename);        
                console.log("https://ygubbay-photo-albums-thumbnails.s3.eu-west-2.amazonaws.com/public/" + encodeURI(p.Filename));   
                photoCOLs.push(<Thumbnail upload={ p } viewPhoto={() => setPhoto( ind ) } />);
            });

            setThumbnailRows(photoCOLs);
          })
          .catch(err => console.log(err));
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
      
          getPhotos(id);

          
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

  function setUploadStatus(filename, status)
  {
      var new_uploads = uploads;
      const upload = new_uploads.find(u => u.file == filename );
      if (upload)
        {
          upload.status = status;
        }
        else {
          new_uploads.push( { file: filename, status: status  });
        }
      
      setUploads(new_uploads);

      setUploadTable();
  }
  
  async function onFileChange(event) {
    console.log(event.target.files)

    if (event.target.files.length == 0)
        return;

    setIsUploading(true);
    console.log('# files to upload:', event.target.files.length);
    //
    // synchronouse file upload -> need to make this run in parallel
    //
    for (var i=0; i< event.target.files.length; i++)
    {
    
      const current_file = event.target.files[i];

      if (!current_file.type.startsWith('image'))
      {
        setUploadStatus(current_file.name, 'Not an image.  Only images can be uploaded to an album.');
        continue;
      }
      console.log('uploading: ', current_file);
      setUploadStatus(current_file.name, 'Uploading');

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

          setUploadStatus(current_file.name, 'Updating');
          console.log("upload info to aws", upload);
          return addUpload(upload)
        })
        .then((upload_response) => {

          setUploadStatus(current_file.name, 'Completed');

          console.log("Upload info saved", upload_response);

          const upload = uploads.find(u => u.status != 'Completed' );
         // if (!upload)
         // {
         //   setIsUploading(false);
         //   setIsAddPictures(false);

         //   getPhotos(id);
         // }
         getPhotos(id);
        });
        
      } catch (e) {
        onError(e);
        setIsUploading(true);
        setIsLoading(false);
      }
    }
  }


 function setUploadTable()
 {
    var rows = [];

    uploads.map((upload, ind) => {

    rows.push(<tr key={'upload' + ind}>
                        <td>{upload.file}</td>
                        <td>{upload.status}</td>
                        </tr>);

    });

    setUploadRows(rows);
 }


  var chooseUploadPictures = isUploading ? null: <div>
                                                  <Button onClick={() => setIsAddPictures(false)} variant="outline-primary">Close</Button>
                                                      <p className="note">Note : your browser will process the zip file, don't choose a file too big !</p>
                                                        <input type="file" id="file" name="file" multiple onChange={onFileChange} /><br />

                                                </div>;
  var addPictures = !isAddPictures ? <Button onClick={() => setIsAddPictures(true)} variant="outline-primary">Add pictures</Button>: 
      <div>
        <h3>Add pictures</h3>


          {chooseUploadPictures}
          <div id="result_block" className="hidden">
            <h3>Content :</h3>
            <div id="result"></div>
          </div>
        </div>;

            
    
  var uploadTable = !isUploading ? null:   
                      <div>
                        <div style={{marginBottom: "10px"}}>
                          Pictures currently uploading.  Please stay on the page until uploading completes.
                        </div>
                        <Table striped bordered hover>
                          <thead>
                              <tr>
                              <th>File</th>
                              <th>Status</th>
                              </tr>
                          </thead>
                          <tbody>
                              {uploadRows}
                              
                          </tbody>
                        </Table>
                      </div>  

  var main_display = isAddPictures ? <div>
                                      <hr />
                                      {addPictures}
                                      {uploadTable}
                                    </div>: 
                     viewPhoto > 0 ? <ViewPhoto upload={photos[viewPhoto]} 
                                                                  prev_click={() => viewPhotoPrev() } 
                                                                  next_click={() => viewPhotoNext() } />:
                      <div><div>{thumbnailRows}</div><div style={{clear: "both"}}></div></div>;
  return (
    <div className="NewNote">
      <h2>Album - {album.Name}</h2>
      
      <div>
        <div>Year: {album.Year}</div>
        <div>Owner: {album.Owner}</div>
        <div>Date created: {album.DateCreated}</div>
        <div>Photos total: {photos.length}</div>

      </div>
      {main_display}
    
    </div>
  );
}