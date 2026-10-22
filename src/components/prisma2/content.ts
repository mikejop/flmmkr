import type { LangCode } from '@/components/prisma2/i18n';

/** Texto de apresentação da página (SEO, AEO e GEO). Só afirma o que o app faz de fato (conferido no pacote do PRISMA 2.app). */
export type Content = {
  lead: string;
  featuresTitle: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
};

export const CONTENT: Record<LangCode, Content> = {
  'pt-BR': {
    lead: 'Grave a tela, a câmera e o áudio do seu Mac em um só lugar. Ideal para aulas, tutoriais, demonstrações e apresentações.',
    featuresTitle: 'O que o PRISMA 2 faz',
    faqTitle: 'Perguntas frequentes',
    faq: [
      { q: 'O que é o PRISMA 2?', a: 'O PRISMA 2 é um gravador de tela para macOS da FLMMKR. Ele grava a tela, o áudio do sistema, o microfone e a câmera, e está em open beta.' },
      { q: 'Quais computadores são compatíveis com o PRISMA 2?', a: 'O PRISMA 2 funciona em Macs com macOS 15 ou superior. O programa é exclusivo para Mac e não funciona em smartphones nem no Windows. Os apps para iPhone e Android são companheiros: servem de câmera e de controle remoto.' },
      { q: 'Por que o macOS bloqueia o PRISMA 2 na primeira abertura?', a: 'O app está na primeira fase do open beta e ainda não passou pela verificação da Apple. Para liberar, abra Ajustes do Sistema, Privacidade e Segurança, e clique em “Abrir Mesmo Assim”. Isso é feito uma única vez.' },
      { q: 'Como baixar o PRISMA 2?', a: 'Clique em “Baixar para Mac”, preencha nome, sobrenome e e-mail (os demais campos são opcionais) e o download do arquivo .dmg, de cerca de 25 MB, começa em seguida.' },
    ],
  },
  en: {
    lead: 'Record your Mac’s screen, camera and audio in one place. Ideal for classes, tutorials, demos and presentations.',
    featuresTitle: 'What PRISMA 2 does',
    faqTitle: 'Frequently asked questions',
    faq: [
      { q: 'What is PRISMA 2?', a: 'PRISMA 2 is a screen recorder for macOS by FLMMKR. It records the screen, system audio, microphone and camera, and it is in open beta.' },
      { q: 'Which computers are compatible with PRISMA 2?', a: 'PRISMA 2 runs on Macs with macOS 15 or later. The program is exclusive to Mac and does not run on smartphones or Windows. The iPhone and Android apps are companions: they work as a camera and a remote control.' },
      { q: 'Why does macOS block PRISMA 2 the first time I open it?', a: 'The app is in the first phase of its open beta and has not been through Apple’s verification yet. To allow it, open System Settings, Privacy & Security, and click “Open Anyway”. You only do this once.' },
      { q: 'How do I download PRISMA 2?', a: 'Click “Download for Mac”, fill in your first name, last name and email (the other fields are optional), and the .dmg download of about 25 MB starts right after.' },
    ],
  },
  es: {
    lead: 'Graba la pantalla, la cámara y el audio de tu Mac en un solo lugar. Ideal para clases, tutoriales, demostraciones y presentaciones.',
    featuresTitle: 'Qué hace PRISMA 2',
    faqTitle: 'Preguntas frecuentes',
    faq: [
      { q: '¿Qué es PRISMA 2?', a: 'PRISMA 2 es un grabador de pantalla para macOS de FLMMKR. Graba la pantalla, el audio del sistema, el micrófono y la cámara, y está en open beta.' },
      { q: '¿Qué computadoras son compatibles con PRISMA 2?', a: 'PRISMA 2 funciona en Mac con macOS 15 o superior. El programa es exclusivo para Mac y no funciona en smartphones ni en Windows. Las apps para iPhone y Android son complementarias: sirven de cámara y de control remoto.' },
      { q: '¿Por qué macOS bloquea PRISMA 2 la primera vez que lo abro?', a: 'La app está en la primera fase del open beta y aún no ha pasado la verificación de Apple. Para permitirla, abre Ajustes del Sistema, Privacidad y seguridad, y haz clic en “Abrir igualmente”. Solo lo haces una vez.' },
      { q: '¿Cómo descargo PRISMA 2?', a: 'Haz clic en “Descargar para Mac”, completa nombre, apellido y correo electrónico (los demás campos son opcionales) y la descarga del archivo .dmg, de unos 25 MB, empieza enseguida.' },
    ],
  },
  it: {
    lead: 'Registra lo schermo, la fotocamera e l’audio del tuo Mac in un unico posto. Ideale per lezioni, tutorial, dimostrazioni e presentazioni.',
    featuresTitle: 'Cosa fa PRISMA 2',
    faqTitle: 'Domande frequenti',
    faq: [
      { q: 'Cos’è PRISMA 2?', a: 'PRISMA 2 è un registratore dello schermo per macOS di FLMMKR. Registra lo schermo, l’audio di sistema, il microfono e la fotocamera, ed è in open beta.' },
      { q: 'Quali computer sono compatibili con PRISMA 2?', a: 'PRISMA 2 funziona sui Mac con macOS 15 o successivo. Il programma è esclusivo per Mac e non funziona su smartphone né su Windows. Le app per iPhone e Android sono complementari: fanno da fotocamera e da telecomando.' },
      { q: 'Perché macOS blocca PRISMA 2 alla prima apertura?', a: 'L’app è nella prima fase dell’open beta e non ha ancora superato la verifica di Apple. Per consentirla, apri Impostazioni di Sistema, Privacy e sicurezza, e fai clic su “Apri comunque”. Lo fai una sola volta.' },
      { q: 'Come scarico PRISMA 2?', a: 'Fai clic su “Scarica per Mac”, compila nome, cognome ed e-mail (gli altri campi sono facoltativi) e il download del file .dmg, di circa 25 MB, parte subito dopo.' },
    ],
  },
  fr: {
    lead: 'Enregistrez l’écran, la caméra et l’audio de votre Mac au même endroit. Idéal pour les cours, tutoriels, démonstrations et présentations.',
    featuresTitle: 'Ce que fait PRISMA 2',
    faqTitle: 'Questions fréquentes',
    faq: [
      { q: 'Qu’est-ce que PRISMA 2 ?', a: 'PRISMA 2 est un enregistreur d’écran pour macOS par FLMMKR. Il enregistre l’écran, l’audio du système, le micro et la caméra, et il est en open bêta.' },
      { q: 'Quels ordinateurs sont compatibles avec PRISMA 2 ?', a: 'PRISMA 2 fonctionne sur les Mac avec macOS 15 ou version ultérieure. Le programme est réservé au Mac et ne fonctionne ni sur smartphone ni sous Windows. Les apps pour iPhone et Android sont des compagnons : elles servent de caméra et de télécommande.' },
      { q: 'Pourquoi macOS bloque-t-il PRISMA 2 à la première ouverture ?', a: 'L’app est dans la première phase de l’open bêta et n’a pas encore passé la vérification d’Apple. Pour l’autoriser, ouvrez Réglages Système, Confidentialité et sécurité, puis cliquez sur « Ouvrir quand même ». Vous ne le faites qu’une fois.' },
      { q: 'Comment télécharger PRISMA 2 ?', a: 'Cliquez sur « Télécharger pour Mac », renseignez prénom, nom et e-mail (les autres champs sont facultatifs) et le téléchargement du fichier .dmg, d’environ 25 Mo, démarre aussitôt.' },
    ],
  },
  ar: {
    lead: 'سجّل شاشة جهاز Mac والكاميرا والصوت في مكان واحد. مثالي للدروس والشروحات والعروض التوضيحية والعروض التقديمية.',
    featuresTitle: 'ماذا يفعل PRISMA 2',
    faqTitle: 'الأسئلة الشائعة',
    faq: [
      { q: 'ما هو PRISMA 2؟', a: 'PRISMA 2 مسجّل شاشة لنظام macOS من FLMMKR. يسجّل الشاشة وصوت النظام والميكروفون والكاميرا، وهو في مرحلة open beta.' },
      { q: 'ما الأجهزة المتوافقة مع PRISMA 2؟', a: 'يعمل PRISMA 2 على أجهزة Mac بنظام macOS 15 أو أحدث. والبرنامج حصري لأجهزة Mac ولا يعمل على الهواتف الذكية ولا على Windows. أما تطبيقا iPhone وAndroid فهما مرافقان: يعملان ككاميرا وكجهاز تحكم عن بُعد.' },
      { q: 'لماذا يحظر macOS تطبيق PRISMA 2 عند أول فتح؟', a: 'التطبيق في المرحلة الأولى من open beta ولم يخضع بعد للتحقق من Apple. للسماح به افتح إعدادات النظام ثم الخصوصية والأمان وانقر على «فتح على أي حال». تفعل ذلك مرة واحدة فقط.' },
      { q: 'كيف أنزّل PRISMA 2؟', a: 'انقر على «تنزيل لنظام Mac» وأدخل الاسم واسم العائلة والبريد الإلكتروني (بقية الحقول اختيارية) ليبدأ بعدها تنزيل ملف dmg بحجم نحو 25 ميغابايت.' },
    ],
  },
  zh: {
    lead: '在一个地方录制 Mac 的屏幕、摄像头和音频。非常适合授课、教程、演示和演讲。',
    featuresTitle: 'PRISMA 2 能做什么',
    faqTitle: '常见问题',
    faq: [
      { q: 'PRISMA 2 是什么？', a: 'PRISMA 2 是 FLMMKR 推出的 macOS 屏幕录制软件，可录制屏幕、系统音频、麦克风和摄像头，目前处于公开测试阶段。' },
      { q: 'PRISMA 2 兼容哪些电脑？', a: 'PRISMA 2 可在 macOS 15 或更高版本的 Mac 上运行。该程序仅限 Mac 使用，不能在智能手机或 Windows 上使用。iPhone 和 Android 应用是配套应用：用作摄像头和遥控器。' },
      { q: '为什么 macOS 在首次打开时会拦截 PRISMA 2？', a: '该应用处于公开测试的第一阶段，尚未通过 Apple 的验证。要放行，请打开系统设置，进入隐私与安全性，然后点击“仍要打开”。只需操作一次。' },
      { q: '如何下载 PRISMA 2？', a: '点击“下载 Mac 版”，填写名、姓和电子邮箱（其他字段为选填），随后会开始下载约 25 MB 的 .dmg 文件。' },
    ],
  },
};
