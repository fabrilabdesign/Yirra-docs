#!/bin/bash
echo "Testing connectivity to https://magic-sauce.addiaire.com/health"
status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 https://magic-sauce.addiaire.com/health)
echo "Status code: $status"
if [ "$status" = "200" ]; then
    echo "✅ Test passed"
else
    echo "❌ Test failed"
fi
