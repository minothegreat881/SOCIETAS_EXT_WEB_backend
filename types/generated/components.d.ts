import type { Schema, Struct } from '@strapi/strapi';

export interface ArticleImage extends Struct.ComponentSchema {
  collectionName: 'components_article_images';
  info: {
    description: 'Image with caption and description for articles';
    displayName: 'Article Image';
  };
  attributes: {
    alt: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    caption: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface ArticleSection extends Struct.ComponentSchema {
  collectionName: 'components_article_sections';
  info: {
    description: 'A content section within an article';
    displayName: 'Article Section';
  };
  attributes: {
    additionalContent: Schema.Attribute.JSON;
    content: Schema.Attribute.Text & Schema.Attribute.Required;
    quote: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1000;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface KeyFact extends Struct.ComponentSchema {
  collectionName: 'components_key_facts';
  info: {
    description: 'Key facts or statistics for articles';
    displayName: 'Key Fact';
  };
  attributes: {
    description: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    number: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

export interface TimelineEvent extends Struct.ComponentSchema {
  collectionName: 'components_timeline_events';
  info: {
    description: 'Historical events for timeline display';
    displayName: 'Timeline Event';
  };
  attributes: {
    event: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    year: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
  };
}

export interface UnitType extends Struct.ComponentSchema {
  collectionName: 'components_unit_types';
  info: {
    description: 'Military unit types and their descriptions';
    displayName: 'Unit Type';
  };
  attributes: {
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    units: Schema.Attribute.JSON & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'article.image': ArticleImage;
      'article.section': ArticleSection;
      'key.fact': KeyFact;
      'timeline.event': TimelineEvent;
      'unit.type': UnitType;
    }
  }
}
