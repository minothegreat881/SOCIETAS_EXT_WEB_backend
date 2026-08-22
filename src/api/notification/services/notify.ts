/**
 * Jediné miesto, cez ktoré vznikajú upozornenia.
 *
 * Pravidlá, ktoré presadzuje za všetkých volajúcich:
 *  1. nikdy neupozorniť sám seba (actorId),
 *  2. rešpektovať predvoľby člena (notifyActivity / notifyPoll / notifyAnnouncement),
 *     výnimkou je typ „system" a „account_approved" — tie idú vždy,
 *  3. neposielať to isté dvakrát (dedupKey),
 *  4. push ani e-mail nesmú zhodiť zápis notifikácie — obe sú „safe".
 */

type NotifyType =
  | 'activity_reminder'
  | 'activity_new'
  | 'poll_new'
  | 'poll_closing'
  | 'announcement'
  | 'account_approved'
  | 'system'

type NotifyInput = {
  userId: number
  type: NotifyType
  title: string
  body?: string
  link?: string
  /** kto akciu vyvolal — tomuto človeku sa neposiela */
  actorId?: number
  /** ak už existuje neprečítaná notifikácia s rovnakým kľúčom, nová nevznikne */
  dedupKey?: string
  email?: boolean
  push?: boolean
}

const PREFERENCE_BY_TYPE: Record<NotifyType, string | null> = {
  activity_reminder: 'notifyActivity',
  activity_new: 'notifyActivity',
  poll_new: 'notifyPoll',
  poll_closing: 'notifyPoll',
  announcement: 'notifyAnnouncement',
  account_approved: null, // vždy
  system: null, // vždy
}

export default ({ strapi }: { strapi: any }) => ({
  async notify(input: NotifyInput) {
    const { userId, type, title, body, link, actorId, dedupKey } = input
    if (!userId) return null
    if (actorId && actorId === userId) return null

    const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
      fields: ['id', 'email', 'displayName', 'username', 'approved', 'blocked',
        'notifyActivity', 'notifyPoll', 'notifyAnnouncement', 'notifyEmail'],
    })
    if (!user || user.blocked) return null

    const prefField = PREFERENCE_BY_TYPE[type]
    if (prefField && user[prefField] === false) return null

    // to isté upozornenie neposielať dvakrát
    if (dedupKey) {
      const existing = await strapi.entityService.findMany('api::notification.notification', {
        filters: { user: userId, link: dedupKey, read: false },
        limit: 1,
      })
      if (existing?.length) return existing[0]
    }

    const notification = await strapi.entityService.create('api::notification.notification', {
      data: { user: userId, type, title, body: body ?? null, link: link ?? dedupKey ?? null, read: false },
    })

    if (input.push !== false) await this.pushSafe(user, { title, body, link })
    if (input.email !== false && user.notifyEmail !== false) await this.emailSafe(user, { title, body, link })

    return notification
  },

  /** Hromadné upozornenie všetkým schváleným členom (nový oznam, nové hlasovanie). */
  async notifyAllMembers(input: Omit<NotifyInput, 'userId'>) {
    const members = await strapi.entityService.findMany('plugin::users-permissions.user', {
      filters: { approved: true, blocked: false, confirmed: true },
      fields: ['id'],
      limit: 1000,
    })
    let sent = 0
    for (const m of members) {
      const n = await this.notify({ ...input, userId: m.id })
      if (n) sent++
    }
    strapi.log.info(`[notify] ${input.type}: ${sent}/${members.length} členov`)
    return sent
  },

  /** Push do zariadenia. Zlyhanie sa iba zaloguje. */
  async pushSafe(user: any, payload: { title: string; body?: string; link?: string }) {
    try {
      const publicKey = process.env.VAPID_PUBLIC_KEY
      const privateKey = process.env.VAPID_PRIVATE_KEY
      if (!publicKey || !privateKey) return

      const webpush = require('web-push')
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:scear@scear.sk',
        publicKey,
        privateKey
      )

      const subs = await strapi.entityService.findMany('api::push-subscription.push-subscription', {
        filters: { user: user.id },
        limit: 20,
      })

      for (const sub of subs) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify({
              title: payload.title,
              body: payload.body ?? '',
              url: payload.link ? `${process.env.FRONTEND_URL || 'https://www.scear.sk'}${payload.link}` : undefined,
            })
          )
        } catch (err: any) {
          // 404/410 = odber už neplatí, zmažeme ho
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            await strapi.entityService.delete('api::push-subscription.push-subscription', sub.id)
          } else {
            await strapi.entityService.update('api::push-subscription.push-subscription', sub.id, {
              data: { failCount: (sub.failCount || 0) + 1 },
            })
          }
        }
      }
    } catch (e) {
      strapi.log.warn('[notify] push preskočený: ' + (e as Error).message)
    }
  },

  /** E-mail. Zlyhanie sa iba zaloguje — notifikácia už je zapísaná. */
  async emailSafe(user: any, payload: { title: string; body?: string; link?: string }) {
    try {
      if (!user.email) return
      const base = process.env.FRONTEND_URL || 'https://www.scear.sk'
      const url = payload.link ? `${base}${payload.link}` : `${base}/clenska-zona`
      const name = user.displayName || user.username || ''

      await strapi.plugin('email').service('email').send({
        to: user.email,
        subject: `${payload.title} · S.C.E.A.R.`,
        text: `${name ? name + ',' : ''}\n\n${payload.title}\n${payload.body || ''}\n\n${url}\n\n— S.C.E.A.R.`,
        html: `
          <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#14100F;padding:28px;color:#F6F1E8">
            <div style="max-width:520px;margin:0 auto;background:#1A1414;border:1px solid rgba(214,178,122,.2);border-radius:10px;padding:28px">
              <div style="font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:#D6B27A;margin-bottom:14px">S·C·E·A·R</div>
              <h1 style="margin:0 0 12px;font-size:20px;color:#F6F1E8">${escapeHtml(payload.title)}</h1>
              ${payload.body ? `<p style="margin:0 0 18px;line-height:1.6;color:rgba(246,241,232,.78)">${escapeHtml(payload.body)}</p>` : ''}
              <a href="${url}" style="display:inline-block;background:#AF2B31;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;font-weight:700;font-size:14px">Otvoriť členskú zónu</a>
              <p style="margin:22px 0 0;font-size:12px;color:rgba(246,241,232,.45)">Upozornenia si môžete vypnúť v profile.</p>
            </div>
          </div>`,
      })
    } catch (e) {
      strapi.log.warn('[notify] e-mail preskočený: ' + (e as Error).message)
    }
  },
})

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}
