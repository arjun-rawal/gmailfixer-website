import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'
import { Helmet } from 'react-helmet';
import Script from 'next/script';
export default function Home() {
  const CLIENT_ID = '589080913521-0tk0ta5737bbam5qb89bsqilhk07ujn7.apps.googleusercontent.com';
  const API_KEY = 'AIzaSyB4GEbZZQYcnfT_dvdgny_xDtR-Os1g5rw';
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';

  let tokenClient;

  function handleAuthClick() {
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw (resp);
      }

      await listLabels();
    };

    if (gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({prompt: ''});
    }
  }

  /**
   *  Sign out the user upon button click.
   */
  function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken('');
      document.getElementById('content').innerText = '';
      document.getElementById('authorize_button').innerText = 'Authorize';
    }
  }

  /**
   * Print all Labels in the authorized user's inbox. If no labels
   * are found an appropriate message is printed.
   */
  async function listLabels() {
    let response;
    try {
      response = await gapi.client.gmail.users.messages.list({
        'userId': 'me',
      });
    } catch (err) {
      document.getElementById('content').innerText = err.message;
      return;
    }
    const labels = response.result.messages;
    if (!labels || labels.length == 0) {
      document.getElementById('content').innerText = 'No labels found.';
      return;
    }

    // Flatten to string to display
    let response1;
    var gmails="";
    console.log(labels.length);
    for (var i =0;i<labels.length;i++){
      response1 = await gapi.client.gmail.users.messages.get({
        'userId': 'me',
        'id': labels[i].id,
        'format': 'raw'
      });
      gmails+= response1.result.snippet + "\n\n";
}

    console.log(gmails);
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
    document.getElementById('content').innerText = gmails;
    
  }
  function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
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
      callback: '', // defined later
    });

  }
  return (
    <>
      <Head>

        <title>Gmail Fixer</title>
      </Head>
      <Script async defer src="https://apis.google.com/js/api.js" onLoad={gapiLoaded}></Script>
      <Script async defer src="https://accounts.google.com/gsi/client" onLoad={gisLoaded}></Script>

      <button onClick={handleAuthClick}>
        Authorize
      </button>
    </>
  )
}
