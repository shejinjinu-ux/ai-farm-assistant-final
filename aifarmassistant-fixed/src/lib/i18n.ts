/** Simple translation layer. Add a new language by adding a code + dictionary. */
export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

type Dict = Record<string, string>;

const en: Dict = {
  brand: "AI Farm Assistant",
  tagline: "Smarter Farming. Better Decisions. Higher Yield.",
  getStarted: "Get Started",
  exploreFeatures: "Explore Features",
  login: "Login",
  loginOtp: "Login with OTP",
  demoLogin: "Demo Login",
  welcomeBack: "Welcome back, Farmer 🌱",
  mobile: "Mobile Number",
  password: "Password / OTP",
  rememberMe: "Remember me",
  dashboard: "Home",
  askAi: "Ask AI",
  listening: "Listening...",
  understanding: "Understanding your question...",
  farmHealth: "Farm Health",
  predictedYield: "Predicted Yield",
  soilMoisture: "Soil Moisture",
  weather: "Weather",
  actionPlan: "Today's AI Action Plan",
  demoMode: "DEMO MODE",
};

const hi: Dict = {
  brand: "एआई फार्म असिस्टेंट",
  tagline: "स्मार्ट खेती। बेहतर निर्णय। अधिक उपज।",
  getStarted: "शुरू करें",
  exploreFeatures: "विशेषताएँ देखें",
  login: "लॉगिन",
  loginOtp: "ओटीपी से लॉगिन",
  demoLogin: "डेमो लॉगिन",
  welcomeBack: "वापसी पर स्वागत है, किसान 🌱",
  mobile: "मोबाइल नंबर",
  password: "पासवर्ड / ओटीपी",
  rememberMe: "मुझे याद रखें",
  dashboard: "होम",
  askAi: "एआई से पूछें",
  listening: "सुन रहा हूँ...",
  understanding: "आपका प्रश्न समझ रहा हूँ...",
  farmHealth: "खेत का स्वास्थ्य",
  predictedYield: "अनुमानित उपज",
  soilMoisture: "मिट्टी की नमी",
  weather: "मौसम",
  actionPlan: "आज की एआई कार्य योजना",
  demoMode: "डेमो मोड",
};

const or: Dict = {
  brand: "ଏଆଇ ଫାର୍ମ ଆସିଷ୍ଟାଣ୍ଟ",
  tagline: "ସ୍ମାର୍ଟ ଚାଷ। ଉତ୍ତମ ନିଷ୍ପତ୍ତି। ଅଧିକ ଅମଳ।",
  getStarted: "ଆରମ୍ଭ କରନ୍ତୁ",
  exploreFeatures: "ବିଶେଷତା ଦେଖନ୍ତୁ",
  login: "ଲଗଇନ୍",
  loginOtp: "ଓଟିପି ସହ ଲଗଇନ୍",
  demoLogin: "ଡେମୋ ଲଗଇନ୍",
  welcomeBack: "ସ୍ୱାଗତ, ଚାଷୀ ଭାଇ 🌱",
  mobile: "ମୋବାଇଲ୍ ନମ୍ବର",
  password: "ପାସୱାର୍ଡ / ଓଟିପି",
  rememberMe: "ମୋତେ ମନେ ରଖନ୍ତୁ",
  dashboard: "ମୂଳପୃଷ୍ଠା",
  askAi: "ଏଆଇକୁ ପଚାରନ୍ତୁ",
  listening: "ଶୁଣୁଛି...",
  understanding: "ଆପଣଙ୍କ ପ୍ରଶ୍ନ ବୁଝୁଛି...",
  farmHealth: "ଚାଷ ସ୍ୱାସ୍ଥ୍ୟ",
  predictedYield: "ଅନୁମାନିତ ଅମଳ",
  soilMoisture: "ମାଟି ଆର୍ଦ୍ରତା",
  weather: "ପାଣିପାଗ",
  actionPlan: "ଆଜିର ଏଆଇ କାର୍ଯ୍ୟ ଯୋଜନା",
  demoMode: "ଡେମୋ ମୋଡ୍",
};

const ta: Dict = {
  brand: "ஏஐ பண்ணை உதவியாளர்",
  tagline: "சிறந்த விவசாயம். சிறந்த முடிவுகள். அதிக விளைச்சல்.",
  getStarted: "தொடங்குக",
  exploreFeatures: "அம்சங்களைப் பாருங்கள்",
  login: "உள்நுழை",
  loginOtp: "OTP மூலம் உள்நுழை",
  demoLogin: "டெமோ உள்நுழைவு",
  welcomeBack: "மீண்டும் வருக, விவசாயி 🌱",
  mobile: "கைபேசி எண்",
  password: "கடவுச்சொல் / OTP",
  rememberMe: "என்னை நினைவில் வையுங்கள்",
  dashboard: "முகப்பு",
  askAi: "ஏஐ-யிடம் கேளுங்கள்",
  listening: "கேட்கிறேன்...",
  understanding: "உங்கள் கேள்வியைப் புரிந்துகொள்கிறேன்...",
  farmHealth: "பண்ணை ஆரோக்கியம்",
  predictedYield: "எதிர்பார்க்கும் விளைச்சல்",
  soilMoisture: "மண் ஈரப்பதம்",
  weather: "வானிலை",
  actionPlan: "இன்றைய ஏஐ செயல் திட்டம்",
  demoMode: "டெமோ முறை",
};

export const dictionaries: Record<LanguageCode, Dict> = { en, hi, or, ta };

export function translate(lang: LanguageCode, key: string): string {
  return dictionaries[lang]?.[key] ?? dictionaries.en[key] ?? key;
}
