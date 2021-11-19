import axios from 'axios'

const apiRoute = `http://localhost:5000/api`;

export async function getResourceData(selectedProfile) {
  const apiURI = `${apiRoute}/resources-data/${selectedProfile}`;
  const response = await axios(apiURI);
  return response.data;
}