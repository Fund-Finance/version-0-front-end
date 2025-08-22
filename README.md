# Version 0 Front End

- For the corresponding back-end see [version-0](https://github.com/Fund-Finance/version-0)

## Releases:

### v0.1:

- Front items and elements work
  - For when the user is not connected
  - And for when the user is connected
- The main format of the front page has been completed
- The backend is not yet connected

### v0.2:
- The backend is now connected
- The front page updates every second by pulling data from the backend

### v0.3:
- Implemented the Submit a Proposal button
- Implemented the Contribute Button
- Implemented the Redeem button
- Added the following display items to the header:
    - The amount of fToken the user has
    - The number of active Proposals

### v0.4:
- Added a page for the active proposals
- Reformated web3Manager to be a class
- Added a page for each individual proposal
- Adjusted redeem module to show USDC only
- Revamped the donut chart and made it look much nicer
- Fixed minor bugs regarding caching and waiting for the backend
- Added the intent to approve visual to the front-end
- Added coinbase on-ramp component (to be experimented with later)
- Added support for a few more assets to be visualized
    - Aave
    - Chainlink
- Minor cleanup of code and formatting of pages 

### v0.4.1:
- Bug fixes:
    - The timing bug where the intent to approve never refreshes and gets stuck waiting for time to pass
    - The bug where if a user clicks reject or accept proposal but then declines the metamask transaction, they get redirected anyway to the home page. Now if they decline a metamask transaction, they stay on the proposal page
