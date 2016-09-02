#!/bin/sh

# to black
sed -i '' 's/#010000/#000000/g' *.svg

# to white
sed -i '' 's/#000000/#ffffff/g' *.svg
