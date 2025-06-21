#!/bin/bash

echo "🎨 Verifying notification settings color improvements..."

# Check NotificationPreferencesScreen improvements
echo "✅ Checking NotificationPreferencesScreen..."
if grep -q "backgroundColor: globalStyles.colors.background" screens/notificationsScreen/NotificationPreferencesScreen.tsx; then
    echo "✅ Background color properly set"
else
    echo "❌ Background color issue"
fi

if grep -q "thumbColor.*globalStyles.colors.primary" screens/notificationsScreen/NotificationPreferencesScreen.tsx; then
    echo "✅ Switch colors properly themed"
else
    echo "❌ Switch color issue"
fi

# Check NotificationPreferenceItem improvements
echo "✅ Checking NotificationPreferenceItem..."
if grep -q "backgroundColor: globalStyles.colors.white" components/notificationsScreen/NotificationPreferenceItem.tsx; then
    echo "✅ Card background properly set"
else
    echo "❌ Card background issue"
fi

if grep -q "shadowColor: globalStyles.colors.shadow" components/notificationsScreen/NotificationPreferenceItem.tsx; then
    echo "✅ Shadow colors properly themed"
else
    echo "❌ Shadow color issue"
fi

# Check NotificationCard improvements
echo "✅ Checking NotificationCard..."
if grep -q "backgroundColor: globalStyles.colors.white" components/notificationsScreen/NotificationCard.tsx; then
    echo "✅ Card colors properly themed"
else
    echo "❌ Card color issue"
fi

if grep -q "color: globalStyles.colors.text" components/notificationsScreen/NotificationCard.tsx; then
    echo "✅ Text colors properly themed"
else
    echo "❌ Text color issue"
fi

# Check NotificationSettingsScreen improvements
echo "✅ Checking NotificationSettingsScreen..."
if grep -q "backgroundColor: globalStyles.colors.white" screens/Settings/NotificationSettingsScreen.tsx; then
    echo "✅ Modal background properly themed"
else
    echo "❌ Modal background issue"
fi

# Check for hardcoded colors that should be avoided
echo "✅ Checking for hardcoded colors..."
hardcoded_colors=$(grep -E "(backgroundColor.*['\"]#[0-9a-fA-F]{3,6}['\"]|color.*['\"]#[0-9a-fA-F]{3,6}['\"])" screens/notificationsScreen/*.tsx components/notificationsScreen/*.tsx 2>/dev/null | grep -v globalStyles || true)
if [ -z "$hardcoded_colors" ]; then
    echo "✅ No hardcoded colors found in notification components"
else
    echo "❌ Some hardcoded colors found:"
    echo "$hardcoded_colors"
fi

echo "🎉 Notification settings color verification complete!"
