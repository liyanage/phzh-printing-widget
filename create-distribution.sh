#!/bin/sh

set -e

VERSION=$(defaults read "$PWD/Info" CFBundleVersion)
NAME="PHZH Printing.wdgt"
rm -rf "$NAME" phzh-printing-widget-*.zip
mkdir "$NAME"
tar --exclude .git --exclude "$NAME" -cv - . | (cd "$NAME"; tar -xf -)
zip -r phzh-printing-widget-$VERSION.zip "$NAME"
rm -rf "$NAME"

