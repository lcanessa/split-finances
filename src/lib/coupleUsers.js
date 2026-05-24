function normalizeName(name) {
  return String(name ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

function findUserByPattern(users, pattern) {
  return users.find((user) => pattern.test(normalizeName(user.name)))
}

/**
 * userA = Mati → salary_user_a
 * userB = Lichi → salary_user_b
 * (independiente del orden en que vengan de Supabase)
 */
export function resolveCoupleUsers(users) {
  if (!users?.length) {
    return { userA: null, userB: null, orderedUsers: [] }
  }

  const userA =
    findUserByPattern(users, /mati/i) ??
    users[0]
  const userB =
    findUserByPattern(users, /lichi/i) ??
    users.find((u) => u.id !== userA.id) ??
    users[1] ??
    userA

  return {
    userA,
    userB,
    orderedUsers: [userA, userB],
  }
}

export function getDefaultPayerUserId(users) {
  return resolveCoupleUsers(users).userA?.id ?? users[0]?.id ?? ''
}
