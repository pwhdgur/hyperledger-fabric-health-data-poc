# Patient Data Management using Hyperledger Fabric
reference site : https://github.com/Shubham-Girdhar/hyperledger-fabric-patient-data-management.git

## Fabric Network configuration

### Bring up the network
$ git clone https://github.com/Shubham-Girdhar/hyperledger-fabric-patient-data-management.git
$ curl -sSL https://bit.ly/2ysbOFE | bash -s

$ cd ~/fabric-samples/patient_project/patient_network/test-network
$ ./network.sh up createChannel -ca -s couchdb


### Deploy the chaincode
$ ./network.sh deployCC -ccn custom -ccp ../../patient_chaincode/chaincode-javascript -ccl javascript

### Enroll Register
$ cd wallet
$ rm *
$ cd ~/fabric-samples/patient_project/patient_enroll
$ npm install
$ node regesisterHospital1Admin.js
$ node regesisterHospital2Admin.js
$ cd wallet

#### 수정사항
cd ~/fabric-samples/patient_project/patient_network/test-network/organizations/fabric-ca/registerEnroll.sh
90: fabric-ca-client enroll -u https://admin:adminpw@localhost:8054 --caname ca-org2 --tls.certfiles "${PWD}/organizations/fabric-ca/org2/tls-cert.pem" 
=> fabric-ca-client enroll -u https://admin2:adminpw@localhost:8054 --caname ca-org2 --tls.certfiles "${PWD}/organizations/fabric-ca/org2/tls-cert.pem"

cd ~/fabric-samples/patient_project/patient_network/test-network/organizations/fabric-ca/org2/fabric-ca-server-config.yaml
126: - name: admin
=> - name: admin2

#### TrobleShooting
Error: Cannot find module 'pkcs11js'
=> package.json : "fabric-ca-client": "^2.2.10", "fabric-network": "^2.2.10" 최신버전으로 변경


### Node Server
cd ~/fabric_latest/fabric-samples/patient_project/patient_backend
npm install
node clientApp.js


### Fontend
cd ~/fabric_latest/fabric-samples/patient_project/patient_frontend
npm install
ng serve -o

#### TrobleShooting
[DEP0148] DeprecationWarning: Use of deprecated folder mapping "./" in the "exports" field module resolution of the package at /Users/daniel/go/src/github.com/pwhdgur/hyperledger/fabric_latest/fabric-samples/patient_project/patient_frontend/node_modules/postcss/package.json.
Update this package.json to use a subpath pattern like "./*".

=> ~patient_frontend/node_modules/postcss/package.json. 14: "./": "./" => "./*": "./*"


## Test Scenario

### Scenario 1
- patient visits docker1
- patient visits docker2
- patient has completed his/her treatment with doctor1
### Scenario 2

### Scenario 3


## Caution Notice
- postman으로 Rest API 테스트시 타임 아웃 발생에 주의.


#### test-network vs pdm-network Node Info

##### configtx.yaml
&Org1 vs &Hospital1
Org1MSP vs Hospital1MSP

MSPDir: ../organizations/peerOrganizations/org1.example.com/msp vs MSPDir: ../organizations/peerOrganizations/hospital1.com/msp

Rule: "OR('Org1MSP.admin', 'Org1MSP.peer', 'Org1MSP.client')" vs Rule: "OR('Hospital1MSP.admin', 'Hospital1MSP.peer', 'Hospital1MSP.client')"

##### docker-compose-ca.yaml
../organizations/fabric-ca/org1:/etc/hyperledger/fabric-ca-server vs ../organizations/fabric-ca/hospital1:/etc/hyperledger/fabric-ca-server
ca-org1 vs ca-hospital1

##### docker-compose-couch.yaml
couchdb1 : admin, adminpw vs couchdb2 : admin2, adminpw

##### docker-compose-test-net.yaml

peer0.org1.example.com vs peer0.hospital1.com

CORE_PEER_ID=peer0.org1.example.com vs CORE_PEER_ID=peer0.hospital1.com
CORE_PEER_LOCALMSPID=Org1MSP vs CORE_PEER_LOCALMSPID=Hospital1MSP


##### Informastion Chaincode Queries

Step 1: Deploy chaincode using ./network.sh deployCC -ccl javscript

Step 2: export PATH=${PWD}/../bin:$PATH
		export FABRIC_CFG_PATH=$PWD/../config/
		
Step3: update environment variables to act as peer for Hospital1 or Hospital2

---------- ca list ---------------
ca_hospital1
ca_hospital2

------------ Hospital1 ------------
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Hospital1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/hospital1.com/peers/peer0.hospital1.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/hospital1.com/users/Admin@hospital1.com/msp
export CORE_PEER_ADDRESS=localhost:7051

------------ Hospital2 ------------
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Hospital2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/hospital2.com/peers/peer0.hospital2.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/hospital2.com/users/Admin@hospital2.com/msp
export CORE_PEER_ADDRESS=localhost:9051

--------------- invoking CC with new peers ---------------
# Initialise ledger
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/hospital1.com/peers/peer0.hospital1.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/hospital2.com/peers/peer0.hospital2.com/tls/ca.crt -c '{"function":"InitPatientLedger","Args":[]}'

# Create new EHR
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/hospital1.com/peers/peer0.hospital1.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/hospital2.com/peers/peer0.hospital2.com/tls/ca.crt -c '{"function":"CreateRecord","Args":["EHR4","Patient4","D4","M4","Doc4"]}'

# Update EHR
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/hospital1.com/peers/peer0.hospital1.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/hospital2.com/peers/peer0.hospital2.com/tls/ca.crt -c '{"function":"UpdateRecord","Args":["EHR4","Patient4","D4","M4","Doc5"]}'

# Update doctor for EHR
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/hospital1.com/peers/peer0.hospital1.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/hospital2.com/peers/peer0.hospital2.com/tls/ca.crt -c '{"function":"TransferRecord","Args":["EHR4","Doc4"]}'

# Delete EHR
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/hospital1.com/peers/peer0.hospital1.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/hospital2.com/peers/peer0.hospital2.com/tls/ca.crt -c '{"function":"DeleteRecord","Args":["EHR4"]}'

--------------- querying CC with new peers ---------------
peer chaincode query -C mychannel -n basic -c '{"Args":["GetAllRecords"]}'

peer chaincode query -C mychannel -n basic -c '{"Args":["ReadRecord","EHR4"]}'

peer chaincode query -C mychannel -n basic -c '{"Args":["RecordExists","EHR4"]}'

