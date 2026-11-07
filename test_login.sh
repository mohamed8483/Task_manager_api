
#!/usr/bin/env bash

BASE_URL="http://localhost:3000/api/auth/login"

USERNAME="Mohamedlogin09"
EMAIL="mohamed.login.test@example.com"
PASSWORD="MyPassword123"

PASS=0
FAIL=0

# Check jq installation
if ! command -v jq >/dev/null 2>&1; then
    echo "[ERROR] jq is not installed."
    echo "Install it using: sudo apt install jq"
    return 1 2>/dev/null || true
fi

run_test() {
    local test_name="$1"
    local expected_status="$2"
    local payload="$3"
    local jq_filter="$4"

    local response
    local actual_status
    local body

    response=$(curl -sS -w "\n%{http_code}" \
        -X POST "$BASE_URL" \
        -H "Content-Type: application/json" \
        -d "$payload")

    actual_status=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')

    local status_ok=true
    local json_ok=true

    if [[ "$actual_status" != "$expected_status" ]]; then
        status_ok=false
    fi

    if ! jq -e "$jq_filter" >/dev/null 2>&1 <<< "$body"; then
        json_ok=false
    fi

    if [[ "$status_ok" == true && "$json_ok" == true ]]; then
        echo "[PASS] $test_name"
        ((PASS++))
    else
        echo "[FAIL] $test_name"

        if [[ "$status_ok" == false ]]; then
            echo "  HTTP: Expected $expected_status, Got $actual_status"
        fi

        if [[ "$json_ok" == false ]]; then
            echo "  JSON validation failed."
        fi

        echo "  Response: $body"
        ((FAIL++))
    fi
}

echo "================================"
echo "       LOGIN API TESTS"
echo "================================"

# 1. Valid username login
run_test "Valid username login" 200 \
"{\"identifier\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" \
'.success == true and (.user.id | type == "number") and .user.username == "Mohamedlogin09" and .user.email == "mohamed.login.test@example.com" and .user.role == "USER" and (.user | has("password_hash") | not)'

# 2. Valid email login
run_test "Valid email login" 200 \
"{\"identifier\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
'.success == true and (.user.id | type == "number") and .user.username == "Mohamedlogin09" and .user.role == "USER" and (.user | has("password_hash") | not)'

# 3. Wrong password
run_test "Wrong password" 401 \
"{\"identifier\":\"$USERNAME\",\"password\":\"WrongPassword123\"}" \
'.success == false and .error == "INVALID_CREDENTIALS"'

# 4. Nonexistent user
run_test "Nonexistent user" 401 \
"{\"identifier\":\"unknown_user_999\",\"password\":\"$PASSWORD\"}" \
'.success == false and .error == "INVALID_CREDENTIALS"'

# 5. Missing identifier
run_test "Missing identifier" 400 \
"{\"password\":\"$PASSWORD\"}" \
'.success == false and .error == "INVALID_IDENTIFIER"'

# 6. Missing password
run_test "Missing password" 400 \
"{\"identifier\":\"$USERNAME\"}" \
'.success == false and .error == "INVALID_PASSWORD"'

# 7. Empty identifier
run_test "Empty identifier" 400 \
"{\"identifier\":\"\",\"password\":\"$PASSWORD\"}" \
'.success == false and .error == "INVALID_IDENTIFIER"'

# 8. Empty password
run_test "Empty password" 400 \
"{\"identifier\":\"$USERNAME\",\"password\":\"\"}" \
'.success == false and .error == "INVALID_PASSWORD"'

# 9. Whitespace-only identifier
run_test "Whitespace identifier" 400 \
"{\"identifier\":\"   \",\"password\":\"$PASSWORD\"}" \
'.success == false and .error == "INVALID_IDENTIFIER"'

# 10. Whitespace-only password
run_test "Whitespace password" 400 \
"{\"identifier\":\"$USERNAME\",\"password\":\"   \"}" \
'.success == false and .error == "INVALID_PASSWORD"'

echo ""
echo "================================"
echo "           SUMMARY"
echo "================================"
echo "Passed: $PASS"
echo "Failed: $FAIL"
echo "Total:  $((PASS + FAIL))"
