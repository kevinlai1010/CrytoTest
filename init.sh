mkdir my-ethereum-dapp && cd my-ethereum-dapp
cat <<EOT > package.json
{
  "name": "my-ethereum-dapp",
  "version": "1.0.0",
  "description": "Simple dapp for testing Amazon Managed Blockchain",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Alice B. Coder",
  "license": "ISC",
  "dependencies": {
    "web3": "^1.3.5",
    "@aws/web3-http-provider": "^1.0.1"
  }
}
EOT
npm install