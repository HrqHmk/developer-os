import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { formatPublishedAt } from '../lib/format-published-at'
import { localePrefix, type Locale } from '../lib/locale'
import { CONTACT_EMAIL } from './site-footer'

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
const LINK = `underline underline-offset-2 hover:text-foreground ${FOCUS_RING}`

/**
 * Publication date of the current text (Issue #95, DP-6). Set in the last
 * commit before merge, and changed again only by a substantive revision —
 * a vendor policy, configuration or analytics change (`conventions.md` §15).
 */
const LAST_UPDATED = '2026-10-20'

const POLICY_URLS = {
  goatcounter: 'https://www.goatcounter.com/help/privacy',
  buttondown: 'https://buttondown.com/legal/privacy',
  cloudflare: 'https://www.cloudflare.com/privacypolicy/',
}

const contact = (
  <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
    {CONTACT_EMAIL}
  </a>
)

type Section = { heading: string; paragraphs: ReactNode[] }

// Every statement below is traced to a source in `conventions.md` §15; keep
// the two languages saying the same thing, at the same strength.
const COPY_EN = {
  title: 'Privacy',
  description: 'What data Developer OS processes, who processes it, and how to reach us.',
  lead: "This page explains what data is processed when you visit Developer OS, who processes it, and how to reach us. Each provider's own privacy policy is linked where it applies.",
  lastUpdated: 'Last updated',
  sections: [
    {
      heading: 'Who is responsible',
      paragraphs: [
        <>
          Data controller: Henrique Hiroshi, maintainer of Developer OS. Privacy contact: {contact}. For any question or
          request about privacy, write to that address.
        </>,
      ],
    },
    {
      heading: 'Visit statistics',
      paragraphs: [
        'This site uses GoatCounter to count visits in aggregate: which pages are read and which sites link to them. The numbers guide what gets written next. They are approximate and are not used to identify anyone.',
        "When a pageview is recorded, your browser sends GoatCounter the page address (including any query parameters), the page title, the referring page, your screen width, and technical fields added by GoatCounter's script. No custom events are sent, and the text you type into this site's search is never sent.",
        "Like any web request, this also gives GoatCounter your IP address and your browser's User-Agent. GoatCounter's privacy policy states that it does not store IP addresses or the full User-Agent. According to the same policy, it may derive information such as browser, operating system, location (from the IP address), language and screen width, and each site may turn off any of these.",
        'Statistics are sent only from developeros.dev. If your browser or an extension blocks GoatCounter, nothing is sent and the site works the same.',
      ],
    },
    {
      heading: 'Sessions',
      paragraphs: [
        "To tell a single visit apart from several pageviews, GoatCounter temporarily processes technical information about the request, as described in its privacy policy. Collection of individual pageviews is disabled in this site's GoatCounter settings, and its statistics dashboard is private.",
      ],
    },
    {
      heading: 'Cookies and browser storage',
      paragraphs: [
        <>
          This site's code sets no cookies, and GoatCounter's privacy policy states that it stores nothing in your
          browser. If you choose a light or dark theme, your choice is saved in your browser's local storage under
          the key <code>theme</code>, so it applies on your next visit. It stays on your device and is not sent
          anywhere. Clearing this site's data in your browser removes it.
        </>,
      ],
    },
    {
      heading: 'Hosting and email',
      paragraphs: [
        <>
          The site is served by Cloudflare, which processes your IP address and request data to deliver pages,
          under Cloudflare's privacy policy. Messages sent to {contact} are received through Cloudflare Email
          Routing and forwarded to a mailbox kept by the maintainer.
        </>,
      ],
    },
    {
      heading: 'Newsletter',
      paragraphs: [
        "If you subscribe to the newsletter, your email address goes directly from your browser to Buttondown, the service that hosts it. Developer OS keeps no subscriber list outside Buttondown. You confirm your subscription by email, and every newsletter includes a link to unsubscribe. See Buttondown's privacy policy for how it handles your data.",
      ],
    },
    {
      heading: 'Retention',
      paragraphs: [
        'Developer OS has not set a retention period for visit statistics. They are kept in GoatCounter as aggregate counts. Data handled by Cloudflare and Buttondown is kept according to their own policies.',
      ],
    },
    {
      heading: 'Your requests',
      paragraphs: [
        <>
          You can write to {contact} to ask what data about you this project holds, or to ask for it to be
          corrected or deleted. This applies to messages you sent to that address and to your newsletter
          subscription.
        </>,
        "Visit statistics are stored as aggregate counts that are not linked to individual visitors, so one person's visits cannot be found in them or removed from them.",
        'Cloudflare, GoatCounter and Buttondown each explain in their own privacy policies how they handle data and what contact or request options they offer. Links are below.',
      ],
    },
  ] satisfies Section[],
  policiesHeading: 'Provider policies',
  policies: {
    goatcounter: 'GoatCounter privacy policy',
    buttondown: 'Buttondown privacy policy',
    cloudflare: 'Cloudflare privacy policy',
  } satisfies Record<keyof typeof POLICY_URLS, string>,
  home: '← Home',
}

const COPY: Record<Locale, typeof COPY_EN> = {
  en: COPY_EN,
  'pt-br': {
    title: 'Privacidade',
    description: 'Quais dados o Developer OS trata, quem os trata e como falar com a gente.',
    lead: 'Esta página explica quais dados são tratados quando você visita o Developer OS, quem os trata e como falar com a gente. A política de privacidade de cada fornecedor está indicada onde se aplica.',
    lastUpdated: 'Última atualização',
    sections: [
      {
        heading: 'Quem é responsável',
        paragraphs: [
          <>
            Controlador dos dados: Henrique Hiroshi, mantenedor do Developer OS. Contato para assuntos de privacidade:{' '}
            {contact}. Para qualquer dúvida ou pedido sobre privacidade, escreva para esse endereço.
          </>,
        ],
      },
      {
        heading: 'Estatísticas de visitas',
        paragraphs: [
          'Este site usa o GoatCounter para contar visitas de forma agregada: quais páginas são lidas e quais sites apontam para elas. Os números orientam o que será escrito em seguida. São aproximados e não são usados para identificar ninguém.',
          'Quando uma visualização de página é registrada, seu navegador envia ao GoatCounter o endereço da página (incluindo parâmetros de consulta), o título da página, a página de origem, a largura da tela e campos técnicos adicionados pelo script do GoatCounter. Nenhum evento personalizado é enviado, e o texto que você digita na busca deste site nunca é enviado.',
          'Como em qualquer requisição na web, o GoatCounter também recebe seu endereço IP e o User-Agent do seu navegador. A política de privacidade do GoatCounter afirma que ele não armazena endereços IP nem o User-Agent completo. Segundo a mesma política, ele pode derivar informações como navegador, sistema operacional, localização (a partir do IP), idioma e largura de tela, e cada site pode desativar qualquer uma delas.',
          'As estatísticas só são enviadas a partir de developeros.dev. Se o seu navegador ou uma extensão bloquear o GoatCounter, nada é enviado e o site funciona da mesma forma.',
        ],
      },
      {
        heading: 'Sessões',
        paragraphs: [
          'Para distinguir uma única visita de várias visualizações de página, o GoatCounter trata temporariamente informações técnicas da requisição, conforme descrito na política de privacidade dele. A coleta de visualizações de página individuais está desativada nas configurações do GoatCounter deste site, e o painel de estatísticas é privado.',
        ],
      },
      {
        heading: 'Cookies e armazenamento no navegador',
        paragraphs: [
          <>
            O código deste site não define cookies, e a política de privacidade do GoatCounter afirma que ele não
            armazena nada no seu navegador. Se você escolher um tema claro ou escuro, a escolha fica salva no
            armazenamento local do navegador, na chave <code>theme</code>, para valer na próxima visita. Ela fica no
            seu dispositivo e não é enviada a lugar nenhum. Limpar os dados deste site no navegador a remove.
          </>,
        ],
      },
      {
        heading: 'Hospedagem e e-mail',
        paragraphs: [
          <>
            O site é servido pela Cloudflare, que trata seu endereço IP e os dados da requisição para entregar as
            páginas, conforme a política de privacidade da Cloudflare. Mensagens enviadas para {contact} são
            recebidas pelo Cloudflare Email Routing e encaminhadas para uma caixa de e-mail mantida pelo mantenedor.
          </>,
        ],
      },
      {
        heading: 'Newsletter',
        paragraphs: [
          'Se você assinar a newsletter, seu endereço de e-mail vai diretamente do seu navegador para o Buttondown, o serviço que a hospeda. O Developer OS não mantém lista de assinantes fora do Buttondown. Você confirma a inscrição por e-mail, e toda edição traz um link para cancelar a inscrição. Veja na política de privacidade do Buttondown como ele trata seus dados.',
        ],
      },
      {
        heading: 'Retenção',
        paragraphs: [
          'O Developer OS não definiu um prazo de retenção para as estatísticas de visitas. Elas ficam no GoatCounter como contagens agregadas. Dados tratados pela Cloudflare e pelo Buttondown são mantidos conforme as políticas deles.',
        ],
      },
      {
        heading: 'Seus pedidos',
        paragraphs: [
          <>
            Você pode escrever para {contact} para perguntar quais dados seus este projeto mantém, ou pedir que sejam
            corrigidos ou excluídos. Isso vale para mensagens que você enviou a esse endereço e para sua inscrição na
            newsletter.
          </>,
          'As estatísticas de visitas são guardadas como contagens agregadas, sem vínculo com visitantes individuais, então não é possível localizar nem remover as visitas de uma pessoa específica.',
          'Cloudflare, GoatCounter e Buttondown explicam, cada um em sua política de privacidade, como tratam dados e quais opções de contato ou solicitação oferecem. Os links estão abaixo.',
        ],
      },
    ],
    policiesHeading: 'Políticas dos fornecedores',
    policies: {
      goatcounter: 'Política de privacidade do GoatCounter',
      buttondown: 'Política de privacidade do Buttondown',
      cloudflare: 'Política de privacidade da Cloudflare',
    },
    home: '← Início',
  },
}

export function privacyTitle(locale: Locale): string {
  return COPY[locale].title
}

export function privacyDescription(locale: Locale): string {
  return COPY[locale].description
}

export function PrivacyPage({ locale }: Readonly<{ locale: Locale }>) {
  const copy = COPY[locale]

  return (
    <main className="relative isolate mx-auto flex min-h-screen max-w-2xl flex-col gap-12 px-6 py-16">
      <div aria-hidden="true" className="page-backdrop" />
      <div className="space-y-4">
        <h1 className="text-3xl font-bold sm:text-4xl">{copy.title}</h1>
        <p className="text-lg text-muted-foreground">{copy.lead}</p>
        <p className="text-sm text-muted-foreground">
          {copy.lastUpdated}: <time dateTime={LAST_UPDATED}>{formatPublishedAt(LAST_UPDATED, locale)}</time>
        </p>
      </div>
      {copy.sections.map((section) => (
        <section key={section.heading} className="space-y-4">
          <h2 className="text-xl font-semibold">{section.heading}</h2>
          {section.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{copy.policiesHeading}</h2>
        <ul className="space-y-2">
          {(Object.keys(POLICY_URLS) as (keyof typeof POLICY_URLS)[]).map((provider) => (
            <li key={provider}>
              <a href={POLICY_URLS[provider]} className={LINK}>
                {copy.policies[provider]}
              </a>
            </li>
          ))}
        </ul>
      </section>
      <Link to={localePrefix(locale) || '/'} className="text-sm text-muted-foreground hover:text-foreground">
        {copy.home}
      </Link>
    </main>
  )
}
