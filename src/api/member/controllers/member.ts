/**
 * Členské API — všetko, čo plugin Users & Permissions nevie:
 * profil s rolou a stavom schválenia, potvrdzovanie účasti, hlasovanie,
 * notifikácie, push odbery a zrušenie účtu.
 *
 * Zámerne nebeží na /api/users/me: obsahové API v Strapi zahadzuje reláciu
 * na rolu, takže by sa nedalo zistiť, či ide o vedenie alebo bežného člena.
 */

const PROFILE_FIELDS = [
  'id', 'username', 'email', 'displayName', 'phone', 'unitPosition', 'bio',
  'ownEquipment', 'memberSince', 'approved', 'approvedAt', 'confirmed', 'blocked',
  'notifyActivity', 'notifyPoll', 'notifyAnnouncement', 'notifyEmail', 'createdAt',
]

/** Polia, ktoré si člen smie meniť sám. Rola, schválenie ani heslo tu nie sú. */
const EDITABLE = ['displayName', 'phone', 'unitPosition', 'bio', 'ownEquipment',
  'notifyActivity', 'notifyPoll', 'notifyAnnouncement', 'notifyEmail']

/**
 * Čítanie typov s konceptom a publikovaním (aktivity, hlasovania, oznamy).
 *
 * Ide cez query engine zámerne: entityService v Strapi 5 vracia pri týchto
 * typoch koncepty, takže členom nič nezobrazí. Query engine navyše drží
 * číselné id stabilné — účasť aj hlasy sa na ne odkazujú.
 */
function publishedMany(uid: string, opts: any = {}) {
  const { where = {}, ...rest } = opts
  return strapi.db.query(uid).findMany({
    where: { ...where, publishedAt: { $notNull: true } },
    ...rest,
  })
}

function requireUser(ctx: any) {
  const user = ctx.state?.user
  if (!user) { ctx.unauthorized('Prihláste sa'); return null }
  return user
}

/** Členská zóna je len pre schválených. Neschválený vidí iba svoj profil. */
function requireApproved(ctx: any) {
  const user = requireUser(ctx)
  if (!user) return null
  if (!user.approved) {
    ctx.forbidden('Váš účet ešte nebol schválený správcom')
    return null
  }
  return user
}

export default {
  /** GET /api/member/me — profil vrátane roly a súhrnov */
  async me(ctx: any) {
    const user = requireUser(ctx)
    if (!user) return

    const full = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
      fields: PROFILE_FIELDS as any,
      populate: { role: { fields: ['name', 'type'] }, avatar: { fields: ['url', 'formats'] } },
    })

    const [attendances, votes, unread] = await Promise.all([
      strapi.entityService.count('api::attendance.attendance', { filters: { user: user.id, status: 'going' } }),
      strapi.entityService.count('api::poll-vote.poll-vote', { filters: { user: user.id } }),
      strapi.entityService.count('api::notification.notification', { filters: { user: user.id, read: false } }),
    ])

    ctx.body = {
      ...full,
      isStaff: (full as any)?.role?.type === 'authenticated',
      stats: { attendances, votes, unreadNotifications: unread },
    }
  },

  /** PUT /api/member/me — úprava vlastného profilu */
  async updateMe(ctx: any) {
    const user = requireUser(ctx)
    if (!user) return

    const body = ctx.request.body?.data ?? ctx.request.body ?? {}
    const data: Record<string, unknown> = {}
    for (const key of EDITABLE) if (key in body) data[key] = body[key]
    if (typeof data.displayName === 'string') data.displayName = (data.displayName as string).trim().slice(0, 80)

    if (!Object.keys(data).length) { ctx.badRequest('Žiadne zmeny'); return }

    const updated = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
      data,
      fields: PROFILE_FIELDS as any,
    })
    ctx.body = updated
  },

  /** DELETE /api/member/me — zrušenie účtu (GDPR) */
  async deleteMe(ctx: any) {
    const user = requireUser(ctx)
    if (!user) return
    // účasti a hlasy sa mažú s účtom — nie sú to verejné príspevky
    const [att, votes, notifs, subs] = await Promise.all([
      strapi.entityService.findMany('api::attendance.attendance', { filters: { user: user.id }, fields: ['id'], limit: 500 }),
      strapi.entityService.findMany('api::poll-vote.poll-vote', { filters: { user: user.id }, fields: ['id'], limit: 500 }),
      strapi.entityService.findMany('api::notification.notification', { filters: { user: user.id }, fields: ['id'], limit: 1000 }),
      strapi.entityService.findMany('api::push-subscription.push-subscription', { filters: { user: user.id }, fields: ['id'], limit: 50 }),
    ])
    const del = (uid: any, rows: any[]) => Promise.all(rows.map(r => strapi.entityService.delete(uid, r.id).catch(() => null)))
    await Promise.all([
      del('api::attendance.attendance', att),
      del('api::poll-vote.poll-vote', votes),
      del('api::notification.notification', notifs),
      del('api::push-subscription.push-subscription', subs),
    ])
    await strapi.entityService.delete('plugin::users-permissions.user', user.id)
    ctx.body = { ok: true }
  },

  /** GET /api/member/activities — aktivity s mojím stavom účasti a počtami */
  async activities(ctx: any) {
    const user = requireApproved(ctx)
    if (!user) return

    const activities = await publishedMany('api::activity.activity', {
      orderBy: { startDate: 'asc' },
      limit: 100,
      populate: true,
    })

    const mine = await strapi.entityService.findMany('api::attendance.attendance', {
      filters: { user: user.id },
      limit: 500,
    })
    const mineByTarget = new Map(mine.map((a: any) => [`${a.targetType}:${a.targetId}`, a]))

    const all = await strapi.entityService.findMany('api::attendance.attendance', {
      filters: { targetType: 'activity' },
      populate: { user: { fields: ['id', 'displayName', 'username'] } },
      limit: 2000,
    })

    const result = activities.map((act: any) => {
      const key = `activity:${act.id}`
      const going = all.filter((a: any) => a.targetType === 'activity' && String(a.targetId) === String(act.id) && a.status === 'going')
      return {
        ...act,
        myAttendance: mineByTarget.get(key) ?? null,
        goingCount: going.length,
        going: going.map((a: any) => ({
          id: a.user?.id,
          name: a.user?.displayName || a.user?.username || 'Člen',
        })),
      }
    })

    ctx.body = { data: result }
  },

  /** POST /api/member/attendance — potvrdenie/zmena účasti */
  async setAttendance(ctx: any) {
    const user = requireApproved(ctx)
    if (!user) return

    const body = ctx.request.body?.data ?? ctx.request.body ?? {}
    const targetType = body.targetType === 'event' ? 'event' : 'activity'
    const targetId = String(body.targetId ?? '')
    const status = ['going', 'maybe', 'not_going'].includes(body.status) ? body.status : null
    const note = typeof body.note === 'string' ? body.note.slice(0, 200) : null

    if (!targetId || !status) { ctx.badRequest('Chýba targetId alebo status'); return }

    const existing = await strapi.entityService.findMany('api::attendance.attendance', {
      filters: { user: user.id, targetType, targetId },
      limit: 1,
    })

    let row
    if (existing?.length) {
      row = await strapi.entityService.update('api::attendance.attendance', existing[0].id, {
        data: { status, note },
      })
    } else {
      row = await strapi.entityService.create('api::attendance.attendance', {
        data: { user: user.id, targetType, targetId, status, note },
      })
    }
    ctx.body = row
  },

  /** GET /api/member/polls — hlasovania s mojím hlasom a výsledkami */
  async polls(ctx: any) {
    const user = requireApproved(ctx)
    if (!user) return

    const polls = await publishedMany('api::poll.poll', {
      orderBy: { createdAt: 'desc' },
      limit: 50,
    })
    // aj tu query engine: entityService by pri populate siahol na koncept
    // hlasovania, ktorý neexistuje, a hlas by sa stratil
    const myVotes = await strapi.db.query('api::poll-vote.poll-vote').findMany({
      where: { user: user.id },
      populate: { poll: { select: ['id'] } },
      limit: 200,
    })
    const myByPoll = new Map(myVotes.map((v: any) => [String(v.poll?.id), v]))

    const allVotes = await strapi.db.query('api::poll-vote.poll-vote').findMany({
      populate: { poll: { select: ['id'] } },
      limit: 5000,
    })

    const now = Date.now()
    const data = polls.map((p: any) => {
      const mine = myByPoll.get(String(p.id)) ?? null
      const closed = p.closesAt ? new Date(p.closesAt).getTime() < now : false
      const votes = allVotes.filter((v: any) => String(v.poll?.id) === String(p.id))

      const showResults =
        p.resultsVisible === 'always' ||
        (p.resultsVisible === 'after_vote' && !!mine) ||
        (p.resultsVisible === 'after_close' && closed) ||
        closed

      const counts: Record<string, number> = {}
      if (showResults) {
        for (const v of votes) for (const c of ((v.choices || []) as string[])) counts[c] = (counts[c] || 0) + 1
      }

      return {
        ...p,
        closed,
        myChoices: mine?.choices ?? null,
        totalVotes: votes.length,
        results: showResults ? counts : null,
      }
    })

    ctx.body = { data }
  },

  /** POST /api/member/polls/:id/vote */
  async vote(ctx: any) {
    const user = requireApproved(ctx)
    if (!user) return

    const pollId = ctx.params.id
    const body = ctx.request.body?.data ?? ctx.request.body ?? {}
    const choices: string[] = Array.isArray(body.choices) ? body.choices.map(String) : []

    const poll: any = await strapi.db.query('api::poll.poll').findOne({
      where: { id: pollId, publishedAt: { $notNull: true } },
    })
    if (!poll) { ctx.notFound('Hlasovanie neexistuje'); return }
    if (poll.closesAt && new Date(poll.closesAt).getTime() < Date.now()) {
      ctx.badRequest('Hlasovanie je už uzavreté'); return
    }
    const validIds = new Set((poll.options || []).map((o: any) => String(o.id)))
    const clean = choices.filter((c) => validIds.has(c))
    if (!clean.length) { ctx.badRequest('Vyberte platnú možnosť'); return }
    if (!poll.multiChoice && clean.length > 1) { ctx.badRequest('V tomto hlasovaní je možná len jedna odpoveď'); return }

    const existing = await strapi.db.query('api::poll-vote.poll-vote').findMany({
      where: { user: user.id, poll: pollId },
      limit: 1,
    })

    const row = existing?.length
      ? await strapi.entityService.update('api::poll-vote.poll-vote', existing[0].id, { data: { choices: clean } })
      : await strapi.entityService.create('api::poll-vote.poll-vote', { data: { user: user.id, poll: pollId, choices: clean } })

    ctx.body = row
  },

  /** GET /api/member/notifications */
  async notifications(ctx: any) {
    const user = requireUser(ctx)
    if (!user) return
    const rows = await strapi.entityService.findMany('api::notification.notification', {
      filters: { user: user.id },
      sort: { createdAt: 'desc' },
      limit: 50,
    })
    const unread = rows.filter((n: any) => !n.read).length
    ctx.body = { data: rows, unread }
  },

  /** POST /api/member/notifications/read — označí všetky (alebo jednu) za prečítané */
  async markRead(ctx: any) {
    const user = requireUser(ctx)
    if (!user) return
    const id = (ctx.request.body?.data ?? ctx.request.body ?? {}).id

    const rows = await strapi.entityService.findMany('api::notification.notification', {
      filters: id ? { user: user.id, id } : { user: user.id, read: false },
      fields: ['id'],
      limit: 200,
    })
    await Promise.all(rows.map((r: any) =>
      strapi.entityService.update('api::notification.notification', r.id, {
        data: { read: true, readAt: new Date().toISOString() },
      }).catch(() => null)
    ))
    ctx.body = { ok: true, updated: rows.length }
  },

  /** POST /api/member/push/subscribe */
  async subscribePush(ctx: any) {
    const user = requireUser(ctx)
    if (!user) return
    const body = ctx.request.body?.data ?? ctx.request.body ?? {}
    const endpoint = body.endpoint
    const p256dh = body.keys?.p256dh ?? body.p256dh
    const auth = body.keys?.auth ?? body.auth
    if (!endpoint || !p256dh || !auth) { ctx.badRequest('Neúplný odber'); return }

    const existing = await strapi.entityService.findMany('api::push-subscription.push-subscription', {
      filters: { endpoint },
      limit: 1,
    })
    if (existing?.length) {
      await strapi.entityService.update('api::push-subscription.push-subscription', existing[0].id, {
        data: { user: user.id, p256dh, auth, failCount: 0 },
      })
    } else {
      await strapi.entityService.create('api::push-subscription.push-subscription', {
        data: { user: user.id, endpoint, p256dh, auth, userAgent: ctx.request.header['user-agent']?.slice(0, 300) },
      })
    }
    ctx.body = { ok: true }
  },

  /** GET /api/member/announcements — nástenka */
  async announcements(ctx: any) {
    const user = requireApproved(ctx)
    if (!user) return
    const rows = await publishedMany('api::announcement.announcement', {
      orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
      limit: 50,
      populate: { image: { select: ['url'] } },
    })
    ctx.body = { data: rows }
  },

  // ---- správa (len vedenie) ----

  /** GET /api/member/admin/pending — čakatelia na schválenie */
  async pending(ctx: any) {
    const user = requireUser(ctx)
    if (!user) return
    if (ctx.state.user?.role?.type !== 'authenticated') { ctx.forbidden(); return }

    const rows = await strapi.entityService.findMany('plugin::users-permissions.user', {
      filters: { approved: false, confirmed: true, blocked: false },
      fields: ['id', 'username', 'email', 'displayName', 'phone', 'unitPosition', 'bio', 'confirmed', 'createdAt'],
      sort: { createdAt: 'desc' },
      limit: 100,
    })
    ctx.body = { data: rows }
  },

  /** POST /api/member/admin/approve — schválenie člena */
  async approve(ctx: any) {
    const staff = requireUser(ctx)
    if (!staff) return
    if (ctx.state.user?.role?.type !== 'authenticated') { ctx.forbidden(); return }

    const body = ctx.request.body?.data ?? ctx.request.body ?? {}
    const id = body.id
    if (!id) { ctx.badRequest('Chýba id'); return }

    const updated = await strapi.entityService.update('plugin::users-permissions.user', id, {
      data: {
        approved: true,
        approvedAt: new Date().toISOString(),
        approvedBy: staff.email,
        memberSince: new Date().toISOString().slice(0, 10),
      },
      fields: ['id', 'email', 'displayName', 'username'],
    })

    await strapi.service('api::notification.notify').notify({
      userId: id,
      type: 'account_approved',
      title: 'Vitajte v S.C.E.A.R.',
      body: 'Váš účet bol schválený. Členská zóna je vám k dispozícii — tréningy, hlasovania aj oznamy.',
      link: '/clenska-zona',
    })

    ctx.body = updated
  },
}
