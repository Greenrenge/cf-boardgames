#!/bin/bash

# 🧪 Location API Customization - Comprehensive Test Suite
# This script runs automated tests for the Location API feature

set -e  # Exit on any error

echo "🚀 Starting Location API Customization Test Suite"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\n${BLUE}🧪 Testing: $test_name${NC}"
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Function to check if file exists and has content
check_file() {
    local file_path="$1"
    local min_size="${2:-1}"
    
    if [[ -f "$file_path" && $(wc -c < "$file_path") -gt $min_size ]]; then
        return 0
    else
        return 1
    fi
}

# Function to check TypeScript compilation
check_typescript() {
    npx tsc --noEmit --project tsconfig.json
}

# Function to check component imports
check_component_imports() {
    local component_dir="components/location"
    local required_components=(
        "LocationList.tsx"
        "LocationItem.tsx" 
        "RoleSelector.tsx"
        "LocationErrorBoundary.tsx"
        "LoadingStates.tsx"
    )
    
    for component in "${required_components[@]}"; do
        if [[ ! -f "$component_dir/$component" ]]; then
            echo "Missing component: $component_dir/$component"
            return 1
        fi
    done
    
    return 0
}

# Function to check hook files
check_hooks() {
    local hooks_dir="lib/hooks"
    local required_hooks=(
        "useLocationSelection.ts"
        "useLocations.ts"
        "usePerformanceOptimizations.ts"
    )
    
    for hook in "${required_hooks[@]}"; do
        if [[ ! -f "$hooks_dir/$hook" ]]; then
            echo "Missing hook: $hooks_dir/$hook"
            return 1
        fi
    done
    
    return 0
}

# Function to check utility files
check_utilities() {
    local utils_dir="lib/utils"
    local required_utils=(
        "locationStorage.ts"
        "locationMerge.ts"
        "errorHandling.ts"
    )
    
    for util in "${required_utils[@]}"; do
        if [[ ! -f "$utils_dir/$util" ]]; then
            echo "Missing utility: $utils_dir/$util"
            return 1
        fi
    done
    
    return 0
}

# Function to check test pages
check_test_pages() {
    local app_dir="app/[locale]"
    local required_pages=(
        "test-locations/page.tsx"
        "test-merge/page.tsx"
        "test-customization/page.tsx"
        "test-host-persistence/page.tsx"
    )
    
    for page in "${required_pages[@]}"; do
        if [[ ! -f "$app_dir/$page" ]]; then
            echo "Missing test page: $app_dir/$page"
            return 1
        fi
    done
    
    return 0
}

# Function to check for console errors in components
check_console_errors() {
    # This is a simple grep check for console.error in production code
    local error_count=$(grep -r "console\.error" components/location lib/hooks lib/utils | grep -v "// Development only" | grep -v "process.env.NODE_ENV" | wc -l)
    
    if [[ $error_count -gt 5 ]]; then  # Allow some console.error in error handlers
        echo "Too many console.error statements found: $error_count"
        return 1
    fi
    
    return 0
}

# Function to check for accessibility attributes
check_accessibility() {
    local aria_count=$(grep -r "aria-" components/location | wc -l)
    local role_count=$(grep -r "role=" components/location | wc -l)
    
    if [[ $aria_count -lt 10 || $role_count -lt 5 ]]; then
        echo "Insufficient accessibility attributes found"
        echo "ARIA attributes: $aria_count (expected: >10)"
        echo "Role attributes: $role_count (expected: >5)"
        return 1
    fi
    
    return 0
}

# Function to check for performance optimizations
check_performance() {
    local memo_count=$(grep -r "React.memo" components/location | wc -l)
    local callback_count=$(grep -r "useCallback" components/location lib/hooks | wc -l)
    
    if [[ $memo_count -lt 3 || $callback_count -lt 5 ]]; then
        echo "Insufficient performance optimizations found"
        echo "React.memo usage: $memo_count (expected: >3)"
        echo "useCallback usage: $callback_count (expected: >5)"
        return 1
    fi
    
    return 0
}

# Function to check documentation
check_documentation() {
    local doc_files=(
        "PHASE_9_POLISH_IMPLEMENTATION.md"
        "TESTING_DEPLOYMENT_PLAN.md"
    )
    
    for doc in "${doc_files[@]}"; do
        if [[ ! -f "$doc" ]]; then
            echo "Missing documentation: $doc"
            return 1
        fi
    done
    
    return 0
}

# Run all tests
echo -e "\n${YELLOW}📁 Checking File Structure...${NC}"
run_test "Core Components Exist" "check_component_imports"
run_test "Required Hooks Exist" "check_hooks" 
run_test "Utility Files Exist" "check_utilities"
run_test "Test Pages Exist" "check_test_pages"
run_test "Documentation Complete" "check_documentation"

echo -e "\n${YELLOW}🔧 Checking Code Quality...${NC}"
run_test "TypeScript Compilation" "check_typescript"
run_test "Console Error Usage" "check_console_errors"

echo -e "\n${YELLOW}♿ Checking Accessibility...${NC}"
run_test "Accessibility Attributes" "check_accessibility"

echo -e "\n${YELLOW}⚡ Checking Performance...${NC}"
run_test "Performance Optimizations" "check_performance"

echo -e "\n${YELLOW}🧪 Checking Specific Components...${NC}"

# Check LocationList component
run_test "LocationList Error Boundary" "grep -q 'LocationErrorBoundary' components/location/LocationList.tsx"
run_test "LocationList Keyboard Navigation" "grep -q 'onKeyDown.*handleKeyDown' components/location/LocationList.tsx"
run_test "LocationList ARIA Labels" "grep -q 'aria-' components/location/LocationList.tsx"

# Check LocationItem component  
run_test "LocationItem Accessibility" "grep -q 'aria-expanded' components/location/LocationItem.tsx"
run_test "LocationItem React.memo" "grep -q 'React.memo' components/location/LocationItem.tsx"

# Check RoleSelector component
run_test "RoleSelector Live Regions" "grep -q 'aria-live' components/location/RoleSelector.tsx"
run_test "RoleSelector React.memo" "grep -q 'React.memo' components/location/RoleSelector.tsx"

# Check Error Handling
run_test "Error Boundary Component" "check_file 'components/location/LocationErrorBoundary.tsx' 1000"
run_test "Error Utilities" "check_file 'lib/utils/errorHandling.ts' 5000"

# Check Performance Hooks
run_test "Performance Optimization Hooks" "check_file 'lib/hooks/usePerformanceOptimizations.ts' 3000"

# Check Loading States
run_test "Loading State Components" "check_file 'components/location/LoadingStates.tsx' 2000"

# Print test summary
echo -e "\n${BLUE}📊 Test Summary${NC}"
echo "=============="
echo -e "Tests Run: ${YELLOW}$TESTS_RUN${NC}"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Feature is ready for deployment.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please review and fix issues before deployment.${NC}"
    exit 1
fi