export const USER_PROFILES = {
  ROOT: {
    id: 1,
    nome: 'Root'
  },
  ADMINISTRADOR: {
    id: 2,
    nome: 'Administrador'
  },
  COLABORADOR: {
    id: 3,
    nome: 'Colaborador'
  }
} as const;

export const USER_PROFILES_LIST = [
  USER_PROFILES.ROOT,
  USER_PROFILES.ADMINISTRADOR,
  USER_PROFILES.COLABORADOR
] as const;

export const getProfileNameById = (id: number): string => {
  const profile = USER_PROFILES_LIST.find(p => p.id === id);
  return profile?.nome || 'Perfil não encontrado';
};

export const hasProfile = (userProfileId: number, targetProfile: typeof USER_PROFILES[keyof typeof USER_PROFILES]): boolean => {
  return userProfileId === targetProfile.id;
};

export const isAdminOrRoot = (userProfileId: number): boolean => {
  return userProfileId === USER_PROFILES.ROOT.id || userProfileId === USER_PROFILES.ADMINISTRADOR.id;
};
