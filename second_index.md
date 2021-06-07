# Bank swam installation ( Does not Work)
### Install Hyperledger Fabric following first_index up untill 'Start the Authority chaincode' 

On Host 1 we need to use docker swarm to create an overlay to connect with the other servers


```bash

docker swarm init --advertise-addr 157.245.130.40 IP-Host-1
docker swarm join-token manager

```

Docker

Out put from join token:
docker swarm join --token SWMTKN-1-4zknhjwzp9w8b6c3mql6dww43mld9htutjk0wz3d1a8mh6psp4-aa3x5cafjergp7a3qj32fx8cs 198.211.108.93:2377

Go to each other host and connect the host to the swarm by using the output of the join-token and the ip of the host

```bash

'swam join-token manager output' --advertise-addr 'ip of machine'

```

'This node joined a swarm as a manager.' should display

create a network overlay across the other hosts

```bash

docker network create --attachable --driver overlay first-network

```


Now download we need to download the start-up scripts for each server
note to self, this should be in a diffrent git repo 

```bash

cd fabric/fabric-samples/

git clone https://github.com/Auzzzz/Hyperledger_Fabric-for-Security-In-Comp--RMIT-.git
cd Hyperledger_Fabric-for-Security-In-Comp--RMIT-/Banks_Server/bank-swarm

```

on each server bring up the correct .sh folder.
for host 2 use ./host2up.sh
This will connect/create each hosts orderer and the peer
Take note of the orderer & peer/org numbers

then bring up the channel on host 1


```bash

chmod +rwx ./host1up.sh
./host1up.sh
chmod +rwx ./host2up.sh
./host2up.sh
chmod +rwx ./host3up.sh
./host3up.sh
chmod +rwx ./host4up.sh
./host4up.sh

# Host 1
chmod +rwx ./mychannelup.sh
./mychannelup.sh

```

to check the other hosts have a connection & they all have the genisus block connect check each host using
```bash

#Host 1
docker exec peer0.org1.example.com peer channel getinfo -c mychannel

#Host 2
docker exec peer1.org1.example.com peer channel getinfo -c mychannel

#Host 3
docker exec peer0.org2.example.com peer channel getinfo -c mychannel

#Host 3
docker exec peer1.org2.example.com peer channel getinfo -c mychannel

```

## Chaincode deploy

earlier we placed the bank chaincode into the chaincode folder

we now need to start that up

take the 'bank_complete.tar.gz' and place that into fabric/fabric-samples/

``` bash

cd ~ && cd fabric/fabric-samples/

# Complete all of this on Host 1

docker exec cli peer lifecycle chaincode package bank_complete.tar.gz --path / --lang node --label basic_1.0

# Peer 0 org 1
docker exec cli peer lifecycle chaincode install bank_complete.tar.gz 

# Peer 1 org 1
docker exec -e CORE_PEER_ADDRESS=peer1.org1.example.com:8051 -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt cli peer lifecycle chaincode install bank_complete.tar.gz

# Peer  org 2
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 -e CORE_PEER_LOCALMSPID="Org2MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt cli peer lifecycle chaincode install bank_complete.tar.gz

# Peer 1 org 2
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer1.org2.example.com:10051 -e CORE_PEER_LOCALMSPID="Org2MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer1.org2.example.com/tls/ca.crt cli peer lifecycle chaincode install bank_complete.tar.gz

```

these scripts will output a Chaincode code package identifier this package should keep the exact same id between installs however you may need to change it

```bash

# org 1
docker exec cli peer lifecycle chaincode approveformyorg --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --channelID mychannel --name bank --version 1 --sequence 1 --waitForEvent --package-id basic_1.0:a0414654a70075262c5b8b37e66523f6b596a91d48412c1e23dc55827ee39f3a

# org 2
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 -e CORE_PEER_LOCALMSPID="Org2MSP" -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt cli peer lifecycle chaincode approveformyorg --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --channelID mychannel --name bank --version 1 --sequence 1 --waitForEvent --package-id basic_1.0:a0414654a70075262c5b8b37e66523f6b596a91d48412c1e23dc55827ee39f3a

```

you should see 'committed with status (VALID)' on both org's

checking the status of both orgs:
```bash
docker exec cli peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name bank --version 1 --sequence 1
```

Commit the chaincode
```bash
docker exec cli peer lifecycle chaincode commit -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt --channelID mychannel --name bank --version 1 --sequence 1
```


```bash
docker exec cli peer chaincode invoke -o orderer3.example.com:9050 --tls true --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer3.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n bank --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"Args":["initLedger"]}'
```

### Thanks

https://hyperledger-fabric.readthedocs.io/en/latest/chaincode_lifecycle.html

https://hyperledger-fabric.readthedocs.io/en/release-2.2/deploy_chaincode.html#install-the-chaincode-package

https://kctheservant.medium.com/multi-host-deployment-for-first-network-hyperledger-fabric-v2-273b794ff3d



chmod +rwx ./host1down.sh
./host1down.sh
chmod +rwx ./host2down.sh
./host2down.sh
chmod +rwx ./host3down.sh
./host3down.sh
chmod +rwx ./host4down.sh
./host4down.sh