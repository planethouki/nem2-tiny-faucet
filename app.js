const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const nem2lib = require('nem2-library')
const nem2Sdk = require("nem2-sdk")
const Account = nem2Sdk.Account,
    Address = nem2Sdk.Address,
    Deadline = nem2Sdk.Deadline,
    NetworkType = nem2Sdk.NetworkType,
    Id = nem2Sdk.Id
const sha3_256 = require('js-sha3').sha3_256
const request = require('request')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

function endian(hex) {
    const uint8arr = nem2lib.convert.hexToUint8(hex)
    return nem2lib.convert.uint8ToHex(uint8arr.reverse())
}

app.post('/claim', function (req, res) {
    const PRIVATE_KEY = process.env.PRIVATE_KEY
    const ENDPOINT = process.env.ENDPOINT
    const account = Account.createFromPrivateKey(PRIVATE_KEY, NetworkType.MIJIN_TEST)
    const recipient = nem2lib.convert.uint8ToHex(nem2lib.address.stringToAddress(Address.createFromRawAddress(req.body.address).plain()))
    const mosaicId = process.env.MOSAIC_ID
    const amount = process.env.AMOUNT
    const txPayload = 
        "A5000000" +
        "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" +
        account.publicKey +
        "039054410000000000000000" +
        endian((new Id(Deadline.create().toDTO())).toHex().toUpperCase()) +
        recipient +
        "01000100" +
        endian(mosaicId) +
        endian(amount)
    const txPayloadSigningBytes = txPayload.substr(100*2)
    const keypair = nem2lib.KeyPair.createKeyPairFromPrivateKeyString(PRIVATE_KEY)
    const signatureByte = nem2lib.KeyPair.sign(keypair, txPayloadSigningBytes)
    const signature = nem2lib.convert.uint8ToHex(signatureByte)

    const signedTxPayload =
        txPayload.substr(0,4*2) +
        signature +
        txPayload.substr((4+64)*2)

    const hashInputPayload = 
        signedTxPayload.substr(4*2,32*2) +
        signedTxPayload.substr((4+64)*2,32*2) +
        signedTxPayload.substr((4+64+32)*2);
    const signedTxHash = 
        sha3_256.create().update(Buffer.from(hashInputPayload, 'hex')).hex().toUpperCase()
    
    request({
        url: `${ENDPOINT}/transaction`,
        method: 'PUT',
        headers: {
            'Content-Type':'application/json'
        },
        json: {"payload": signedTxPayload}
    }, (error, response, body) => {
        console.log(body)
    })
    res.send(`<a href="${ENDPOINT}/transaction/${signedTxHash}/status">${signedTxHash}</a>`)
  })

  
app.listen(4300, () => console.log('Example app listening on port 4300!'))