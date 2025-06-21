#!/bin/bash

echo "=== Verifying Advanced Notification Settings Colors ==="
echo ""

echo "1. Checking List.Accordion theming..."
grep -n "List.Accordion" /home/siaziz/Desktop/frontend/screens/Settings/NotificationSettingsScreen.tsx | head -3

echo ""
echo "2. Checking accordion title styles..."
grep -n "accordionTitle" /home/siaziz/Desktop/frontend/screens/Settings/NotificationSettingsScreen.tsx

echo ""
echo "3. Checking List.Item theme properties..."
grep -A 6 "theme={{" /home/siaziz/Desktop/frontend/screens/Settings/NotificationSettingsScreen.tsx | head -20

echo ""
echo "4. Checking for any remaining black/dark colors..."
echo "Searching for potential black colors..."
grep -i "black\|#000\|rgba(0,0,0" /home/siaziz/Desktop/frontend/screens/Settings/NotificationSettingsScreen.tsx || echo "No black colors found ✓"

echo ""
echo "5. Checking accordion title style definition..."
grep -A 5 "accordionTitle:" /home/siaziz/Desktop/frontend/screens/Settings/NotificationSettingsScreen.tsx

echo ""
echo "6. Checking listAccordion style for background..."
grep -A 10 "listAccordion:" /home/siaziz/Desktop/frontend/screens/Settings/NotificationSettingsScreen.tsx

echo ""
echo "✅ Advanced notification settings color verification complete!"
