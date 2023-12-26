export interface CollectionsDetail {
  app_name: string;
  ban_reason: string;
  ban_text_check_result: number;
  banned: number;
  banner: string;
  can_be_deleted: number;
  can_subscribe: number;
  children: Array<{
    publishedfileid: string;
    sortorder: number;
    file_type: number;
  }>;
  consumer_appid: number | string;
  consumer_shortcutid: number;
  creator: string;
  creator_appid: number;
  favorited: number;
  file_size: string;
  file_type: number;
  file_url: string;
  filename: string;
  flags: number;
  followers: number;
  hcontent_file: string;
  hcontent_preview: string;
  image_height: number;
  image_width: number;
  language: number;
  lifetime_favorited: number;
  lifetime_followers: number;
  lifetime_playtime: string;
  lifetime_playtime_sessions: string;
  lifetime_subscriptions: number;
  maybe_inappropriate_sex: number;
  maybe_inappropriate_violence: number;
  num_children: number;
  num_comments_developer: number;
  num_comments_public: number;
  num_reports: number;
  preview_file_size: string;
  preview_url: string;
  publishedfileid: string;
  result: number;
  revision: number;
  revision_change_number: string;
  score: string;
  short_description: string;
  show_subscribe_all: number;
  subscriptions: number;
  tags: Array<{
    tag: string;
    display_name: string;
  }>;
  time_created: number;
  time_updated: number;
  title: string;
  url: string;
  views: number;
  visibility: number;
  vote_data: {
    score: string;
    votes_up: number;
    votes_down: number;
  };
  votesagainst: number;
  votesfor: number;
  workshop_accepted: number;
  workshop_file: number;
}
export interface GetCollectionsResponse {
  all_collections: {
    items: Record<string, CollectionsDetail>;
  };
  parent_collections: {
    publishedfiledetails: [];
  };
  success: number;
}
export interface PublishedFileDetails {
  ban_reason: string;
  banned: number;
  consumer_app_id: number;
  creator: string;
  creator_app_id: number;
  description: string;
  favorited: number;
  file_size: number;
  file_url: string;
  filename: string;
  hcontent_file: string;
  hcontent_preview: string;
  lifetime_favorited: number;
  lifetime_subscriptions: number;
  preview_url: string;
  publishedfileid: string;
  result: number;
  subscriptions: number;
  tags: Array<{ tag: string }>;
  time_created: number;
  time_updated: number;
  title: string;
  views: number;
  visibility: number;
}
export interface GetPublishedFileDetailsResponse {
  response: {
    publishedfiledetails: Array<PublishedFileDetails>;
    result: number;
    resultcount: number;
  };
}
