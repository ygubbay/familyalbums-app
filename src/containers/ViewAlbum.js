import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { onError } from "../libs/errorLib";
import { useAppContext } from "../libs/contextLib";
import { API } from "aws-amplify";
import { Button } from "react-bootstrap";
import Thumbnail from "../components/Thumbnail";
import ViewPhoto from "../components/ViewPhoto";
import AddPictures from "../components/AddPictures";
import "./ViewAlbum.css";


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

export default function ViewAlbum() {
  const file = useRef(null);
  const history = useHistory();
  const [album, setAlbum] = useState([]);
  const [photos, setPhotos] = useState({});
  const [thumbnailRows, setThumbnailRows] = useState([]);
  const [isAddPictures, setIsAddPictures] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDescriptionShown, setDescriptionShown] = useState(false);
  const [viewPhoto, setViewPhoto] = useState(null);
  

  
  const [isLoading, setIsLoading] = useState(false);
  const { userEmail } = useAppContext();

  let { id } = useParams();

  

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

  function closeAddPictures()
  {
    setIsAddPictures(false);
    setIsUploading(false);
    setIsLoading(false);
    getPhotos(id);
  }
  

 function toggleDescription(showInfo)
 {
  setDescriptionShown(showInfo);
 }

 


  var addPictures = null;
  const viewPhotosDisplay = ((viewPhoto != null && viewPhoto >= 0) && photos.length > 0);
  
  if (!viewPhotosDisplay) {

  
      addPictures = !isAddPictures ? <Button onClick={() => setIsAddPictures(true)} variant="outline-primary">Add pictures</Button>: 
                      <AddPictures album_id={id} 
                      isUploading={isUploading} 
                      setIsUploading={setIsUploading} 
                      setIsAddPictures={setIsAddPictures}
                      closeAddPictures={closeAddPictures} />;

  }          
    
  

  var main_display = isAddPictures ? null: 
                     viewPhotosDisplay ? <ViewPhoto upload={photos[viewPhoto]} 
                                                    prev_click={() => viewPhotoPrev() } 
                                                    next_click={() => viewPhotoNext() }
                                                    index = {viewPhoto+1}
                                                    album_count = {photos.length} />:
                                          <div><div>{thumbnailRows}</div><div style={{clear: "both"}}></div></div>;
  return (
    <div className="NewNote">
      <h2>Album - {album.Name}<span className="glyphicon glyphicon-chevron-right big-arrow" style={{display: isDescriptionShown? "none": "inline" }} onClick={() => toggleDescription(true)}></span>
                              <span className="glyphicon glyphicon-chevron-down big-arrow" style={{display: isDescriptionShown? "inline": "none" }} onClick={() => toggleDescription(false)}></span></h2>
      
      {isDescriptionShown &&
      (<div>
        <div>Year: {album.Year}</div>
        <div>Owner: {album.Owner}</div>
        <div>Date created: {album.DateCreated}</div>
        <div>Photos total: {photos.length}</div>

      </div>)}
      {main_display}
      <hr />
      {addPictures}
    
    </div>
  );
}