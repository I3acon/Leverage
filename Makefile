compile: 
	npx hardhat compile

account: 
	npx hardhat accounts

ltest:
	npx hardhat test

chain:
	npx hardhat node

deploy:
	npx hardhat run scripts/deploy.ts --network localhost