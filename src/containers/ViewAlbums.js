import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Table, Button, Alert } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../libs/errorLib";
import "./ViewAlbums.css";
import { API, sectionFooterSecondaryContent } from "aws-amplify";
import { useAppContext } from "../libs/contextLib";

export default function ViewAlbums() {
   const history = useHistory();
  const [albums, setAlbums] = useState([]);
  const [albumRows, setAlbumRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [archiveTitle, setArchiveTitle] = useState('');
  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const [archiveId, setArchiveId] = useState(null);
  const { userInfo } = useAppContext();

  useEffect(() => {
    onLoad();
  }, []);
  
  async function onLoad() {
    try {
        console.log('onLoad');

        if (userInfo == null)
        {
          history.push('/login');
          return;          
        }
        await  getAlbums().then( (response) =>
        {
            setAlbums(response);
            var albcoll = [];
            response.map((alb, ind) => {

                const archiveButton = (alb.Owner == userInfo.email) ? 
                                    <Button variant="secondary" size="sm" onClick={() => confirmArchive(alb.Partition_Key, alb.Name)} >archive</Button>: <div></div>

                albcoll.push(<tr key={'alb' + ind}>
                                <td>{alb.Year}</td>
                                <td>{alb.Name}</td>
                                <td>{alb.Owner}</td>
                                <td>
                                  <Button  variant="secondary" size="sm" onClick={() => viewAlbum(alb.Partition_Key)} >view</Button>
                                  {archiveButton}  
                                </td>
                                </tr>);

            });

            setAlbumRows(albcoll);
            
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

   function archiveAlbum()
   {
    setArchiveConfirm(false);
     API.put("albums", "/albums/archive/" + archiveId, {
      headers: { "Content-Type": "application/x-www-form-urlencoded", 
      Accept: "application/json"}
     }).then((response) => {
        
        cancelArchive();
        console.log(response);
        onLoad();
     })
     
   }
  
   function viewAlbum(album_id)
   {
    history.push('/albums/' + album_id);
   }

   function getAlbums() 
   {
        return API.get("albums", "/albums", {
            headers: { "Content-Type": "application/x-www-form-urlencoded", 
            Accept: "application/json"
            }
        });
   }

  function confirmArchive(album_id, title)
  {
    setArchiveId(album_id);
    setArchiveTitle(title);
    setArchiveConfirm(true);
  }
    
  function cancelArchive()
  {
    setArchiveId(null);
    setArchiveTitle('');
    setArchiveConfirm(false);
  }   
  

  return (


    <div className="ViewAlbums">
      <h2>Albums</h2>

      { archiveConfirm ?  
      <Alert key={0} variant={"warning"}>
      
        Archive album <b>{archiveTitle}</b> ?  Please choose <Button  variant={"primary"}  className="btn-primary" onClick={() => archiveAlbum()}>Archive</Button> or <Button variant="danger" onClick={() => cancelArchive()}  className="btn-danger">Cancel</Button>
        
      </Alert>: null }

      <Table striped bordered hover>
        <thead>
            <tr>
            <th>Year</th>
            <th>Name</th>
            <th>Owner</th>
            <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {albumRows}
            
        </tbody>
        </Table>
    </div>
  );
}