# Bank swam installation
### Install Hyperledger Fabric following first_index up untill 'Start the Authority chaincode' 

take the bank foler located inside 'chaincode' and place in /fabric/fabric-samples/chaincode


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

docker network create --attachable --driver overlay bank-network

```


