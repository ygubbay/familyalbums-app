import React, { useRef, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Table, Button } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../libs/errorLib";
import "./ViewAlbums.css";
import { API, sectionFooterSecondaryContent } from "aws-amplify";
import { useAppContext } from "../libs/contextLib";

export default function ViewAlbums() {
  const file = useRef(null);
  const history = useHistory();
  const [albums, setAlbums] = useState([]);
  const [albumRows, setAlbumRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { userEmail } = useAppContext();

  useEffect(() => {
    onLoad();
  }, []);
  
  async function onLoad() {
    try {
        console.log('onLoad');
      await  getAlbums().then( (response) =>
        {
            console.log('response now');
            console.log(JSON.stringify(response));
            
            console.log(response.length);

            setAlbums(response);
            var albcoll = [];
            response.map((alb, ind) => {

                albcoll.push(<tr key={'alb' + ind}>
                                <td>{alb.Year}</td>
                                <td>{alb.Name}</td>
                                <td>{alb.Owner}</td>
                                <td><Button onClick={() => viewAlbum(alb.Id)} variant="outline-primary">Add pictures</Button></td>
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
    
   
  

  return (

    
    <div className="ViewAlbums">
      <h2>Albums</h2>
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