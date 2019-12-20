### Setup the simnet environment

```sh
scripts/simnet-setup.sh
```

### to get LND_MACAROON and LND_CERT run:

```sh
scripts/simnet-env.sh
```

then copy in .env

Để xem balance của wallet

```sh
docker-compose exec simnet-lnd-btcd-alice lncli --rpcserver=localhost:10009 --macaroonpath=~/.lnd/data/chain/bitcoin/simnet/admin.macaroon walletbalance
```

migrate btcd

```sh
docker-compose run simnet-btcctl generate 5 > /dev/null
```

Open channel

```sh
docker-compose exec simnet-lnd-btcd-alice lncli --rpcserver=localhost:10009 --macaroonpath=~/.lnd/data/chain/bitcoin/simnet/admin.macaroon openchannel --node_key=02d61e6b1e69f56e1be75fc270abdb9daade494df32ce4b7bb008a0caed5e4bb3c --local_amt=1000000
```

copy data from node

```
# Bob lnd node

docker cp 9090bb453f26:/root/.lnd/data/bitcoin ./bob
```
