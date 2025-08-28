#!/bin/bash

echo "🔄 Starting data migration..."

# Get gallery photos from local API
echo "📥 Fetching local gallery photos..."
LOCAL_GALLERY=$(curl -s "http://localhost:1342/api/gallery-photos?populate=*")

# Extract and migrate each photo
echo "📤 Migrating gallery photos..."
echo "$LOCAL_GALLERY" | jq -r '.data[] | @json' | while IFS= read -r photo; do
    TITLE=$(echo "$photo" | jq -r '.title')
    ALT=$(echo "$photo" | jq -r '.alt')
    DESCRIPTION=$(echo "$photo" | jq -r '.description')
    LOCATION=$(echo "$photo" | jq -r '.location')
    ACTIVITY=$(echo "$photo" | jq -r '.activity')
    CATEGORY=$(echo "$photo" | jq -r '.category')
    
    echo "Migrating photo: $TITLE"
    
    curl -s -X POST "https://societas-backend.onrender.com/api/gallery-photos" \
        -H "Content-Type: application/json" \
        -d "{\"data\":{\"title\":\"$TITLE\",\"alt\":\"$ALT\",\"description\":\"$DESCRIPTION\",\"location\":\"$LOCATION\",\"activity\":\"$ACTIVITY\",\"category\":\"$CATEGORY\"}}" > /dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully migrated: $TITLE"
    else
        echo "❌ Failed to migrate: $TITLE"
    fi
done

# Get events from local API
echo "📥 Fetching local events..."
LOCAL_EVENTS=$(curl -s "http://localhost:1342/api/events?populate=*")

# Extract and migrate each event
echo "📤 Migrating events..."
echo "$LOCAL_EVENTS" | jq -r '.data[] | @json' | while IFS= read -r event; do
    TITLE=$(echo "$event" | jq -r '.title')
    DESCRIPTION=$(echo "$event" | jq -r '.description')
    START_DATE=$(echo "$event" | jq -r '.startDate')
    END_DATE=$(echo "$event" | jq -r '.endDate')
    CATEGORY=$(echo "$event" | jq -r '.category')
    LOCATION_NAME=$(echo "$event" | jq -r '.locationName')
    LOCATION_ADDRESS=$(echo "$event" | jq -r '.locationAddress')
    RECURRING=$(echo "$event" | jq -r '.recurring')
    LAT=$(echo "$event" | jq -r '.coordinates.latitude // null')
    LNG=$(echo "$event" | jq -r '.coordinates.longitude // null')
    
    echo "Migrating event: $TITLE"
    
    if [ "$LAT" != "null" ] && [ "$LNG" != "null" ]; then
        COORDINATES_JSON="{\"latitude\":$LAT,\"longitude\":$LNG,\"accuracy\":null}"
    else
        COORDINATES_JSON="null"
    fi
    
    curl -s -X POST "https://societas-backend.onrender.com/api/events" \
        -H "Content-Type: application/json" \
        -d "{\"data\":{\"title\":\"$TITLE\",\"description\":\"$DESCRIPTION\",\"startDate\":\"$START_DATE\",\"endDate\":\"$END_DATE\",\"category\":\"$CATEGORY\",\"locationName\":\"$LOCATION_NAME\",\"locationAddress\":\"$LOCATION_ADDRESS\",\"recurring\":$RECURRING,\"coordinates\":$COORDINATES_JSON}}" > /dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully migrated: $TITLE"
    else
        echo "❌ Failed to migrate: $TITLE"
    fi
done

echo "🎉 Data migration completed!"

# Verify migration
echo "🔍 Verifying migration..."
PROD_GALLERY=$(curl -s "https://societas-backend.onrender.com/api/gallery-photos")
PROD_EVENTS=$(curl -s "https://societas-backend.onrender.com/api/events")

GALLERY_COUNT=$(echo "$PROD_GALLERY" | jq '.meta.pagination.total')
EVENTS_COUNT=$(echo "$PROD_EVENTS" | jq '.meta.pagination.total')

echo "📊 Production now has $GALLERY_COUNT gallery photos and $EVENTS_COUNT events"