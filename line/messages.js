const TEXT_TYPE = 'text';
const STICKER_TYPE = 'sticker';
const IMAGE_TYPE = 'image';
const VIDEO_TYPE = 'video';
const AUDIO_TYPE = 'audio';
const LOCATION_TYPE = 'location';
const IMAGEMAP_TYPE = 'imagemap';
const TEMPLATE_TYPE = 'template';

const BUTTON_TEMPLATE_TYPE = 'buttons';
const CAROUSEL_TEMPLATE_TYPE = 'carousel';

const ACTION_POSTBACK_TYPE = 'postback';
const ACTION_MESSAGE_TYPE = 'message';
const ACTION_URI_TYPE = 'uri';
const ACTION_DATETIME_TYPE = 'datetimepicker';

exports.textMessage = (text) => ({
    type: TEXT_TYPE,
    text,
});

exports.imageMessage = (originalContentUrl, previewImageUrl) => ({
    type: IMAGE_TYPE,
    originalContentUrl,
    previewImageUrl,
});

exports.templateMessage = (altText, template) => ({
    type: TEMPLATE_TYPE,
    altText,
    template
});

exports.buttonTemplate = (thumbnailImageUrl, title, text, actions) => ({
    type: BUTTON_TEMPLATE_TYPE,
    thumbnailImageUrl,
    title,
    text,
    actions
});

exports.carouselTemplate = (columns) => ({
    type: CAROUSEL_TEMPLATE_TYPE,
    columns
});

exports.carouselColumnTemplate = (thumbnailImageUrl, title, text, actions) => ({
    thumbnailImageUrl,
    title,
    text,
    actions
});

exports.actionPostbackTemplate = (label, data, text) => ({
    type: ACTION_POSTBACK_TYPE,
    label,
    data,
    text
});

exports.actionUriTemplate = (label, uri) => ({
    type: ACTION_URI_TYPE,
    label,
    uri
});