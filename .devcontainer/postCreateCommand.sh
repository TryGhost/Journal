#!/usr/bin/sh

# Install npm dependencies for app
npm i
npm i -g ghost-cli@latest

# Install Ghost
cd /workspaces
mkdir ghost
cd ghost
ghost install local --no-start

# symlink the current folder to the ghost themes folder
ln -s /workspaces/ghost-dc-journal /workspaces/ghost/content/themes/ghost-dc-journal

cd /workspaces/ghost-dc-journal