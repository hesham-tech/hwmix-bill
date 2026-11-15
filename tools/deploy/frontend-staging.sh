#!/usr/bin/env bash
set -euo pipefail
revision="${1:?Git revision required}"
[[ "$revision" =~ ^[a-f0-9]{40}$ ]] || exit 2
base=/home/u715355537/apps/hwnix-frontend-staging
web=/home/u715355537/domains/hwnix.com/public_html/staging
release="$base/releases/$revision"
[[ "$(whoami)" == u715355537 && "$(realpath "$base")" == "$base" ]] || exit 2
exec 9>"$base/deploy.lock"
flock -w 300 9

if [[ -L "$web" ]]; then
    [[ "$(readlink "$web")" == "$base/current" ]] || exit 2
elif [[ -d "$web" ]]; then
    unexpected="$(find "$web" -mindepth 1 ! -type d ! -name default.php -print -quit)"
    [[ -z "$unexpected" && ! -e "$base/initial-placeholder" ]] || {
        echo 'Unrecognized staging content; refusing replacement'; exit 2;
    }
else
    echo 'Expected staging web root is missing'; exit 2
fi

mkdir -p "$release"
[[ "$(realpath "$release")" == "$release" ]] || exit 2
tar -xzf "$base/incoming/$revision.tgz" -C "$release"
test -s "$release/index.html"
test -s "$release/.htaccess"
[[ "$(cat "$release/staging-revision.txt")" == "$revision" ]] || exit 2
previous="$(readlink "$base/current" || true)"
# Existing tabs can still request old hashed chunks after a deployment.
if [[ "$previous" == "$base/releases/"* && -d "$previous/assets" ]]; then
    cp -an "$previous/assets/." "$release/assets/"
fi
ln -sfn "$release" "$base/current.next"
mv -Tf "$base/current.next" "$base/current"
first=false
if [[ ! -L "$web" ]]; then
    mv "$web" "$base/initial-placeholder"
    ln -s "$base/current" "$web"
    first=true
fi

healthy=false
for attempt in 1 2 3 4; do
    actual="$(curl --fail --silent --show-error --max-time 30 https://staging.hwnix.com/staging-revision.txt || true)"
    if [[ "$actual" == "$revision" ]] && curl --fail --silent --show-error --max-time 30 https://staging.hwnix.com/ > /dev/null; then
        healthy=true; break
    fi
    sleep 5
done
if [[ "$healthy" != true ]]; then
    if [[ "$previous" == "$base/releases/"* && -d "$previous" ]]; then
        ln -sfn "$previous" "$base/current.rollback"
        mv -Tf "$base/current.rollback" "$base/current"
        echo 'Restored previous staging frontend release'
    elif [[ "$first" == true && "$(readlink "$web")" == "$base/current" ]]; then
        unlink "$web"
        mv "$base/initial-placeholder" "$web"
        echo 'Restored initial staging placeholder'
    fi
    exit 1
fi
echo "Activated staging frontend revision $revision"
