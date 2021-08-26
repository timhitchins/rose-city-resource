# Rose City Resource Online

To start this application in development, clone the repository.

There are two `package.json` files for installing modules in the client and server.

For the server:

```
cd ./rose-city-resource
npm install
```

NOTE: the following environment variables must be present in order to run the server:

```
AIRTABLE_API_KEY='The airtable API key'
AIRTABLE_BASE_ID='The airtable base ID'
DATABASE_URL='The fully-qualified Heroku Database URL'
GOOGLE_API_KEY='The Google API key'

(These can be added to an .env file in the root directory)
```

ETL IMPORT: import Python modules to enable running the ETL import script

```
pip3 install -r requirements.txt

(Requirements.txt is located in the root of the repository)
```

For the client:

```
cd ./rose-city-resource/client
npm install
```

To run the stack in development after installs, change back to the root directory and run:

```
npm run dev
```

## Troubleshooting

### M1 Macs

The new architecture on the M1 macs creates some issues with project dependencies and such. Make sure to install **node/npm** using a Rosetta-translated terminal as per [this guide](https://dev.to/courier/tips-and-tricks-to-setup-your-apple-m1-for-development-547g). After that, your `npm installs` and scripts *should* run just fine.
