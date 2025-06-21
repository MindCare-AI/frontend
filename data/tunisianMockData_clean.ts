// Tunisian Mock Data for Demo
// This file contains all mock data with Tunisian names, addresses, and cultural context
// Special focus on Aziz Bahloul (patient) and Slimen Abyadh (therapist)

export interface MockUser {
  id: string | number;
  first_name: string;
  last_name: string;
  full_name: string;
  username: string;
  email: string;
  phone_number: string;
  user_type: 'patient' | 'therapist';
  profile_pic?: string;
  avatar?: string;
  author_user_type?: 'patient' | 'therapist';
}

export interface MockPatientProfile extends MockUser {
  user_type: 'patient';
  date_of_birth: string;
  gender: 'M' | 'F' | 'O' | 'N';
  blood_type: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  emergency_contact: {
    name: string;
    phone: string;
    email: string;
    relation: string;
  };
  medical_history: Array<{
    condition: string;
    diagnosis_date: string;
    description: string;
  }>;
  health_metrics: Array<{
    date: string;
    weight: number;
    blood_pressure: string;
    heart_rate: number;
  }>;
}

export interface MockTherapistProfile extends MockUser {
  user_type: 'therapist';
  bio: string;
  specializations: string[];
  years_of_experience: number;
  treatment_approaches: string[];
  languages: string[];
  hourly_rate: string;
  accepts_insurance: boolean;
  insurance_providers: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  rating: number;
  total_ratings: number;
  total_sessions: number;
  verification_status: string;
  availability?: {
    [key: string]: string[];
  };
}

export interface MockConversation {
  id: string | number;
  name?: string;
  participants: MockUser[];
  other_user?: MockUser;
  other_user_name?: string;
  last_message?: {
    content: string;
    timestamp: string;
    sender: MockUser;
  };
  is_group: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockMessage {
  id: string | number;
  content: string;
  timestamp: string;
  sender: MockUser;
  conversation_id: string | number;
  message_type: 'text' | 'image' | 'audio' | 'video';
  media_url?: string;
}

export interface MockPost {
  id: string | number;
  title: string;
  content: string;
  author: MockUser;
  author_name?: string;
  author_user_type?: 'patient' | 'therapist';
  created_at: string;
  updated_at: string;
  media_files: Array<{
    id: string;
    url: string;
    type: 'image' | 'video';
    thumbnail_url?: string;
  }>;
  reactions: Array<{
    user: MockUser;
    type: 'like' | 'love' | 'support' | 'insightful';
  }>;
  comments: Array<{
    id: string;
    content: string;
    author: MockUser;
    created_at: string;
    replies?: Array<{
      id: string;
      content: string;
      author: MockUser;
      created_at: string;
    }>;
  }>;
  tags: string[];
  topics: string[];
  reactions_count?: number;
  comments_count?: number;
  likes_count?: number;
}

export interface MockMoodLog {
  id: string | number;
  user: MockUser;
  rating: number; // 1-10
  emotions: string[];
  activities: string[];
  notes: string;
  date: string;
  energy_level: number;
  sleep_hours: number;
  stress_level: number;
}

export interface MockAppointment {
  id: string | number;
  patient: MockUser;
  therapist: MockUser;
  date: string;
  time: string;
  duration: number; // minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  appointment_type: 'in-person' | 'video' | 'phone';
  video_session_link?: string;
  created_at: string;
  updated_at: string;
}

export interface MockNotification {
  id: string | number;
  title: string;
  message: string;
  type: 'appointment' | 'message' | 'system' | 'reminder';
  is_read: boolean;
  created_at: string;
  user: MockUser;
  priority: 'low' | 'medium' | 'high';
}

// Tunisian Names and Data
export const TUNISIAN_FIRST_NAMES = {
  male: [
    'Ahmed', 'Mohamed', 'Ali', 'Omar', 'Youssef', 'Karim', 'Samir', 'Nabil', 
    'Hassen', 'Slim', 'Mehdi', 'Rami', 'Fares', 'Zied', 'Amine', 'Maher',
    'Sami', 'Walid', 'Tarek', 'Bassem', 'Khalil', 'Marwan', 'Rafik', 'Hatem',
    'Slimen', 'Aymen', 'Hamza', 'Anis', 'Oussama', 'Bilel', 'Kamel', 'Adel'
  ],
  female: [
    'Fatma', 'Amal', 'Sarra', 'Rim', 'Imen', 'Nesrine', 'Amira', 'Leila',
    'Maryam', 'Nour', 'Yasmine', 'Dorra', 'Ines', 'Sonia', 'Houda', 'Khadija',
    'Salma', 'Meriem', 'Rahma', 'Aya', 'Siwar', 'Nadia', 'Emna', 'Wafa',
    'Asma', 'Hiba', 'Khouloud', 'Sarah', 'Lilia', 'Rania', 'Malek', 'Nawel'
  ]
};

export const TUNISIAN_LAST_NAMES = [
  'Bahloul', 'Abyadh', 'Ben Ali', 'Trabelsi', 'Bouazizi', 'Hamrouni', 'Mzoughi', 'Khelifi', 'Sassi',
  'Jemli', 'Ouali', 'Gharbi', 'Arfaoui', 'Boughedir', 'Chaabane', 'Dhahri',
  'Essid', 'Ferchichi', 'Ghorbel', 'Hajji', 'Iddoudi', 'Jlassi', 'Karoui',
  'Laabidi', 'Mahfoudh', 'Nasri', 'Othman', 'Preneur', 'Rahali', 'Saidani',
  'Tounsi', 'Zouari', 'Belgacem', 'Chedly', 'Daly', 'Elloumi', 'Fakhfakh',
  'Hamdi', 'Ayari', 'Ahmed', 'Mejri', 'Hammami', 'Abidi', 'Dridi'
];

export const TUNISIAN_CITIES = [
  'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana', 'Gafsa', 'Monastir', 'Ben Arous'
];

export const TUNISIAN_STREETS = [
  'Avenue Habib Bourguiba', 'Rue de la Liberté', 'Avenue Mohamed V', 'Rue Ibn Khaldoun', 'Avenue de Carthage', 'Rue des Martyrs'
];

export const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b612d1c1?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face'
];

export const MENTAL_HEALTH_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1588195719862-bd49eed3db1d?w=400&h=300&fit=crop'
];

export const VIDEO_THUMBNAILS = [
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
];

export const SAMPLE_VIDEOS = [
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4'
];

const getRandomTunisianName = (gender: 'male' | 'female') => {
  const firstNames = TUNISIAN_FIRST_NAMES[gender];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = TUNISIAN_LAST_NAMES[Math.floor(Math.random() * TUNISIAN_LAST_NAMES.length)];
  return { firstName, lastName, fullName: `${firstName} ${lastName}` };
};

const getRandomTunisianAddress = () => {
  const street = TUNISIAN_STREETS[Math.floor(Math.random() * TUNISIAN_STREETS.length)];
  const city = TUNISIAN_CITIES[Math.floor(Math.random() * TUNISIAN_CITIES.length)];
  return {
    street: `${Math.floor(Math.random() * 200) + 1} ${street}`,
    city,
    state: city,
    postalCode: `${Math.floor(Math.random() * 9000) + 1000}`,
    country: 'Tunisia'
  };
};

const getRandomMentalHealthImage = () => {
  return MENTAL_HEALTH_IMAGES[Math.floor(Math.random() * MENTAL_HEALTH_IMAGES.length)];
};

const getRandomVideoThumbnail = () => {
  return VIDEO_THUMBNAILS[Math.floor(Math.random() * VIDEO_THUMBNAILS.length)];
};

const getRandomVideo = () => {
  return SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)];
};

const getRandomPlaceholderImage = () => {
  return PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)];
};

// Main character: Aziz Bahloul (Patient)
export const AZIZ_BAHLOUL: MockPatientProfile = {
  id: 'patient_aziz_1',
  first_name: 'Aziz',
  last_name: 'Bahloul',
  full_name: 'Aziz Bahloul',
  username: 'azizbahloul',
  email: 'aziz.bahloul@example.tn',
  phone_number: '+216 20 123 456',
  user_type: 'patient' as const,
  author_user_type: 'patient' as const,
  profile_pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  date_of_birth: '1995-03-15',
  gender: 'M',
  blood_type: 'O+',
  address: {
    street: '15 Avenue Habib Bourguiba',
    city: 'Tunis',
    state: 'Tunis',
    postalCode: '1000',
    country: 'Tunisia'
  },
  emergency_contact: {
    name: 'Sarra Bahloul',
    phone: '+216 20 987 654',
    email: 'sarra.bahloul@example.tn',
    relation: 'Sister'
  },
  medical_history: [
    {
      condition: 'Anxiety Disorder',
      diagnosis_date: '2023-01-15',
      description: 'Generalized anxiety disorder with panic attacks'
    }
  ],
  health_metrics: [
    {
      date: '2024-06-15',
      weight: 75,
      blood_pressure: '120/80',
      heart_rate: 72
    }
  ]
};

// Main therapist: Dr. Slimen Abyadh
export const SLIMEN_ABYADH: MockTherapistProfile = {
  id: 'therapist_slimen_1',
  first_name: 'Slimen',
  last_name: 'Abyadh',
  full_name: 'Dr. Slimen Abyadh',
  username: 'drslimenabyadh',
  email: 'slimen.abyadh@mindcare.tn',
  phone_number: '+216 71 234 567',
  user_type: 'therapist' as const,
  author_user_type: 'therapist' as const,
  profile_pic: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
  avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
  bio: 'Experienced clinical psychologist specializing in anxiety and depression treatment with over 10 years of practice in Tunisia.',
  specializations: ['Anxiety Disorders', 'Depression', 'Cognitive Behavioral Therapy', 'Mindfulness'],
  years_of_experience: 12,
  treatment_approaches: ['CBT', 'Mindfulness-Based Therapy', 'Psychodynamic Therapy'],
  languages: ['Arabic', 'French', 'English'],
  hourly_rate: '120',
  accepts_insurance: true,
  insurance_providers: ['CNAM', 'CNSS', 'Assurances Salim'],
  education: [{
    degree: 'PhD in Clinical Psychology',
    institution: 'University of Tunis',
    year: 2012
  }],
  rating: 4.8,
  total_ratings: 234,
  total_sessions: 2156,
  verification_status: 'verified'
};

const generateTunisianEmail = (firstName: string, lastName: string) => {
  const domains = ['gmail.com', 'yahoo.fr', 'hotmail.com', 'outlook.tn', 'example.tn'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '')}@${domain}`;
};

const generateTunisianPhone = () => {
  const prefixes = ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `+216 ${prefix} ${number.slice(0, 3)} ${number.slice(3)}`;
};

const generateMockPatients = (count: number = 10): MockPatientProfile[] => {
  const patients: MockPatientProfile[] = [AZIZ_BAHLOUL];
  
  for (let i = 1; i < count; i++) {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const { firstName, lastName, fullName } = getRandomTunisianName(gender);
    const address = getRandomTunisianAddress();
    const profile_pic = getRandomPlaceholderImage();
    
    patients.push({
      id: `patient_${firstName.toLowerCase()}_${i}`,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      username: `${firstName.toLowerCase()}${lastName.toLowerCase().replace(/\s+/g, '')}`,
      email: generateTunisianEmail(firstName, lastName),
      phone_number: generateTunisianPhone(),
      user_type: 'patient' as const,
      author_user_type: 'patient' as const,
      profile_pic,
      avatar: profile_pic,
      date_of_birth: `${1985 + Math.floor(Math.random() * 20)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      gender: gender === 'male' ? 'M' : 'F',
      blood_type: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][Math.floor(Math.random() * 8)],
      address,
      emergency_contact: {
        name: getRandomTunisianName(Math.random() > 0.5 ? 'male' : 'female').fullName,
        phone: generateTunisianPhone(),
        email: generateTunisianEmail('emergency', 'contact'),
        relation: ['Parent', 'Sibling', 'Spouse', 'Friend'][Math.floor(Math.random() * 4)]
      },
      medical_history: [],
      health_metrics: []
    });
  }
  
  return patients;
};

const generateMockTherapists = (count: number = 5): MockTherapistProfile[] => {
  const therapists: MockTherapistProfile[] = [SLIMEN_ABYADH];
  
  for (let i = 1; i < count; i++) {
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    const { firstName, lastName, fullName } = getRandomTunisianName(gender);
    const profile_pic = getRandomPlaceholderImage();
    
    therapists.push({
      id: `therapist_${firstName.toLowerCase()}_${i}`,
      first_name: firstName,
      last_name: lastName,
      full_name: `Dr. ${fullName}`,
      username: `dr${firstName.toLowerCase()}${lastName.toLowerCase().replace(/\s+/g, '')}`,
      email: generateTunisianEmail(firstName, lastName.replace(/\s+/g, '')),
      phone_number: generateTunisianPhone(),
      user_type: 'therapist' as const,
      author_user_type: 'therapist' as const,
      profile_pic,
      avatar: profile_pic,
      bio: `Experienced ${['clinical psychologist', 'psychiatrist', 'counselor', 'therapist'][Math.floor(Math.random() * 4)]} with expertise in mental health.`,
      specializations: [
        ['Anxiety Disorders', 'Depression'],
        ['PTSD', 'Trauma Therapy'],
        ['Cognitive Behavioral Therapy', 'Mindfulness'],
        ['Family Therapy', 'Couples Counseling']
      ][Math.floor(Math.random() * 4)],
      years_of_experience: 5 + Math.floor(Math.random() * 15),
      treatment_approaches: ['CBT', 'Psychodynamic Therapy', 'Mindfulness-Based Therapy'].slice(0, Math.floor(Math.random() * 3) + 1),
      languages: ['Arabic', 'French', 'English'].slice(0, Math.floor(Math.random() * 3) + 1),
      hourly_rate: `${80 + Math.floor(Math.random() * 100)}`,
      accepts_insurance: Math.random() > 0.3,
      insurance_providers: ['CNAM', 'CNSS', 'Assurances Salim'],
      education: [{
        degree: ['PhD in Clinical Psychology', 'MD in Psychiatry', 'Master in Counseling Psychology'][Math.floor(Math.random() * 3)],
        institution: ['University of Tunis', 'University of Sfax', 'University of Sousse'][Math.floor(Math.random() * 3)],
        year: 2005 + Math.floor(Math.random() * 15)
      }],
      rating: 3.5 + Math.random() * 1.5,
      total_ratings: 50 + Math.floor(Math.random() * 200),
      total_sessions: 100 + Math.floor(Math.random() * 2000),
      verification_status: 'verified'
    });
  }
  
  return therapists;
};

// Generate mock data
export const MOCK_PATIENTS = generateMockPatients(15);
export const MOCK_THERAPISTS = generateMockTherapists(8);
export const MOCK_USERS = [...MOCK_PATIENTS, ...MOCK_THERAPISTS];

// Generate mock appointments with comprehensive data for all UI states
const generateMockAppointments = (count: number = 25): MockAppointment[] => {
  const appointments: MockAppointment[] = [];
  const statuses: Array<'pending' | 'confirmed' | 'completed' | 'cancelled'> = ['pending', 'confirmed', 'completed', 'cancelled'];
  const types: Array<'in-person' | 'video' | 'phone'> = ['in-person', 'video', 'phone'];
  
  // Generate appointments for the last 6 months and next 3 months
  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(startDate.getMonth() - 6);
  
  for (let i = 0; i < count; i++) {
    // Random date within the range
    const appointmentDate = new Date(startDate);
    appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 270)); // 9 months range
    
    const randomPatient = MOCK_PATIENTS[Math.floor(Math.random() * MOCK_PATIENTS.length)];
    const randomTherapist = MOCK_THERAPISTS[Math.floor(Math.random() * MOCK_THERAPISTS.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    // Generate time slots (9 AM to 5 PM)
    const hours = 9 + Math.floor(Math.random() * 8);
    const minutes = Math.random() > 0.5 ? '00' : '30';
    const time = `${hours.toString().padStart(2, '0')}:${minutes}`;
    
    appointments.push({
      id: `appointment_${i + 1}`,
      patient: randomPatient,
      therapist: randomTherapist,
      date: appointmentDate.toISOString().split('T')[0],
      time,
      duration: [30, 45, 60, 90][Math.floor(Math.random() * 4)],
      status: randomStatus,
      notes: randomStatus === 'completed' ? 
        'Session completed successfully. Good progress made.' : 
        randomStatus === 'cancelled' ? 
        'Cancelled due to scheduling conflict.' : 
        'Regular therapy session.',
      appointment_type: randomType,
      video_session_link: randomType === 'video' ? 'https://meet.mindcare.tn/session-' + (i + 1) : undefined,
      created_at: new Date(appointmentDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  // Sort by date
  return appointments.sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime());
};

// Generate mock posts with comments
const generateMockPosts = (count: number = 20): MockPost[] => {
  const posts: MockPost[] = [];
  const topics = ['anxiety', 'depression', 'mindfulness', 'therapy', 'mental-health', 'wellness', 'coping-strategies'];
  const sampleContents = [
    'Taking small steps towards better mental health every day. Today I practiced mindfulness for 10 minutes and it really helped calm my thoughts.',
    'Had my therapy session today and learned some new coping strategies. Feeling hopeful about the journey ahead.',
    'Reminder: It\'s okay to have bad days. What matters is that we keep trying and seeking support when we need it.',
    'Sharing my experience with anxiety management. Deep breathing exercises have been a game-changer for me.',
    'Mental health awareness is so important. Let\'s continue to break the stigma and support each other.',
    'Gratitude practice: Today I\'m grateful for my support system and the progress I\'ve made in therapy.',
    'Self-care isn\'t selfish. Remember to take care of yourself - you deserve it.',
    'Tips for managing stress: Regular exercise, adequate sleep, and staying connected with loved ones.',
    'Meditation has been helping me find inner peace. Even 5 minutes a day makes a difference.',
    'Recovery isn\'t linear, and that\'s okay. Every step forward, no matter how small, is progress.'
  ];
  
  for (let i = 0; i < count; i++) {
    const randomAuthor = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
    const randomContent = sampleContents[Math.floor(Math.random() * sampleContents.length)];
    const hasMedia = Math.random() > 0.7;
    const mediaFiles = hasMedia ? [{
      id: `media_${i}_1`,
      url: getRandomMentalHealthImage(),
      type: 'image' as const,
      thumbnail_url: getRandomMentalHealthImage()
    }] : [];
    
    const postDate = new Date();
    postDate.setDate(postDate.getDate() - Math.floor(Math.random() * 30));
    
    // Generate comments for this post
    const numComments = Math.floor(Math.random() * 8);
    const comments = [];
    
    for (let j = 0; j < numComments; j++) {
      const commentAuthor = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
      const commentDate = new Date(postDate.getTime() + Math.random() * 24 * 60 * 60 * 1000);
      
      comments.push({
        id: `comment_${i}_${j}`,
        content: [
          'Thank you for sharing this. It really resonates with me.',
          'This is so helpful! I\'ve been struggling with similar issues.',
          'Your journey is inspiring. Keep going!',
          'Great advice, I\'ll definitely try this.',
          'Sending you positive vibes and support.',
          'This post came at the perfect time for me.',
          'Your strength is admirable. Thank you for being vulnerable.',
          'I can relate to this so much. We\'re not alone in this.'
        ][Math.floor(Math.random() * 8)],
        author: commentAuthor,
        created_at: commentDate.toISOString()
      });
    }
    
    posts.push({
      id: `post_${i + 1}`,
      title: randomContent.split('.')[0] + '.',
      content: randomContent,
      author: randomAuthor,
      author_name: randomAuthor.full_name,
      author_user_type: randomAuthor.user_type,
      created_at: postDate.toISOString(),
      updated_at: postDate.toISOString(),
      media_files: mediaFiles,
      reactions: Array.from({ length: Math.floor(Math.random() * 15) }, (_, idx) => ({
        user: MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)],
        type: ['like', 'love', 'support', 'insightful'][Math.floor(Math.random() * 4)] as any
      })),
      comments,
      tags: topics.slice(0, Math.floor(Math.random() * 3) + 1),
      topics: topics.slice(0, Math.floor(Math.random() * 2) + 1),
      reactions_count: Math.floor(Math.random() * 15),
      comments_count: comments.length,
      likes_count: Math.floor(Math.random() * 10)
    });
  }
  
  return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

// Generate mock conversations
const generateMockConversations = (count: number = 15): MockConversation[] => {
  const conversations: MockConversation[] = [];
  
  for (let i = 0; i < count; i++) {
    const participants = [
      AZIZ_BAHLOUL,
      MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)]
    ];
    
    const lastMessageDate = new Date();
    lastMessageDate.setHours(lastMessageDate.getHours() - Math.floor(Math.random() * 72));
    
    conversations.push({
      id: `conversation_${i + 1}`,
      participants,
      other_user: participants[1],
      other_user_name: participants[1].full_name,
      last_message: {
        content: [
          'How are you feeling today?',
          'Thank you for the session yesterday.',
          'I\'ve been practicing the breathing exercises.',
          'Looking forward to our next appointment.',
          'The mindfulness techniques are really helping.',
          'Can we reschedule our next session?'
        ][Math.floor(Math.random() * 6)],
        timestamp: lastMessageDate.toISOString(),
        sender: participants[Math.floor(Math.random() * 2)]
      },
      is_group: false,
      created_at: new Date(lastMessageDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: lastMessageDate.toISOString()
    });
  }
  
  return conversations.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
};

// Generate comprehensive appointment data for all UI states
const generateMockAppointmentData = () => {
  return {
    // Upcoming appointments (next 30 days)
    upcoming: generateMockAppointments(8).filter(apt => {
      const aptDate = new Date(apt.date);
      const now = new Date();
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return aptDate >= now && aptDate <= in30Days && ['pending', 'confirmed'].includes(apt.status);
    }),
    
    // Past appointments (last 90 days)
    past: generateMockAppointments(15).filter(apt => {
      const aptDate = new Date(apt.date);
      const now = new Date();
      const ago90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return aptDate <= now && aptDate >= ago90Days && apt.status === 'completed';
    }),
    
    // Cancelled appointments
    cancelled: generateMockAppointments(5).filter(apt => apt.status === 'cancelled'),
    
    // Waiting list entries
    waitingList: Array.from({ length: 6 }, (_, i) => ({
      id: `waiting_${i + 1}`,
      patient: AZIZ_BAHLOUL,
      therapist: MOCK_THERAPISTS[Math.floor(Math.random() * MOCK_THERAPISTS.length)],
      preferredDates: [
        new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date(Date.now() + (i + 2) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      ],
      preferredTimes: ['09:00', '14:00', '16:00'],
      priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
      notes: 'Looking for earliest available slot',
      created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      status: 'waiting'
    })),
    
    // Feedback data for completed appointments
    feedback: Array.from({ length: 10 }, (_, i) => ({
      id: `feedback_${i + 1}`,
      appointmentId: `appointment_${i + 1}`,
      patientId: AZIZ_BAHLOUL.id,
      therapistId: MOCK_THERAPISTS[0].id,
      rating: 3 + Math.random() * 2, // 3-5 stars
      comment: [
        'Great session, very helpful techniques shared.',
        'Dr. was very understanding and professional.',
        'Felt comfortable and supported throughout.',
        'Good progress made, looking forward to next session.',
        'Excellent therapy session, highly recommend.',
        'Therapist was empathetic and provided valuable insights.'
      ][Math.floor(Math.random() * 6)],
      categories: {
        communication: 4 + Math.random(),
        professionalism: 4 + Math.random(),
        effectiveness: 4 + Math.random(),
        environment: 4 + Math.random()
      },
      wouldRecommend: Math.random() > 0.2,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    })),
    
    // Reschedule requests
    rescheduleRequests: Array.from({ length: 3 }, (_, i) => ({
      id: `reschedule_${i + 1}`,
      originalAppointment: `appointment_${i + 1}`,
      requestedBy: AZIZ_BAHLOUL.id,
      reason: [
        'Work conflict',
        'Family emergency',
        'Health issue',
        'Travel plans'
      ][Math.floor(Math.random() * 4)],
      preferredNewDates: [
        new Date(Date.now() + (i + 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date(Date.now() + (i + 6) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      ],
      status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    })),
    
    // Appointment statistics
    stats: {
      totalAppointments: 45,
      completedAppointments: 32,
      cancelledAppointments: 8,
      upcomingAppointments: 5,
      averageRating: 4.6,
      totalTherapists: 3,
      monthlyStats: Array.from({ length: 6 }, (_, i) => ({
        month: new Date(2024, 5 - i, 1).toLocaleString('en', { month: 'short' }),
        appointments: Math.floor(Math.random() * 10) + 2,
        completed: Math.floor(Math.random() * 8) + 2,
        cancelled: Math.floor(Math.random() * 3)
      })).reverse()
    },
    
    // Notification preferences
    notificationSettings: {
      appointmentReminders: true,
      reminderTime: 24, // hours before
      confirmationEmails: true,
      reschedulingAlerts: true,
      feedbackRequests: true,
      promotionalEmails: false
    }
  };
};

// Generate all mock data
export const MOCK_POSTS = generateMockPosts(25);
export const MOCK_CONVERSATIONS = generateMockConversations(20);
export const MOCK_APPOINTMENTS = generateMockAppointments(30);

// Comprehensive appointment mock data
export const MOCK_APPOINTMENT_DATA = generateMockAppointmentData();

// Export individual sections for easier access
export const MOCK_WAITING_LIST = MOCK_APPOINTMENT_DATA.waitingList;
export const MOCK_FEEDBACK_DATA = MOCK_APPOINTMENT_DATA.feedback;
export const MOCK_RESCHEDULE_DATA = MOCK_APPOINTMENT_DATA.rescheduleRequests;
export const MOCK_APPOINTMENT_STATS = MOCK_APPOINTMENT_DATA.stats;

// Generate mock notifications
export const MOCK_NOTIFICATIONS: MockNotification[] = Array.from({ length: 15 }, (_, i) => {
  const types: Array<'appointment' | 'message' | 'system' | 'reminder'> = ['appointment', 'message', 'system', 'reminder'];
  const randomType = types[Math.floor(Math.random() * types.length)];
  const notificationDate = new Date();
  notificationDate.setHours(notificationDate.getHours() - Math.floor(Math.random() * 168)); // Within last week
  
  return {
    id: `notification_${i + 1}`,
    title: {
      appointment: 'Appointment Reminder',
      message: 'New Message',
      system: 'System Update',
      reminder: 'Daily Check-in'
    }[randomType],
    message: {
      appointment: 'You have an appointment tomorrow at 2:00 PM with Dr. Slimen Abyadh',
      message: 'You received a new message from Dr. Slimen Abyadh',
      system: 'New features have been added to the app',
      reminder: 'Don\'t forget to log your mood today'
    }[randomType],
    type: randomType,
    is_read: Math.random() > 0.4,
    created_at: notificationDate.toISOString(),
    user: AZIZ_BAHLOUL,
    priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any
  };
});

// Export helper functions
export const getAvailableTherapists = () => MOCK_THERAPISTS.filter(t => t.verification_status === 'verified');

export const getTherapistById = (id: string) => MOCK_THERAPISTS.find(t => t.id === id);

export const getPatientById = (id: string) => MOCK_PATIENTS.find(p => p.id === id);

export const getAppointmentsByPatientId = (patientId: string) => 
  MOCK_APPOINTMENTS.filter(apt => apt.patient.id === patientId);

export const getUpcomingAppointments = (patientId: string) => {
  const now = new Date();
  return MOCK_APPOINTMENTS.filter(apt => 
    apt.patient.id === patientId && 
    new Date(apt.date) >= now && 
    ['pending', 'confirmed'].includes(apt.status)
  );
};

export const getPastAppointments = (patientId: string) => {
  const now = new Date();
  return MOCK_APPOINTMENTS.filter(apt => 
    apt.patient.id === patientId && 
    new Date(apt.date) < now && 
    apt.status === 'completed'
  );
};

// Default export with all data
export default {
  users: MOCK_USERS,
  patients: MOCK_PATIENTS,
  therapists: MOCK_THERAPISTS,
  posts: MOCK_POSTS,
  conversations: MOCK_CONVERSATIONS,
  appointments: MOCK_APPOINTMENTS,
  appointmentData: MOCK_APPOINTMENT_DATA,
  notifications: MOCK_NOTIFICATIONS,
  waitingList: MOCK_WAITING_LIST,
  feedback: MOCK_FEEDBACK_DATA,
  reschedule: MOCK_RESCHEDULE_DATA,
  stats: MOCK_APPOINTMENT_STATS
};
