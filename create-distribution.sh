#!/bin/sh

set -e

VERSION=$(defaults read "$PWD/Info" CFBundleVersion)
NAME=$(basename "$PWD")
rm -rf "$NAME" phzh-printing-widget-*.zip
svn export https://svn.futurelab.ch/repos/futurelab/projects/phzh/PHZH%20Printing.wdgt
zip -r phzh-printing-widget-$VERSION.zip "$NAME"
rm -rf "$NAME"
