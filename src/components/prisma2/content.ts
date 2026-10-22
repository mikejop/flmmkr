import type { LangCode } from '@/components/prisma2/i18n';

/** Texto de apresentação da página (SEO, AEO e GEO). Só afirma o que o app faz de fato (conferido no pacote do PRISMA 2.app). */
export type Content = {
  lead: string;
  featuresTitle: string;
  features: { title: string; text: string }[];
  faqTitle: string;
  faq: { q: string; a: string }[];
};

export const CONTENT: Record<LangCode, Content> = {
  'pt-BR': {
    lead: 'Gravador de tela leve para Mac, feito para quem ensina.',
    featuresTitle: 'O que o PRISMA 2 faz',
    features: [
      { title: 'Tela e áudio do sistema', text: 'Grava a tela do Mac junto com o áudio do sistema.' },
      { title: 'Microfone e câmera', text: 'Grava a sua voz pelo microfone e aparece na gravação com a câmera.' },
      { title: 'Celular como câmera e controle remoto', text: 'Conecte o celular pelo QR Code e use como câmera e controle remoto, pela rede local, sem internet.' },
      { title: 'Leve', text: 'O instalador tem cerca de 25 MB.' },
      { title: 'Local da gravação (opcional)', text: 'Se você permitir, salva o local da gravação nos metadados do arquivo.' },
    ],
    faqTitle: 'Perguntas frequentes',
    faq: [
      { q: 'O que é o PRISMA 2?', a: 'O PRISMA 2 é um gravador de tela para macOS da FLMMKR. Ele grava a tela, o áudio do sistema, o microfone e a câmera, e está em open beta.' },
      { q: 'Quais computadores são compatíveis com o PRISMA 2?', a: 'O PRISMA 2 funciona em Macs com macOS 15 ou superior. Ele é exclusivo para computadores e não funciona em smartphones nem no Windows.' },
      { q: 'Por que o macOS bloqueia o PRISMA 2 na primeira abertura?', a: 'O app está na primeira fase do open beta e ainda não passou pela verificação da Apple. Para liberar, abra Ajustes do Sistema, Privacidade e Segurança, e clique em “Abrir Mesmo Assim”. Isso é feito uma única vez.' },
      { q: 'Como baixar o PRISMA 2?', a: 'Clique em “Baixar para Mac”, preencha nome, sobrenome e e-mail (os demais campos são opcionais) e o download do arquivo .dmg, de cerca de 25 MB, começa em seguida.' },
    ],
  },
  en: {
    lead: 'A lightweight screen recorder for Mac, made for people who teach.',
    featuresTitle: 'What PRISMA 2 does',
    features: [
      { title: 'Screen and system audio', text: 'Records your Mac screen together with the system audio.' },
      { title: 'Microphone and camera', text: 'Records your voice through the microphone and shows you on camera in the recording.' },
      { title: 'Phone as camera and remote control', text: 'Connect your phone with a QR code and use it as a camera and remote control over the local network, with no internet.' },
      { title: 'Lightweight', text: 'The installer is about 25 MB.' },
      { title: 'Recording location (optional)', text: 'If you allow it, saves the recording location in the file metadata.' },
    ],
    faqTitle: 'Frequently asked questions',
    faq: [
      { q: 'What is PRISMA 2?', a: 'PRISMA 2 is a screen recorder for macOS by FLMMKR. It records the screen, system audio, microphone and camera, and it is in open beta.' },
      { q: 'Which computers are compatible with PRISMA 2?', a: 'PRISMA 2 runs on Macs with macOS 15 or later. It is exclusive to computers and does not work on smartphones or Windows.' },
      { q: 'Why does macOS block PRISMA 2 the first time I open it?', a: 'The app is in the first phase of its open beta and has not been through Apple’s verification yet. To allow it, open System Settings, Privacy & Security, and click “Open Anyway”. You only do this once.' },
      { q: 'How do I download PRISMA 2?', a: 'Click “Download for Mac”, fill in your first name, last name and email (the other fields are optional), and the .dmg download of about 25 MB starts right after.' },
    ],
  },
  es: {
    lead: 'Grabador de pantalla ligero para Mac, hecho para quienes enseñan.',
    featuresTitle: 'Qué hace PRISMA 2',
    features: [
      { title: 'Pantalla y audio del sistema', text: 'Graba la pantalla del Mac junto con el audio del sistema.' },
      { title: 'Micrófono y cámara', text: 'Graba tu voz con el micrófono y apareces en la grabación con la cámara.' },
      { title: 'Celular como cámara y control remoto', text: 'Conecta el celular con un código QR y úsalo como cámara y control remoto por la red local, sin internet.' },
      { title: 'Ligero', text: 'El instalador pesa unos 25 MB.' },
      { title: 'Ubicación de la grabación (opcional)', text: 'Si lo permites, guarda la ubicación de la grabación en los metadatos del archivo.' },
    ],
    faqTitle: 'Preguntas frecuentes',
    faq: [
      { q: '¿Qué es PRISMA 2?', a: 'PRISMA 2 es un grabador de pantalla para macOS de FLMMKR. Graba la pantalla, el audio del sistema, el micrófono y la cámara, y está en open beta.' },
      { q: '¿Qué computadoras son compatibles con PRISMA 2?', a: 'PRISMA 2 funciona en Mac con macOS 15 o superior. Es exclusivo para computadoras y no funciona en smartphones ni en Windows.' },
      { q: '¿Por qué macOS bloquea PRISMA 2 la primera vez que lo abro?', a: 'La app está en la primera fase del open beta y aún no ha pasado la verificación de Apple. Para permitirla, abre Ajustes del Sistema, Privacidad y seguridad, y haz clic en “Abrir igualmente”. Solo lo haces una vez.' },
      { q: '¿Cómo descargo PRISMA 2?', a: 'Haz clic en “Descargar para Mac”, completa nombre, apellido y correo electrónico (los demás campos son opcionales) y la descarga del archivo .dmg, de unos 25 MB, empieza enseguida.' },
    ],
  },
  it: {
    lead: 'Registratore dello schermo leggero per Mac, pensato per chi insegna.',
    featuresTitle: 'Cosa fa PRISMA 2',
    features: [
      { title: 'Schermo e audio di sistema', text: 'Registra lo schermo del Mac insieme all’audio di sistema.' },
      { title: 'Microfono e fotocamera', text: 'Registra la tua voce con il microfono e compari nella registrazione con la fotocamera.' },
      { title: 'Telefono come fotocamera e telecomando', text: 'Collega il telefono con un codice QR e usalo come fotocamera e telecomando sulla rete locale, senza internet.' },
      { title: 'Leggero', text: 'Il programma di installazione pesa circa 25 MB.' },
      { title: 'Posizione della registrazione (facoltativa)', text: 'Se lo consenti, salva la posizione della registrazione nei metadati del file.' },
    ],
    faqTitle: 'Domande frequenti',
    faq: [
      { q: 'Cos’è PRISMA 2?', a: 'PRISMA 2 è un registratore dello schermo per macOS di FLMMKR. Registra lo schermo, l’audio di sistema, il microfono e la fotocamera, ed è in open beta.' },
      { q: 'Quali computer sono compatibili con PRISMA 2?', a: 'PRISMA 2 funziona sui Mac con macOS 15 o successivo. È esclusivo per computer e non funziona su smartphone né su Windows.' },
      { q: 'Perché macOS blocca PRISMA 2 alla prima apertura?', a: 'L’app è nella prima fase dell’open beta e non ha ancora superato la verifica di Apple. Per consentirla, apri Impostazioni di Sistema, Privacy e sicurezza, e fai clic su “Apri comunque”. Lo fai una sola volta.' },
      { q: 'Come scarico PRISMA 2?', a: 'Fai clic su “Scarica per Mac”, compila nome, cognome ed e-mail (gli altri campi sono facoltativi) e il download del file .dmg, di circa 25 MB, parte subito dopo.' },
    ],
  },
  fr: {
    lead: 'Enregistreur d’écran léger pour Mac, conçu pour ceux qui enseignent.',
    featuresTitle: 'Ce que fait PRISMA 2',
    features: [
      { title: 'Écran et audio du système', text: 'Enregistre l’écran du Mac avec l’audio du système.' },
      { title: 'Micro et caméra', text: 'Enregistre votre voix avec le micro et vous apparaissez dans l’enregistrement avec la caméra.' },
      { title: 'Téléphone comme caméra et télécommande', text: 'Connectez le téléphone avec un code QR et utilisez-le comme caméra et télécommande via le réseau local, sans internet.' },
      { title: 'Léger', text: 'Le programme d’installation fait environ 25 Mo.' },
      { title: 'Lieu de l’enregistrement (facultatif)', text: 'Si vous l’autorisez, enregistre le lieu de l’enregistrement dans les métadonnées du fichier.' },
    ],
    faqTitle: 'Questions fréquentes',
    faq: [
      { q: 'Qu’est-ce que PRISMA 2 ?', a: 'PRISMA 2 est un enregistreur d’écran pour macOS par FLMMKR. Il enregistre l’écran, l’audio du système, le micro et la caméra, et il est en open bêta.' },
      { q: 'Quels ordinateurs sont compatibles avec PRISMA 2 ?', a: 'PRISMA 2 fonctionne sur les Mac avec macOS 15 ou version ultérieure. Il est réservé aux ordinateurs et ne fonctionne ni sur smartphone ni sous Windows.' },
      { q: 'Pourquoi macOS bloque-t-il PRISMA 2 à la première ouverture ?', a: 'L’app est dans la première phase de l’open bêta et n’a pas encore passé la vérification d’Apple. Pour l’autoriser, ouvrez Réglages Système, Confidentialité et sécurité, puis cliquez sur « Ouvrir quand même ». Vous ne le faites qu’une fois.' },
      { q: 'Comment télécharger PRISMA 2 ?', a: 'Cliquez sur « Télécharger pour Mac », renseignez prénom, nom et e-mail (les autres champs sont facultatifs) et le téléchargement du fichier .dmg, d’environ 25 Mo, démarre aussitôt.' },
    ],
  },
  ar: {
    lead: 'مسجّل شاشة خفيف لنظام Mac، مصمم لمن يعلّمون.',
    featuresTitle: 'ماذا يفعل PRISMA 2',
    features: [
      { title: 'الشاشة وصوت النظام', text: 'يسجّل شاشة Mac مع صوت النظام.' },
      { title: 'الميكروفون والكاميرا', text: 'يسجّل صوتك عبر الميكروفون وتظهر في التسجيل بالكاميرا.' },
      { title: 'الهاتف ككاميرا وجهاز تحكم عن بُعد', text: 'اربط هاتفك برمز QR واستخدمه ككاميرا وجهاز تحكم عن بُعد عبر الشبكة المحلية دون إنترنت.' },
      { title: 'خفيف', text: 'حجم المثبّت نحو 25 ميغابايت.' },
      { title: 'موقع التسجيل (اختياري)', text: 'إذا سمحت بذلك، يحفظ موقع التسجيل في بيانات الملف الوصفية.' },
    ],
    faqTitle: 'الأسئلة الشائعة',
    faq: [
      { q: 'ما هو PRISMA 2؟', a: 'PRISMA 2 مسجّل شاشة لنظام macOS من FLMMKR. يسجّل الشاشة وصوت النظام والميكروفون والكاميرا، وهو في مرحلة open beta.' },
      { q: 'ما الأجهزة المتوافقة مع PRISMA 2؟', a: 'يعمل PRISMA 2 على أجهزة Mac بنظام macOS 15 أو أحدث. وهو حصري لأجهزة الكمبيوتر ولا يعمل على الهواتف الذكية ولا على Windows.' },
      { q: 'لماذا يحظر macOS تطبيق PRISMA 2 عند أول فتح؟', a: 'التطبيق في المرحلة الأولى من open beta ولم يخضع بعد للتحقق من Apple. للسماح به افتح إعدادات النظام ثم الخصوصية والأمان وانقر على «فتح على أي حال». تفعل ذلك مرة واحدة فقط.' },
      { q: 'كيف أنزّل PRISMA 2؟', a: 'انقر على «تنزيل لنظام Mac» وأدخل الاسم واسم العائلة والبريد الإلكتروني (بقية الحقول اختيارية) ليبدأ بعدها تنزيل ملف dmg بحجم نحو 25 ميغابايت.' },
    ],
  },
  zh: {
    lead: '轻量的 Mac 屏幕录制软件，为教学者而做。',
    featuresTitle: 'PRISMA 2 能做什么',
    features: [
      { title: '屏幕和系统音频', text: '录制 Mac 屏幕，同时录制系统音频。' },
      { title: '麦克风和摄像头', text: '通过麦克风录下你的声音，并用摄像头让你出现在录像中。' },
      { title: '手机作摄像头和遥控器', text: '用二维码连接手机，通过局域网把它当作摄像头和遥控器，无需联网。' },
      { title: '轻量', text: '安装包约 25 MB。' },
      { title: '录制位置（可选）', text: '如果你允许，会把录制位置保存到文件元数据中。' },
    ],
    faqTitle: '常见问题',
    faq: [
      { q: 'PRISMA 2 是什么？', a: 'PRISMA 2 是 FLMMKR 推出的 macOS 屏幕录制软件，可录制屏幕、系统音频、麦克风和摄像头，目前处于公开测试阶段。' },
      { q: 'PRISMA 2 兼容哪些电脑？', a: 'PRISMA 2 可在 macOS 15 或更高版本的 Mac 上运行。它仅限电脑使用，不能在智能手机或 Windows 上使用。' },
      { q: '为什么 macOS 在首次打开时会拦截 PRISMA 2？', a: '该应用处于公开测试的第一阶段，尚未通过 Apple 的验证。要放行，请打开系统设置，进入隐私与安全性，然后点击“仍要打开”。只需操作一次。' },
      { q: '如何下载 PRISMA 2？', a: '点击“下载 Mac 版”，填写名、姓和电子邮箱（其他字段为选填），随后会开始下载约 25 MB 的 .dmg 文件。' },
    ],
  },
};
