#!/bin/sh

JSHINT="./node_modules/jshint/bin/jshint"

$JSHINT lib/*.js tests/*.js
