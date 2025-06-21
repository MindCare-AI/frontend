#!/bin/bash

echo "🔍 Verifying Timezone Settings color fixes..."

# Check the main container has white background
echo "✅ Checking container background..."
if grep -q "backgroundColor: globalStyles.colors.white" components/SettingsScreen/TimeZoneSettings.tsx; then
    echo "✅ Container has proper white background"
else
    echo "❌ Container background issue"
fi

# Check Card.Title has proper background
echo "✅ Checking Card.Title background..."
if grep -q "cardTitleContainer:" components/SettingsScreen/TimeZoneSettings.tsx; then
    echo "✅ Card.Title has proper background style"
else
    echo "❌ Card.Title background issue"
fi

# Check Card.Content has proper background
echo "✅ Checking Card.Content background..."
if grep -q "cardContent:" components/SettingsScreen/TimeZoneSettings.tsx; then
    echo "✅ Card.Content has proper background style"
else
    echo "❌ Card.Content background issue"
fi

# Check no hardcoded black or dark colors
echo "✅ Checking for hardcoded dark colors..."
if grep -E "(backgroundColor.*['\"]#000|backgroundColor.*['\"]black|backgroundColor.*['\"]#333)" components/SettingsScreen/TimeZoneSettings.tsx; then
    echo "❌ Found hardcoded dark colors"
else
    echo "✅ No hardcoded dark colors found"
fi

# Check all colors use globalStyles
echo "✅ Checking all colors use globalStyles..."
color_issues=$(grep -E "color.*['\"]#[0-9a-fA-F]{3,6}['\"]" components/SettingsScreen/TimeZoneSettings.tsx | grep -v globalStyles || true)
if [ -z "$color_issues" ]; then
    echo "✅ All colors properly use globalStyles"
else
    echo "❌ Some hardcoded colors found:"
    echo "$color_issues"
fi

echo "🎉 Timezone Settings color verification complete!"
