import type { Schema, Struct } from '@strapi/strapi';

export interface LocationCoordinates extends Struct.ComponentSchema {
  collectionName: 'components_location_coordinates';
  info: {
    description: 'GPS coordinates for event location';
    displayName: 'Coordinates';
    icon: 'map-pin';
  };
  attributes: {
    accuracy: Schema.Attribute.Float;
    latitude: Schema.Attribute.Float & Schema.Attribute.Required;
    longitude: Schema.Attribute.Float & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'location.coordinates': LocationCoordinates;
    }
  }
}
