# Steam Profile Designer (server repository)

Steam Profile Designer requires server because STEAM API doesn't use CORS and it can't access through browser extension

You can self host server and change ip address of your host in browser extensions settings.

PS. I'm thinking about downloading all metadata about pointshop into browser extension. But metadata size is about 30-40 mb.

# How to use

## Prerequisites

### Windows

[Node.JS v22.7.0 or newer (might work on prevous versions)](https://nodejs.org/en/download/prebuilt-installer)
[Git](https://git-scm.com/downloads) or download manually by clicking green code button then "Download ZIP"

## Linux

Download NodeJS and Git via package managers

## Installation

`git clone https://github.com/kyceblake/steam-profile-designer-server.git`

`cd steam-profile-designer-server`

`npm install`

`npm run update` - update pointshop metadata **if you want fresh database run this first!!!**

`npm run start` - start the server

# To Do

- Get game icon of the pointshop item (WONTFIX because it requires steam partner publisher key)
- If we can accesss Steam API without CORS then maybe make browser extension as standalone?

# Credits

`updateDatabase.js` uses some code from https://github.com/sapic/backgroundsgallery/blob/master/utils/backgrounds/getAllBackgrounds.ts

# Contribution

Feel free to send pull requests
