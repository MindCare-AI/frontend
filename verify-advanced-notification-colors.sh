#!/bin/bash

echo "🎨 Verifying Advanced Notification Settings Color Fixes..."

# Check that List.Accordion components have proper styling
echo "✅ Checking List.Accordion styling..."
if grep -q "titleStyle={styles.listItemTitle}" screens/Settings/NotificationSettingsScreen.tsx; then
    echo "✅ List.Accordion titles use proper colors"
else
    echo "❌ List.Accordion title styling issue"
fi

if grep -q "style={styles.listAccordion}" screens/Settings/NotificationSettingsScreen.tsx; then
    echo "✅ List.Accordion has proper background styling"
else
    echo "❌ List.Accordion background styling issue"
fi

# Check that List.Item components have proper styling
echo "✅ Checking List.Item styling..."
if grep -q "titleStyle={styles.listItemTitle}" screens/Settings/NotificationSettingsScreen.tsx; then
    echo "✅ List.Item titles use proper colors"
else
    echo "❌ List.Item title styling issue"
fi

if grep -q "style={styles.listItem}" screens/Settings/NotificationSettingsScreen.tsx; then
    echo "✅ List.Item has proper background styling"
else
    echo "❌ List.Item background styling issue"
fi

# Check that List.Subheader has proper styling
echo "✅ Checking List.Subheader styling..."
if grep -q "style={styles.listSubheader}" screens/Settings/NotificationSettingsScreen.tsx; then
    echo "✅ List.Subheader uses proper colors"
else
    echo "❌ List.Subheader styling issue"
fi

# Check that Checkboxes have proper colors
echo "✅ Checking Checkbox colors..."
if grep -q "color={globalStyles.colors.primary}" screens/Settings/NotificationSettingsScreen.tsx; then
    echo "✅ Checkboxes use theme colors"
else
    echo "❌ Checkbox color issue"
fi

# Check that Switch in Quiet Hours has proper colors
echo "✅ Checking Switch colors..."
if grep -q "thumbColor.*globalStyles.colors.primary" screens/Settings/NotificationSettingsScreen.tsx; then
    echo "✅ Switch uses theme colors"
else
    echo "❌ Switch color issue"
fi

# Check for remaining black/dark colors
echo "✅ Checking for remaining dark colors..."
dark_colors=$(grep -E "(backgroundColor.*['\"]#000|backgroundColor.*['\"]black|color.*['\"]#000)" screens/Settings/NotificationSettingsScreen.tsx || true)
if [ -z "$dark_colors" ]; then
    echo "✅ No black/dark colors found"
else
    echo "❌ Some dark colors still found:"
    echo "$dark_colors"
fi

# Check that styles include the new List component styles
echo "✅ Checking style definitions..."
if grep -q "listAccordion:" screens/Settings/NotificationSettingsScreen.tsx; then
    echo "✅ listAccordion style defined"
else
    echo "❌ listAccordion style missing"
fi

if grep -q "listItemTitle:" screens/Settings/NotificationSettingsScreen.tsx; then
    echo "✅ listItemTitle style defined"
else
    echo "❌ listItemTitle style missing"
fi

if grep -q "listSubheader:" screens/Settings/NotificationSettingsScreen.tsx; then
    echo "✅ listSubheader style defined"
else
    echo "❌ listSubheader style missing"
fi

echo "🎉 Advanced notification settings verification complete!"
