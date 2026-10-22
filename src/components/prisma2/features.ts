import type { LangCode } from '@/components/prisma2/i18n';

export type FeatureGroup = { title: string; items: string[] };
export type Features = { intro: string; groups: FeatureGroup[] };

/** Lista completa de funções do PRISMA 2, por área, em todos os idiomas da página. */
export const FEATURES: Record<LangCode, Features> = {
  'pt-BR': {
    intro: 'Para Mac com macOS 15 ou mais novo (com Liquid Glass no macOS 26), com apps companheiros para iPhone e Android.',
    groups: [
      { title: 'Gravação de tela', items: [
        'Grave a tela do Mac em resolução nativa, incluindo monitores externos 4K e 5K. Suporte a até 120 fps e 10 bits, conforme o hardware.',
        'Mostre ou oculte o cursor do mouse.',
        'Codecs de vídeo: HEVC de 8 ou 10 bits (padrão), ProRes 422 e ProRes 422 HQ. O uso de aceleração por hardware depende do Mac.',
        'Exporte os dados de movimento do mouse por quadro em um arquivo JSON separado.',
      ] },
      { title: 'Câmera', items: [
        'Use a câmera do Mac, um iPhone ou iPad, webcams USB, placas de captura HDMI e câmeras virtuais.',
        'Aplique LUTs para ajustar as cores da imagem, com controle de intensidade e configuração do sinal de entrada. O ajuste aparece na prévia e na gravação.',
        'Transforme seu iPhone, iPad ou celular Android em uma câmera para o PRISMA 2. O pareamento é feito por QR code, sem internet, com suporte a até 8K em HEVC.',
        'Controle a câmera do celular pelo aplicativo: zoom, exposição, ISO, obturador, balanço de branco em Kelvin, foco, lanterna e HDR.',
        'Use False Color e focus peaking para avaliar exposição e foco durante a gravação com o celular.',
      ] },
      { title: 'Áudio', items: [
        'Microfone e áudio do computador ao mesmo tempo, sem placa virtual.',
        '“Sistema (padrão)”: segue o microfone e a saída que você escolher no macOS, e troca junto se você mudar lá.',
        'Tracks separadas: cada fonte numa faixa do arquivo.',
        'Voice Isolation da Apple no microfone.',
        'Medidores de nível ao vivo.',
        'Formato de áudio: PCM 24 bits (sem perda) ou AAC 256 kbps.',
      ] },
      { title: 'Ferramentas na tela', items: [
        'Desenhar na tela: livre, seta, elipse, retângulo, selecionar e mover, cores, desfazer, apagar e limpar. Com espessura e traço de exemplo ao vivo, tempo para o desenho sumir (fade) e glow. A barra flutuante pode ser minimizada e expandida na horizontal.',
        'Lupa: atalho liga e desliga (segurado ou alternado), círculo ou quadrado, tamanho, intensidade no centro e na borda, e aro com aberração cromática.',
        'Teclas na tela: mostra as teclas e atalhos apertados, com fonte, tamanho, estilo vidro ou fosco e posição.',
        'Cada ferramenta fica na barra do topo, com menu ⋯ de atalho e configurações.',
        'Tudo entra no vídeo gravado, nunca aparece duplicado, e as janelas flutuantes do app ficam fora da captura.',
        'Monitor de status (fps, CPU, RAM, frames perdidos) que não aparece na gravação.',
      ] },
      { title: 'Projetos e arquivos', items: [
        'Projetos com pasta própria, vídeos numerados e versões, abrir a pasta de um vídeo já gravado e lixeira.',
        'Nome automático e metadados do arquivo (título, resolução, codec, dispositivos).',
        'Log de sessão (frames perdidos, erros).',
        'Perfis de gravação e a última configuração salva.',
      ] },
      { title: 'Desempenho', items: [
        'Análise de desempenho: teste real que diz se o Mac aguenta a configuração (OK, apertado ou impossível), lista processos pesados com botão para fechar, sugere uma configuração melhor e calcula o máximo que o Mac consegue.',
        'Calibração única do computador.',
      ] },
    ],
  },
  en: {
    intro: 'For Macs running macOS 15 or later (with Liquid Glass on macOS 26), with companion apps for iPhone and Android.',
    groups: [
      { title: 'Screen recording', items: [
        'Record your Mac screen at native resolution, including external 4K and 5K displays. Supports up to 120 fps and 10-bit, depending on the hardware.',
        'Show or hide the mouse cursor.',
        'Video codecs: 8-bit or 10-bit HEVC (default), ProRes 422 and ProRes 422 HQ. Hardware acceleration depends on the Mac.',
        'Export per-frame mouse movement data to a separate JSON file.',
      ] },
      { title: 'Camera', items: [
        'Use the Mac camera, an iPhone or iPad, USB webcams, HDMI capture cards and virtual cameras.',
        'Apply LUTs to adjust the image colors, with intensity control and input signal setup. The adjustment shows in the preview and in the recording.',
        'Turn your iPhone, iPad or Android phone into a camera for PRISMA 2. Pairing is done by QR code, with no internet, and supports up to 8K in HEVC.',
        'Control the phone camera from the app: zoom, exposure, ISO, shutter, white balance in Kelvin, focus, flashlight and HDR.',
        'Use False Color and focus peaking to judge exposure and focus while recording with the phone.',
      ] },
      { title: 'Audio', items: [
        'Microphone and computer audio at the same time, with no virtual audio device.',
        '“System (default)”: follows the microphone and output you choose in macOS, and switches with them if you change it there.',
        'Separate tracks: each source on its own track in the file.',
        'Apple Voice Isolation on the microphone.',
        'Live level meters.',
        'Audio format: 24-bit PCM (lossless) or AAC 256 kbps.',
      ] },
      { title: 'On-screen tools', items: [
        'Draw on screen: freehand, arrow, ellipse, rectangle, select and move, colors, undo, erase and clear. With thickness and a live sample stroke, a time for the drawing to fade, and glow. The floating bar can be minimized and expanded horizontally.',
        'Magnifier: shortcut toggles it on and off (held or toggled), circle or square, size, intensity at the center and edge, and a ring with chromatic aberration.',
        'On-screen Keys: shows the keys and shortcuts you press, with font, size, glass or matte style and position.',
        'Each tool sits in the top bar, with a ⋯ menu for its shortcut and settings.',
        'Everything is recorded in the video, never shows up twice, and the app’s floating windows stay out of the capture.',
        'Status monitor (fps, CPU, RAM, dropped frames) that does not appear in the recording.',
      ] },
      { title: 'Projects and files', items: [
        'Projects with their own folder, numbered videos and versions, opening the folder of an already recorded video, and a trash.',
        'Automatic file name and metadata (title, resolution, codec, devices).',
        'Session log (dropped frames, errors).',
        'Recording profiles and the last saved setup.',
      ] },
      { title: 'Performance', items: [
        'Performance analysis: a real test that tells you whether your Mac can handle the setup (OK, tight or impossible), lists heavy processes with a button to close them, suggests a better setup and calculates the maximum your Mac can do.',
        'One-time computer calibration.',
      ] },
    ],
  },
  es: {
    intro: 'Para Mac con macOS 15 o posterior (con Liquid Glass en macOS 26), con apps complementarias para iPhone y Android.',
    groups: [
      { title: 'Grabación de pantalla', items: [
        'Graba la pantalla del Mac en resolución nativa, incluidos monitores externos 4K y 5K. Admite hasta 120 fps y 10 bits, según el hardware.',
        'Muestra u oculta el cursor del ratón.',
        'Códecs de vídeo: HEVC de 8 o 10 bits (predeterminado), ProRes 422 y ProRes 422 HQ. El uso de aceleración por hardware depende del Mac.',
        'Exporta los datos de movimiento del ratón por fotograma a un archivo JSON aparte.',
      ] },
      { title: 'Cámara', items: [
        'Usa la cámara del Mac, un iPhone o iPad, webcams USB, capturadoras HDMI y cámaras virtuales.',
        'Aplica LUT para ajustar los colores de la imagen, con control de intensidad y configuración de la señal de entrada. El ajuste se ve en la vista previa y en la grabación.',
        'Convierte tu iPhone, iPad o celular Android en una cámara para PRISMA 2. El emparejamiento se hace por código QR, sin internet, con soporte de hasta 8K en HEVC.',
        'Controla la cámara del celular desde la app: zoom, exposición, ISO, obturador, balance de blancos en Kelvin, enfoque, linterna y HDR.',
        'Usa False Color y focus peaking para evaluar la exposición y el enfoque mientras grabas con el celular.',
      ] },
      { title: 'Audio', items: [
        'Micrófono y audio del ordenador al mismo tiempo, sin tarjeta de audio virtual.',
        '«Sistema (predeterminado)»: sigue el micrófono y la salida que elijas en macOS, y cambia junto con ellos si los cambias allí.',
        'Pistas separadas: cada fuente en una pista del archivo.',
        'Voice Isolation de Apple en el micrófono.',
        'Medidores de nivel en vivo.',
        'Formato de audio: PCM de 24 bits (sin pérdida) o AAC a 256 kbps.',
      ] },
      { title: 'Herramientas en pantalla', items: [
        'Dibujar en pantalla: libre, flecha, elipse, rectángulo, seleccionar y mover, colores, deshacer, borrar y limpiar. Con grosor y trazo de ejemplo en vivo, tiempo para que el dibujo desaparezca (fade) y glow. La barra flotante se puede minimizar y expandir en horizontal.',
        'Lupa: atajo para activarla y desactivarla (mantenido o alternado), círculo o cuadrado, tamaño, intensidad en el centro y en el borde, y aro con aberración cromática.',
        'Teclas en pantalla: muestra las teclas y atajos que pulsas, con fuente, tamaño, estilo cristal o mate y posición.',
        'Cada herramienta está en la barra superior, con menú ⋯ de atajo y ajustes.',
        'Todo queda en el vídeo grabado, nunca aparece duplicado, y las ventanas flotantes de la app quedan fuera de la captura.',
        'Monitor de estado (fps, CPU, RAM, fotogramas perdidos) que no aparece en la grabación.',
      ] },
      { title: 'Proyectos y archivos', items: [
        'Proyectos con carpeta propia, vídeos numerados y versiones, abrir la carpeta de un vídeo ya grabado y papelera.',
        'Nombre automático y metadatos del archivo (título, resolución, códec, dispositivos).',
        'Registro de sesión (fotogramas perdidos, errores).',
        'Perfiles de grabación y la última configuración guardada.',
      ] },
      { title: 'Rendimiento', items: [
        'Análisis de rendimiento: una prueba real que indica si el Mac aguanta la configuración (OK, justo o imposible), lista procesos pesados con botón para cerrarlos, sugiere una configuración mejor y calcula el máximo que el Mac puede hacer.',
        'Calibración única del ordenador.',
      ] },
    ],
  },
  it: {
    intro: 'Per Mac con macOS 15 o successivo (con Liquid Glass su macOS 26), con app complementari per iPhone e Android.',
    groups: [
      { title: 'Registrazione dello schermo', items: [
        'Registra lo schermo del Mac a risoluzione nativa, inclusi i monitor esterni 4K e 5K. Supporta fino a 120 fps e 10 bit, in base all’hardware.',
        'Mostra o nascondi il cursore del mouse.',
        'Codec video: HEVC a 8 o 10 bit (predefinito), ProRes 422 e ProRes 422 HQ. L’uso dell’accelerazione hardware dipende dal Mac.',
        'Esporta i dati del movimento del mouse per fotogramma in un file JSON separato.',
      ] },
      { title: 'Fotocamera', items: [
        'Usa la fotocamera del Mac, un iPhone o iPad, webcam USB, schede di acquisizione HDMI e fotocamere virtuali.',
        'Applica le LUT per regolare i colori dell’immagine, con controllo dell’intensità e impostazione del segnale di ingresso. La regolazione compare nell’anteprima e nella registrazione.',
        'Trasforma il tuo iPhone, iPad o telefono Android in una fotocamera per PRISMA 2. L’abbinamento avviene con codice QR, senza internet, con supporto fino a 8K in HEVC.',
        'Controlla la fotocamera del telefono dall’app: zoom, esposizione, ISO, otturatore, bilanciamento del bianco in Kelvin, messa a fuoco, torcia e HDR.',
        'Usa False Color e focus peaking per valutare esposizione e messa a fuoco durante la registrazione con il telefono.',
      ] },
      { title: 'Audio', items: [
        'Microfono e audio del computer contemporaneamente, senza scheda audio virtuale.',
        '«Sistema (predefinito)»: segue il microfono e l’uscita scelti in macOS e cambia insieme a loro se li modifichi lì.',
        'Tracce separate: ogni sorgente su una traccia del file.',
        'Voice Isolation di Apple sul microfono.',
        'Indicatori di livello dal vivo.',
        'Formato audio: PCM a 24 bit (senza perdita) o AAC a 256 kbps.',
      ] },
      { title: 'Strumenti sullo schermo', items: [
        'Disegnare sullo schermo: a mano libera, freccia, ellisse, rettangolo, seleziona e sposta, colori, annulla, cancella e pulisci. Con spessore e tratto di esempio dal vivo, tempo di dissolvenza del disegno (fade) e glow. La barra mobile può essere ridotta a icona e ampliata in orizzontale.',
        'Lente d’ingrandimento: scorciatoia per attivarla e disattivarla (tenuta premuta o alternata), cerchio o quadrato, dimensione, intensità al centro e sul bordo, e anello con aberrazione cromatica.',
        'Tasti sullo schermo: mostra i tasti e le scorciatoie premuti, con font, dimensione, stile vetro o opaco e posizione.',
        'Ogni strumento si trova nella barra superiore, con menu ⋯ per scorciatoia e impostazioni.',
        'Tutto finisce nel video registrato, non compare mai doppio, e le finestre mobili dell’app restano fuori dalla cattura.',
        'Monitor di stato (fps, CPU, RAM, fotogrammi persi) che non compare nella registrazione.',
      ] },
      { title: 'Progetti e file', items: [
        'Progetti con cartella propria, video numerati e versioni, apertura della cartella di un video già registrato e cestino.',
        'Nome automatico e metadati del file (titolo, risoluzione, codec, dispositivi).',
        'Registro di sessione (fotogrammi persi, errori).',
        'Profili di registrazione e ultima configurazione salvata.',
      ] },
      { title: 'Prestazioni', items: [
        'Analisi delle prestazioni: un test reale che dice se il Mac regge la configurazione (OK, al limite o impossibile), elenca i processi pesanti con un pulsante per chiuderli, suggerisce una configurazione migliore e calcola il massimo che il Mac può fare.',
        'Calibrazione unica del computer.',
      ] },
    ],
  },
  fr: {
    intro: 'Pour Mac sous macOS 15 ou version ultérieure (avec Liquid Glass sous macOS 26), avec des apps compagnons pour iPhone et Android.',
    groups: [
      { title: 'Enregistrement d’écran', items: [
        'Enregistrez l’écran du Mac en résolution native, y compris les écrans externes 4K et 5K. Prise en charge jusqu’à 120 ips et 10 bits, selon le matériel.',
        'Affichez ou masquez le curseur de la souris.',
        'Codecs vidéo : HEVC 8 ou 10 bits (par défaut), ProRes 422 et ProRes 422 HQ. L’accélération matérielle dépend du Mac.',
        'Exportez les données de mouvement de la souris image par image dans un fichier JSON séparé.',
      ] },
      { title: 'Caméra', items: [
        'Utilisez la caméra du Mac, un iPhone ou iPad, des webcams USB, des cartes de capture HDMI et des caméras virtuelles.',
        'Appliquez des LUT pour ajuster les couleurs de l’image, avec contrôle de l’intensité et réglage du signal d’entrée. Le réglage apparaît dans l’aperçu et dans l’enregistrement.',
        'Transformez votre iPhone, iPad ou téléphone Android en caméra pour PRISMA 2. L’association se fait par code QR, sans internet, avec prise en charge jusqu’à 8K en HEVC.',
        'Contrôlez la caméra du téléphone depuis l’app : zoom, exposition, ISO, obturateur, balance des blancs en Kelvin, mise au point, lampe torche et HDR.',
        'Utilisez False Color et focus peaking pour évaluer l’exposition et la mise au point pendant l’enregistrement avec le téléphone.',
      ] },
      { title: 'Audio', items: [
        'Micro et audio de l’ordinateur en même temps, sans carte audio virtuelle.',
        '« Système (par défaut) » : suit le micro et la sortie choisis dans macOS et change avec eux si vous les modifiez là-bas.',
        'Pistes séparées : chaque source sur une piste du fichier.',
        'Voice Isolation d’Apple sur le micro.',
        'Indicateurs de niveau en direct.',
        'Format audio : PCM 24 bits (sans perte) ou AAC 256 kbit/s.',
      ] },
      { title: 'Outils à l’écran', items: [
        'Dessiner à l’écran : main levée, flèche, ellipse, rectangle, sélectionner et déplacer, couleurs, annuler, effacer et tout supprimer. Avec épaisseur et tracé d’exemple en direct, durée avant que le dessin disparaisse (fade) et glow. La barre flottante peut être réduite et étendue à l’horizontale.',
        'Loupe : raccourci pour l’activer et la désactiver (maintenu ou alterné), cercle ou carré, taille, intensité au centre et sur le bord, et anneau avec aberration chromatique.',
        'Touches à l’écran : affiche les touches et raccourcis pressés, avec police, taille, style verre ou mat et position.',
        'Chaque outil se trouve dans la barre du haut, avec un menu ⋯ pour le raccourci et les réglages.',
        'Tout est enregistré dans la vidéo, n’apparaît jamais en double, et les fenêtres flottantes de l’app restent hors de la capture.',
        'Moniteur d’état (ips, CPU, RAM, images perdues) qui n’apparaît pas dans l’enregistrement.',
      ] },
      { title: 'Projets et fichiers', items: [
        'Projets avec leur propre dossier, vidéos numérotées et versions, ouverture du dossier d’une vidéo déjà enregistrée et corbeille.',
        'Nom automatique et métadonnées du fichier (titre, résolution, codec, périphériques).',
        'Journal de session (images perdues, erreurs).',
        'Profils d’enregistrement et dernière configuration enregistrée.',
      ] },
      { title: 'Performances', items: [
        'Analyse des performances : un vrai test qui dit si le Mac supporte la configuration (OK, juste ou impossible), liste les processus lourds avec un bouton pour les fermer, suggère une meilleure configuration et calcule le maximum que le Mac peut faire.',
        'Calibrage unique de l’ordinateur.',
      ] },
    ],
  },
  ar: {
    intro: 'لأجهزة Mac بنظام macOS 15 أو أحدث (مع Liquid Glass في macOS 26)، مع تطبيقين مرافقين لـ iPhone وAndroid.',
    groups: [
      { title: 'تسجيل الشاشة', items: [
        'سجّل شاشة الـ Mac بدقتها الأصلية، بما في ذلك الشاشات الخارجية 4K و5K. يدعم حتى 120 إطارًا في الثانية وعمق 10 بت، بحسب العتاد.',
        'أظهر مؤشر الفأرة أو أخفِه.',
        'ترميزات الفيديو: HEVC بعمق 8 أو 10 بت (الافتراضي) وProRes 422 وProRes 422 HQ. يعتمد استخدام التسريع بالعتاد على جهاز الـ Mac.',
        'صدِّر بيانات حركة الفأرة لكل إطار في ملف JSON منفصل.',
      ] },
      { title: 'الكاميرا', items: [
        'استخدم كاميرا الـ Mac أو iPhone أو iPad أو كاميرات الويب USB أو بطاقات التقاط HDMI أو الكاميرات الافتراضية.',
        'طبّق LUT لضبط ألوان الصورة، مع التحكم في الشدة وإعداد إشارة الدخل. يظهر الضبط في المعاينة وفي التسجيل.',
        'حوّل iPhone أو iPad أو هاتف Android إلى كاميرا لـ PRISMA 2. يتم الاقتران برمز QR ودون إنترنت، مع دعم حتى 8K بترميز HEVC.',
        'تحكّم في كاميرا الهاتف من التطبيق: التقريب والتعريض وISO والغالق وتوازن الأبيض بالكلفن والتركيز والمصباح وHDR.',
        'استخدم False Color وfocus peaking لتقييم التعريض والتركيز أثناء التسجيل بالهاتف.',
      ] },
      { title: 'الصوت', items: [
        'الميكروفون وصوت الكمبيوتر في وقت واحد، دون بطاقة صوت افتراضية.',
        '«النظام (الافتراضي)»: يتبع الميكروفون والمخرج اللذين تختارهما في macOS ويتغيّر معهما إذا غيّرتهما هناك.',
        'مسارات منفصلة: كل مصدر في مسار داخل الملف.',
        'Voice Isolation من Apple على الميكروفون.',
        'مقاييس مستوى مباشرة.',
        'صيغة الصوت: PCM بعمق 24 بت (دون فقد) أو AAC بمعدل 256 كيلوبت/ثانية.',
      ] },
      { title: 'أدوات على الشاشة', items: [
        'الرسم على الشاشة: حر وسهم وشكل بيضاوي ومستطيل وتحديد ونقل وألوان وتراجع ومسح وتفريغ. مع السماكة وخط تجريبي مباشر ووقت اختفاء الرسم (fade) وتوهّج. يمكن تصغير الشريط العائم وتوسيعه أفقيًا.',
        'العدسة المكبّرة: اختصار للتشغيل والإيقاف (بالضغط المستمر أو بالتبديل)، دائرة أو مربع، الحجم، الشدة في المركز وعند الحافة، وإطار بانحراف لوني.',
        'المفاتيح على الشاشة: تعرض المفاتيح والاختصارات التي تضغطها، مع الخط والحجم والنمط الزجاجي أو المطفي والموضع.',
        'كل أداة في الشريط العلوي، مع قائمة ⋯ للاختصار والإعدادات.',
        'كل شيء يدخل في الفيديو المسجَّل ولا يظهر مكررًا أبدًا، وتبقى نوافذ التطبيق العائمة خارج اللقطة.',
        'مراقب الحالة (الإطارات في الثانية والمعالج والذاكرة والإطارات المفقودة) ولا يظهر في التسجيل.',
      ] },
      { title: 'المشاريع والملفات', items: [
        'مشاريع بمجلد خاص ومقاطع مرقّمة ونسخ، وفتح مجلد مقطع سبق تسجيله، وسلة محذوفات.',
        'اسم تلقائي وبيانات وصفية للملف (العنوان والدقة والترميز والأجهزة).',
        'سجل الجلسة (الإطارات المفقودة والأخطاء).',
        'ملفات تعريف التسجيل وآخر إعداد محفوظ.',
      ] },
      { title: 'الأداء', items: [
        'تحليل الأداء: اختبار حقيقي يخبرك إن كان الـ Mac يتحمّل الإعداد (جيد أو ضيق أو مستحيل)، ويعرض العمليات الثقيلة مع زر لإغلاقها، ويقترح إعدادًا أفضل ويحسب أقصى ما يستطيعه الـ Mac.',
        'معايرة واحدة للكمبيوتر.',
      ] },
    ],
  },
  zh: {
    intro: '适用于 macOS 15 或更高版本的 Mac（macOS 26 上带 Liquid Glass 效果），并配有 iPhone 和 Android 配套应用。',
    groups: [
      { title: '屏幕录制', items: [
        '以原生分辨率录制 Mac 屏幕，包括外接 4K 和 5K 显示器。根据硬件支持最高 120 fps 和 10 位。',
        '显示或隐藏鼠标光标。',
        '视频编码：HEVC 8 位或 10 位（默认）、ProRes 422 和 ProRes 422 HQ。是否使用硬件加速取决于 Mac。',
        '将逐帧的鼠标移动数据导出为单独的 JSON 文件。',
      ] },
      { title: '摄像头', items: [
        '使用 Mac 摄像头、iPhone 或 iPad、USB 网络摄像头、HDMI 采集卡和虚拟摄像头。',
        '应用 LUT 调整画面色彩，可控制强度并设置输入信号。调整效果会显示在预览和录制中。',
        '把你的 iPhone、iPad 或 Android 手机变成 PRISMA 2 的摄像头。通过二维码配对，无需联网，最高支持 8K HEVC。',
        '在应用中控制手机摄像头：变焦、曝光、ISO、快门、开尔文白平衡、对焦、手电筒和 HDR。',
        '使用 False Color 和 focus peaking，在用手机录制时判断曝光和对焦。',
      ] },
      { title: '音频', items: [
        '同时录制麦克风和电脑音频，无需虚拟声卡。',
        '“系统（默认）”：跟随你在 macOS 中选择的麦克风和输出，在那里更改时会一同切换。',
        '分轨：每个音源占文件中的一条轨道。',
        '麦克风上的 Apple Voice Isolation。',
        '实时电平表。',
        '音频格式：24 位 PCM（无损）或 AAC 256 kbps。',
      ] },
      { title: '屏幕工具', items: [
        '在屏幕上绘制：自由绘制、箭头、椭圆、矩形、选择和移动、颜色、撤销、擦除和清除。可调粗细并实时预览笔触，可设置绘制内容消失的时间（fade）和 glow。悬浮工具栏可最小化，并可横向展开。',
        '放大镜：快捷键开关（按住或切换）、圆形或方形、大小、中心和边缘的强度，以及带色差效果的边框。',
        '屏幕按键：显示你按下的按键和快捷键，可设置字体、大小、玻璃或磨砂样式和位置。',
        '每个工具都在顶部栏中，带有用于快捷键和设置的 ⋯ 菜单。',
        '所有内容都会录入视频，绝不会重复出现，应用的悬浮窗口不会进入捕获画面。',
        '状态监视器（fps、CPU、内存、丢帧）不会出现在录制中。',
      ] },
      { title: '项目和文件', items: [
        '项目拥有独立文件夹、带编号的视频和版本，可打开已录制视频所在的文件夹，并有废纸篓。',
        '自动命名和文件元数据（标题、分辨率、编码、设备）。',
        '会话日志（丢帧、错误）。',
        '录制配置文件和上次保存的设置。',
      ] },
      { title: '性能', items: [
        '性能分析：真实测试，告诉你 Mac 能否承受当前设置（正常、吃紧或不可能），列出占用高的进程并提供关闭按钮，建议更合适的设置，并计算 Mac 能达到的最大值。',
        '电脑一次性校准。',
      ] },
    ],
  },
};
