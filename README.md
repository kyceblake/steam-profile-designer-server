# Steam Profile Designer (server repository)

Chrome extension requires server because STEAM API doesn't use CORS and we can't access it through chrome extension

You can self host server and change ip address of your host in chrome extensions settings.

PS. I'm thinking about downloading all metadata about pointshop into chrome extension. But metadata size is about 30-40 mb.

# How to use

`git clone https://github.com/kyceblake/steam-profile-designer-server.git`

`cd steam-profile-designer-server`

`npm install`

`npm run start` - start the server

`npm run update` - update pointshop metadata

# To Do

- cleanup code
- use timestamps on metadata to see when it was updated

# Credits

`updateDatabase.js` uses some code from https://github.com/sapic/backgroundsgallery/blob/master/utils/backgrounds/getAllBackgrounds.ts

# Contribution

Feel free to send pull requests
