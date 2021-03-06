import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Table, Button, Alert, ButtonGroup, DropdownButton, MenuItem } from "react-bootstrap";
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

            let new_date = new Date(Date.now() - 12096e5);  // 2 weeks ago

            setAlbums(response);
            var albcoll = [];
            response.map((alb, ind) => {

                var buttons = (alb.Owner == userInfo.email) ? ['View', 'Archive', 'Rename']:['View'];
                var menuItems = buttons.map((title, index) => {
                    switch(title)
                    {
                      case 'View': 
                        return <MenuItem onSelect={() => viewAlbum(alb.Partition_Key)}>View</MenuItem>
                      case 'Archive': 
                        return <MenuItem onSelect={() => confirmArchive(alb.Partition_Key, alb.Name)}>Archive</MenuItem>
                      case 'Rename': 
                        return <MenuItem onSelect={() => renameAlbum(alb.Partition_Key)}>Rename</MenuItem>
                    }
                });

                const buttonGroup = <ButtonGroup>
                <DropdownButton title="Dropdown" id="bg-nested-dropdown" title="Actions" bsStyle="info" bsSize="small">
                  {menuItems}
                </DropdownButton>
              </ButtonGroup>;                                    

                var alb_update = new Date(alb.LastUpdated.substr(0, 4),
                                          parseInt(alb.LastUpdated.substr(5, 2)) - 1,
                                          alb.LastUpdated.substr(8, 2) );

                var is_new = alb_update > new_date;

                albcoll.push(<tr key={'alb' + ind} className={is_new ? "tr-viewalbum new-album" : "tr-viewalbum" }>
                                <td className="td-viewalbum" onClick={() => viewAlbum(alb.Partition_Key)}>{is_new ? "NEW** ": ""}{alb.LastUpdated.substring(0, 16)}</td>
                                <td className="td-viewalbum" onClick={() => viewAlbum(alb.Partition_Key)}>{alb.Name}</td>
                                <td className="td-viewalbum td-year" onClick={() => viewAlbum(alb.Partition_Key)}>{alb.Year}</td>
                                <td>
                                  
                                  {buttonGroup}
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

  function renameAlbum(archiveId)
  {

    // todo
    alert('not yet implemented');
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
            <th>Last Updated</th>
            <th>Name</th>
            <th className="td-year">Year</th>
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