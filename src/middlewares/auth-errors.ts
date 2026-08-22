/**
 * Zrozumiteľné chyby na prihlasovacích a členských cestách.
 *
 * Strapi v produkčnom režime zabalí ApplicationError do holého
 * „500 Internal Server Error". Frontend tak nerozlíši neoverený účet od
 * zlého hesla a hlavne nespozná vypršaný token — namiesto odhlásenia by
 * ukázal „niečo sa pokazilo". Tento middleware chybu zachytí a vráti
 * správny stavový kód so slovenskou hláškou.
 *
 * Prepúšťa len správy známych typov chýb. Neočakávaná výnimka skončí
 * všeobecnou hláškou, aby sa von nedostali vnútornosti servera.
 */

const CESTY = ['/api/auth/', '/api/member/']

/** Hlášky pre prihlasovanie. Zámerne nerozlišuje „neexistuje" od „zlé heslo" —
 *  cez formulár sa nemá dať zistiť, ktoré adresy sú zaregistrované. */
const HLASKY: Array<[RegExp, string, number]> = [
  [/not confirmed/i, 'Účet ešte nie je overený. Skontrolujte si e-mail — poslali sme vám overovací odkaz.', 400],
  [/already taken/i, 'Tento e-mail alebo meno je už zaregistrované.', 400],
  [/Invalid identifier or password/i, 'Nesprávny e-mail alebo heslo.', 400],
  [/blocked/i, 'Účet je zablokovaný. Ozvite sa nám na scear@scear.sk.', 403],
  [/provide your (username|email)/i, 'Vyplňte prihlasovacie údaje.', 400],
  [/password.*(length|short)/i, 'Heslo musí mať aspoň 6 znakov.', 400],
  [/email.*(valid|format)/i, 'Zadajte platnú e-mailovú adresu.', 400],
  [/Incorrect code/i, 'Odkaz na obnovu hesla je neplatný alebo už bol použitý.', 400],
]

/** Chyby, ktorých znenie smie ísť von tak, ako ho zapísal controller. */
const PODLA_TYPU: Record<string, { status: number; nahrada: string }> = {
  UnauthorizedError: { status: 401, nahrada: 'Prihláste sa' },
  ForbiddenError: { status: 403, nahrada: 'Na túto akciu nemáte oprávnenie' },
  PolicyError: { status: 403, nahrada: 'Na túto akciu nemáte oprávnenie' },
  NotFoundError: { status: 404, nahrada: 'Nenašlo sa' },
  ValidationError: { status: 400, nahrada: 'Skontrolujte zadané údaje' },
  BadRequestError: { status: 400, nahrada: 'Požiadavku sa nepodarilo spracovať' },
}

export default (config: unknown, { strapi }: { strapi: any }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    if (!CESTY.some((c) => ctx.path.startsWith(c))) return next()

    const odpovedz = (status: number, message: string) => {
      ctx.status = status
      ctx.body = { data: null, error: { status, name: 'ValidationError', message } }
    }

    try {
      await next()

      // Politika Users & Permissions nehádže výnimku vždy — pri zamietnutí
      // vie rovno nastaviť stav. Aj tak ho treba prekryť čitateľnou hláškou.
      if (ctx.status === 401 && !ctx.body?.error) odpovedz(401, 'Prihláste sa')
    } catch (err: any) {
      const text = err?.message || err?.details?.message || ''

      if (ctx.path.startsWith('/api/auth/')) {
        const zhoda = HLASKY.find(([re]) => re.test(text))
        if (zhoda) {
          odpovedz(zhoda[2], zhoda[1])
          return
        }
      }

      const podlaTypu = PODLA_TYPU[err?.name]
      if (podlaTypu) {
        // „Forbidden access" je hláška Strapi, nie naša — nahradiť
        const vlastna = text && !/^(Forbidden access|Unauthorized|Missing or invalid credentials)$/i.test(text)

        // Keď nie je kto, ide o neprihláseného — nie o chýbajúce oprávnenie.
        // Rozdiel je podstatný: na 401 frontend člena odhlási, takže po
        // vypršaní tokenu skončí na prihlásení a nie na hláške o chybe.
        // Platí to aj pre neplatný token: hlavička prišla, používateľ nie.
        if (podlaTypu.status === 403 && !ctx.state?.user) {
          odpovedz(401, 'Prihláste sa')
          return
        }

        odpovedz(podlaTypu.status, vlastna ? text : podlaTypu.nahrada)
        return
      }

      strapi.log.error(`[auth] neznáma chyba na ${ctx.path}: ${text}`)
      odpovedz(400, 'Požiadavku sa nepodarilo spracovať. Skúste to znova.')
    }
  }
}
