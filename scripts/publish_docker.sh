set -e

if [ -n "$(git status --porcelain)" ]; then
  echo "Must not have uncommitted changes"
  exit 1
fi

SHA=$(git rev-parse HEAD)
bun docker:build
docker tag daradermody/siren-steps:latest daradermody/siren-steps:"${SHA}"
docker push daradermody/siren-steps:latest
docker push daradermody/siren-steps:"${SHA}"
