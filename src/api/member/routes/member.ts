/**
 * Cesty členskej zóny. Všetky vyžadujú prihlásenie — kontrolu robí controller
 * (a pri členských dátach aj schválenie účtu), preto tu nie je auth: false.
 */
export default {
  routes: [
    { method: 'GET', path: '/member/me', handler: 'member.me' },
    { method: 'PUT', path: '/member/me', handler: 'member.updateMe' },
    { method: 'DELETE', path: '/member/me', handler: 'member.deleteMe' },

    { method: 'GET', path: '/member/activities', handler: 'member.activities' },
    { method: 'POST', path: '/member/attendance', handler: 'member.setAttendance' },

    { method: 'GET', path: '/member/polls', handler: 'member.polls' },
    { method: 'POST', path: '/member/polls/:id/vote', handler: 'member.vote' },

    { method: 'GET', path: '/member/announcements', handler: 'member.announcements' },

    { method: 'GET', path: '/member/notifications', handler: 'member.notifications' },
    { method: 'POST', path: '/member/notifications/read', handler: 'member.markRead' },
    { method: 'POST', path: '/member/push/subscribe', handler: 'member.subscribePush' },

    { method: 'GET', path: '/member/admin/pending', handler: 'member.pending' },
    { method: 'POST', path: '/member/admin/approve', handler: 'member.approve' },
  ],
}
