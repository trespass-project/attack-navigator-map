#!/bin/sh

# all to lowercase first
for f in *; do mv "$f" "$f.tmp"; mv "$f.tmp" "`echo $f | tr "[:upper:]" "[:lower:]"`"; done

# black to white
sed -i '' 's/#000000/#ffffff/g' *.svg

# white to black
sed -i '' 's/#ffffff/#000000/g' *.svg
