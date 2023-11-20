const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

async function getDataFromCube(apiUrl, productId, coordinateValues, latestN, outputPath) {
  try {
    // Dynamically import 'node-fetch'
    const fetch = await import('node-fetch');

    const coordinate = coordinateValues.join('.');
    const requestBody = [{
      "productId": productId,
      "coordinate": coordinate,
      "latestN": latestN
    }];

    const response = await fetch.default(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Failed to get data, status code ${response.status}`);
    }

    const data = await response.json();

    if (data && Array.isArray(data) && data.length > 0) {
      // Assuming the response is an array of data objects
      console.log(data[0].object.vectorDataPoint[0].value)
      const fileName = 'output.json'; // Change this to the desired output file name
      const filePath = path.join(outputPath, fileName);

      await promisify(fs.writeFile)(filePath, JSON.stringify(data, null, 2));

      console.log(`Data saved successfully: ${filePath}`);
    } else {
      throw new Error('Failed to get valid data from Stats Canada API');
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Example usage:
const apiUrl = 'https://www150.statcan.gc.ca/t1/wds/rest/getDataFromCubePidCoordAndLatestNPeriods';
const productId = 14100354;
const coordinateValues = [28, 109, 0, 0, 0, 0, 0, 0, 0, 0];
const latestN = 1;
const outputPath = __dirname; // You can change this to the desired output directory

getDataFromCube(apiUrl, productId, coordinateValues, latestN, outputPath);
