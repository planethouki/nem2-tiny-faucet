# nem2-tiny-faucet


## env

```
PRIVATE_KEY=
API_URL_INNER=http://rest-gateway:3000
API_URL_OUTER=http://127.0.0.1:3000
MOSAIC_ID=D525AD41D95FCF29
AMOUNT=00000000000F4240
```

## docker-compose

```
  faucet:
    image: planethouki/nem2-tiny-faucet
    stop_signal: SIGINT
    environment:
    - API_URL_INNER=http://rest-gateway:3000
    - API_URL_OUTER=http://127.0.0.1:3000
    - PRIVATE_KEY=
    - MOSAIC_ID=D525AD41D95FCF29
    - AMOUNT=00000000000F4240
    command: ["npm", "start"]
    ports:
    - '4000:4300'
```