# PCB Wizard 3000™

A wild PCB validator + visualizer application appears!

## How to run

### Local development

This project has a server and a client, which need to be run separately.

#### Server

```sh
cd server
npm install
npm start
# Server should be running at http://localhost:4000
```

#### Client

```sh
cd client
npm install
npm run dev
# Client app should be available at http://localhost:5137 in your browser
```

### Using Docker Compose

Both the client and server have their own Dockerfiles, and a `docker-compose.yml` file is provided at the top level of the project to run both the client and server together.

```sh
docker-compose build
docker-compose up
# Open http://localhost:4137 in your browser
```
