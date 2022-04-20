import fs from "fs";
import axios from "axios";

import { google_api_key } from "./config.json";

function formatQueryString(queryText: string): string {
    if (queryText.includes(' ')) {
        queryText = queryText.replaceAll(' ', '%20');
    }
    if (queryText.includes("'")) {
        queryText = queryText.replaceAll("'", "%27");
    }
    if (queryText.includes(",")) {
        queryText = queryText.replaceAll(",", "%2C");
    }
    return queryText;
}

function formatFilenameString(queryText: string): string {
    if (queryText.includes(' ')) {
        queryText = queryText.replaceAll(' ', '-');
    }
    if (queryText.includes("'")) {
        queryText = queryText.replaceAll("'", "");
    }
    return queryText;
}


function writeData(placeData: any, placeType: string): void {
    fs.writeFileSync(`./PlacesData/${formatFilenameString(placeType)}.json`, JSON.stringify(placeData, null, 4));
}

async function fetchData(placeType: string): Promise<any> {
    placeType += "near san marcos, ca";
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${formatQueryString(placeType)}&key=${google_api_key}`
    try {
        let response = await axios.get(url);
        if (response.data.status === 'OK') {
            return response.data;
        } else {
            return undefined;
        }
    } catch (err) {
        console.log("There was an error");
        return undefined;
    }
}

async function main(): Promise<number> {
   const placesOfInterest: Array<string> = [
       "cafe", "amusement park", "aquarium", "bar", "night club", "thrift stores",
       "shopping malls", "farmers' market", "casino", "bakery", "restaurant",
       "bowling", "arcade", "parks", "trails"
   ];
    placesOfInterest.forEach(async (placeType: string) => {
        let placeData = await fetchData(placeType);
        if (placeData !== undefined) {
            writeData(placeData, placeType); // write to file
        }
    });
    return 0;
}

main();