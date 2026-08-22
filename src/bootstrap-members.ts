/**
 * Nastavenie členského systému pri štarte Strapi.
 *
 * Je to idempotentné: čo existuje, preskočí; čo chýba, dorobí. Po čistej
 * inštalácii teda členská zóna funguje bez klikania v admine — a hlavne sa
 * oprávnenia nedajú omylom rozbiť ručnou zmenou, lebo sa pri každom štarte
 * zrovnajú podľa tohto súboru.
 */

/** Čo smie neprihlásený návštevník (nad rámec toho, čo už web má). */
const PUBLIC_ACTIONS: string[] = []

/**
 * Čo smie prihlásený člen. Členské dáta idú cez /api/member/* — tam sa
 * kontroluje aj schválenie účtu, preto tu stačí povoliť tieto cesty.
 */
const MEMBER_ACTIONS = [
  'api::member.member.me',
  'api::member.member.updateMe',
  'api::member.member.deleteMe',
  'api::member.member.activities',
  'api::member.member.setAttendance',
  'api::member.member.polls',
  'api::member.member.vote',
  'api::member.member.announcements',
  'api::member.member.notifications',
  'api::member.member.markRead',
  'api::member.member.subscribePush',
]

/** Vedenie: navyše schvaľovanie členov. */
const STAFF_EXTRA_ACTIONS = [
  'api::member.member.pending',
  'api::member.member.approve',
]

export async function bootstrapMembers({ strapi }: { strapi: any }) {
  try {
    const pluginStore = strapi.store({ type: 'plugin', name: 'users-permissions' })

    // 1) Registrácia s overením e-mailu, prihlásenie až po potvrdení
    const frontend = process.env.FRONTEND_URL || 'https://www.scear.sk'

    /**
     * Overenie e-mailu sa dá vypnúť. Nie je to bezpečnostná diera: prístup
     * do zóny aj tak otvára až schválenie vedením. Prepínač existuje preto,
     * že niektorí poskytovatelia (DigitalOcean, Hetzner) blokujú odchádzajúci
     * SMTP — a keď Strapi nevie odoslať overovací e-mail, registrácia zlyhá
     * celá. Vtedy je lepšie overenie vypnúť než nechať nikoho zaregistrovať sa.
     */
    const overovatEmail = process.env.EMAIL_CONFIRMATION !== 'false'

    const advanced = (await pluginStore.get({ key: 'advanced' })) || {}
    const desiredAdvanced = {
      ...advanced,
      allow_register: true,
      email_confirmation: overovatEmail,
      email_confirmation_redirection: `${frontend}/prihlasenie?potvrdene=1`,
      // odkaz v e-maile na obnovu hesla; Strapi k nemu doplní ?code=…
      email_reset_password: `${frontend}/reset-hesla`,
      unique_email: true,
    }
    if (JSON.stringify(advanced) !== JSON.stringify(desiredAdvanced)) {
      await pluginStore.set({ key: 'advanced', value: desiredAdvanced })
      strapi.log.info('[members] nastavenia registrácie zrovnané')
    }

    // 1b) Slovenské e-maily namiesto anglických vzorov od Strapi,
    // ktoré chodia z adresy no-reply@strapi.io
    const odosielatel = {
      name: 'S.C.E.A.R.',
      email: process.env.EMAIL_FROM || 'scear@scear.sk',
    }
    const emaily = (await pluginStore.get({ key: 'email' })) || {}
    const zelaneEmaily = {
      ...emaily,
      email_confirmation: {
        ...(emaily as any).email_confirmation,
        display: 'Email.template.email_confirmation',
        icon: 'check-square',
        options: {
          from: odosielatel,
          response_email: '',
          object: 'Overenie e-mailu — S.C.E.A.R.',
          message: [
            '<p>Ďakujeme za registráciu do členskej zóny S.C.E.A.R.</p>',
            '<p>Adresu potvrdíte kliknutím na odkaz:</p>',
            '<p><a href="<%= URL %>?confirmation=<%= CODE %>"><%= URL %>?confirmation=<%= CODE %></a></p>',
            '<p>Po overení účet ešte schvaľuje vedenie skupiny — dáme vám vedieť.</p>',
            '<p>Ak ste sa neregistrovali, tento e-mail pokojne ignorujte.</p>',
          ].join('\n'),
        },
      },
      reset_password: {
        ...(emaily as any).reset_password,
        display: 'Email.template.reset_password',
        icon: 'sync',
        options: {
          from: odosielatel,
          response_email: '',
          object: 'Obnova hesla — S.C.E.A.R.',
          message: [
            '<p>Dostali sme žiadosť o zmenu hesla k vášmu členskému účtu.</p>',
            '<p>Nové heslo si nastavíte tu:</p>',
            '<p><a href="<%= URL %>?code=<%= TOKEN %>"><%= URL %>?code=<%= TOKEN %></a></p>',
            '<p>Odkaz platí jednu hodinu. Ak ste o zmenu nežiadali, nič nerobte — heslo zostáva.</p>',
          ].join('\n'),
        },
      },
    }
    if (JSON.stringify(emaily) !== JSON.stringify(zelaneEmaily)) {
      await pluginStore.set({ key: 'email', value: zelaneEmaily })
      strapi.log.info('[members] e-mailové vzory prepnuté na slovenské')
    }

    // 2) Rola „member" — predvolená pre nových registrovaných
    const roleService = strapi.plugin('users-permissions').service('role')
    let roles = await roleService.find()
    let member = roles.find((r: any) => r.type === 'member')

    if (!member) {
      await roleService.createRole({
        name: 'Člen',
        description: 'Registrovaný člen skupiny. Do členskej zóny sa dostane po schválení správcom.',
        type: 'member',
        permissions: {},
      })
      roles = await roleService.find()
      member = roles.find((r: any) => r.type === 'member')
      strapi.log.info('[members] rola „member" vytvorená')
    }

    // predvolená rola pri registrácii
    if (member && desiredAdvanced.default_role !== 'member') {
      await pluginStore.set({ key: 'advanced', value: { ...desiredAdvanced, default_role: 'member' } })
      strapi.log.info('[members] predvolená rola pri registrácii = member')
    }

    const publicRole = roles.find((r: any) => r.type === 'public')
    const staffRole = roles.find((r: any) => r.type === 'authenticated')

    // „Authenticated" v admine nikomu nepovie, že ide o vedenie skupiny.
    // Mení sa len zobrazovaný názov, type ostáva — na ten sa viažu oprávnenia.
    if (staffRole && staffRole.name === 'Authenticated') {
      await strapi.query('plugin::users-permissions.role').update({
        where: { id: staffRole.id },
        data: {
          name: 'Vedenie',
          description: 'Vedenie skupiny. Navyše schvaľuje nových členov.',
        },
      })
      strapi.log.info('[members] rola „Authenticated" premenovaná na „Vedenie"')
    }

    // 3) Oprávnenia — dorobiť chýbajúce, existujúce nechať
    // V Strapi 5 nemá oprávnenie príznak „enabled" — čo existuje, to platí.
    // Načítame naraz, čo rola má, a dorobíme len chýbajúce; inak by sa pri
    // každom štarte zakladali duplikáty.
    const ensure = async (roleId: number, actions: string[], label: string) => {
      if (!roleId || !actions.length) return

      const existing = await strapi.query('plugin::users-permissions.permission').findMany({
        where: { role: { id: roleId } },
        select: ['action'],
        limit: -1,
      })
      const have = new Set(existing.map((p: any) => p.action))
      const missing = actions.filter((a) => !have.has(a))
      if (!missing.length) return

      for (const action of missing) {
        await strapi.query('plugin::users-permissions.permission').create({
          data: { action, role: roleId },
        })
      }
      strapi.log.info(`[members] ${label}: doplnených ${missing.length} oprávnení`)
    }

    await ensure(member?.id, MEMBER_ACTIONS, 'rola member')
    await ensure(staffRole?.id, [...MEMBER_ACTIONS, ...STAFF_EXTRA_ACTIONS], 'rola vedenie')
    await ensure(publicRole?.id, PUBLIC_ACTIONS, 'rola public')

    if (!overovatEmail) {
      strapi.log.warn('[members] overenie e-mailu je VYPNUTÉ (EMAIL_CONFIRMATION=false); prístup stráži už len schválenie vedením')
    }
    strapi.log.info('[members] členský systém pripravený')
  } catch (e) {
    strapi.log.error('[members] bootstrap zlyhal: ' + (e as Error).message)
  }
}
