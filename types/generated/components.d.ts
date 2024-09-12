import type { Schema, Attribute } from '@strapi/strapi';

export interface FeatureFeatures extends Schema.Component {
  collectionName: 'components_feature_features';
  info: {
    displayName: 'features';
    icon: 'bulletList';
  };
  attributes: {
    title: Attribute.String;
    description: Attribute.Text;
  };
}

export interface DetailsVariant extends Schema.Component {
  collectionName: 'components_details_variants';
  info: {
    displayName: 'variant';
    icon: 'chartBubble';
    description: '';
  };
  attributes: {
    color: Attribute.String;
    capacity: Attribute.String;
    price: Attribute.Decimal & Attribute.DefaultTo<0>;
    images: Attribute.Media<'images' | 'files' | 'videos' | 'audios', true>;
    isAvailable: Attribute.Boolean & Attribute.DefaultTo<true>;
    stock: Attribute.Integer & Attribute.DefaultTo<1>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'feature.features': FeatureFeatures;
      'details.variant': DetailsVariant;
    }
  }
}
