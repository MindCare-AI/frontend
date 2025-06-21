#!/bin/bash

echo "🎨 Testing Notification Settings UI Improvements..."

# Check NotificationPreferencesScreen improvements
echo "✅ Checking NotificationPreferencesScreen..."
if grep -q "backgroundColor: globalStyles.colors.primary" screens/notificationsScreen/NotificationPreferencesScreen.tsx; then
    echo "✅ Header has proper theme colors"
else
    echo "❌ Header color issue"
fi

if grep -q "borderRadius: 12" screens/notificationsScreen/NotificationPreferencesScreen.tsx; then
    echo "✅ Modern border radius applied"
else
    echo "❌ Border radius issue"
fi

if grep -q "channelCard:" screens/notificationsScreen/NotificationPreferencesScreen.tsx; then
    echo "✅ Channel cards properly styled"
else
    echo "❌ Channel card styling issue"
fi

# Check NotificationPreferenceItem improvements
echo "✅ Checking NotificationPreferenceItem..."
if grep -q "borderLeftWidth: 4" components/notificationsScreen/NotificationPreferenceItem.tsx; then
    echo "✅ Left border accent added"
else
    echo "❌ Left border accent missing"
fi

if grep -q "paddingVertical: 20" components/notificationsScreen/NotificationPreferenceItem.tsx; then
    echo "✅ Better padding applied"
else
    echo "❌ Padding issue"
fi

# Check SettingToggle improvements
echo "✅ Checking SettingToggle..."
if grep -q "width: 52" components/SettingsScreen/SettingToggle.tsx; then
    echo "✅ Toggle size improved"
else
    echo "❌ Toggle size issue"
fi

if grep -q "backgroundColor: globalStyles.colors.white" components/SettingsScreen/SettingToggle.tsx; then
    echo "✅ Card background properly set"
else
    echo "❌ Card background issue"
fi

# Check SectionHeader improvements
echo "✅ Checking SectionHeader..."
if grep -q "fontSize: 20" components/SettingsScreen/SectionHeader.tsx; then
    echo "✅ Section title size improved"
else
    echo "❌ Section title size issue"
fi

# Check for consistent use of globalStyles
echo "✅ Checking consistent color usage..."
color_issues=$(grep -E "(color.*['\"]#[0-9a-fA-F]{3,6}['\"]|backgroundColor.*['\"]#[0-9a-fA-F]{3,6}['\"])" screens/notificationsScreen/*.tsx components/notificationsScreen/*.tsx components/SettingsScreen/SettingToggle.tsx 2>/dev/null | grep -v globalStyles || true)
if [ -z "$color_issues" ]; then
    echo "✅ All colors properly use globalStyles"
else
    echo "❌ Some hardcoded colors found:"
    echo "$color_issues"
fi

echo "🎉 Notification settings UI improvements verification complete!"
