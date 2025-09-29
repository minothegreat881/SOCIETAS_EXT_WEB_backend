import type { Schema, Struct } from '@strapi/strapi';

export interface ContentArticleContentBlock extends Struct.ComponentSchema {
  collectionName: 'components_content_article_content_blocks';
  info: {
    description: 'Mixed content block for articles with text and images';
    displayName: 'Article Content Block';
    icon: 'layout';
  };
  attributes: {
    codeLanguage: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    content: Schema.Attribute.Blocks;
    contentImage: Schema.Attribute.Component<'content.content-image', false>;
    headingLevel: Schema.Attribute.Enumeration<
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    > &
      Schema.Attribute.DefaultTo<'h2'>;
    listType: Schema.Attribute.Enumeration<['ordered', 'unordered']> &
      Schema.Attribute.DefaultTo<'unordered'>;
    quoteAuthor: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    type: Schema.Attribute.Enumeration<
      ['paragraph', 'heading', 'image', 'quote', 'list', 'code', 'table']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'paragraph'>;
  };
}

export interface ContentContentImage extends Struct.ComponentSchema {
  collectionName: 'components_content_content_images';
  info: {
    description: 'Floating image with text wrap for article content';
    displayName: 'Content Image';
    icon: 'picture';
  };
  attributes: {
    alt: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    caption: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    pairWithNext: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    position: Schema.Attribute.Enumeration<
      ['left', 'right', 'center', 'full']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'left'>;
    rounded: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    shadow: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    showCaption: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    width: Schema.Attribute.Enumeration<['30', '40', '50', '60', '100']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'50'>;
  };
}

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

export interface MediaAdditionalImage extends Struct.ComponentSchema {
  collectionName: 'components_media_additional_images';
  info: {
    description: 'Additional image with metadata';
    displayName: 'Additional Image';
    icon: 'picture';
  };
  attributes: {
    alt: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    caption: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    position: Schema.Attribute.Enumeration<
      ['left', 'center', 'right', 'full-width']
    > &
      Schema.Attribute.DefaultTo<'center'>;
    size: Schema.Attribute.Enumeration<['small', 'medium', 'large', 'full']> &
      Schema.Attribute.DefaultTo<'medium'>;
  };
}

export interface SharedFactItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_fact_items';
  info: {
    description: 'Single fact item';
    displayName: 'Fact Item';
    icon: 'info';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
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
        maxLength: 255;
      }>;
  };
}

export interface SharedTimelineEvent extends Struct.ComponentSchema {
  collectionName: 'components_shared_timeline_events';
  info: {
    description: 'Single timeline event';
    displayName: 'Timeline Event';
    icon: 'calendar';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1000;
      }>;
    event: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    highlight: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    year: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

export interface SharedUnitType extends Struct.ComponentSchema {
  collectionName: 'components_shared_unit_types';
  info: {
    description: 'Military unit type';
    displayName: 'Unit Type';
    icon: 'users';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    icon: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    units: Schema.Attribute.JSON & Schema.Attribute.Required;
  };
}

export interface SidebarKeyFacts extends Struct.ComponentSchema {
  collectionName: 'components_sidebar_key_facts';
  info: {
    description: 'Key facts section for sidebar';
    displayName: 'Key Facts';
    icon: 'list';
  };
  attributes: {
    facts: Schema.Attribute.Component<'shared.fact-item', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    style: Schema.Attribute.Enumeration<
      ['numbered-circles', 'icons', 'cards']
    > &
      Schema.Attribute.DefaultTo<'numbered-circles'>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'K\u013E\u00FA\u010Dov\u00E9 fakty'>;
  };
}

export interface SidebarRelatedArticles extends Struct.ComponentSchema {
  collectionName: 'components_sidebar_related_articles';
  info: {
    description: 'Related articles section';
    displayName: 'Related Articles';
    icon: 'link';
  };
  attributes: {
    articles: Schema.Attribute.Relation<
      'oneToMany',
      'api::history-article.history-article'
    >;
    showThumbnails: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'S\u00FAvisiace \u010Dl\u00E1nky'>;
  };
}

export interface SidebarTimeline extends Struct.ComponentSchema {
  collectionName: 'components_sidebar_timelines';
  info: {
    description: 'Timeline section for sidebar';
    displayName: 'Timeline';
    icon: 'clock';
  };
  attributes: {
    events: Schema.Attribute.Component<'shared.timeline-event', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    orientation: Schema.Attribute.Enumeration<['vertical', 'horizontal']> &
      Schema.Attribute.DefaultTo<'vertical'>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'\u010Casov\u00E1 os'>;
  };
}

export interface SidebarUnitTypes extends Struct.ComponentSchema {
  collectionName: 'components_sidebar_unit_types';
  info: {
    description: 'Unit types section for auxiliary forces';
    displayName: 'Unit Types';
    icon: 'shield';
  };
  attributes: {
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Typy jednotiek'>;
    types: Schema.Attribute.Component<'shared.unit-type', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'content.article-content-block': ContentArticleContentBlock;
      'content.content-image': ContentContentImage;
      'location.coordinates': LocationCoordinates;
      'media.additional-image': MediaAdditionalImage;
      'shared.fact-item': SharedFactItem;
      'shared.timeline-event': SharedTimelineEvent;
      'shared.unit-type': SharedUnitType;
      'sidebar.key-facts': SidebarKeyFacts;
      'sidebar.related-articles': SidebarRelatedArticles;
      'sidebar.timeline': SidebarTimeline;
      'sidebar.unit-types': SidebarUnitTypes;
    }
  }
}
