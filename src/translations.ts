export interface TranslationStrings {
  appName: string;
  appSubtitle: string;
  runCell: string;
  runAll: string;
  stopKernel: string;
  restartKernel: string;
  resetKernel: string;
  newNotebook: string;
  saveNotebook: string;
  exportNotebook: string;
  addCodeCell: string;
  addMarkdownCell: string;
  moveUp: string;
  moveDown: string;
  deleteCell: string;
  duplicateCell: string;
  kernelReady: string;
  kernelRunning: string;
  files: string;
  courses: string;
  exercises: string;
  datasets: string;
  libraries: string;
  variables: string;
  aiTutor: string;
  searchPlaceholder: string;
  beginnerMode: string;
  proMode: string;
  lightMode: string;
  darkMode: string;
  output: string;
  noOutputYet: string;
  executionTime: string;
  variableInspector: string;
  noVariables: string;
  installPackage: string;
  uninstall: string;
  installed: string;
  available: string;
  uploadDataset: string;
  openAsDataFrame: string;
  generateEDA: string;
  runTests: string;
  hint: string;
  solution: string;
  passedTests: string;
  askAiToExplain: string;
  askAiToDebug: string;
  askAiToImprove: string;
  beginnerExplanation: string;
  suggestedFix: string;
}

export const translations: Record<'en' | 'ar' | 'fr', TranslationStrings> = {
  en: {
    appName: "PyStudio",
    appSubtitle: "Python Learning & Data Science Studio",
    runCell: "Run Cell",
    runAll: "Run All",
    stopKernel: "Interrupt",
    restartKernel: "Restart Kernel",
    resetKernel: "Clear State",
    newNotebook: "New Notebook",
    saveNotebook: "Save",
    exportNotebook: "Export",
    addCodeCell: "+ Code",
    addMarkdownCell: "+ Text",
    moveUp: "Move Up",
    moveDown: "Move Down",
    deleteCell: "Delete",
    duplicateCell: "Duplicate",
    kernelReady: "Python 3.10 — Ready",
    kernelRunning: "Python 3.10 — Running...",
    files: "Files",
    courses: "Courses",
    exercises: "Exercises",
    datasets: "Datasets",
    libraries: "Libraries",
    variables: "Variables",
    aiTutor: "AI Tutor",
    searchPlaceholder: "Search lessons, files, functions...",
    beginnerMode: "Beginner Mode",
    proMode: "Pro Mode",
    lightMode: "Light",
    darkMode: "Dark",
    output: "Execution Output",
    noOutputYet: "Execute a cell to see real-time output, charts, and DataFrames here.",
    executionTime: "Execution Time",
    variableInspector: "Kernel Variables",
    noVariables: "No active variables in kernel namespace.",
    installPackage: "Install Package",
    uninstall: "Uninstall",
    installed: "Installed",
    available: "Available",
    uploadDataset: "Upload Dataset",
    openAsDataFrame: "Open in Notebook",
    generateEDA: "Generate EDA Report",
    runTests: "Run Tests",
    hint: "Get Hint",
    solution: "Show Solution",
    passedTests: "All tests passed successfully!",
    askAiToExplain: "Explain with AI",
    askAiToDebug: "Debug with AI",
    askAiToImprove: "Optimize Code",
    beginnerExplanation: "What this code does:",
    suggestedFix: "Suggested Solution:",
  },
  ar: {
    appName: "باي ستوديو",
    appSubtitle: "منصة تعلم بايثون وعلم البيانات التفاعلية",
    runCell: "تشغيل الخلية",
    runAll: "تشغيل الكل",
    stopKernel: "إيقاف",
    restartKernel: "إعادة تشغيل النواة",
    resetKernel: "مسح الذاكرة",
    newNotebook: "دفتر جديد",
    saveNotebook: "حفظ",
    exportNotebook: "تصدير",
    addCodeCell: "+ كود",
    addMarkdownCell: "+ نص",
    moveUp: "تحريك لأعلى",
    moveDown: "تحريك لأسفل",
    deleteCell: "حذف",
    duplicateCell: "نسخ مطابقة",
    kernelReady: "بايثون 3.10 — جاهز",
    kernelRunning: "بايثون 3.10 — قيد التشغيل...",
    files: "الملفات",
    courses: "الدروس",
    exercises: "التمارين",
    datasets: "البيانات",
    libraries: "المكتبات",
    variables: "المتغيرات",
    aiTutor: "المعلم الذكي",
    searchPlaceholder: "ابحث في الدروس والملفات والمكتبات...",
    beginnerMode: "وضع المبتدئين",
    proMode: "الوضع الاحترافي",
    lightMode: "فاتح",
    darkMode: "داكن",
    output: "نتائج التشغيل",
    noOutputYet: "قم بتشغيل الخلية لمشاهدة المخرجات والجداول والرسومات هنا.",
    executionTime: "وقت التنفيذ",
    variableInspector: "متغيرات النواة",
    noVariables: "لا توجد متغيرات نشطة حالياً.",
    installPackage: "تثبيت حزمة",
    uninstall: "إلغاء التثبيت",
    installed: "المثبتة",
    available: "المتاحة",
    uploadDataset: "رفع ملف بيانات",
    openAsDataFrame: "فتح في الدفتر",
    generateEDA: "إنشاء تقرير استكشافي",
    runTests: "اختبار الكود",
    hint: "تلميح",
    solution: "عرض الحل",
    passedTests: "اجتازت جميع الاختبارات بنجاح!",
    askAiToExplain: "اشرح بالذكاء الاصطناعي",
    askAiToDebug: "إصلاح بالذكاء الاصطناعي",
    askAiToImprove: "تحسين الكود",
    beginnerExplanation: "شرح مبسط لما يفعله الكود:",
    suggestedFix: "الحل المقترح:",
  },
  fr: {
    appName: "PyStudio",
    appSubtitle: "Plateforme d'apprentissage Python et Data Science",
    runCell: "Exécuter la cellule",
    runAll: "Tout exécuter",
    stopKernel: "Interrompre",
    restartKernel: "Redémarrer le noyau",
    resetKernel: "Effacer l'état",
    newNotebook: "Nouveau Notebook",
    saveNotebook: "Enregistrer",
    exportNotebook: "Exporter",
    addCodeCell: "+ Code",
    addMarkdownCell: "+ Texte",
    moveUp: "Monter",
    moveDown: "Descendre",
    deleteCell: "Supprimer",
    duplicateCell: "Dupliquer",
    kernelReady: "Python 3.10 — Prêt",
    kernelRunning: "Python 3.10 — En cours...",
    files: "Fichiers",
    courses: "Cours",
    exercises: "Exercices",
    datasets: "Jeux de données",
    libraries: "Bibliothèques",
    variables: "Variables",
    aiTutor: "Tuteur IA",
    searchPlaceholder: "Rechercher cours, fichiers, fonctions...",
    beginnerMode: "Mode Débutant",
    proMode: "Mode Pro",
    lightMode: "Clair",
    darkMode: "Sombre",
    output: "Résultats d'exécution",
    noOutputYet: "Exécutez une cellule pour voir les résultats, graphiques et DataFrames ici.",
    executionTime: "Temps d'exécution",
    variableInspector: "Variables du noyau",
    noVariables: "Aucune variable active dans l'espace de noms.",
    installPackage: "Installer un package",
    uninstall: "Désinstaller",
    installed: "Installées",
    available: "Disponibles",
    uploadDataset: "Importer des données",
    openAsDataFrame: "Ouvrir dans le Notebook",
    generateEDA: "Rapport EDA automatique",
    runTests: "Tester le code",
    hint: "Indice",
    solution: "Voir la solution",
    passedTests: "Tous les tests ont réussi avec succès !",
    askAiToExplain: "Expliquer avec l'IA",
    askAiToDebug: "Déboguer avec l'IA",
    askAiToImprove: "Optimiser le code",
    beginnerExplanation: "Explication de ce que fait ce code :",
    suggestedFix: "Correction suggérée :",
  }
};
