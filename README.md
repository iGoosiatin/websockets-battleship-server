# RSSchool NodeJS websocket battleship task
> Static HTTP server and websocket server for battleship game

**NOTES**
- Once player is registered, winners table is updated.
- For user registartion no backend validation is applied - frontend is not able to handle specific errors.
- For login password is being validated.
- Password is stored in plain text for sake of simplicity.
- Random attack is plain simple. Shot will be made absolutely random, possibly to position that was already shot to.
- Bot is not using any specific game-winning algorithms, however it is able shoot randomly, records made shots, do not shoot to same position twice, track and hunt ships that were hit.
- Bot doesn't generate ship layout. It uses pre-generated layout.
- Disconnected player's game and/or room are closed. Opponent player is considered as a winner, even if game technically not started (user disconnected during ship layout)

## Installation
1. Clone/download repo
2. `npm install`

## Usage
**Development**

`npm run start:dev`

* App served @ `http://localhost:8181` with nodemon

**Production**

`npm run start`

* App served @ `http://localhost:8181` without nodemon

---

**All commands**

Command | Description
--- | ---
`npm run start:dev` | App served @ `http://localhost:8181` with nodemon
`npm run start` | App served @ `http://localhost:8181` without nodemon

**Note**: replace `npm` with `yarn` in `package.json` if you use yarn.
