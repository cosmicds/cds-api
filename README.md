# cds-api

This repository contains the source code for an API to access and manipulate the CosmicDS database. The goal here is to provide a single interface for the multiple pieces of CosmicDS software (the CosmicDS app, the website, etc.) to interact with our data.

## Project structure

This API is a relatively simple server written in [TypeScript](https://www.typescriptlang.org/) using [Express](https://expressjs.com/). This API handles things like user login, account creation, classroom creation, as well as multiple endpoints for fetching data from the database.

Interaction with the database (a MySQL database living on AWS) is handled via [Sequelize](https://sequelize.org/).

## Deployment

On a push to the main branch, this API is automatically built and deployed on an AWS EC2 instance managed via Elastic Beanstalk. The API is reachable at https://api.cosmicds.cfa.harvard.edu/.
