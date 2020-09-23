import React, { useRef, useState, useEffect } from "react";

import { Storage } from "aws-amplify";
import { API } from "aws-amplify";
import { onError } from "../libs/errorLib";

import "./Thumbnail.css";

import { Table, Button, ProgressBar } from "react-bootstrap";

export default function AddPictures({album_id, 
                                        isUploading, 
                                        setIsUploading, 
                                        setIsAddPictures, 
                                        closeAddPictures})
{
    const [uploads, setUploads] = useState([]);
    const [uploadRows, setUploadRows] = useState([]);
    const [progress, setProgress] = useState(0);
  

async function s3Upload(key_prefix, file) {

    const date_prefix = new Date().YYYYMMDDHHMMSS();
    const filename = `${date_prefix}_${file.name}`;
    const stored = await Storage.put(key_prefix + "/" + filename, file, {
        level: 'public',
        contentType: file.type,
    });
    
    return stored.key;
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
    let progressIncrement = 100 / 2 / event.target.files.length;
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

        const album_prefix = album_id.substring(0, 4) + "/" + album_id.substring(5);
        
        s3Upload(album_prefix, current_file)
        .then((response) => {

          console.log('uploaded', current_file, response);
          setProgress(progress + progressIncrement);
          
          let upload = { OriginalFilename: current_file.name, 
                          Filename: response, 
                          AlbumKey: album_id,
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
          setProgress(progress + progressIncrement);

          console.log("Upload info saved", upload_response);

         const upload = uploads.find(u => u.status != 'Completed' );
         
         if (!upload)
         {
             closeAddPictures();
         }
        });
        
      } catch (e) {
        onError(e);
        closeAddPictures();
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


    var chooseUploadPictures = isUploading ? null: 
    <div>
        <Button onClick={() => setIsAddPictures(false)} variant="outline-primary">Close</Button>

        <p className="note">Note : your browser will process the zip file, don't choose a file too big !</p>
        <input type="file" id="file" name="file" multiple onChange={onFileChange} /><br />
    </div>;
    //<ProgressBar animated now={progress} />
var uploadTable = !isUploading ? null:   
                                        <div>
                                            <div style={{marginBottom: "10px"}}>
                                                Pictures uploading now.  Please wait until uploading completes.
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
                                        </div>;

    return (
    <div>
        <h3>Add pictures</h3>


        {chooseUploadPictures}

        <div>
            <hr />
            
            {uploadTable}
        </div>

        <div id="result_block" className="hidden">
        <h3>Content :</h3>
        <div id="result"></div>
        </div>
    </div>);
}