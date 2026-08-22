/**
 * Naplánované úlohy.
 *
 * Pripomienka pred tréningom: beží každých 5 minút a hľadá aktivity, ktoré
 * začínajú o 55–70 minút. Okno je širšie než interval, aby sa žiadna aktivita
 * nepreskočila, a `remindedAt` na účasti zabráni druhému odoslaniu.
 */

const REMIND_MINUTES = 60
const WINDOW_BEFORE = 70
const WINDOW_AFTER = 55

export default {
  activityReminder: {
    task: async ({ strapi }: { strapi: any }) => {
      try {
        const now = Date.now()
        const from = new Date(now + WINDOW_AFTER * 60_000)
        const to = new Date(now + WINDOW_BEFORE * 60_000)

        // query engine, nie entityService: aktivity majú koncept/publikované
        const activities = await strapi.db.query('api::activity.activity').findMany({
          where: {
            publishedAt: { $notNull: true },
            startDate: { $gte: from.toISOString(), $lte: to.toISOString() },
          },
          limit: 50,
        })
        if (!activities.length) return

        for (const activity of activities) {
          const attendances = await strapi.entityService.findMany('api::attendance.attendance', {
            filters: { targetType: 'activity', targetId: String(activity.id), status: 'going', remindedAt: { $null: true } },
            populate: { user: { fields: ['id'] } },
            limit: 300,
          })
          if (!attendances.length) continue

          const title = activity.title_sk || activity.title || 'Tréning'
          const place = activity.locationName_sk || activity.location?.name || ''
          // časové pásmo natvrdo: server môže bežať v UTC a člen by dostal zlý čas
          const time = new Date(activity.startDate).toLocaleTimeString('sk-SK', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Bratislava',
          })

          for (const att of attendances) {
            if (!att.user?.id) continue
            await strapi.service('api::notification.notify').notify({
              userId: att.user.id,
              type: 'activity_reminder',
              title: `O hodinu začína: ${title}`,
              body: place ? `${time} · ${place}. Mapu a detaily nájdete v členskej zóne.` : `Začiatok o ${time}.`,
              link: `/clenska-zona/aktivity?id=${activity.id}`,
            })
            await strapi.entityService.update('api::attendance.attendance', att.id, {
              data: { remindedAt: new Date().toISOString() },
            }).catch(() => null)
          }
          strapi.log.info(`[cron] pripomienka „${title}" → ${attendances.length} členom`)
        }
      } catch (e) {
        strapi.log.error('[cron] activityReminder zlyhal: ' + (e as Error).message)
      }
    },
    options: { rule: '*/5 * * * *', tz: 'Europe/Bratislava' },
  },

  /** Upozornenie na hlasovanie, ktoré sa dnes uzatvára. */
  pollClosing: {
    task: async ({ strapi }: { strapi: any }) => {
      try {
        const now = Date.now()
        const polls = await strapi.db.query('api::poll.poll').findMany({
          where: {
            publishedAt: { $notNull: true },
            closesAt: {
              $gte: new Date(now + 3 * 3600_000).toISOString(),
              $lte: new Date(now + 4 * 3600_000).toISOString(),
            },
          },
          limit: 10,
        })
        for (const poll of polls) {
          await strapi.service('api::notification.notify').notifyAllMembers({
            type: 'poll_closing',
            title: 'Hlasovanie sa dnes uzatvára',
            body: poll.question,
            link: `/clenska-zona/hlasovania?id=${poll.id}`,
            dedupKey: `/clenska-zona/hlasovania?id=${poll.id}`,
          })
        }
      } catch (e) {
        strapi.log.error('[cron] pollClosing zlyhal: ' + (e as Error).message)
      }
    },
    options: { rule: '0 * * * *', tz: 'Europe/Bratislava' },
  },
}
