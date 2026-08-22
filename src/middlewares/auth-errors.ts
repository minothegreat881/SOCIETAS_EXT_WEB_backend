/**
 * Zrozumiteľné chyby na prihlasovacích cestách.
 *
 * Strapi zabalí ApplicationError z pluginu users-permissions do holého
 * „500 Internal Server Error", takže frontend nemá čo používateľovi povedať —
 * nerozlíši nepotvrdený e-mail od zlého hesla. Tento middleware chybu zachytí
 * a vráti 400 so slovenskou správou.
 *
 * Zámerne neprekladá „nesprávne údaje" na dve rôzne hlášky: cez prihlasovací
 * formulár sa nemá dať zistiť, ktoré e-maily sú registrované.
 */

const MESSAGES: Array<[RegExp, string, number]> = [
  [/not confirmed/i, 'Účet ešte nie je overený. Skontrolujte si e-mail — poslali sme vám overovací odkaz.', 400],
  [/already taken/i, 'Tento e-mail alebo meno je už zaregistrované.', 400],
  [/Invalid identifier or password/i, 'Nesprávny e-mail alebo heslo.', 400],
  [/blocked/i, 'Účet je zablokovaný. Ozvite sa nám na scear@scear.sk.', 403],
  [/provide your (username|email)/i, 'Vyplňte prihlasovacie údaje.', 400],
  [/password.*(length|short)/i, 'Heslo musí mať aspoň 6 znakov.', 400],
  [/email.*(valid|format)/i, 'Zadajte platnú e-mailovú adresu.', 400],
  [/Incorrect code/i, 'Odkaz na obnovu hesla je neplatný alebo už bol použitý.', 400],
]

export default (config: unknown, { strapi }: { strapi: any }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    if (!ctx.path.startsWith('/api/auth/')) return next()

    try {
      await next()
    } catch (err: any) {
      const raw = err?.message || err?.details?.message || ''
      const match = MESSAGES.find(([re]) => re.test(raw))

      if (match) {
        const [, message, status] = match
        ctx.status = status
        ctx.body = { data: null, error: { status, name: 'ValidationError', message } }
        return
      }

      strapi.log.error('[auth] neznáma chyba: ' + raw)
      ctx.status = 400
      ctx.body = {
        data: null,
        error: { status: 400, name: 'ValidationError', message: 'Požiadavku sa nepodarilo spracovať. Skúste to znova.' },
      }
    }
  }
}
