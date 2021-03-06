import React, { useState } from "react";
import { API } from "aws-amplify";
import { Auth } from "aws-amplify";
import { useHistory } from "react-router-dom";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import { useAppContext } from "../libs/contextLib";
import { useFormFields } from "../libs/hooksLib";
import { onError } from "../libs/errorLib";
import "./Login.css";

export default function Login() {
  const history = useHistory();
  const { userHasAuthenticated } = useAppContext();
  const { setUserInfo } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [fields, handleFieldChange] = useFormFields({
    email: "",
    password: ""
  });

  function validateForm() {
    return fields.email.length > 0 && fields.password.length > 0;
  }

  async function getUserInfo()
   {
     const userInfo = await Auth.currentUserInfo();
     console.log("userInfo", userInfo);
     
   }


  function setLastLoginDate(email)
  {
    API.put("albums", "/users/lastlogin/", {
      headers: { "Content-Type": "application/x-www-form-urlencoded", 
      Accept: "application/json"},
      body: { Email: email }
    }).then((response) => {
      console.log(response);
    })

  }

  async function handleSubmit(event) {
    event.preventDefault();

    setIsLoading(true);

    try {
      await Auth.signIn(fields.email, fields.password).then((response) => {
        console.log("login: " + JSON.stringify(response.attributes));
        setUserInfo(response.attributes);
      });
      userHasAuthenticated(true);

      await getUserInfo();
      console.log('setLastLoginDate now:');
      setLastLoginDate(fields.email);
      history.push("/albums/view");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }

  return (
    <div className="Login">
      <form onSubmit={handleSubmit}>
        <FormGroup controlId="email" bsSize="large">
          <ControlLabel>Email</ControlLabel>
          <FormControl
            autoFocus
            type="email"
            value={fields.email}
            onChange={handleFieldChange}
          />
        </FormGroup>
        <FormGroup controlId="password" bsSize="large">
          <ControlLabel>Password</ControlLabel>
          <FormControl
            type="password"
            value={fields.password}
            onChange={handleFieldChange}
          />
        </FormGroup>
        <LoaderButton
          block
          type="submit"
          bsSize="large"
          isLoading={isLoading}
          disabled={!validateForm()}
        >
          Login
        </LoaderButton>
      </form>
    </div>
  );
}