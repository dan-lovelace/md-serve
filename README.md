# md-serve

A barebones web server that converts pages written in Markdown to HTML. It will
serve any Markdown located in the `pages` directory as HTML using the file's
path as its access point. Files named `index.md` are considered base routes. For
instance:

- The file `pages/index.md` is accessible at `/`
- The file `pages/blog/ireland.md` is accessible at `/blog/ireland`
- The file `pages/blog/index.md` is accessible at `/blog`

The site's layout is defined by the HTML in `public/index.html`. Opening that
file, you'll notice the token `%APP%` which is where a page's converted HTML
gets injected.

## Browser Javascript

If your application needs Javascript, uncomment the line referencing
`/js/main.js` and add whatever you want to `src/js/main.ts`. There is no
bundling solution for browser Javascript so you can't `import`/`require` unless
you modify the build process. If you need multiple files, just add separate
`script` tags to `public/index.html`.

# Project structure

- `pages/` - Stores Markdown pages and defines the site's routing
- `public/` - Static assets
- `src/` - The ExpressJS server

# Requirements

- [NodeJS v18](https://nodejs.org/en/blog/release/v18.18.1) or higher
- Optional: [Docker](https://docs.docker.com/get-docker/)

# Getting started

1. Clone this repository
   ```sh
   git clone https://github.com/dan-lovelace/md-serve.git
   ```
1. Change into the new directory
   ```sh
   cd md-serve
   ```
1. Start the server using one of the following options:
   [from source](#running-from-source) or [with Docker](#running-with-docker)

## Running from source

1. Install dependencies
   ```sh
   npm install
   ```
1. Start the development server
   ```sh
   npm run dev
   ```

## Running with Docker

- Build and run the container using default configuration
  ```sh
  docker compose up --build
  ```
- Build and run using a specific environment file
  ```sh
  docker compose --env-file=".env.development" up --build
  ```

# Local development

The `npm run dev` command starts the server from source and watches for changes
to the `pages` and `src` directories. The base HTML inherited by all pages can
be found in `public/index.html` and anything in the `public` directory is served
statically.

There is a `src/js` directory that is used to store any necessary Javascript for
the browser. There is no bundling solution shipped by default but one could be
added depending on needs.

# Docker and AWS

## Building and pushing an image to ECR

1. Create a new repository in ECR
   ```sh
   aws ecr create-repository md-serve
   ```
1. Login to the new repository with Docker - Replace `ACCOUNT_NUMBER` and
   `REGION` with your own
   ```sh
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_NUMBER.dkr.ecr.REGION.amazonaws.com/md-serve
   ```
1. Build the latest image
   ```sh
   docker compose build
   ```
   - **Note**: You may provide an environment file using the `--env-file` flag
     like this: `docker compose --env-file=".env.production" build`
1. Create a tag pointing to the ECR repository - Replace `ACCOUNT_NUMBER` and
   `REGION` with your own
   ```sh
   docker tag md-web-server:latest ACCOUNT_NUMBER.dkr.ecr.REGION.amazonaws.com/md-serve
   ```
1. Push the image to the remote repository
   ```sh
   docker push ACCOUNT_NUMBER.dkr.ecr.REGION.amazonaws.com/md-serve
   ```

## Deployment

Below are some very loose steps for AWS deployment options and there are an
endless list of other options for hosting Docker containers.

### EC2

1. Create a new EC2 instance using an image that has Linux and Docker - Look in
   the AWS marketplace
1. Create an elastic IP and associate it with the instance
1. SSH into the machine and run that
   `aws ecr get-login-password ... | docker login ...` command from above to
   login to docker - Run `aws configure` to set up credentials or edit
   `~/.aws/config` and `~/.aws/credentials` manually
1. Pull the image
   `docker pull ACCOUNT_NUMBER.dkr.ecr.REGION.amazonaws.com/md-serve-repo:latest`
1. Get the image id with `docker images`
1. Run it using the image id and expose the correct port(s)
   `docker run -d -p 8000:8000 2ce25025a251`
1. Navigate to the instance's public IP
1. Homepage should display

### ECS

1. Create a new ECS cluster
1. Create a new ECS Task Definition using the ECR image
1. Create a new ECS Service that uses the new Task Definition
1. Wait for task to start and select it
1. Navigate to the task's public IP
1. Homepage should display

#### Assign static IP to ECS service

https://repost.aws/knowledge-center/ecs-fargate-static-elastic-ip-address
