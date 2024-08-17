default:
  @just --list

# Project Setup

# copies web/.env.example to web/.env
generate-initial-web-env:
  cp web/.env.example web/.env

# installs npm deps for web
web-install:
  cd web && npm install

# builds the typescript for the front end app
web-build:
  cd web && npm run build

# run front end app locally,
# with file watching that triggers rebuilds
web-run:
  cd web && npm run dev

# lint the front end app
web-lint:
  cd web && npm run lint
