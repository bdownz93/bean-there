#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Function to print error and exit
error_exit() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# Check if environment is provided
if [ "$1" != "dev" ] && [ "$1" != "prod" ]; then
    error_exit "Please specify environment: dev or prod"
fi

ENV=$1

# Load appropriate environment variables
if [ "$ENV" = "prod" ]; then
    echo -e "${GREEN}Loading production environment...${NC}"
    if [ ! -f .env.production ]; then
        error_exit ".env.production file not found"
    fi
    set -a
    source .env.production
    set +a

    # Link to the production project
    echo -e "${GREEN}Linking to Supabase project...${NC}"
    npx supabase link --project-ref $(echo $NEXT_PUBLIC_SUPABASE_URL | cut -d'/' -f3 | cut -d'.' -f1) || error_exit "Failed to link project"

    # Apply migrations
    echo -e "${GREEN}Applying migrations...${NC}"
    npx supabase db push || error_exit "Failed to apply migrations"
else
    echo -e "${GREEN}Loading development environment...${NC}"
    if [ ! -f .env.local ]; then
        error_exit ".env.local file not found"
    fi
    set -a
    source .env.local
    set +a

    # Reset and start local database
    echo -e "${GREEN}Resetting local database...${NC}"
    npx supabase db reset || error_exit "Failed to reset database"

    # Apply seed data
    if [ -f supabase/seed.sql ]; then
        echo -e "${GREEN}Applying seed data...${NC}"
        npx supabase db reset --db-url postgresql://postgres:postgres@localhost:54322/postgres << EOF
n
EOF
    fi
fi

echo -e "${GREEN}Migration completed successfully!${NC}"
