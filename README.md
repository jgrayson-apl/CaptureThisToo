# Capture This Too!
Use this application to create screen captures of your web maps and web scenes.


### Technologies Used
 - [ArcGIS API for Javascript](https://developers.arcgis.com/javascript/latest/api-reference/)
 - [Calcite Components](https://developers.arcgis.com/calcite-design-system/components/)

### Deploy

This demo is built as a _static_ web application.

1. Download and copy the root folder to a web accessible location
2. Update configuration parameters in application.json

### Configure

Update the parameters in ./config/application.json file in your favorite json editor:

|      parameter | details                                                           |
|---------------:|-------------------------------------------------------------------|
|  **portalUrl** | Organization or Enterprise URL; example: https://www.arcgis.com   |
| **oauthappid** | The OAuth ID of the Web Application item                          |
|   **authMode** | For public access set to 'anonymous' (and set oauthappid to null) |
|     **apiKey** | ArcGIS Platform API key                                           |
|     **webmap** | The item id of the web map (only use webmap OR webscene)          |
|   **webscene** | The item id of the web scene (only use webmap OR webscene)        |


### To dynamically use other Web Maps and Web Scenes

Append your portal item id to the end of the application URL

* Web Map
  * ../index.html?webmap=123456789123456789123456789
* Web Scene
  * ../index.html?webscene=123456789123456789123456789


#### For questions about the demo web application:
> John Grayson | Prototype Specialist | Geo Experience Center\
> Esri | 380 New York St | Redlands, CA 92373 | USA\
> T 909 793 2853 x1609 | [jgrayson@esri.com](mailto:jgrayson@esri.com) | [GeoXC Demos](https://geoxc.esri.com) | [esri.com](https://www.esri.com)
