'use client';

import {
  EditorialQuote,
  EditorialSection,
  TwoColumnText,
} from './EditorialLayout';
import ChromaSubsamplingDemo from './ChromaSubsamplingDemo';

const gradientImage =
  'https://images.squarespace-cdn.com/content/v1/6885e4cc114bc647662424fb/58b71d0b-94fe-4493-9486-71b0e7034cd6/8b%2Bvs%2B10b.png?format=1500w';
const gradingImage =
  'https://noamkroll.com/wp-content/uploads/2015/05/Skintone-Color-Grading.jpg';
const cameraImage =
  'https://www.filmtools.com/media/catalog/product/1/7/1712933734_1823585.jpg';

const cameraGroups = [
  {
    depth: '1. Câmeras com gravação interna em 8-bit',
    note: 'Modelos cujo vídeo interno convencional tem como limite 8-bit, sem considerar eventuais fluxos externos de gravação.',
    rows: [
      ['Sony', 'α7 II, α7 III, α7R II, α7R III, α7R IV, α7S II, α7C original, α6400, α6500, α6600, α6300, α6000, α9, α9 II, ZV-E10 original, ZV-1 original, RX100 V, RX100 VI, RX100 VII'],
      ['Canon', 'EOS R, EOS RP, EOS M50, EOS M50 Mark II, EOS 5D Mark III, EOS 5D Mark IV, EOS 6D Mark II, EOS 80D, EOS 90D, EOS 7D Mark II, EOS 200D, EOS 250D'],
      ['Nikon', 'D750, D850, D500, D7500, Z5 original, Z6, Z6 II, Z7, Z7 II, Z50, Z fc'],
      ['Panasonic', 'LUMIX GH4, G7, G85/G80, GX85/GX80'],
      ['Fujifilm', 'X-T2, X-T30 original, X-S10, X-T200'],
      ['Canon Cinema EOS', 'C100, C100 Mark II, C300 original'],
    ],
  },
  {
    depth: '2. Câmeras com gravação interna em 10-bit',
    note: 'Inclui modelos cujo formato interno convencional mais avançado é 10-bit, sem considerar eventuais gravações RAW de 12-bit ou 16-bit.',
    rows: [
      ['Sony Alpha', 'α7 IV, α7S III, α7R V, α1, α1 II, α7C II, α6700'],
      ['Sony Cinema Line', 'FX3, FX30, FX6, FX9'],
      ['Sony ZV', 'ZV-E1, ZV-E10 II'],
      ['Canon EOS', 'EOS R6 Mark II, EOS R7, EOS R8'],
      ['Canon Cinema EOS', 'C70, C300 Mark II'],
      ['Nikon', 'Zf'],
      ['Panasonic LUMIX', 'GH5, GH5S, GH6, S1, S1H, S5, S5 II, S5 IIX, S9, G9 II, BGH1, BS1H'],
      ['Fujifilm X Series', 'X-T3, X-T4, X-T5, X-H2, X-H2S, X-S20, X-M5, X-T50'],
      ['Fujifilm GFX', 'GFX100 II'],
      ['GoPro', 'HERO11 Black, HERO12 Black, HERO13 Black'],
      ['DJI', 'Osmo Pocket 3, Osmo Action 4, Osmo Action 5 Pro'],
    ],
  },
  {
    depth: '3. Câmeras com gravação interna em 12-bit',
    note: 'Nesta categoria predominam sistemas que oferecem gravação RAW, com maior liberdade para interpretar a imagem na pós-produção.',
    rows: [
      ['Blackmagic Design', 'Pocket Cinema Camera 4K, 6K, 6K G2 e 6K Pro', 'Blackmagic RAW'],
      ['Blackmagic Design', 'Cinema Camera 6K Full Frame', 'Blackmagic RAW'],
      ['Blackmagic Design', 'PYXIS 6K e PYXIS 12K', 'Blackmagic RAW'],
      ['Blackmagic Design', 'URSA Mini Pro 4.6K G2, URSA Mini Pro 12K, URSA Broadcast G2', 'Blackmagic RAW'],
      ['Blackmagic Design', 'URSA Cine 12K LF, URSA Cine 17K 65', 'Blackmagic RAW'],
      ['Canon EOS', 'EOS R5, EOS R5 C', 'RAW interno, conforme modelo e modo'],
      ['Canon Cinema EOS', 'C200, C300 Mark III, C500 Mark II, C400', 'Cinema RAW Light'],
      ['Nikon', 'Z6 III, Z8, Z9, ZR', 'N-RAW ou outros formatos RAW compatíveis'],
      ['Panasonic LUMIX', 'GH7', 'Apple ProRes RAW HQ interno'],
      ['ARRI', 'ALEXA Classic, ALEXA XT, ALEXA Mini, ALEXA LF, ALEXA Mini LF, ALEXA 65', 'ARRIRAW de 12-bit, conforme sistema e modo'],
    ],
  },
  {
    depth: '4. Câmeras com gravação em 16-bit',
    note: 'Sistemas que permitem registrar material RAW de 16-bit, internamente ou por meio de um módulo de gravação compatível.',
    rows: [
      ['Sony Cinema Line', 'FX5', 'X-OCN interno'],
      ['Sony CineAlta', 'BURANO', 'X-OCN LT interno'],
      ['Sony CineAlta', 'VENICE 2', 'X-OCN interno'],
      ['Sony CineAlta', 'VENICE original', 'X-OCN ou RAW com gravador AXS-R7 externo'],
      ['RED Digital Cinema', 'KOMODO, KOMODO-X, V-RAPTOR, V-RAPTOR X, V-RAPTOR XL, RANGER e linhas compatíveis', 'REDCODE RAW (R3D)'],
      ['DJI', 'Ronin 4D com Zenmuse X9-6K ou X9-8K', 'Apple ProRes RAW ou ProRes RAW HQ, conforme modo'],
    ],
  },
];

function CameraDepthList({ group }: { group: (typeof cameraGroups)[number] }) {
  const hasFormat = group.rows.some((row) => row.length > 2);
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200">
      <div className="bg-[#f5f5f7] p-5">
        <h4 className="font-sans text-lg font-bold text-neutral-900">{group.depth}</h4>
        <p className="mt-1 font-serif text-sm text-neutral-700">{group.note}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left font-serif text-sm text-neutral-800">
          <thead className="bg-neutral-100 font-sans text-xs uppercase tracking-wide text-neutral-600">
            <tr><th className="px-4 py-3">Fabricante</th><th className="px-4 py-3">Modelos</th>{hasFormat && <th className="px-4 py-3">Formato de referência</th>}</tr>
          </thead>
          <tbody>
            {group.rows.map((row) => <tr className="border-t border-neutral-200 align-top" key={`${row[0]}-${row[1]}`}>
              <th className="whitespace-nowrap px-4 py-3 font-sans font-semibold text-neutral-900">{row[0]}</th>
              <td className="px-4 py-3 leading-relaxed">{row[1]}</td>
              {hasFormat && <td className="px-4 py-3 leading-relaxed">{row[2] || '—'}</td>}
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ArticleImage({ src, alt, caption, source }: { src: string; alt: string; caption: string; source: string }) {
  return (
    <figure className="my-7 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      {/* Imagens externas permanecem hospedadas na página de origem e recebem crédito abaixo. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" className="block max-h-[560px] w-full object-contain" />
      <figcaption className="flex flex-wrap justify-between gap-x-3 gap-y-1 px-4 py-3 font-sans text-xs text-neutral-600">
        <span>{caption}</span>
        <a href={source} target="_blank" rel="noreferrer" className="text-[#0071e3] hover:underline">Fonte da imagem</a>
      </figcaption>
    </figure>
  );
}

function BitDepthCard({ depth, children }: { depth: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
      <h4 className="font-sans text-lg font-bold text-neutral-900">{depth}</h4>
      <div className="space-y-3 font-serif text-[15px] leading-[1.65] text-neutral-800 [&_p]:text-justify">
        {children}
      </div>
    </section>
  );
}

function KeyPoints({ advantages, limitations, usage }: { advantages: string; limitations: string; usage: string }) {
  return (
    <div className="space-y-2 border-t border-neutral-200 pt-3 font-serif text-sm leading-relaxed text-neutral-700">
      <p><strong className="font-sans text-neutral-900">Vantagens:</strong> {advantages}</p>
      <p><strong className="font-sans text-neutral-900">Desvantagens:</strong> {limitations}</p>
      <p><strong className="font-sans text-neutral-900">Quando escolher:</strong> {usage}</p>
    </div>
  );
}

export default function AnaliseTecnicaArticle() {
  return (
    <article className="relative w-full space-y-10 font-serif leading-relaxed text-[#111111]">
      <EditorialSection kickerLeft="FUNDAMENTOS · ANÁLISE TÉCNICA" kickerRight="PRECISÃO DO SINAL" title="PROFUNDIDADE DE BITS" subtitle="8, 10, 12 E 16-BIT NA IMAGEM CINEMATOGRÁFICA">
        <div className="space-y-5">
          <h4 className="font-sans text-xl font-bold text-neutral-900">O que significa profundidade de bits?</h4>
        <TwoColumnText
          left={<><p>Quando uma câmera grava em 8, 10, 12 ou 16 bits, esse número indica quantos níveis digitais podem representar cada amostra do sinal. O sensor capta luz, e a câmera converte essas informações em valores numéricos que, depois do processamento, formam a imagem.</p><p>Imagine um degradê do preto ao branco. Com poucos valores disponíveis, transições suaves podem aparecer como saltos entre tons. Com mais valores, o sinal descreve essas transições com maior precisão.</p></>}
          right={<><p>A profundidade de bits importa especialmente quando o material será submetido a correção de cor, criação de looks, composição de efeitos visuais ou outras operações intensas. Ela define a precisão numérica da representação; não descreve, sozinha, a qualidade total da imagem.</p><EditorialQuote quote="Mais níveis oferecem mais precisão para trabalhar o sinal captado, mas não recuperam informação que nunca foi registrada." /></>}
        />
        <ArticleImage src={gradientImage} alt="Comparação visual entre degradês de 8-bit e 10-bit" caption="Representação ilustrativa de faixas tonais e banding." source="https://jusha.com.au/knowledge-base/8-bit-vs-10-bit-color-depth" />
        </div>

        <div className="space-y-5 border-t border-neutral-200 pt-7">
        <h4 className="font-sans text-xl font-bold text-neutral-900">Quantos níveis cada profundidade oferece?</h4>
        <p className="font-serif text-[16px] text-neutral-800 sm:text-[17px]">A quantidade de valores possíveis por amostra é calculada por 2ⁿ, em que <em>n</em> representa a profundidade de bits. A tabela considera três canais RGB independentes com o mesmo número de níveis; as combinações são uma referência matemática, não uma contagem de cores que o olho necessariamente distingue.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['8 bits', '256 por canal', '≈ 16,7 milhões de combinações RGB'],
            ['10 bits', '1.024 por canal', '≈ 1,07 bilhão de combinações RGB'],
            ['12 bits', '4.096 por canal', '≈ 68,7 bilhões de combinações RGB'],
            ['16 bits', '65.536 por canal', '≈ 281 trilhões de combinações RGB'],
          ].map(([depth, levels, colors]) => <div key={depth} className="rounded-2xl border border-neutral-200 bg-[#f5f5f7] p-5"><span className="font-sans text-2xl font-black text-[#0071e3]">{depth}</span><p className="mt-2 font-sans text-sm font-semibold text-neutral-900">{levels}</p><p className="mt-1 font-serif text-sm text-neutral-600">{colors}</p></div>)}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <BitDepthCard depth="8 bits · 256 níveis por canal">
            <p>Em RGB de faixa completa, cada canal usa códigos de 0 a 255: são cerca de 16,7 milhões de combinações. É uma opção eficiente e compatível, suficiente quando a imagem é bem captada, já está próxima do resultado desejado e receberá poucos ajustes.</p>
            <h5 className="font-sans text-sm font-bold text-neutral-900">Na pós-produção</h5>
            <p>Há menos precisão para sustentar mudanças fortes. Ajustes intensos de curvas, exposição ou saturação — especialmente ao recuperar contraste de uma imagem gravada em perfil Log — podem revelar <em>banding</em>: faixas visíveis em degradês de céu, paredes e sombras.</p>
            <p>Funciona bem para entregas rápidas e fluxos simples. Para correções de cor intensas, recuperação de exposição ou combinação de câmeras, exige mais cuidado na captação; 10 bits oferecem uma base mais robusta. Compressão, ruído e subamostragem de cor também afetam o resultado.</p>
          </BitDepthCard>
          <BitDepthCard depth="10 bits · 1.024 níveis por canal">
            <p>Cada canal tem quatro vezes mais códigos que em 8-bit, ou cerca de 1,07 bilhão de combinações RGB. A precisão extra ajuda a preservar transições de cor e luminosidade em degradês, tons de pele e sombras.</p>
            <h5 className="font-sans text-sm font-bold text-neutral-900">Na pós-produção</h5>
            <p>Suporta melhor ajustes de curvas, contraste, saturação e seleções de cor, com menor risco de revelar faixas tonais. É especialmente útil em HDR e para manter a consistência entre planos e câmeras; não elimina o <em>banding</em> nem corrige uma exposição ruim.</p>
            <p>É um equilíbrio entre flexibilidade e praticidade para publicidade, documentários e outras produções profissionais. O impacto no armazenamento e no processamento varia conforme o codec, a compressão, a resolução e a taxa de quadros — os arquivos não ficam necessariamente quatro vezes maiores que os de 8 bits.</p>
            <p className="text-sm text-neutral-600">Gravar em 10 bits não aumenta a faixa dinâmica. Já 4:2:0 e 4:2:2 indicam como a cor é amostrada, uma característica diferente da profundidade de bits.</p>
          </BitDepthCard>
          <BitDepthCard depth="12 bits · 4.096 níveis por canal">
            <p>São quatro vezes mais códigos que em 10-bit e dezesseis vezes mais que em 8-bit (cerca de 68,7 bilhões de combinações RGB teóricas). É comum em formatos RAW cinematográficos, como Blackmagic RAW e ARRIRAW.</p>
            <h5 className="font-sans text-sm font-bold text-neutral-900">O que muda no RAW</h5>
            <p>Em um arquivo RAW de sensor Bayer, cada ponto do sensor registra luz filtrada em vermelho, verde ou azul, em vez de uma cor RGB completa. O software combina essas amostras para formar a imagem colorida. Conforme a câmera e o formato, também é possível ajustar com mais liberdade o balanço de branco e a interpretação da imagem.</p>
            <p>Essa precisão favorece correções de cor intensas, efeitos visuais e continuidade entre planos. Porém, arquivos RAW exigem programas compatíveis, mais armazenamento e capacidade de processamento. 12 bits não equivalem a 12 pontos de latitude: sensor, ruído, exposição e compressão continuam determinantes.</p>
            <p className="text-sm text-neutral-600">Vale para projetos que realmente precisam dessa liberdade; para pouca manipulação, 10-bit pode entregar ótima qualidade com um fluxo mais simples.</p>
          </BitDepthCard>
          <BitDepthCard depth="16 bits · 65.536 níveis por canal">
            <p>Uma imagem RGB de 16 bits permite cerca de 281 trilhões de combinações teóricas. Essa profundidade está presente em fluxos RAW de cinema como o X-OCN da Sony, que registra dados em 16 bits lineares e comprimidos.</p>
            <h5 className="font-sans text-sm font-bold text-neutral-900">Precisão e fluxo de trabalho</h5>
            <p>A alta precisão numérica ajuda em transformações complexas, HDR, efeitos visuais e ajustes finos de materiais, altas luzes e degradês. A distribuição dos códigos também importa: 16 bits lineares e 12 bits Log não podem ser comparados apenas pela quantidade de níveis.</p>
            <p>Arquivos RAW exigem programas compatíveis, capacidade de processamento e planejamento de armazenamento. 16 bits não garantem mais nitidez, resolução ou latitude que 12 bits nem recuperam informações perdidas por estouro de luz ou ruído. Essa margem é útil quando a produção precisa dela; nos demais casos, 10 ou 12 bits podem ser mais práticos.</p>
          </BitDepthCard>
        </div>
        </div>

        <div className="space-y-5 border-t border-neutral-200 pt-7">
        <h4 className="font-sans text-xl font-bold text-neutral-900">O que muda na correção de cor?</h4>
        <TwoColumnText
          left={<><p>A profundidade de bits influencia como o material suporta ajustes. Imagine um fundo cinza com iluminação suave. Ao alterar exposição e contraste, o colorista redistribui os valores dessa transição. Se a origem tem pouca precisão, o ajuste pode tornar degraus tonais ou outros artefatos mais visíveis.</p><p>O mesmo princípio aparece no uso de curvas, qualifiers, máscaras, janelas, ajustes seletivos de saturação e criação de looks.</p></>}
          right={<><p>Isso não quer dizer que um arquivo de 10 ou 12-bit sempre terá melhor aparência que um arquivo de 8-bit. Exposição incorreta, altas luzes estouradas, sombras tomadas por ruído e compressão agressiva podem comprometer o material em qualquer profundidade.</p><p>Um software pode calcular internamente com precisão de ponto flutuante, como 32-bit float, mas isso não transforma uma captura original de 8-bit em uma captura de 32-bit: os cálculos não recuperam informação que não foi registrada.</p></>}
        />
        <ArticleImage src={gradingImage} alt="Comparação de pele antes e depois da correção de cor no DaVinci Resolve" caption="Exemplo de tratamento de tons de pele com qualifier e power windows." source="https://noamkroll.com/how-to-match-skintones-perfectly-using-qualifiers-power-windows-in-davinci-resolve/" />
        </div>
      </EditorialSection>

      <EditorialSection kickerLeft="CÂMERAS E FORMATOS" kickerRight="A CAPTURA DEFINE O SINAL" title="QUAIS CÂMERAS GRAVAM EM CADA PROFUNDIDADE?" subtitle="A MESMA CÂMERA PODE OFERECER FORMATOS DIFERENTES">
        <p className="font-serif text-[16px] text-neutral-800 sm:text-[17px]">Os exemplos abaixo ilustram possibilidades de gravação. A profundidade efetiva depende do modo, resolução, taxa de quadros e formato escolhidos; confirme sempre as especificações do modo de gravação usado.</p>
        <ArticleImage src={cameraImage} alt="Câmera de cinema Blackmagic Design PYXIS 6K com montagem Canon EF" caption="Blackmagic Design PYXIS 6K Cinema Box, Canon EF." source="https://www.filmtools.com/blackmagic-design-pyxis-6k-cinema-box-camera-canon-ef.html" />
        <div className="space-y-5">
          {cameraGroups.map((group) => <CameraDepthList key={group.depth} group={group} />)}
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-[#f5f5f7] p-5 sm:p-6">
          <h4 className="font-sans text-lg font-bold text-neutral-900">Observações sobre formatos e modos</h4>
          <ul className="mt-3 list-disc space-y-2 pl-5 font-serif text-sm leading-relaxed text-neutral-800">
            <li>A disponibilidade de 10-bit varia conforme codec e modo. A Sony α7 IV oferece 10-bit 4:2:2 nos modos XAVC compatíveis; a Fujifilm X-H2S também oferece opções de 8-bit e 10-bit.</li>
            <li>A Panasonic GH5 passou a oferecer gravação interna 4:2:2 de 10-bit por atualização de firmware.</li>
            <li>Blackmagic RAW usa codificação não linear de 12-bit. Nikon Z8 e Z9 oferecem gravação interna em 12-bit N-RAW e ProRes RAW HQ; a Canon EOS R5 C oferece Cinema RAW Light de 12-bit, além de vídeo comprimido em 10-bit e 8-bit.</li>
          </ul>
          <p className="mt-4 font-serif text-sm leading-relaxed text-neutral-800"><strong>ARRI ALEXA 35:</strong> seu ARRIRAW é de 13-bit, não deve ser classificado como 12-bit. A ARRI diferencia os dados RAW de 12-bit dos sensores ALEV3 e os dados de 13-bit da ALEXA 35.</p>
          <h4 className="mt-5 font-sans text-base font-bold text-neutral-900">ARRI ALEXA e AMIRA por profundidade</h4>
          <ul className="mt-2 list-disc space-y-2 pl-5 font-serif text-sm leading-relaxed text-neutral-800">
            <li><strong>8-bit:</strong> AMIRA em MPEG-2 HD 422, nos modos compatíveis.</li>
            <li><strong>10-bit:</strong> ALEXA Classic, XT, SXT, Mini, LF, Mini LF e ALEXA 35 em Apple ProRes 422 ou 422 HQ, conforme modelo e modo; AMIRA em ProRes 422, 422 LT e 422 HQ.</li>
            <li><strong>12-bit:</strong> ALEXA Classic, XT, SXT, Mini, LF e Mini LF em ARRIRAW e ProRes 4444/4444 XQ, conforme modelo e configuração; AMIRA em ProRes 4444/4444 XQ e ARRIRAW nos sistemas compatíveis.</li>
            <li><strong>13-bit:</strong> ALEXA 35 em ARRIRAW.</li>
            <li><strong>16-bit:</strong> não é a classificação dos arquivos ARRIRAW das ALEXA e AMIRA tradicionais. A ARRI processa dados em 16-bit linear em determinadas etapas, mas grava esses ARRIRAW em 12-bit Log; a ALEXA 35 grava ARRIRAW em 13-bit Log.</li>
          </ul>
        </div>
        <p className="font-sans text-xs leading-relaxed text-neutral-600">Especificações oficiais: <a className="text-[#0071e3] hover:underline" href="https://www.sony.com/electronics/support/e-mount-body-ilce-7-series/ilce-7cl/specifications" target="_blank" rel="noreferrer">Sony α7C</a> · <a className="text-[#0071e3] hover:underline" href="https://www.sony.com/electronics/support/camcorders-and-video-cameras-interchangeable-lens-camcorders/ilme-fx3/specifications" target="_blank" rel="noreferrer">Sony FX3</a> · <a className="text-[#0071e3] hover:underline" href="https://www.panasonic.com/content/dam/Panasonic/MEA/pdf-download/cameras-camcorders/DC-GH5.pdf" target="_blank" rel="noreferrer">Panasonic GH5</a> · <a className="text-[#0071e3] hover:underline" href="https://www.blackmagicdesign.com/br/products/blackmagicpocketcinemacamera/techspecs/W-CIN-12" target="_blank" rel="noreferrer">Blackmagic 6K Pro</a> · <a className="text-[#0071e3] hover:underline" href="https://www.usa.canon.com/shop/p/eos-c70" target="_blank" rel="noreferrer">Canon C70</a> · <a className="text-[#0071e3] hover:underline" href="https://pro.sony/bp_BR/products/digital-cinema-cameras/venice2" target="_blank" rel="noreferrer">Sony VENICE 2</a>.</p>
      </EditorialSection>

      <EditorialSection kickerLeft="CONCEITOS RELACIONADOS" kickerRight="LEITURA DO MATERIAL" title="BITS NÃO SÃO LATITUDE" subtitle="PROFUNDIDADE, FAIXA DINÂMICA E EXPOSIÇÃO SÃO CONCEITOS DIFERENTES">
        <TwoColumnText
          left={<><h4 className="font-sans text-lg font-bold text-neutral-900">Profundidade de bits</h4><p>Indica quantos valores digitais estão disponíveis para representar cada amostra. A faixa dinâmica descreve a extensão entre os níveis de sinal mais baixos e mais altos que o sistema registra, de acordo com critérios definidos.</p></>}
          right={<><h4 className="font-sans text-lg font-bold text-neutral-900">Latitude de exposição</h4><p>É a margem que o material oferece para ajustes de exposição, especialmente nas altas luzes e nas sombras. Uma câmera pode gravar em 12-bit e ter menos faixa dinâmica que outra que grava em 10-bit, por diferenças de sensor, ruído, saturação, leitura e processamento.</p></>}
        />
        <EditorialQuote quote="Um bit adicional dobra os códigos disponíveis; não equivale automaticamente a um ponto de latitude." />
        <p className="font-serif text-[16px] text-neutral-800 sm:text-[17px]">12-bit pode representar com mais precisão a informação captada, mas não cria detalhes depois que o sensor saturou nem transforma sombras dominadas por ruído em informação limpa.</p>
      </EditorialSection>

      <EditorialSection kickerLeft="ESPECIFICAÇÕES DE VÍDEO" kickerRight="AMOSTRAGEM DE COR" title="CHROMA SUBSAMPLING" subtitle="4:4:4, 4:2:2 E 4:2:0">
        <p className="font-serif text-[16px] text-neutral-800 sm:text-[17px]">Chroma subsampling, ou subamostragem de crominância, reduz a resolução espacial da informação de cor para diminuir a quantidade de dados do vídeo. A luminância — relacionada à estrutura de brilho e detalhes — permanece em resolução completa. Como o olho percebe melhor pequenos detalhes de brilho do que de cor, essa redução costuma ser discreta em cenas comuns.</p>
        <p className="font-serif text-[16px] text-neutral-800 sm:text-[17px]">A notação descreve a quantidade de amostras de crominância em relação à luminância dentro de uma área de referência. Ela não indica profundidade de bits, resolução total da câmera ou taxa de bits.</p>

        <ChromaSubsamplingDemo />

        <div className="space-y-3 font-serif text-[16px] leading-relaxed text-neutral-800 [&_p]:text-justify">
          <h4 className="font-sans text-lg font-bold text-neutral-900">Impacto na correção de cor</h4>
          <p>Menos amostras de cor podem limitar seleções próximas às bordas e tornar mais trabalhosos o chroma key, a composição e os ajustes seletivos intensos. Em cenas comuns e com correções moderadas, 4:2:0 ainda pode oferecer ótimo resultado; a diferença depende da imagem e do tratamento.</p>
          <p>4:4:4 preserva mais informação cromática para trabalhos exigentes, mas pode demandar mais armazenamento e processamento. 4:2:2 oferece um meio-termo usado em muitos fluxos profissionais. Subamostragem, sozinha, não determina a qualidade: codec, compressão, exposição e profundidade de bits também contam.</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-[#f5f5f7] p-5 sm:p-6">
          <h4 className="font-sans text-lg font-bold text-neutral-900">Subamostragem não é profundidade de bits</h4>
          <p className="mt-2 font-serif text-[16px] leading-relaxed text-neutral-800">Profundidade de bits define quantos valores digitais cada amostra pode representar; subamostragem define quantas amostras de cor são registradas e onde. Assim, 10 bits 4:2:0 têm maior precisão numérica por amostra que 8 bits 4:2:2, mas menos resolução espacial de cor. Um formato não é sempre superior: depende do uso, do codec e da captação.</p>
          <p className="mt-3 font-serif text-[16px] leading-relaxed text-neutral-800">Para muitos trabalhos de direção de fotografia e correção de cor, 10 bits 4:2:2 combinam boa precisão tonal com mais informação cromática que 4:2:0. Projetos com composição complexa podem se beneficiar de 4:4:4. RAW de sensor Bayer não deve ser chamado automaticamente de 4:4:4: seus dados têm outra organização e precisam ser convertidos em imagem colorida.</p>
        </div>
      </EditorialSection>

      <EditorialSection kickerLeft="TELAS · SINAL · PROCESSAMENTO" kickerRight="REPRODUÇÃO DE IMAGEM" title="PROFUNDIDADE DE BITS NOS DISPOSITIVOS DE VISUALIZAÇÃO" subtitle="PAINEL, SINAL RECEBIDO E PROCESSAMENTO INTERNO">
        <TwoColumnText
          left={<><p>Monitores, televisores e celulares recebem um sinal de imagem, processam suas informações e as transformam em luz por meio dos pixels da tela. Nesse contexto, a profundidade de bits determina a precisão potencial para reproduzir gradações de cor e luminosidade.</p><p>Uma tela não tem necessariamente uma única profundidade de bits. É preciso considerar o sinal recebido, o processamento interno e a capacidade do painel de reproduzir as gradações. São aspectos relacionados, mas diferentes.</p></>}
          right={<><p>Um monitor pode receber um sinal de 10 bits, fazer cálculos internos em 14 ou 16 bits e usar um painel nativo de 8 bits por componente. O processamento pode melhorar as conversões, mas não transforma o painel em um painel nativo de 16 bits.</p><p>Essa distinção é essencial para avaliar uma tela de edição, correção de cor e color grading.</p></>}
        />

        <div className="space-y-4">
          <h4 className="font-sans text-xl font-bold text-neutral-900">O que significam 8, 10 e 12 bits em uma tela?</h4>
          <p className="font-serif text-[16px] text-neutral-800 sm:text-[17px]">Em RGB, cada pixel é formado pelos componentes vermelho, verde e azul. A profundidade por componente determina quantos códigos digitais representam cada um.</p>
          <div className="overflow-x-auto rounded-2xl border border-neutral-200">
            <table className="w-full min-w-[520px] border-collapse text-left font-serif text-sm text-neutral-800">
              <thead className="bg-neutral-100 font-sans text-xs uppercase tracking-wide text-neutral-600"><tr><th className="px-4 py-3">Bits por componente RGB</th><th className="px-4 py-3">Códigos por componente</th><th className="px-4 py-3">Combinações RGB teóricas</th></tr></thead>
              <tbody>{[['8 bits', '256', '16,7 milhões'], ['10 bits', '1.024', '1,07 bilhão'], ['12 bits', '4.096', '68,7 bilhões']].map(([depth, levels, colors]) => <tr key={depth} className="border-t border-neutral-200"><th className="px-4 py-3 font-sans font-semibold text-neutral-900">{depth}</th><td className="px-4 py-3">{levels}</td><td className="px-4 py-3">{colors}</td></tr>)}</tbody>
            </table>
          </div>
          <p className="font-serif text-sm leading-relaxed text-neutral-700">São combinações matemáticas; isso não garante que a tela consiga reproduzir fisicamente todas elas. Também não confunda bits por componente com bits por pixel: RGB de 8 bits por componente usa 24 bits por pixel; em 10 bits por componente, são 30 bits por pixel.</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-[#f5f5f7] p-5 sm:p-6">
          <h4 className="font-sans text-lg font-bold text-neutral-900">Então, o que significa “32-bit color”?</h4>
          <p className="mt-2 font-serif text-[16px] leading-relaxed text-neutral-800">A expressão costuma aparecer nas configurações do computador e não significa, necessariamente, que o monitor reproduza 32 bits para cada componente. Em uma representação convencional de 32 bits por pixel, são usados 8 bits para cada componente RGB e mais 8 bits para transparência (canal alfa) ou preenchimento. A imagem continua com 256 códigos por componente, cerca de 16,7 milhões de combinações.</p>
          <p className="mt-3 font-serif text-[16px] leading-relaxed text-neutral-800">Há outros formatos de 32 bits por pixel, inclusive alguns com 10 bits por componente RGB e 2 bits para alfa. Por isso, o número total de bits por pixel não revela, sozinho, a profundidade do sinal nem a capacidade do painel. Consulte as especificações do modelo.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <BitDepthCard depth="Painel de 8 bits · 256 níveis">
            <p>É suficiente para muitas tarefas, de navegação e entretenimento à edição convencional. Em degradês, sombras e fundos uniformes, pode deixar faixas visíveis entre tons próximos: o chamado <em>banding</em>.</p>
            <p>O resultado também depende do sinal, do processamento, da calibração e das condições de visualização. Um bom painel de 8 bits pode ser muito consistente e atender bem a vídeos, navegação e edições sem controle rigoroso das gradações.</p>
          </BitDepthCard>
          <BitDepthCard depth="Painel de 10 bits · 1.024 níveis">
            <p>Oferece quatro vezes mais códigos por componente que 8 bits. Pode reproduzir degradês, sombras e transições de cor com maior precisão, algo útil para avaliar materiais de 10 bits e imagens HDR.</p>
            <p>Para enxergar essa diferença, o sinal, o sistema de reprodução e o monitor precisam estar configurados para trabalhar em 10 bits. O painel não recria gradações que já faltam na imagem.</p>
          </BitDepthCard>
          <BitDepthCard depth="8 bits + FRC">
            <p>O <em>Frame Rate Control</em> alterna rapidamente entre níveis próximos para simular gradações intermediárias. Pode se aproximar visualmente de 10 bits, mas não é igual a um painel nativo de 10 bits; a qualidade depende da implementação.</p>
            <p>Ao avaliar uma tela, verifique se “10 bits” significa painel nativo ou 8 bits + FRC.</p>
          </BitDepthCard>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-[#f5f5f7] p-5 sm:p-6">
          <h4 className="font-sans text-lg font-bold text-neutral-900">Processamento interno de 10, 12, 14 ou 16 bits</h4>
          <p className="mt-2 font-serif text-[16px] leading-relaxed text-neutral-800">O monitor pode fazer cálculos internos com mais precisão do que a profundidade nativa do painel. LUTs (<em>Look-Up Tables</em>) e outros cálculos ajudam a converter gama, ajustar o ponto de branco, corrigir a uniformidade e construir curvas de reprodução. Mais precisão reduz erros de arredondamento nessas operações.</p>
          <p className="mt-3 font-serif text-[16px] leading-relaxed text-neutral-800">Uma LUT de 16 bits, por exemplo, pode calcular correções para um painel nativo de 10 bits. Ela melhora a precisão dos cálculos, mas não transforma o painel em uma tela de 16 bits nem recupera informação ausente no sinal.</p>
        </div>

        <div className="space-y-4">
          <h4 className="font-sans text-xl font-bold text-neutral-900">Como funciona a cadeia de exibição?</h4>
          <p className="font-serif text-[16px] text-neutral-800 sm:text-[17px]">Para preservar a imagem, as etapas precisam ser compatíveis:</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['1. Fonte', 'Arquivo ou sinal original em 8, 10, 12 bits ou outra profundidade do formato.'],
              ['2. Sistema', 'Computador, placa gráfica ou reprodutor processa e envia o sinal.'],
              ['3. Conexão', 'HDMI, DisplayPort, SDI e outras interfaces têm modos e limites próprios.'],
              ['4. Processamento', 'A tela converte o sinal, aplica correções e prepara os valores.'],
              ['5. Painel', 'Os pixels reproduzem a imagem conforme a capacidade física da tela.'],
            ].map(([step, description]) => <div key={step} className="rounded-2xl border border-neutral-200 bg-white p-4"><h5 className="font-sans text-sm font-bold text-neutral-900">{step}</h5><p className="mt-2 font-serif text-sm leading-relaxed text-neutral-700">{description}</p></div>)}
          </div>
          <p className="font-serif text-sm leading-relaxed text-neutral-700">Se uma etapa reduzir a precisão, um painel de 10 bits não garante que todas as gradações originais serão preservadas. O processamento interno pode melhorar conversões, mas não recuperar informação perdida antes.</p>
        </div>

        <TwoColumnText
          left={<><h4 className="font-sans text-lg font-bold text-neutral-900">Televisores e celulares</h4><p>HDR10 usa sinal de vídeo de 10 bits, mas a compatibilidade com esse padrão não garante painel nativo de 10 bits nem reprodução HDR de alta qualidade. Brilho, contraste, nível de preto e processamento também influenciam o resultado.</p><p>Nos celulares, a indicação “1 bilhão de cores” não informa, sozinha, se o painel é nativo de 10 bits ou usa 8 bits + FRC. É preciso consultar a documentação do modelo.</p></>}
          right={<><h4 className="font-sans text-lg font-bold text-neutral-900">O que avaliar para correção de cor</h4><p>Verifique a profundidade nativa do painel, o uso de FRC, a compatibilidade com o sinal e a precisão do processamento. Considere também calibração, uniformidade, gerenciamento e gama de cores, além da reprodução de sombras e altas luzes.</p><p>Profundidade de bits e gama de cores são características diferentes. Uma tela pode cobrir um espaço amplo, como DCI-P3, e ainda ter limitações na quantidade de gradações reproduzidas.</p></>}
        />
        <EditorialQuote quote="O número exibido pelo sistema, a precisão do processamento interno e a capacidade nativa do painel descrevem coisas diferentes." />
      </EditorialSection>

      <EditorialSection kickerLeft="DECISÃO DE PRODUÇÃO" kickerRight="ESCOLHA DE FORMATO" title="QUAL PROFUNDIDADE DE BITS DEVO ESCOLHER?" subtitle="A DECISÃO DEPENDE DO MATERIAL, DA PÓS-PRODUÇÃO E DA ESTRUTURA DISPONÍVEL">
        <TwoColumnText
          left={<><p>A escolha depende do tipo de produção, da liberdade necessária na pós e da estrutura disponível para gravar, editar e armazenar o material. Um videomaker que produz para redes sociais, um filmmaker que grava videoclipes e um diretor de fotografia de publicidade podem ter necessidades bem diferentes.</p><p>Quanto maior a profundidade, maior a precisão numérica para representar as informações da imagem. Isso pode preservar melhor as gradações durante a correção de cor, mas também pode aumentar as exigências de armazenamento e processamento, conforme o formato.</p></>}
          right={<><p>O ponto decisivo é escolher uma profundidade compatível com o tratamento que a imagem vai receber. Para gravar, fazer pequenos ajustes e publicar rapidamente, talvez não seja necessário um fluxo RAW de alta precisão. Para reconstruir o contraste de Log, fazer correções seletivas complexas ou buscar acabamento visual rigoroso, preservar mais informação desde a captura pode fazer diferença.</p><p>Profundidade de bits não determina sozinha o tamanho do arquivo nem o desempenho da câmera. Codec, compressão, resolução, taxa de quadros e taxa de bits também influenciam esses fatores. Mais bits tampouco significam automaticamente mais faixa dinâmica ou uma imagem visualmente superior.</p></>}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <BitDepthCard depth="8-bit · Quando economizar dados é prioridade">
            <p>É uma opção válida quando a imagem será captada próxima do resultado final, com exposição bem controlada e pouca necessidade de mudanças intensas na pós. É comum em câmeras de entrada, equipamentos mais antigos e modos que priorizam arquivos compactos.</p>
            <p>Dependendo do modo de gravação, pode exigir menos dados, ocupar menos espaço e facilitar armazenamento e transferência. Isso ajuda quem grava eventos, trabalha sozinho, produz vídeos informativos ou precisa entregar rápido. Bem exposto, com balanço de branco correto e visual próximo do final, o 8-bit pode ter ótima qualidade.</p>
            <h5 className="font-sans text-sm font-bold text-neutral-900">Onde está o limite?</h5>
            <p>A margem diminui quando é preciso transformar muito a imagem. Ao reconstruir contraste e saturação de um perfil Log gravado em 8-bit, levantar sombras, corrigir balanço de branco ou mudar bastante cores específicas, podem aparecer <em>banding</em>, posterização e outros artefatos. A compressão e o processamento também influenciam.</p>
            <p>Isso não torna todo arquivo 8-bit ruim para edição: uma imagem convencional, próxima do resultado desejado, pode ser corrigida sem dificuldade. O risco aumenta quando o material Log precisa de mudanças agressivas.</p>
            <KeyPoints advantages="Arquivos potencialmente menores, transferência rápida e fluxo simples." limitations="Menor tolerância a correções intensas e menos flexibilidade para combinar planos que exigem grandes ajustes." usage="Redes sociais, registros rápidos, entrevistas e conteúdos com ajustes leves. Evite depender de Log em 8-bit para correção de cor agressiva." />
          </BitDepthCard>

          <BitDepthCard depth="10-bit · O equilíbrio entre qualidade e eficiência">
            <p>Para muitos videomakers, filmmakers e diretores de fotografia, é uma escolha equilibrada. Oferece quatro vezes mais códigos por componente que 8-bit e representa gradações de cor e luminosidade com mais precisão.</p>
            <p>Essa margem ajuda a ajustar curvas, contraste, saturação, tons de pele e cores seletivas, especialmente ao reconstruir uma imagem Log. Também facilita aproximar planos gravados em condições de luz e temperaturas de cor diferentes. Exposição, iluminação e sensor continuam fundamentais.</p>
            <h5 className="font-sans text-sm font-bold text-neutral-900">Armazenamento e edição</h5>
            <p>Em configurações equivalentes, 10-bit pode exigir uma taxa de bits maior, mas isso não é obrigatório: codec, compressão, resolução e taxa de quadros também determinam o tamanho. A fluidez depende muito do codec. Um arquivo 4K de 10-bit em H.265 pode ser pesado para um computador sem decodificação por hardware compatível, enquanto outro formato, como ProRes, pode rodar melhor conforme o equipamento.</p>
            <p>Por isso, 10-bit não significa sempre que será necessário um computador mais potente: verifique a compatibilidade do codec e do sistema de edição.</p>
            <KeyPoints advantages="Mais precisão tonal, segurança na correção de cor e equilíbrio entre qualidade e complexidade." limitations="Pode aumentar arquivos e exigir atenção à compatibilidade do codec e ao armazenamento." usage="Publicidade, videoclipes, entrevistas tratadas, vídeos de marca, documentários, Log e HDR. 10-bit 4:2:2 em Log é um ponto de partida versátil para muitos projetos." />
          </BitDepthCard>

          <BitDepthCard depth="12-bit · Quando a flexibilidade na pós é essencial">
            <p>É encontrado principalmente em formatos RAW de câmeras cinematográficas. Tem quatro vezes mais códigos por amostra que 10-bit e preserva uma representação numérica mais precisa dos dados captados pelo sensor.</p>
            <p>No RAW, parte da interpretação acontece na revelação digital. Conforme a câmera e o formato, pode ser possível ajustar balanço de branco e interpretação da exposição com mais liberdade do que em um vídeo convencional já processado. Isso ajuda em cenas com reflexos delicados, tons de pele controlados, composição e efeitos visuais.</p>
            <h5 className="font-sans text-sm font-bold text-neutral-900">O custo depende do formato</h5>
            <p>RAW pode exigir mais armazenamento, cópias de segurança, organização de mídia e processamento para reconstruir a imagem, especialmente em alta resolução e taxa de quadros. Mas não significa necessariamente arquivos enormes ou edição lenta: formatos como Blackmagic RAW usam compressão para equilibrar tamanho e qualidade e podem aproveitar CPU e GPU.</p>
            <p>12-bit não equivale a 12 pontos de latitude nem recupera altas luzes saturadas no sensor. A informação captada também depende do sensor, do ruído e da exposição.</p>
            <KeyPoints advantages="Mais liberdade para interpretar a imagem, ajustar balanço de branco e trabalhar cor e efeitos visuais." limitations="Mais planejamento de mídia, armazenamento e processamento, dependendo do RAW escolhido." usage="Publicidade de alto padrão, curtas, videoclipes elaborados, efeitos visuais e projetos que precisam preservar flexibilidade na pós." />
          </BitDepthCard>

          <BitDepthCard depth="16-bit · Para fluxos cinematográficos exigentes">
            <p>Está presente em alguns formatos RAW de sistemas cinematográficos profissionais. O X-OCN da Sony, por exemplo, usa dados lineares de 16-bit em arquivos RAW comprimidos. Essa representação oferece alta precisão numérica para tratamentos de cor, composição e finalização exigentes.</p>
            <p>O benefício depende do sistema completo. Gravar em 16-bit não garante mais resolução, nitidez ou faixa dinâmica do que qualquer gravação em 12-bit. E arquivos de 16-bit não são necessariamente maiores ou mais difíceis de editar que todos os formatos de menor profundidade: a compressão e o formato fazem diferença.</p>
            <p>Ainda assim, conforme a resolução, a taxa de quadros e a compressão, a produção pode precisar de cartões rápidos, grande capacidade de armazenamento, cópias de segurança e máquinas capazes de decodificar o material. Se o projeto exigir pouca manipulação, 10 ou 12-bit pode entregar excelente resultado com menos complexidade.</p>
            <KeyPoints advantages="Alta precisão numérica e flexibilidade em fluxos RAW de alta exigência." limitations="Fluxo mais complexo, infraestrutura de dados e custos que podem não se justificar em todo projeto." usage="Longas-metragens, publicidade de grande porte, VFX complexos, HDR e projetos que exigem um fluxo RAW de alta precisão." />
          </BitDepthCard>
        </div>
        <EditorialQuote quote="Escolha o formato que preserva informação suficiente para o resultado pretendido sem impor custos desnecessários de armazenamento, processamento e finalização." author="Diretriz de análise técnica" />
      </EditorialSection>
    </article>
  );
}
