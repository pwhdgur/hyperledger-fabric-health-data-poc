'use strict'

const FabricCAServices = require('fabric-ca-client')
const { Wallets } = require('fabric-network')
const fs = require('fs')
const path = require('path')

async function main() {
  try {
    // load the network configuration
    // const ccpPath = path.resolve(__dirname, '..', '..', 'fabric-samples/pdm-network', 'organizations', 'peerOrganizations', 'hospital2.com', 'connection-hospital2.json')
    const ccpPath = path.resolve(__dirname, '..', '..', '..', 'fabric-samples/patient_project/patient_network/test-network', 'organizations', 'peerOrganizations', 'org2.example.com', 'connection-org2.json')

    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'))

    // Create a new CA client for interacting with the CA.
    // const caInfo = ccp.certificateAuthorities['ca.hospital2']
    const caInfo = ccp.certificateAuthorities['ca.org2.example.com']
    const caTLSCACerts = caInfo.tlsCACerts.pem
    const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName)

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet')
    // const walletPath = path.join(process.cwd(), 'wallet/org2')
    const wallet = await Wallets.newFileSystemWallet(walletPath)
    console.log(`Wallet path: ${walletPath}`)

    // Check to see if we've already enrolled the admin2 user.
    const identity = await wallet.get('admin2')
    // const identity = await wallet.get('admin')
    if (identity) {
      console.log('An identity for the admin2 user "admin2" already exists in the wallet')
      // console.log('An identity for the admin user "admin" already exists in the wallet')
      return
    }

    // Enroll the admin2 user, and import the new identity into the wallet.
    const enrollment = await ca.enroll({ enrollmentID: 'admin2', enrollmentSecret: 'adminpw' })
    // const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' })
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes()
      },
      // mspId: 'Hospital2MSP',
      mspId: 'Org2MSP',
      type: 'X.509'
    }
    await wallet.put('admin2', x509Identity)
    // await wallet.put('admin', x509Identity)
    console.log('Successfully enrolled admin2 user "admin2" and imported it into the wallet')
    // console.log('Successfully enrolled admin user "admin" and imported it into the wallet')
  } catch (error) {
    console.error(`Failed to enroll admin2 user "admin2": ${error}`)
    // console.error(`Failed to enroll admin user "admin": ${error}`)
    process.exit(1)
  }
}

main()
