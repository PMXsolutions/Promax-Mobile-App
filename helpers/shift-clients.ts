export type ShiftClientChoice = {
  key: string;
  name: string;
  clientId?: number;
  profileId?: number;
};

type NamedClient = {
  clientId?: number;
  profileId?: number;
  firstName?: string;
  surName?: string;
  middleName?: string;
  fullName?: string;
  name?: string;
};

export type ShiftClientSource = {
  clients?: string | null;
  profile?: NamedClient | null;
  profiles?: NamedClient[] | null;
  clientProfiles?: NamedClient[] | null;
  clientList?: NamedClient[] | null;
};

const displayName = (person: NamedClient) => {
  const explicit = person.fullName?.trim() || person.name?.trim();
  if (explicit) return explicit;
  return [person.firstName, person.middleName, person.surName]
    .filter((part) => part && part.trim())
    .join(" ")
    .trim();
};

const positiveId = (value?: number) =>
  value != null && value > 0 ? value : undefined;

export function getShiftClients(
  shift: ShiftClientSource | null | undefined
): ShiftClientChoice[] {
  if (!shift) return [];

  const list = [shift.profiles, shift.clientProfiles, shift.clientList].find(
    (entry) => Array.isArray(entry) && entry.length > 0
  );

  if (list) {
    return list.map((person, index) => {
      const name = displayName(person) || `Client ${index + 1}`;
      const clientId = positiveId(person.clientId);
      const profileId = positiveId(person.profileId);
      return {
        key: String(clientId || profileId || name),
        name,
        clientId,
        profileId,
      };
    });
  }

  const profile = shift.profile;
  const profileName = profile ? displayName(profile) : "";
  const names = (shift.clients || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (names.length === 0 && profileName) {
    return [
      {
        key: String(positiveId(profile?.clientId) || profileName),
        name: profileName,
        clientId: positiveId(profile?.clientId),
        profileId: positiveId(profile?.profileId),
      },
    ];
  }

  return names.map((name) => {
    const matchesProfile =
      profileName.length > 0 && name.toLowerCase() === profileName.toLowerCase();
    const canUseProfile = matchesProfile || names.length === 1;
    return {
      key: name,
      name,
      clientId: canUseProfile ? positiveId(profile?.clientId) : undefined,
      profileId: canUseProfile ? positiveId(profile?.profileId) : undefined,
    };
  });
}
