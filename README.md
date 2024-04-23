# Setup & Installation
DFMM Indexer is current setup to run on the most recent DFMM deployment on OP Sepolia Testnet.

1. Run `bun i` to install dependancies.
2. Create a `.env` file and add an HTTP OP Sepolia Testnet RPC URL under `PONDER_RPC_URL_11155420`
3. Run `bun dev` to start development server.

# Production Deployment
Follow the Ponder deployment instructions to easily spin up an indexer enpoint using Railway.


# Usage 
## Web Applications
Internally, Primitive uses Tanstack Query to write queries for dfmm-indexer. Please visit [Tanstack Query v4 documentation](https://tanstack.com/query/v4).

## Static Websites
Static webpages must consume gql using `fetch`.  Write an async function that creates the necessary headers, place the gql query within the requestBody, and write a simple loading state.

Remember, dfmm-indexer is not authenticated so we can strip out a lot of common boilerplate. This example demonstates the most simple method of implementing `fetch` in Next.js:
https://github.com/aagam29/graphql-clients/blob/main/pages/fetch.jsx