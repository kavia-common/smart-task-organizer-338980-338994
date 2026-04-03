#!/bin/bash
cd /home/kavia/workspace/code-generation/smart-task-organizer-338980-338994/backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

