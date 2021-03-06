import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import setEffectiveConnectionType from '../modifiers/setUserEffectiveConnectionType';

export default function setUserEffectiveConnectionType(effectiveConnectionType) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ChangeUserEffectiveConnectionMsg';
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(effectiveConnectionType, String);

  const payload = {
    meetingId,
    userId: requesterUserId,
    effectiveConnectionType,
  };

  setEffectiveConnectionType(meetingId, requesterUserId, effectiveConnectionType);

  Logger.verbose(`User ${requesterUserId} effective connection updated to ${effectiveConnectionType}`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
