# ffpass-lambda
Fork of @d4v3y0rk ffpass node modules to control FordPass equipped vehicles packaged and rewritten to run in AWS Lambda.

These instructions are VERY rough. Nevertheless, if you have some basic experience with AWS Lambda you should be able to get up and running fairly easily. I've been able to use it to start my car and much more with a Siri shortcut, NFC tag, or anything else that can send a HTTP GET request (e.g. SmartThings, etc.) with custom headers.

<B>Getting Started</B>  
1) Prerequisites:
	- FordPass capable vehicle and account
	- AWS Account (free tier is fine)
	- Geocodio Account (free tier account)
2) Open AWS Lambda
3) Select Layers on the left
4) Create a new layer
5) Let's name it ffpassLayer, and select nodejs12.x as the runtime
6) Download the nodejs.zip file from this repository, upload it and create the layer. This layer has the back-end ffpass module and all of its dependencies packaged together.
7) After you create the layer, select Functions on the left, and create a new function.
8) Let's name the function ffpass, select Node.js 12x as the runtime, and leave the permission settings as default.
9) Click Layer is the middle of the screen, then the Add Layer button below to the right
10) Select your previously created ffpassLayer, then click Add
11) Click ffpass above Layers to get back to the Function code editor
12) Now we need to paste in the index.js code for the front-end that has been customized to run in AWS.
13) Copy the index.js code from this repository and paste it into the editor. Double-check that it copied over properly, then click Save in the upper right corner.
14a) You need to create four Environmental Variables below the function code editor:
	- FORD_USERNAME : your FordPass username 
	- FORD_PASSWORD : your FordPass password
	- VIN : the VIN of the vehicle you want to control through this API
	- MAPS_API_KEY : your API key from Geocodio
14b) You also need to increase the execution timeout to 45 seconds to give the API time to send the command to your card and get confirmation that it did or did not work. Under "Basic Setting," click Edit and increase the time out to 45 seconds from the default.
15) Click save. The function is now complete, but we still need to create an API Gateway endpoint to access the function over the internet.
16) Under Designer click Add trigger and select API Gateway
17) Select REST API, and Security API Key and Create
18) From Service, select API Gateway. You'll see the API that Lambda created for you, but we need to get the API key.
19) Click the created API, then click API Keys on the left. Select your key, and click show to record the key.
20) Browse back to Lambda and select the ffpass function, once it opens click on API Gateway to expose your API endpoint and copy this down.

You are done setting up the server. To send a command you will send a GET request to your API Endpoint with two custom headers. Using Postman to test is a good idea.

<B>Headers:</B>


 	1) x-api-key : your AWS API Key
	2) command : status, start, stop, unlock, or lock

... the commands are fairly self explaintory. 'status' will return a whole bunch of info in the response body that you can use for cool things such as asking Siri how much gas you have left.

THIS SOFTWARE WAS CREATED EXPRESSLY FOR MY OWN PERSONAL USE. YOUR USE OF THIS SOFTWARE IS ENTIRELY AT YOUR OWN RISK. DEVELOPER SHALL NOT BE RESPONSIBLE OR LIABLE UNDER ANY CONTRACT, NEGLIGENCE, STRICT LIABILITY OR OTHER THEORY ARISING OUT OF OR RELATED TO THIS OPEN SOURCE SOFWARE.
