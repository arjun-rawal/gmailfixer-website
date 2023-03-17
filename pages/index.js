import Head from "next/head";
import styles from "@/styles/Home.module.css";
import Script from "next/script";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
export default function Home() {
  //please don't use my api key and id!!! I wasn't able to hide them but still get vercel to use them
  const CLIENT_ID =
    "589080913521-0tk0ta5737bbam5qb89bsqilhk07ujn7.apps.googleusercontent.com";
  const API_KEY = "AIzaSyB4GEbZZQYcnfT_dvdgny_xDtR-Os1g5rw";
  const DISCOVERY_DOC =
    "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest";

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  const SCOPES = "https://www.googleapis.com/auth/gmail.readonly";
  var gmails = [];
  const [gmailMapArray, setGmails] = useState();
  let tokenClient;
  const [inbox, setInbox] = useState("");
  var dict = [];
  function handleAuthClick() {
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw resp;
      }

      await listLabels();
    };

    if (gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({ prompt: "" });
    }
  }

  /**
   *  Sign out the user upon button click.
   */
  function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken("");
      document.getElementById("content").innerText = "";
      document.getElementById("authorize_button").innerText = "Authorize";
    }
  }

  /**
   * Print all Labels in the authorized user's inbox. If no labels
   * are found an appropriate message is printed.
   */

  async function listLabels() {
    const start = new Date();
    var startM = start.getMinutes();
    var startS = start.getSeconds();

    let response;
    try {
      response = await gapi.client.gmail.users.messages.list({
        userId: "me",
        maxResults: 500,
      });
    } catch (err) {
      return;
    }
    const labels = response.result.messages;
    if (!labels || labels.length == 0) {
      return;
    }

    // Flatten to string to display
    let response1;
    console.log(labels.length);
    setInbox("Loading... (this might take a minute)");
    for (var i = 0; i < 500; i++) {
      response1 = await gapi.client.gmail.users.messages.get({
        userId: "me",
        id: labels[i].id,
        format: "metadata",
      });
      var temp = response1.result.payload.headers;
      console.log(temp);
      var temp2 = temp.filter(n => n.name.toLowerCase() === 'from');
      gmails[i] = temp2[0].value;
    }
  

        for (var i = 0; i<gmails.length; i++){
          let temp3 = gmails[i]
          let temp4 = -1;
          let end = false;
          while (!end && (gmails.length !=0)){

            if (gmails.findIndex(isLargeNumber) == -1 || temp3 == undefined){
              end = true;
            }
            delete gmails[gmails.findIndex(isLargeNumber)];
            temp4++;
          }
          if (temp4 != 0){
            dict.push({
              "name" : temp3,
              "value" : temp4,
            })
        }
          function isLargeNumber(element) {
            return element == temp3;
          }
        }
      dict.sort((a, b) => b.value - a.value);
      console.log(dict);

    setInbox("done");
    setGmails(dict);
    const end = new Date();
    var endM = end.getMinutes();
    var endS = end.getSeconds();
    console.log((endM - startM) * 60 + (endS - startS));
    /*   var decode = function(input) {
    // Replace non-url compatible chars with base64 standard chars
    input = input
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    // Pad out with standard base64 required padding characters
    var pad = input.length % 4;
    if(pad) {
      if(pad === 1) {
        throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
      }
      input += new Array(5-pad).join('=');
    } 

    return input;
}  
var decodedGmails = atob(decode(gmails))
 console.log(decodedGmails);
 */
  }
  function gapiLoaded() {
    gapi.load("client", initializeGapiClient);
  }

  async function initializeGapiClient() {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
  }

  function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: "", // defined later
    });
  }

  const MappedInbox = () => {

    return (
      <BarChart width={3000} height={750} data={gmailMapArray}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>

      );
  };
  return (
    <>
      <Head>
        <title>Gmail Fixer</title>
      </Head>
      <Script
        async
        defer
        src="https://apis.google.com/js/api.js"
        onLoad={gapiLoaded}
      ></Script>
      <Script
        async
        defer
        src="https://accounts.google.com/gsi/client"
        onLoad={gisLoaded}
      ></Script>

      <button onClick={handleAuthClick}>Authorize</button>
      {inbox == "done" ? <MappedInbox /> : inbox}
    </>
  );
}
