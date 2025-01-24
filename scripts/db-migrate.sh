#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Check if environment argument is provided
if [ -z "$1" ]; then
    echo -e "${RED}Please specify environment: dev or prod${NC}"
    exit 1
fi

ENV=$1

# Load appropriate environment variables
if [ "$ENV" = "prod" ]; then
    echo -e "${GREEN}Loading production environment...${NC}"
    set -a
    source .env.production
    set +a
elif [ "$ENV" = "dev" ]; then
    echo -e "${GREEN}Loading development environment...${NC}"
    set -a
    source .env.local
    set +a
else
    echo -e "${RED}Invalid environment. Use 'dev' or 'prod'${NC}"
    exit 1
fi

# Run database migrations
echo -e "${GREEN}Running database migrations for $ENV environment...${NC}"
npx supabase db push

echo -e "${GREEN}Migration completed successfully!${NC}"
