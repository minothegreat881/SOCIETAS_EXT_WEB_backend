module.exports = async () => {
  // Set default permissions for activities
  const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
    where: {
      type: 'public',
    },
  });

  if (publicRole) {
    const publicPermissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
      where: {
        role: publicRole.id,
      },
    });

    const hasActivityPermissions = publicPermissions.some(permission => 
      permission.action.includes('api::activity')
    );

    if (!hasActivityPermissions) {
      // Create permissions for activity endpoints
      await strapi.db.query('plugin::users-permissions.permission').createMany({
        data: [
          {
            action: 'api::activity.activity.find',
            role: publicRole.id,
            enabled: true,
          },
          {
            action: 'api::activity.activity.findOne',
            role: publicRole.id, 
            enabled: true,
          },
          {
            action: 'api::activity.activity.create',
            role: publicRole.id,
            enabled: true,
          },
          {
            action: 'api::activity.activity.update',
            role: publicRole.id,
            enabled: true,
          },
          {
            action: 'api::activity.activity.delete',
            role: publicRole.id,
            enabled: true,
          },
        ],
      });
      
      console.log('✅ Activities API permissions have been set for public role');
    }
  }
};