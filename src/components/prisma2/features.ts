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
        'Grave o áudio do computador e o microfone ao mesmo tempo, sem precisar instalar uma placa de áudio virtual.',
        'Grave cada fonte de áudio em uma faixa separada para facilitar a edição.',
        'Ative o Isolamento de Voz da Apple no microfone para reduzir ruídos de fundo.',
        'Acompanhe os níveis de áudio durante a gravação.',
        'Formatos de áudio: PCM de 24 bits, sem compressão com perdas, ou AAC a 256 kbps.',
      ] },
      { title: 'Ferramentas na tela', items: [
        'Desenho e anotações: desenhe à mão livre, adicione setas, elipses e retângulos. Escolha cores e espessura do traço, mova as anotações e desfaça ou apague alterações.',
        'Lupa: amplie uma área da tela durante a gravação.',
        'Teclas e atalhos: mostre na gravação as teclas pressionadas e os atalhos utilizados.',
        'Monitor de desempenho: acompanhe FPS, uso de CPU e RAM e quadros perdidos durante a gravação, sem incluir essas informações no vídeo.',
      ] },
      { title: 'Projetos e arquivos', items: [
        'Projetos com pasta própria, vídeos numerados e versões, abrir a pasta de um vídeo já gravado e lixeira.',
        'Nome automático e metadados do arquivo (título, resolução, codec, dispositivos).',
        'Log de sessão (frames perdidos, erros).',
        'Perfis de gravação e a última configuração salva.',
      ] },
      { title: 'Desempenho', items: [
        'Teste seu Mac antes de gravar: verifique se ele suporta a configuração escolhida, identifique processos que consomem muitos recursos e receba sugestões de ajustes.',
        'O teste indica se a configuração está adequada, próxima do limite ou acima da capacidade do computador.',
        'Faça a calibração inicial do computador para avaliar seu desempenho.',
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
        'Record computer audio and the microphone at the same time, with no need to install a virtual audio device.',
        'Record each audio source on a separate track to make editing easier.',
        'Turn on Apple’s Voice Isolation on the microphone to reduce background noise.',
        'Watch the audio levels while recording.',
        'Audio formats: 24-bit PCM, with no lossy compression, or AAC at 256 kbps.',
      ] },
      { title: 'On-screen tools', items: [
        'Drawing and annotations: draw freehand, add arrows, ellipses and rectangles. Choose colors and stroke thickness, move annotations, and undo or erase changes.',
        'Magnifier: zoom in on an area of the screen while recording.',
        'Keys and shortcuts: show the keys pressed and the shortcuts used in the recording.',
        'Performance monitor: track FPS, CPU and RAM usage and dropped frames during recording, without including this information in the video.',
      ] },
      { title: 'Projects and files', items: [
        'Projects with their own folder, numbered videos and versions, opening the folder of an already recorded video, and a trash.',
        'Automatic file name and metadata (title, resolution, codec, devices).',
        'Session log (dropped frames, errors).',
        'Recording profiles and the last saved setup.',
      ] },
      { title: 'Performance', items: [
        'Test your Mac before recording: check whether it supports the chosen setup, identify processes that use a lot of resources, and get suggestions for adjustments.',
        'The test tells you whether the setup is suitable, close to the limit or beyond what your computer can handle.',
        'Run the initial computer calibration to assess its performance.',
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
        'Graba el audio del ordenador y el micrófono al mismo tiempo, sin necesidad de instalar una tarjeta de audio virtual.',
        'Graba cada fuente de audio en una pista separada para facilitar la edición.',
        'Activa el Aislamiento de voz de Apple en el micrófono para reducir el ruido de fondo.',
        'Sigue los niveles de audio durante la grabación.',
        'Formatos de audio: PCM de 24 bits, sin compresión con pérdida, o AAC a 256 kbps.',
      ] },
      { title: 'Herramientas en pantalla', items: [
        'Dibujo y anotaciones: dibuja a mano alzada, añade flechas, elipses y rectángulos. Elige colores y grosor del trazo, mueve las anotaciones y deshaz o borra cambios.',
        'Lupa: amplía una zona de la pantalla durante la grabación.',
        'Teclas y atajos: muestra en la grabación las teclas pulsadas y los atajos utilizados.',
        'Monitor de rendimiento: sigue los FPS, el uso de CPU y RAM y los fotogramas perdidos durante la grabación, sin incluir esa información en el vídeo.',
      ] },
      { title: 'Proyectos y archivos', items: [
        'Proyectos con carpeta propia, vídeos numerados y versiones, abrir la carpeta de un vídeo ya grabado y papelera.',
        'Nombre automático y metadatos del archivo (título, resolución, códec, dispositivos).',
        'Registro de sesión (fotogramas perdidos, errores).',
        'Perfiles de grabación y la última configuración guardada.',
      ] },
      { title: 'Rendimiento', items: [
        'Prueba tu Mac antes de grabar: comprueba si admite la configuración elegida, identifica los procesos que consumen muchos recursos y recibe sugerencias de ajustes.',
        'La prueba indica si la configuración es adecuada, está cerca del límite o supera la capacidad del ordenador.',
        'Haz la calibración inicial del ordenador para evaluar su rendimiento.',
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
        'Registra l’audio del computer e il microfono contemporaneamente, senza dover installare una scheda audio virtuale.',
        'Registra ogni sorgente audio su una traccia separata per facilitare il montaggio.',
        'Attiva l’Isolamento vocale di Apple sul microfono per ridurre i rumori di fondo.',
        'Tieni sotto controllo i livelli audio durante la registrazione.',
        'Formati audio: PCM a 24 bit, senza compressione con perdita, o AAC a 256 kbps.',
      ] },
      { title: 'Strumenti sullo schermo', items: [
        'Disegno e annotazioni: disegna a mano libera, aggiungi frecce, ellissi e rettangoli. Scegli colori e spessore del tratto, sposta le annotazioni e annulla o cancella le modifiche.',
        'Lente d’ingrandimento: ingrandisci un’area dello schermo durante la registrazione.',
        'Tasti e scorciatoie: mostra nella registrazione i tasti premuti e le scorciatoie usate.',
        'Monitor delle prestazioni: tieni d’occhio FPS, uso di CPU e RAM e fotogrammi persi durante la registrazione, senza includere queste informazioni nel video.',
      ] },
      { title: 'Progetti e file', items: [
        'Progetti con cartella propria, video numerati e versioni, apertura della cartella di un video già registrato e cestino.',
        'Nome automatico e metadati del file (titolo, risoluzione, codec, dispositivi).',
        'Registro di sessione (fotogrammi persi, errori).',
        'Profili di registrazione e ultima configurazione salvata.',
      ] },
      { title: 'Prestazioni', items: [
        'Testa il tuo Mac prima di registrare: verifica se supporta la configurazione scelta, individua i processi che consumano molte risorse e ricevi suggerimenti di regolazione.',
        'Il test indica se la configurazione è adeguata, vicina al limite o oltre la capacità del computer.',
        'Esegui la calibrazione iniziale del computer per valutarne le prestazioni.',
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
        'Enregistrez l’audio de l’ordinateur et le micro en même temps, sans avoir à installer de carte audio virtuelle.',
        'Enregistrez chaque source audio sur une piste séparée pour faciliter le montage.',
        'Activez l’isolation de la voix d’Apple sur le micro pour réduire les bruits de fond.',
        'Suivez les niveaux audio pendant l’enregistrement.',
        'Formats audio : PCM 24 bits, sans compression avec perte, ou AAC à 256 kbit/s.',
      ] },
      { title: 'Outils à l’écran', items: [
        'Dessin et annotations : dessinez à main levée, ajoutez des flèches, des ellipses et des rectangles. Choisissez les couleurs et l’épaisseur du trait, déplacez les annotations et annulez ou effacez les modifications.',
        'Loupe : agrandissez une zone de l’écran pendant l’enregistrement.',
        'Touches et raccourcis : affichez dans l’enregistrement les touches pressées et les raccourcis utilisés.',
        'Moniteur de performances : suivez les ips, l’utilisation du CPU et de la RAM et les images perdues pendant l’enregistrement, sans inclure ces informations dans la vidéo.',
      ] },
      { title: 'Projets et fichiers', items: [
        'Projets avec leur propre dossier, vidéos numérotées et versions, ouverture du dossier d’une vidéo déjà enregistrée et corbeille.',
        'Nom automatique et métadonnées du fichier (titre, résolution, codec, périphériques).',
        'Journal de session (images perdues, erreurs).',
        'Profils d’enregistrement et dernière configuration enregistrée.',
      ] },
      { title: 'Performances', items: [
        'Testez votre Mac avant d’enregistrer : vérifiez s’il prend en charge la configuration choisie, repérez les processus qui consomment beaucoup de ressources et recevez des suggestions de réglages.',
        'Le test indique si la configuration est adaptée, proche de la limite ou au-delà de la capacité de l’ordinateur.',
        'Effectuez le calibrage initial de l’ordinateur pour évaluer ses performances.',
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
        'سجّل صوت الكمبيوتر والميكروفون في وقت واحد، دون الحاجة إلى تثبيت بطاقة صوت افتراضية.',
        'سجّل كل مصدر صوتي في مسار منفصل لتسهيل المونتاج.',
        'فعّل «عزل الصوت» من Apple على الميكروفون لتقليل ضوضاء الخلفية.',
        'تابع مستويات الصوت أثناء التسجيل.',
        'صيغ الصوت: PCM بعمق 24 بت دون ضغط مع فقد، أو AAC بمعدل 256 كيلوبت/ثانية.',
      ] },
      { title: 'أدوات على الشاشة', items: [
        'الرسم والتعليقات التوضيحية: ارسم بيدك الحرة وأضف الأسهم والأشكال البيضاوية والمستطيلات. اختر الألوان وسماكة الخط، وحرّك التعليقات التوضيحية، وتراجع عن التغييرات أو امسحها.',
        'العدسة المكبّرة: كبّر منطقة من الشاشة أثناء التسجيل.',
        'المفاتيح والاختصارات: اعرض في التسجيل المفاتيح التي تضغطها والاختصارات المستخدمة.',
        'مراقب الأداء: تابع الإطارات في الثانية واستخدام المعالج والذاكرة والإطارات المفقودة أثناء التسجيل، دون تضمين هذه المعلومات في الفيديو.',
      ] },
      { title: 'المشاريع والملفات', items: [
        'مشاريع بمجلد خاص ومقاطع مرقّمة ونسخ، وفتح مجلد مقطع سبق تسجيله، وسلة محذوفات.',
        'اسم تلقائي وبيانات وصفية للملف (العنوان والدقة والترميز والأجهزة).',
        'سجل الجلسة (الإطارات المفقودة والأخطاء).',
        'ملفات تعريف التسجيل وآخر إعداد محفوظ.',
      ] },
      { title: 'الأداء', items: [
        'اختبر جهاز Mac قبل التسجيل: تحقق مما إذا كان يدعم الإعداد المختار، وحدّد العمليات التي تستهلك موارد كثيرة، واحصل على اقتراحات للتعديل.',
        'يوضح الاختبار ما إذا كان الإعداد مناسبًا أو قريبًا من الحد أو يتجاوز قدرة الكمبيوتر.',
        'أجرِ المعايرة الأولية للكمبيوتر لتقييم أدائه.',
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
        '同时录制电脑音频和麦克风，无需安装虚拟声卡。',
        '将每个音源录制到单独的轨道，方便剪辑。',
        '在麦克风上启用 Apple 语音隔离，减少背景噪音。',
        '录制时实时查看音频电平。',
        '音频格式：24 位 PCM（无有损压缩）或 AAC 256 kbps。',
      ] },
      { title: '屏幕工具', items: [
        '绘图和标注：可自由手绘，添加箭头、椭圆和矩形。可选择颜色和线条粗细，移动标注，并撤销或擦除修改。',
        '放大镜：录制时放大屏幕的某个区域。',
        '按键和快捷键：在录制中显示按下的按键和使用的快捷键。',
        '性能监视器：录制时查看 FPS、CPU 和内存占用以及丢帧情况，这些信息不会包含在视频中。',
      ] },
      { title: '项目和文件', items: [
        '项目拥有独立文件夹、带编号的视频和版本，可打开已录制视频所在的文件夹，并有废纸篓。',
        '自动命名和文件元数据（标题、分辨率、编码、设备）。',
        '会话日志（丢帧、错误）。',
        '录制配置文件和上次保存的设置。',
      ] },
      { title: '性能', items: [
        '录制前先测试你的 Mac：检查它是否支持所选设置，找出占用大量资源的进程，并获得调整建议。',
        '测试会告诉你设置是否合适、接近极限，还是超出了电脑的能力。',
        '进行电脑初次校准，以评估其性能。',
      ] },
    ],
  },
};
