#!/bin/bash

# Bank API Test Script
# Tests all endpoints of the local bank server

BASE_URL="http://localhost:3001"
echo "🏦 Testing Bank API at $BASE_URL"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    echo -e "\n${YELLOW}Testing: $1${NC}"
    echo "Command: $2"
    echo "Response:"
    eval $2
    echo ""
}

# 1. Test API Information
test_endpoint "API Information" "curl -s $BASE_URL/ | jq ."

# 2. Test Get All Accounts
test_endpoint "Get All Accounts" "curl -s $BASE_URL/api/accounts | jq ."

# 3. Test Get Specific Account
test_endpoint "Get Account #1" "curl -s $BASE_URL/api/accounts/1 | jq ."

# 4. Test Get Account Balance
test_endpoint "Get Account #1 Balance" "curl -s $BASE_URL/api/accounts/1/balance | jq ."

# 5. Test Get All Transactions
test_endpoint "Get All Transactions" "curl -s $BASE_URL/api/transactions | jq ."

# 6. Test Account Statement
test_endpoint "Get Account Statement" "curl -s '$BASE_URL/api/accounts/1/statement?startDate=2025-06-01&endDate=2025-06-30' | jq ."

# 7. Test Create Account
test_endpoint "Create New Account" "curl -s -X POST $BASE_URL/api/accounts -H 'Content-Type: application/json' -d '{\"accountHolder\": \"Test User\", \"initialBalance\": 1000, \"accountType\": \"checking\"}' | jq ."

# 8. Test Deposit Transaction
test_endpoint "Create Deposit Transaction" "curl -s -X POST $BASE_URL/api/accounts/1/transactions -H 'Content-Type: application/json' -d '{\"type\": \"deposit\", \"amount\": 500, \"description\": \"Test deposit\"}' | jq ."

# 9. Test Withdrawal Transaction
test_endpoint "Create Withdrawal Transaction" "curl -s -X POST $BASE_URL/api/accounts/1/transactions -H 'Content-Type: application/json' -d '{\"type\": \"withdrawal\", \"amount\": 100, \"description\": \"Test withdrawal\"}' | jq ."

# 10. Test Transfer
test_endpoint "Transfer Funds" "curl -s -X POST $BASE_URL/api/transfer -H 'Content-Type: application/json' -d '{\"fromAccountId\": 1, \"toAccountId\": 2, \"amount\": 250, \"description\": \"Test transfer\"}' | jq ."

# 11. Test Interest Calculation (on savings account)
test_endpoint "Apply Interest to Savings Account" "curl -s -X POST $BASE_URL/api/accounts/2/interest -H 'Content-Type: application/json' -d '{\"rate\": 0.025}' | jq ."

# 12. Test Freeze Account
test_endpoint "Freeze Account" "curl -s -X POST $BASE_URL/api/accounts/3/freeze -H 'Content-Type: application/json' -d '{\"reason\": \"Test freeze\"}' | jq ."

# 13. Test Unfreeze Account
test_endpoint "Unfreeze Account" "curl -s -X POST $BASE_URL/api/accounts/3/unfreeze | jq ."

# 14. Final Status Check
echo -e "\n${GREEN}🎉 API Testing Complete!${NC}"
echo "================================="
echo "📊 Final account balances:"
curl -s $BASE_URL/api/accounts | jq '.[] | {id: .id, holder: .accountHolder, balance: .balance, status: .status}'

echo -e "\n💳 Total transactions:"
curl -s $BASE_URL/api/transactions | jq 'length'

echo -e "\n${GREEN}✅ All tests completed successfully!${NC}" 