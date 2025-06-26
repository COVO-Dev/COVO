import { AbilityBuilder, Ability } from '@casl/ability';

export function defineAdminAbility(adminId: string): Ability {
  const { can, cannot, build } = new AbilityBuilder(Ability);


  const user = { role: 'Admin', id: adminId };

  if (user.role === 'Admin') {
    can('manage', 'all');
  }

  
  return build();
}
