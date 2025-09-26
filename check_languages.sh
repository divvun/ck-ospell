#!/bin/bash

port=$1
if [ -z "$port" ]; then
    echo "Usage: $0 <port>"
    exit 1
fi
# Run curl command and capture both output and exit status
response=$(curl -s "http://localhost:$port/spellcheck/script/ssrv.cgi?cmd=get_lang_list&run_mode=web_service")
curl_exit_code=$?

# If curl failed, exit with curl's exit status
if [ $curl_exit_code -ne 0 ]; then
    echo "curl failed with exit code: $curl_exit_code"
    exit $curl_exit_code
fi

# Check if "langList" is in the response
if echo "$response" | grep -q "langList"; then
    echo "Success: langList found in response"
    echo "Response: $response"
    exit 0
else
    echo "Error: langList not found in response"
    echo "Response: $response"
    exit 99
fi
