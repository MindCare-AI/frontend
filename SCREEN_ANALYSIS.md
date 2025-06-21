# MindCare AI App - Complete Screen Analysis

## 🗂️ Screen Inventory and Functionality

### 📱 **Authentication Screens** (Keep Real Data)
- **LoginScreen** - User login with email/password and social auth
- **SignupScreen** - User registration form
- **ForgetPasswordScreen** - Password reset functionality  
- **SetNewPasswordScreen** - Set new password after reset
- **GoogleCallbackScreen** - Handle OAuth callback

### 🚀 **Onboarding Screens** (Replace with Mock Data)
- **SplashScreen** - App loading screen with logo
- **WelcomeSlideScreen** - Welcome slides with app introduction
- **OnboardingScreen** - Main onboarding flow controller
- **EnhancedOnboardingScreen** - Enhanced onboarding experience

### 🏠 **Main App Screens** (Replace with Mock Data)

#### **Dashboard & Home**
- **HomeScreen** - Main dashboard (legacy)
- **InitialLoadingScreen** - App initialization loader

#### **Feeds & Social**
- **FeedScreen** - Social feeds with posts, reactions, comments
- **CreatePostScreen** - Create new posts with media upload

#### **Messaging & Communication**
- **ConversationsScreen** - List of conversations (direct & group)
- **ChatScreen** - Generic chat interface
- **DirectChatScreen** - Direct messaging between users
- **GroupChatScreen** - Group messaging interface
- **DirectMessagesScreen** - Direct messages list
- **GroupMessagesScreen** - Group messages list
- **NewConversationScreen** - Create new conversation
- **MessagingSettingsScreen** - Messaging preferences

#### **Chatbot & AI**
- **ChatbotScreen** - AI chatbot conversation
- **ChatbotConversationListScreen** - List of chatbot conversations
- **ConversationSettingsScreen** - Chatbot conversation settings

#### **Mood Tracking**
- **MoodScreen** - Main mood tracking interface (2 versions)

#### **Journal**
- **JournalDashboard** - Journaling main screen

#### **Appointments** 
**Patient Side:**
- **DashboardScreen** (Patient) - Patient appointment dashboard
- **ProfileScreen** (Patient) - Patient profile view
- **SettingsScreen** (Patient) - Patient settings

**Therapist Side:**
- **DashboardScreenT** - Therapist appointment dashboard  
- **AppointmentsScreen** - Therapist appointments management
- **ProfileScreen** (Therapist) - Therapist profile
- **SettingsScreen** (Therapist) - Therapist settings
- **TherapistAvailabilityScreen** - Manage availability

#### **Settings & Profile**
- **HomeSettingsScreen** - Main settings hub
- **SettingsScreen** - General app settings
- **PatientProfileScreen** - Patient profile management
- **TherapistProfileScreen** - Therapist profile management
- **PatientMedicalInfoScreen** - Medical information management
- **NotificationSettingsScreen** - Notification preferences

#### **Notifications**
- **NotificationsScreen** - All notifications list
- **NotificationDetailScreen** - Individual notification details
- **NotificationPreferencesScreen** - Notification settings

## 🎯 **Screens Needing Mock Data Replacement**

### 1. **Profile & User Data Screens**
- PatientProfileScreen ✅
- TherapistProfileScreen ✅  
- HomeSettingsScreen ✅
- Patient/Therapist DashboardScreens ✅

### 2. **Social & Communication Screens**
- FeedScreen ✅
- CreatePostScreen ✅
- ConversationsScreen ✅
- DirectMessagesScreen ✅
- GroupMessagesScreen ✅
- ChatScreen ✅

### 3. **Mood & Journal Screens**
- MoodScreen ✅
- JournalDashboard ✅

### 4. **Notifications**
- NotificationsScreen ✅
- NotificationPreferencesScreen ✅

### 5. **Onboarding Components**
- All onboarding forms (patient/therapist info) ✅

## 🔧 **Components with User Data**

### **User Profile Components**
- UserAvatarCard
- PatientInfoForm
- TherapistInfoForm
- ProfileForm

### **Chat Components**
- UserSelectionModal
- ConversationItem
- MessageBubble
- ChatHeader

### **Feed Components**
- Post components
- Comment components
- User Avatar components

### **Settings Components**
- Various settings forms with user data

## 📋 **Implementation Plan**

### Phase 1: Core Mock Data Setup ✅
- [x] Create comprehensive Tunisian mock data file
- [x] Generate realistic user profiles, conversations, posts

### Phase 2: Profile & Settings Screens
- [ ] Replace all user profile screens with mock data
- [ ] Update settings screens with mock user info
- [ ] Replace avatar/image displays with placeholder images

### Phase 3: Social Features
- [ ] Replace feed posts with mock content
- [ ] Update conversation lists with mock users
- [ ] Replace message content with mock messages

### Phase 4: Mood & Journal
- [ ] Replace mood logs with mock data
- [ ] Update journal entries with mock content

### Phase 5: Notifications
- [ ] Replace notification content with mock data

### Phase 6: Onboarding Forms
- [ ] Pre-populate forms with mock data examples
- [ ] Replace sample data with Tunisian names/info

## 🎨 **Mock Data Features**

### **Tunisian Cultural Context**
- ✅ Authentic Tunisian names (male/female)
- ✅ Real Tunisian cities and addresses
- ✅ Local phone number formats (+216)
- ✅ Tunisian email domains (.tn)
- ✅ Cultural references in content

### **Realistic Healthcare Data**
- ✅ Medical specializations
- ✅ Treatment approaches
- ✅ Tunisian healthcare institutions
- ✅ Insurance providers (CNAM, CNSS)

### **Placeholder Images**
- ✅ Professional headshots from Unsplash
- ✅ Diverse representation
- ✅ High-quality, appropriate images

## 🚫 **Screens to Keep Real Data**
- All Authentication screens (login, signup, etc.)
- OAuth callback screens
- Any screens with live API integration for demo

## ✅ **Next Steps**
1. Start with most visible screens (profiles, feeds)
2. Work through each screen systematically
3. Test all functionality still works
4. Verify no real data is visible anywhere
5. Ensure auth still works for demo

---

**Summary**: 48+ screens total, ~35 screens need mock data replacement. Focus on user-facing screens with profiles, conversations, posts, and personal information first.
