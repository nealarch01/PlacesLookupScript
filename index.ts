import fs from "fs";
import axios from "axios";

import { google_api_key } from "./config.json";

let GLOBAL_SUM = 0;

function formatQueryString(queryText: string): string {
    queryText = encodeURI(queryText);
    return queryText;
}

function formatFilenameString(queryText: string): string {
    if (queryText.includes(' ')) {
        queryText = queryText.replaceAll(' ', '-');
    }
    if (queryText.includes("'")) {
        queryText = queryText.replaceAll("'", "");
    }
    queryText = queryText.replaceAll(" ", "-");
    queryText = queryText.replaceAll("'", "");
    queryText = queryText.replaceAll(",", "");
    return queryText;
}


function writeData(placeData: any, placeType: string, location: string): void {
    try {
        fs.writeFileSync(`./MorePlacesData/${formatFilenameString(`${placeType}-${location}`)}.json`, JSON.stringify(placeData, null, 4));
    } catch (err) {
        console.log("There was an error writing");
    }
}

async function fetchPlaceData(placeType: string, location: string): Promise<any> {
    placeType += ` in ${location}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${formatQueryString(placeType)}&key=${google_api_key}`
    try {
        let response = await axios.get(url);
        if (response.data.status === 'OK') {
            return response.data;
        } else {
            return undefined;
        }
    } catch (err) {
        console.log("There was an error making an API request");
        return undefined;
    }
}

async function processPlacesOfInterest(placesOfInterest: Array<string>, location: string): Promise<void> {
    placesOfInterest.forEach(async (placeType: string) => {
        let placeData = await fetchPlaceData(placeType, location);
        if (placeData !== undefined) {
            writeData(placeData, placeType, location); // Write to file
        }
    });
}

async function main(): Promise<number> {
    const placesOfInterest_NorthCountySD: Array<string> = [
        "farmers' markets", "beaches", "cafes", "shopping malls",
        "amusement parks", "arcades", "parks", "bowling", "bakeries", "museums",
        "movie theatres", "libraries", "tea shops", "trails", "skate parks", "night clubs",
        "thrift stores", "bars", "breweries", "brunch", "escape rooms", "vegan food"
    ];

    const placesOfInterest_SanDiego: Array<string> = [
        "art gallery", "art museums", "beaches", "date night", "thrift stores", "museums", "casino", "bakeries",
        "cafes", "fine dining", "night club", "aquarium", "amusement parks", "shopping malls", "brunch", "wineries", "bars"
    ];

    await processPlacesOfInterest(placesOfInterest_NorthCountySD, "north county san diego, ca");
    await processPlacesOfInterest(placesOfInterest_SanDiego, "san diego, ca");
    console.log(placesOfInterest_NorthCountySD.sort());
    console.log(placesOfInterest_SanDiego.sort());
    console.log("Successful run");
    return 0;
}


main();