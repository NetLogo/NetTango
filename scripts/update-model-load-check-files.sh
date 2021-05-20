#!/bin/zsh

if [ -e "dist/test/results/code-checks/" ]
then
  mv dist/test/results/code-checks/*.nls test/code-checks
fi

if [ -e "dist/test/results/data-checks" ]
then
  mv dist/test/results/data-checks/*.ntjson test/data-checks
fi
