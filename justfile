default:
  @just --list

# Project Setup

# copies web/.env.example to web/.env
generate-initial-web-env:
  cp web/.env.example web/.env

# installs npm deps for web
install-web-deps:
  cd web && npm install

# builds the typescript for the front end app
build-web:
  cd web && npm run build

# run front end app locally,
# with file watching that triggers rebuilds
run-web-local:
  cd web && npm run dev